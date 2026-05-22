package com.example.sms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String courseCode; // e.g., CS101

    @Column(nullable = false)
    private String courseName; // e.g., Data Structures

    private int credits;
    private int semester; // e.g., Semester 1, 2, 3...

    // --- NEW FIELD: Class Date & Time ---
    private String classTiming; // e.g., "Mon & Wed 10:00 AM"

    @Column(columnDefinition = "TEXT")
    private String content; // Syllabus/Notes

    @Column(columnDefinition = "TEXT")
    private String videoUrl; // YouTube link

    // --- GETTERS AND SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    // --- NEW GETTER/SETTER FOR SCHEDULE TIMING ---
    public String getClassTiming() {
        return classTiming;
    }

    public void setClassTiming(String classTiming) {
        this.classTiming = classTiming;
    }
}