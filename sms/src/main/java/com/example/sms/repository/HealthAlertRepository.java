package com.example.sms.repository;

import com.example.sms.entity.HealthAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthAlertRepository extends JpaRepository<HealthAlert, Long> {
    List<HealthAlert> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
