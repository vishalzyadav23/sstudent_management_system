package com.example.sms.service;

import com.example.sms.entity.Attendance;
import com.example.sms.entity.HealthRecord;
import com.example.sms.entity.Marks;
import com.example.sms.repository.AttendanceRepository;
import com.example.sms.repository.HealthRecordRepository;
import com.example.sms.repository.MarksRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PredictiveAnalysisService {

    @Autowired
    private HealthRecordRepository healthRecordRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    public Map<String, Object> buildStudentPredictive(Long studentId) {
        Map<String, Object> predictive = new HashMap<>();
        predictive.put("healthTrend", computeHealthTrend(studentId));
        predictive.put("attendanceProjection", computeAttendanceProjection(studentId));
        predictive.put("academicAdvisor", computeAcademicAdvisor(studentId));
        return predictive;
    }

    private Map<String, Object> computeHealthTrend(Long studentId) {
        List<HealthRecord> records = healthRecordRepository.findByStudentIdOrderByRecordedAtDesc(studentId);
        Map<String, Object> result = new HashMap<>();

        if (records.isEmpty()) {
            result.put("healthRiskScore", 18.0);
            result.put("healthRiskLabel", "Low");
            result.put("healthRiskAdvice",
                    "No recent vital records are available. Establish a monitoring routine and connect your wearable device to the system.");
            return result;
        }

        HealthRecord latest = records.get(0);
        double risk = 18.0;
        StringBuilder advice = new StringBuilder();

        if (latest.getSpo2() < 95) {
            risk += latest.getSpo2() < 92 ? 35 : 20;
            advice.append("Blood oxygen is below normal; keep the student calm and consider a nurse review. ");
        }
        if (latest.getBpm() > 100) {
            risk += 20;
            advice.append("Heart rate is elevated, which may reflect stress or early illness. ");
        } else if (latest.getBpm() < 55) {
            risk += 10;
            advice.append("Heart rate is low; monitor for dizziness or fatigue. ");
        }
        if (latest.getBodyTemp() > 37.5) {
            risk += 22;
            advice.append("Body temperature is elevated; the student may be developing a fever. ");
        } else if (latest.getBodyTemp() < 35.5) {
            risk += 12;
            advice.append("Body temperature is lower than typical; check for environmental exposure. ");
        }

        if (records.size() >= 4) {
            HealthRecord fourth = records.get(Math.min(3, records.size() - 1));
            double spo2Delta = latest.getSpo2() - fourth.getSpo2();
            double tempDelta = latest.getBodyTemp() - fourth.getBodyTemp();
            double bpmDelta = latest.getBpm() - fourth.getBpm();

            if (spo2Delta < -1) {
                risk += 12;
                advice.append("Oxygen saturation has trended downward over recent readings. ");
            }
            if (tempDelta > 0.4) {
                risk += 10;
                advice.append("Temperature has been rising. ");
            }
            if (bpmDelta > 5) {
                risk += 8;
                advice.append("Heart rate is increasing compared to earlier data. ");
            }
        }

        double normalized = Math.min(96.0, Math.max(12.0, risk));
        String label = normalized > 70 ? "High" : normalized > 42 ? "Moderate" : "Low";
        String summary = String.format("Latest vitals: %d BPM, %d%% SpO2, %.1f°C. %s",
                latest.getBpm(), latest.getSpo2(), latest.getBodyTemp(),
                advice.length() > 0 ? advice.toString().trim() : "Vitals are generally stable.");

        result.put("healthRiskScore", round(normalized));
        result.put("healthRiskLabel", label);
        result.put("healthRiskSummary", summary);
        result.put("healthRiskAdvice",
                advice.length() > 0 ? advice.toString().trim() : "Maintain regular monitoring and rest.");
        return result;
    }

    private Map<String, Object> computeAttendanceProjection(Long studentId) {
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        Map<String, Object> result = new HashMap<>();

        if (records.isEmpty()) {
            result.put("attendanceRiskPercent", 14.0);
            result.put("attendanceRiskLabel", "Low");
            result.put("attendanceProjectionSummary",
                    "No attendance records available yet. Keep attending classes regularly to build a strong academic pace.");
            return result;
        }

        long total = records.size();
        long absent = records.stream().filter(r -> r.getStatus() != null && r.getStatus().equalsIgnoreCase("Absent"))
                .count();
        double absenceRate = total > 0 ? (absent * 100.0) / total : 0.0;
        double risk = 15 + absenceRate * 1.2;

        String label;
        if (absenceRate >= 30) {
            label = "High";
            risk += 20;
        } else if (absenceRate >= 15) {
            label = "Moderate";
        } else {
            label = "Low";
        }

        risk = Math.min(92.0, Math.max(12.0, risk));
        String summary = String.format("Current absence rate is %.0f%% across %d records. %s",
                absenceRate, total,
                label.equals("High") ? "Immediate outreach from faculty or a counselor is recommended."
                        : label.equals("Moderate")
                                ? "Try to reduce missed sessions and keep a consistent weekly study plan."
                                : "Attendance is tracking well, keep the current routine.");

        result.put("attendanceRiskPercent", round(risk));
        result.put("attendanceRiskLabel", label);
        result.put("attendanceProjectionSummary", summary);
        result.put("attendanceRate", round(absenceRate));
        return result;
    }

    private Map<String, Object> computeAcademicAdvisor(Long studentId) {
        List<Marks> records = marksRepository.findByStudentId(studentId);
        Map<String, Object> result = new HashMap<>();

        if (records.isEmpty()) {
            result.put("academicTrendLabel", "No Grades");
            result.put("academicAdvisorNotes",
                    "No grades are available yet. Focus on class participation and seek early guidance from faculty as assignments are shared.");
            result.put("academicWeakSubjects", List.of());
            return result;
        }

        double average = records.stream()
                .filter(m -> m.getTotalMarks() != null)
                .mapToDouble(m -> m.getTotalMarks() == null ? 0.0 : m.getTotalMarks())
                .average()
                .orElse(0.0);

        List<String> weakSubjects = records.stream()
                .filter(m -> m.getTotalMarks() == null || m.getTotalMarks() < 65 || "D".equalsIgnoreCase(m.getGrade())
                        || "F".equalsIgnoreCase(m.getGrade()))
                .map(m -> m.getCourse() != null ? m.getCourse().getCourseName() : "Unknown subject")
                .distinct()
                .collect(Collectors.toList());

        String label = average >= 80 ? "Strong" : average >= 65 ? "On Track" : "At Risk";
        StringBuilder notes = new StringBuilder();

        if (weakSubjects.isEmpty()) {
            notes.append(
                    "Performance is steady. Continue reviewing class notes and ask instructors for small concept checks.");
        } else {
            notes.append("Focus study time on: ");
            notes.append(String.join(", ", weakSubjects));
            notes.append(
                    ". Schedule review sessions, ask for targeted feedback, and practice past quizzes for these subjects.");
        }

        if (average < 65) {
            notes.append(" Seek tutoring support early to improve overall course mastery.");
        } else if (average >= 85) {
            notes.append(" Keep building confidence by solving extension problems and peer teaching.");
        }

        result.put("academicAverage", round(average));
        result.put("academicTrendLabel", label);
        result.put("academicAdvisorNotes", notes.toString().trim());
        result.put("academicWeakSubjects", weakSubjects);
        return result;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
