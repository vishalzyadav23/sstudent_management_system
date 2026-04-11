package com.example.sms.service;

import com.example.sms.entity.Course;
import com.example.sms.repository.CourseRepository;
import com.example.sms.repository.EnrollmentRepository;
import com.example.sms.repository.MarksRepository;
import com.example.sms.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private EnrollmentRepository enrollmentRepo;

    @Autowired
    private MarksRepository marksRepo;

    @Autowired
    private AttendanceRepository attendanceRepo;

    public Course addCourse(Course course) {
        return courseRepo.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    // --- NEW: SAFE DELETE LOGIC ---
    @Transactional
    public void deleteCourse(Long id) {
        // 1. Delete all Marks linked to this course
        marksRepo.findAll().stream()
                .filter(m -> m.getCourse() != null && m.getCourse().getId().equals(id))
                .forEach(marksRepo::delete);

        // 2. Delete all Attendance linked to this course
        attendanceRepo.findAll().stream()
                .filter(a -> a.getCourse() != null && a.getCourse().getId().equals(id))
                .forEach(attendanceRepo::delete);

        // 3. Delete all Enrollments linked to this course
        enrollmentRepo.findAll().stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(id))
                .forEach(enrollmentRepo::delete);

        // 4. Force the database to clear these constraints right now
        marksRepo.flush();
        attendanceRepo.flush();
        enrollmentRepo.flush();

        // 5. Finally, safely delete the course
        courseRepo.deleteById(id);
    }
}