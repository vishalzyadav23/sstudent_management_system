package com.example.sms.service;

import com.example.sms.entity.Course;
import com.example.sms.entity.Enrollment;
import com.example.sms.entity.Faculty;
import com.example.sms.entity.Student;
import com.example.sms.repository.CourseRepository;
import com.example.sms.repository.EnrollmentRepository;
import com.example.sms.repository.FacultyRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepo;
    @Autowired
    private StudentRepository studentRepo;
    @Autowired
    private CourseRepository courseRepo;
    @Autowired
    private FacultyRepository facultyRepo;

    @Transactional
    public Enrollment enrollStudent(Long studentId, Long courseId, Long facultyId, String semester, String section) {

        // 1. Verify everything exists
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found!"));
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));
        Faculty faculty = facultyRepo.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found!"));

        // 2. Create the Enrollment Bridge
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setFaculty(faculty);
        enrollment.setAcademicSemester(semester);
        enrollment.setSection(section);

        // 3. Save it to the database
        return enrollmentRepo.save(enrollment);
    }

    // Get all classes for a specific student (For the Student Dashboard)
    public List<Enrollment> getClassesForStudent(Long studentId) {
        return enrollmentRepo.findByStudentId(studentId);
    }

    // Get all students for a specific professor (For the Faculty Dashboard)
    public List<Enrollment> getClassesForFaculty(Long facultyId) {
        return enrollmentRepo.findByFacultyId(facultyId);
    }
}