package com.example.sms.repository;

import com.example.sms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    // Find all courses a specific student is enrolled in
    List<Enrollment> findByStudentId(Long studentId);

    // Find all students taking a specific course
    List<Enrollment> findByCourseId(Long courseId);

    // Find all classes a specific professor is teaching
    List<Enrollment> findByFacultyId(Long facultyId);
}