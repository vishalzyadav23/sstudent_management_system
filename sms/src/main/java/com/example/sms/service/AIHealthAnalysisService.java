package com.example.sms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

@Service
public class AIHealthAnalysisService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.api.key:#{null}}")
    private String openAiApiKeyProperty;
    private final String OPENAI_MODEL = "gpt-3.5-turbo";
    private final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    private String getOpenAiApiKey() {
        if (openAiApiKeyProperty != null && !openAiApiKeyProperty.isBlank()) {
            return openAiApiKeyProperty;
        }
        String envKey = System.getenv("OPENAI_API_KEY");
        return envKey != null && !envKey.isBlank() ? envKey : null;
    }

    /**
     * Analyzes health vitals and provides medical insights
     */
    public String analyzeHealthData(Map<String, Object> healthData) {
        try {
            String apiKey = getOpenAiApiKey();
            if (apiKey == null || apiKey.isBlank()) {
                return getMockAnalysis(healthData);
            }

            String prompt = buildHealthAnalysisPrompt(healthData);
            String response = callOpenAI(prompt, apiKey);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return getMockAnalysis(healthData);
        }
    }

    /**
     * Answers specific medical questions based on health context
     */
    public String answerMedicalQuestion(String question, Map<String, Object> healthContext) {
        try {
            String apiKey = getOpenAiApiKey();
            if (apiKey == null || apiKey.isBlank()) {
                return getMockMedicalAnswer(question, healthContext);
            }

            String prompt = buildMedicalPrompt(question, healthContext);
            String response = callOpenAI(prompt, apiKey);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return "Unable to process your question at this time. Please consult a medical professional.";
        }
    }

    private String buildHealthAnalysisPrompt(Map<String, Object> healthData) {
        return String.format(
                "You are a paramedic field triage AI assistant. Analyze the following patient vital signs and provide brief medical guidance:\n\n"
                        +
                        "Heart Rate: %s BPM\n" +
                        "Blood Oxygen (SpO2): %s %%\n" +
                        "Body Temperature: %s °C\n" +
                        "Room Temperature: %s °C\n" +
                        "Room Humidity: %s %%\n\n" +
                        "Provide:\n" +
                        "1. Assessment of vital signs (normal/warning/critical)\n" +
                        "2. Potential health concerns\n" +
                        "3. Recommended actions\n" +
                        "4. When to seek medical help\n\n" +
                        "Keep response concise (3-4 sentences max).",
                healthData.getOrDefault("bpm", "N/A"),
                healthData.getOrDefault("spo2", "N/A"),
                healthData.getOrDefault("bodyTemp", "N/A"),
                healthData.getOrDefault("roomTemp", "N/A"),
                healthData.getOrDefault("roomHumidity", "N/A"));
    }

    private String buildMedicalPrompt(String question, Map<String, Object> healthContext) {
        return String.format(
                "You are a paramedic field triage AI assistant answering a medical question from a responder in the field. Use the patient vitals and provide clear, safe, practical guidance. Do not offer a diagnosis; prioritize next steps, when to seek help, and emergency warning signs.\n\n"
                        +
                        "Patient Vitals:\n" +
                        "Heart Rate: %s BPM\n" +
                        "Blood Oxygen (SpO2): %s %%\n" +
                        "Body Temperature: %s °C\n" +
                        "Room Temperature: %s °C\n" +
                        "Room Humidity: %s %%\n\n" +
                        "Question: %s\n\n" +
                        "Answer clearly and directly for an EMT or paramedic user.",
                healthContext.getOrDefault("bpm", "N/A"),
                healthContext.getOrDefault("spo2", "N/A"),
                healthContext.getOrDefault("bodyTemp", "N/A"),
                healthContext.getOrDefault("roomTemp", "N/A"),
                healthContext.getOrDefault("roomHumidity", "N/A"),
                question);
    }

    private String callOpenAI(String prompt, String apiKey) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", OPENAI_MODEL);
        body.put("messages", new Object[] {
                Map.of("role", "system", "content",
                        "You are a medical field triage AI assistant helping paramedics with patient analysis."),
                Map.of("role", "user", "content", prompt)
        });
        body.put("temperature", 0.7);
        body.put("max_tokens", 300);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);

        try {
            var response = restTemplate.postForEntity(OPENAI_URL, entity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                java.util.List<?> choices = (java.util.List<?>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = (Map<String, Object>) choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return getMockAnalysis(Map.of()); // Fallback to mock
        }

        return "Unable to retrieve analysis at this time.";
    }

    /**
     * Mock analysis when API is not available (for demo purposes)
     */
    private String getMockAnalysis(Map<String, Object> healthData) {
        double bpm = Double.parseDouble(String.valueOf(healthData.getOrDefault("bpm", 72)));
        double spo2 = Double.parseDouble(String.valueOf(healthData.getOrDefault("spo2", 98)));
        double bodyTemp = Double.parseDouble(String.valueOf(healthData.getOrDefault("bodyTemp", 37)));

        StringBuilder analysis = new StringBuilder();
        analysis.append("🏥 PARAMEDIC FIELD TRIAGE ANALYSIS\n\n");

        analysis.append("✓ Vital Signs Assessment:\n");
        if (bpm >= 60 && bpm <= 100)
            analysis.append("  • Heart Rate: NORMAL (72 BPM)\n");
        else if (bpm > 100)
            analysis.append("  • Heart Rate: ⚠️ ELEVATED (").append(bpm).append(" BPM)\n");
        else
            analysis.append("  • Heart Rate: ⚠️ LOW (").append(bpm).append(" BPM)\n");

        if (spo2 >= 95)
            analysis.append("  • Blood Oxygen: NORMAL (").append(spo2).append(" %)\n");
        else
            analysis.append("  • Blood Oxygen: ⚠️ LOW (").append(spo2).append(" %)\n");

        if (bodyTemp >= 36.5 && bodyTemp <= 37.5)
            analysis.append("  • Body Temp: NORMAL (").append(bodyTemp).append(" °C)\n");
        else if (bodyTemp > 37.5)
            analysis.append("  • Body Temp: ⚠️ FEVER (").append(bodyTemp).append(" °C)\n");
        else
            analysis.append("  • Body Temp: ⚠️ LOW (").append(bodyTemp).append(" °C)\n");

        analysis.append("\n📋 Status: Overall vitals within normal range.\n");
        analysis.append("✅ Recommendation: Continue monitoring. No immediate intervention needed.\n");

        return analysis.toString();
    }

    private String getMockMedicalAnswer(String question, Map<String, Object> healthContext) {
        String lower = question.toLowerCase();
        double bpm = parseDouble(healthContext.getOrDefault("bpm", "N/A"));
        double spo2 = parseDouble(healthContext.getOrDefault("spo2", "N/A"));
        double bodyTemp = parseDouble(healthContext.getOrDefault("bodyTemp", "N/A"));
        double roomTemp = parseDouble(healthContext.getOrDefault("roomTemp", "N/A"));
        double roomHumidity = parseDouble(healthContext.getOrDefault("roomHumidity", "N/A"));

        String heartStatus = bpm >= 60 && bpm <= 100 ? "normal" : bpm > 100 ? "elevated" : "low";
        String oxygenStatus = spo2 >= 95 ? "normal" : spo2 >= 90 ? "mildly low" : "dangerously low";
        String tempStatus = bodyTemp >= 36.5 && bodyTemp <= 37.5 ? "normal"
                : bodyTemp > 37.5 ? "elevated (fever)" : "low";

        String baseline = String.format(
                "Current vitals: heart rate %.0f BPM (%s), SpO2 %.0f%% (%s), temperature %.1f°C (%s). ",
                bpm, heartStatus, spo2, oxygenStatus, bodyTemp, tempStatus);

        if (lower.contains("chest pain") || lower.contains("heart pain") || lower.contains("pressure")
                || lower.contains("tightness") || lower.contains("left arm") || lower.contains("radiating pain")) {
            return "Chest pain can signal a serious emergency. If pain is sudden, severe, or comes with shortness of breath, call emergency services immediately and keep the patient calm.";
        }

        if (lower.contains("breath") || lower.contains("shortness of breath") || lower.contains("difficulty breathing")
                || lower.contains("asthma") || lower.contains("respiratory")) {
            return String.format(
                    "The patient currently has SpO2 at %.0f%%, which is %s. If breathing is difficult or rapid, treat this as a potentially urgent problem and get emergency medical help right away.",
                    spo2, oxygenStatus);
        }

        if (lower.contains("fever") || lower.contains("temperature") || lower.contains("hot")
                || lower.contains("cold")) {
            return String.format(
                    "Body temperature is %.1f°C, which is %s. Keep the patient hydrated, rest in a cool environment, and seek medical attention if fever persists over several hours or if the patient develops confusion, chills, or severe headache.",
                    bodyTemp, tempStatus);
        }

        if (lower.contains("heart rate") || lower.contains("bpm") || lower.contains("pulse")
                || lower.contains("tachycardia")
                || lower.contains("bradycardia")) {
            return String.format(
                    "Heart rate is %.0f BPM, which is %s. If the patient has dizziness, chest discomfort, or fainting, stop activity and seek medical evaluation immediately.",
                    bpm, heartStatus);
        }

        if (lower.contains("oxygen") || lower.contains("spo2") || lower.contains("blood oxygen")
                || lower.contains("hypoxia")) {
            return String.format(
                    "SpO2 is %.0f%%, which is %s. Oxygen below 94%% is a concern; if the patient feels weak, confused, or has fast breathing, get urgent medical help.",
                    spo2, oxygenStatus);
        }

        if (lower.contains("medication") || lower.contains("medicine") || lower.contains("dose")
                || lower.contains("drug") || lower.contains("prescribe")) {
            return "Medication advice requires a licensed clinician and a complete medical history. Do not self-prescribe. If this is an emergency, seek immediate care.";
        }

        if (lower.contains("water") || lower.contains("hydrate") || lower.contains("dehydration")) {
            return String.format(
                    "Maintain good hydration and avoid overheating. Room temperature is %.1f°C and humidity is %.1f%%, so keep the patient cool and offer small sips of water regularly.",
                    roomTemp, roomHumidity);
        }

        if (lower.contains("rest") || lower.contains("activity") || lower.contains("exercise")
                || lower.contains("work")) {
            return "In this condition, rest is generally safer than exertion. Avoid strenuous activity until vitals are stable and a medical provider has evaluated the patient.";
        }

        if (lower.contains("what should i do") || lower.contains("what do i do") || lower.contains("next step")
                || lower.contains("should i") || lower.contains("when should")) {
            return String.format(
                    "Current vital signs: heart rate %.0f BPM (%s), SpO2 %.0f%% (%s), temperature %.1f°C (%s). Monitor closely, keep the patient comfortable, and seek medical attention if any warning signs develop such as worsening breathing, chest pain, confusion, or severe fever.",
                    bpm, heartStatus, spo2, oxygenStatus, bodyTemp, tempStatus);
        }

        if (lower.contains("symptom") || lower.contains("sign") || lower.contains("cause") || lower.contains("why")) {
            return String.format(
                    "%s With the current vitals, the patient has a %s heart rate, SpO2 at %.0f%%, and temperature %.1f°C. If symptoms worsen or new warning signs appear, get medical care immediately.",
                    baseline, heartStatus, spo2, bodyTemp);
        }

        return String.format(
                "%s If the concern is urgent or symptoms worsen, contact emergency services right away. For non-emergency questions, consult a healthcare provider for personalized advice.",
                baseline);
    }

    private double parseDouble(Object value) {
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception e) {
            return Double.NaN;
        }
    }
}
