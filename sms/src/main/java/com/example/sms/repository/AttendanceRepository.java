package com.example.sms.repository;

import com.example.sms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // Get a student's entire attendance record
    List<Attendance> findByStudentId(Long studentId);

    // Get a student's attendance for one specific subject
    List<Attendance> findByStudentIdAndCourseId(Long studentId, Long courseId);
}