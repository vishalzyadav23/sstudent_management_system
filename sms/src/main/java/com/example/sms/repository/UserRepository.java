package com.example.sms.repository;

import com.example.sms.entity.Student;
import com.example.sms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Boot is smart enough to automatically write the SQL for this based on
    // the method name!
    Optional<User> findByUsername(String username);

    // --- Find a user by their reset token ---
    Optional<User> findByResetToken(String resetToken);

    // --- NEW FOOLPROOF METHOD ---
    // Finds the exact login account linked to a specific student profile
    Optional<User> findByStudent(Student student);
}