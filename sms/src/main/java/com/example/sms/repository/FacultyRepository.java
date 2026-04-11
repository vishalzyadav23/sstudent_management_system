package com.example.sms.repository;

import com.example.sms.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmail(String email);

    // Find all professors in a specific department (e.g., "CS" or "Mechanical")
    java.util.List<Faculty> findByDepartment(String department);
}