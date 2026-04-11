package com.example.sms.service;

import com.example.sms.entity.Course;
import com.example.sms.entity.Marks;
import com.example.sms.entity.Student;
import com.example.sms.repository.CourseRepository;
import com.example.sms.repository.MarksRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarksService {

    @Autowired
    private MarksRepository marksRepo;
    @Autowired
    private StudentRepository studentRepo;
    @Autowired
    private CourseRepository courseRepo;

    public Marks saveMarks(Long studentId, Long courseId, Double internal, Double semester) {
        Student student = studentRepo.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if marks already exist, if so update them, otherwise create new
        Marks marks = marksRepo.findByStudentIdAndCourseId(studentId, courseId).orElse(new Marks());

        marks.setStudent(student);
        marks.setCourse(course);
        marks.setInternalMarks(internal);
        marks.setSemesterMarks(semester);

        // Calculate Total
        double total = (internal != null ? internal : 0) + (semester != null ? semester : 0);
        marks.setTotalMarks(total);

        // Auto-assign Grade based on Total (Assuming out of 100)
        marks.setGrade(calculateGrade(total));

        return marksRepo.save(marks);
    }

    public List<Marks> getStudentReportCard(Long studentId) {
        return marksRepo.findByStudentId(studentId);
    }

    // Helper method to automatically calculate letter grades
    private String calculateGrade(double total) {
        if (total >= 90)
            return "A+";
        if (total >= 80)
            return "A";
        if (total >= 70)
            return "B";
        if (total >= 60)
            return "C";
        if (total >= 50)
            return "D";
        return "F"; // Fail
    }
}