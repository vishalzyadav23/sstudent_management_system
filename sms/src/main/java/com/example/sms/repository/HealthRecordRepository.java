package com.example.sms.repository;

import com.example.sms.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    // This will let us easily fetch a specific student's health history later!
    List<HealthRecord> findByStudentIdOrderByRecordedAtDesc(Long studentId);
}