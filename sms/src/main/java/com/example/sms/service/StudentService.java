package com.example.sms.service;

import com.example.sms.entity.Student;
import com.example.sms.repository.StudentRepository;
import com.example.sms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- Added this import

import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    @Autowired
    private UserRepository userRepository;

    public Student addStudent(Student student) {
        return repo.save(student);
    }

    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    // --- NEW METHODS ---
    public Student getStudentById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @Transactional // <-- Keeps the database sync safe
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = repo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

        String newEmail = studentDetails.getEmail();

        // Update the fields with the new data from React
        student.setName(studentDetails.getName());
        student.setRollNumber(studentDetails.getRollNumber());
        student.setEmail(studentDetails.getEmail());
        student.setPhoneNumber(studentDetails.getPhoneNumber());
        student.setDepartment(studentDetails.getDepartment());
        student.setAcademicYear(studentDetails.getAcademicYear());
        student.setAddress(studentDetails.getAddress());

        // --- THE FOOLPROOF SYNC FIX ---
        // Find the exact user linked to this specific student record (ignores duplicate
        // emails)
        userRepository.findByStudent(student).ifPresent(user -> {
            user.setUsername(newEmail);
            userRepository.save(user);
        });

        // Save the updated student back to PostgreSQL
        return repo.save(student);
    }

    @Transactional // <-- CRITICAL: Ensures both deletes happen as one unit
    public void deleteStudent(Long id) {
        // 1. Get the exact student object
        Student student = repo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

        // 2. Find the linked User account using the exact Student object
        userRepository.findByStudent(student).ifPresent(user -> {
            userRepository.delete(user);
        });

        // 3. FORCE the database to execute the user deletion RIGHT NOW
        userRepository.flush();

        // 4. Now it is 100% safe to delete the student
        repo.deleteById(id);
    }
}