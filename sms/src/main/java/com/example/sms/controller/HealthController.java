package com.example.sms.controller;

import com.example.sms.dto.ApiResponse;
import com.example.sms.entity.HealthAlert;
import com.example.sms.entity.HealthRecord;
import com.example.sms.entity.MedicalDocument;
import com.example.sms.entity.Student;
import com.example.sms.repository.HealthAlertRepository;
import com.example.sms.repository.HealthRecordRepository;
import com.example.sms.repository.MedicalDocumentRepository;
import com.example.sms.repository.StudentRepository;
import com.example.sms.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private HealthRecordRepository healthRecordRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private HealthAlertRepository healthAlertRepository;

    @Autowired
    private MedicalDocumentRepository medicalDocumentRepository;

    @Autowired
    private EmailService emailService;

    @Value("${health.alert.recipients:}")
    private String healthAlertRecipients;

    @PostMapping("/metrics")
    public ResponseEntity<ApiResponse<String>> receiveDeviceData(@RequestBody Map<String, Object> payload) {
        try {
            Long studentId = Long.valueOf(payload.get("studentId").toString());
            Student student = studentRepository.findById(studentId).orElse(null);

            if (student == null) {
                return new ResponseEntity<>(new ApiResponse<>(HttpStatus.NOT_FOUND.value(), "Student not found"),
                        HttpStatus.NOT_FOUND);
            }

            HealthRecord record = new HealthRecord();
            record.setStudent(student);
            record.setBpm(Integer.parseInt(payload.get("bpm").toString()));
            record.setSpo2(Integer.parseInt(payload.get("spo2").toString()));
            record.setBodyTemp(Float.parseFloat(payload.get("bodyTemp").toString()));
            record.setRoomTemp(Float.parseFloat(payload.get("roomTemp").toString()));
            record.setRoomHumidity(Float.parseFloat(payload.get("roomHumidity").toString()));
            record.setDeviceSource(payload.getOrDefault("deviceSource", "Campus health sensor").toString());

            applyEscalationWorkflow(record, student);
            healthRecordRepository.save(record);

            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Metrics saved successfully"),
                    HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Invalid data format"),
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void applyEscalationWorkflow(HealthRecord record, Student student) {
        StringBuilder escalationReason = new StringBuilder();
        String severity = "Warning";
        boolean escalationNeeded = false;

        if (record.getSpo2() < 92) {
            escalationNeeded = true;
            escalationReason.append("Oxygen saturation is critically low (< 92%). ");
            severity = "Critical";
        }
        if (record.getBpm() > 110 || record.getBpm() < 50) {
            escalationNeeded = true;
            escalationReason.append("Abnormal heart rate detected. ");
            severity = "Critical";
        }
        if (record.getBodyTemp() >= 38.5) {
            escalationNeeded = true;
            escalationReason.append("High fever measured (>= 38.5°C). ");
            severity = "Critical";
        } else if (record.getBodyTemp() >= 37.5) {
            escalationNeeded = true;
            escalationReason.append("Elevated body temperature detected. ");
        }

        if (escalationNeeded) {
            record.setAlertStatus("Escalated");
            record.setEmergencyEscalated(true);
            record.setEscalationReason(escalationReason.toString().trim());

            HealthAlert alert = new HealthAlert();
            alert.setStudent(student);
            alert.setSeverity(severity);
            alert.setMessage(escalationReason.toString().trim());
            alert.setEmailSent(false);
            healthAlertRepository.save(alert);

            sendHealthAlertNotification(student, alert, record);
        } else {
            record.setAlertStatus("Stable");
            record.setEmergencyEscalated(false);
            record.setEscalationReason("No urgent health threshold breached.");
        }
    }

    private void sendHealthAlertNotification(Student student, HealthAlert alert, HealthRecord record) {
        try {
            String[] recipients = buildRecipientsList(student);
            String subject = String.format("Urgent Health Alert: %s (%s)", student.getName(), student.getRollNumber());
            StringBuilder body = new StringBuilder();
            body.append("A student health alert has been generated for ")
                    .append(student.getName())
                    .append(" (Roll: ")
                    .append(student.getRollNumber())
                    .append(").\n\n")
                    .append("Alert Severity: ")
                    .append(alert.getSeverity())
                    .append("\n")
                    .append("Reason: ")
                    .append(alert.getMessage())
                    .append("\n\n")
                    .append("Latest vitals:\n")
                    .append(" - BPM: ")
                    .append(record.getBpm())
                    .append("\n")
                    .append(" - SpO2: ")
                    .append(record.getSpo2())
                    .append("\n")
                    .append(" - Body Temp: ")
                    .append(record.getBodyTemp())
                    .append("°C\n")
                    .append(" - Device: ")
                    .append(record.getDeviceSource())
                    .append("\n\n")
                    .append("Student contact: ")
                    .append(student.getEmail())
                    .append(" / ")
                    .append(student.getPhoneNumber())
                    .append("\n")
                    .append("Emergency contact: ")
                    .append(student.getEmergencyContactName() != null ? student.getEmergencyContactName() : "Not configured")
                    .append(" / ")
                    .append(student.getEmergencyContactPhone() != null ? student.getEmergencyContactPhone() : "Not configured")
                    .append("\n\n")
                    .append("Please review the student immediately and escalate to medical staff as needed.");

            emailService.sendHealthAlertEmail(recipients, subject, body.toString());
            alert.setEmailSent(true);
            healthAlertRepository.save(alert);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String[] buildRecipientsList(Student student) {
        if (healthAlertRecipients != null && !healthAlertRecipients.trim().isEmpty()) {
            return List.of(healthAlertRecipients.split(",")).stream()
                    .map(String::trim)
                    .filter(email -> !email.isEmpty())
                    .collect(Collectors.toList())
                    .toArray(new String[0]);
        }
        return new String[]{student.getEmail()};
    }

    @PostMapping("/student/{studentId}/documents")
    public ResponseEntity<ApiResponse<MedicalDocument>> uploadMedicalDocument(
            @PathVariable Long studentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "notes", required = false) String notes) {

        try {
            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null) {
                return new ResponseEntity<>(new ApiResponse<>(HttpStatus.NOT_FOUND.value(), "Student not found"),
                        HttpStatus.NOT_FOUND);
            }

            MedicalDocument document = new MedicalDocument();
            document.setStudent(student);
            document.setFileName(file.getOriginalFilename());
            document.setContentType(file.getContentType());
            document.setNotes(notes);
            document.setFileData(Base64.getEncoder().encodeToString(file.getBytes()));

            medicalDocumentRepository.save(document);

            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.CREATED.value(), "Document uploaded successfully", document),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to upload document"),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/student/{studentId}/documents")
    public ResponseEntity<ApiResponse<List<MedicalDocument>>> getMedicalDocuments(@PathVariable Long studentId) {
        try {
            List<MedicalDocument> documents = medicalDocumentRepository.findByStudentIdOrderByUploadedAtDesc(studentId);
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Medical documents fetched", documents),
                    HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error fetching documents"),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/student/{studentId}/alerts")
    public ResponseEntity<ApiResponse<List<HealthAlert>>> getHealthAlerts(@PathVariable Long studentId) {
        try {
            List<HealthAlert> alerts = healthAlertRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Health alerts fetched", alerts),
                    HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error fetching alerts"),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<HealthRecord>>> getStudentHealth(@PathVariable Long studentId) {
        try {
            List<HealthRecord> records = healthRecordRepository.findByStudentIdOrderByRecordedAtDesc(studentId);
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Health records fetched", records),
                    HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                    new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error fetching records"),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
