package com.example.sms.repository;

import com.example.sms.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MarksRepository extends JpaRepository<Marks, Long> {
    // Get the report card (all marks) for a specific student
    List<Marks> findByStudentId(Long studentId);

    // Get the marks for a specific student in a specific course
    Optional<Marks> findByStudentIdAndCourseId(Long studentId, Long courseId);
}