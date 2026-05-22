package com.example.sms.controller;

import com.example.sms.dto.ApiResponse;
import com.example.sms.entity.HealthRecord;
import com.example.sms.entity.Student;
import com.example.sms.repository.HealthRecordRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private HealthRecordRepository healthRecordRepository;

    @Autowired
    private StudentRepository studentRepository;

    // --- RECEIVE DATA FROM ESP8266 ---
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
            record.setBpm((Integer) payload.get("bpm"));
            record.setSpo2((Integer) payload.get("spo2"));
            record.setBodyTemp(Float.parseFloat(payload.get("bodyTemp").toString()));
            record.setRoomTemp(Float.parseFloat(payload.get("roomTemp").toString()));
            record.setRoomHumidity(Float.parseFloat(payload.get("roomHumidity").toString()));

            healthRecordRepository.save(record);

            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Metrics saved successfully"),
                    HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Invalid data format"),
                    HttpStatus.BAD_REQUEST);
        }
    }

    // --- NEW: SEND DATA TO REACT FRONTEND ---
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<java.util.List<HealthRecord>>> getStudentHealth(@PathVariable Long studentId) {
        try {
            // Fetch the health history for this specific student, sorted by newest first
            java.util.List<HealthRecord> records = healthRecordRepository
                    .findByStudentIdOrderByRecordedAtDesc(studentId);
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