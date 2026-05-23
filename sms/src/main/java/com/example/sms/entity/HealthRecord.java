package com.example.sms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int bpm;
    private int spo2;
    private float bodyTemp;
    private float roomTemp;
    private float roomHumidity;

    private String deviceSource;
    private String alertStatus;
    private boolean emergencyEscalated;
    private String escalationReason;

    // This records exactly when the ESP8266 sent the data
    private LocalDateTime recordedAt;

    // Link this health data to a specific student in your ERP
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    // Automatically set the timestamp when the record is created
    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }

    // --- GETTERS AND SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getBpm() {
        return bpm;
    }

    public void setBpm(int bpm) {
        this.bpm = bpm;
    }

    public int getSpo2() {
        return spo2;
    }

    public void setSpo2(int spo2) {
        this.spo2 = spo2;
    }

    public float getBodyTemp() {
        return bodyTemp;
    }

    public void setBodyTemp(float bodyTemp) {
        this.bodyTemp = bodyTemp;
    }

    public float getRoomTemp() {
        return roomTemp;
    }

    public void setRoomTemp(float roomTemp) {
        this.roomTemp = roomTemp;
    }

    public float getRoomHumidity() {
        return roomHumidity;
    }

    public void setRoomHumidity(float roomHumidity) {
        this.roomHumidity = roomHumidity;
    }

    public String getDeviceSource() {
        return deviceSource;
    }

    public void setDeviceSource(String deviceSource) {
        this.deviceSource = deviceSource;
    }

    public String getAlertStatus() {
        return alertStatus;
    }

    public void setAlertStatus(String alertStatus) {
        this.alertStatus = alertStatus;
    }

    public boolean isEmergencyEscalated() {
        return emergencyEscalated;
    }

    public void setEmergencyEscalated(boolean emergencyEscalated) {
        this.emergencyEscalated = emergencyEscalated;
    }

    public String getEscalationReason() {
        return escalationReason;
    }

    public void setEscalationReason(String escalationReason) {
        this.escalationReason = escalationReason;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }
}