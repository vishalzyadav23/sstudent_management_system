package com.example.sms.controller;

import com.example.sms.service.AIHealthAnalysisService;
import com.example.sms.service.PredictiveAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIHealthController {

    @Autowired
    private AIHealthAnalysisService aiHealthService;

    @Autowired
    private PredictiveAnalysisService predictiveAnalysisService;

    /**
     * Analyze current health vitals and provide medical assessment
     */
    @PostMapping("/analyze-health")
    public ResponseEntity<?> analyzeHealth(@RequestBody Map<String, Object> healthData) {
        try {
            String analysis = aiHealthService.analyzeHealthData(healthData);
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "analysis", analysis));
        } catch (Exception e) {
            return ResponseEntity.ok().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    /**
     * Answer medical questions based on current patient context
     */
    @PostMapping("/medical-question")
    public ResponseEntity<?> askMedicalQuestion(@RequestBody Map<String, Object> payload) {
        try {
            String question = (String) payload.get("question");
            Map<String, Object> healthContext = (Map<String, Object>) payload.get("healthContext");

            String answer = aiHealthService.answerMedicalQuestion(question, healthContext);
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "answer", answer));
        } catch (Exception e) {
            return ResponseEntity.ok().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}/predictive")
    public ResponseEntity<?> getStudentPredictive(@PathVariable Long studentId) {
        try {
            Map<String, Object> predictive = predictiveAnalysisService.buildStudentPredictive(studentId);
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "predictive", predictive));
        } catch (Exception e) {
            return ResponseEntity.ok().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }
}
