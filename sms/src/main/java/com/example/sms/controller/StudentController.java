package com.example.sms.controller;

import com.example.sms.dto.ApiResponse;
import com.example.sms.entity.Student;
import com.example.sms.exception.ResourceNotFoundException;
import com.example.sms.repository.StudentRepository;
import com.example.sms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentService service;

    @Autowired
    private StudentRepository studentRepository; // Added to handle profile updates directly

    // --- ADMIN ONLY: Adding a new student ---
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Student>> addStudent(@RequestBody Student student) {
        Student savedStudent = service.addStudent(student);
        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.CREATED.value(), "Student added successfully", savedStudent),
                HttpStatus.CREATED);
    }

    // --- EVERYONE: Viewing all students ---
    @GetMapping
    public ResponseEntity<ApiResponse<List<Student>>> getAllStudents() {
        List<Student> students = service.getAllStudents();
        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(), "Students retrieved successfully", students),
                HttpStatus.OK);
    }

    // --- EVERYONE: Viewing a single student ---
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Student>> getStudentById(@PathVariable Long id) {
        Student student = service.getStudentById(id);
        if (student == null) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(), "Student found", student),
                HttpStatus.OK);
    }

    // --- ADMIN ONLY: Full Update ---
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Student>> updateStudent(@PathVariable Long id,
            @RequestBody Student studentDetails) {
        Student existingStudent = service.getStudentById(id);
        if (existingStudent == null) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }

        Student updatedStudent = service.updateStudent(id, studentDetails);
        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(), "Student updated successfully", updatedStudent),
                HttpStatus.OK);
    }

    // --- NEW: STUDENT ONLY: Update personal contact info ---
    @PutMapping("/my-profile/{id}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse<Student>> updateMyProfile(@PathVariable Long id,
            @RequestBody Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        // SECURITY: A student can only update these two specific fields!
        student.setEmail(studentDetails.getEmail());
        student.setAddress(studentDetails.getAddress());

        Student updatedStudent = studentRepository.save(student);
        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(), "Your profile has been updated successfully!", updatedStudent),
                HttpStatus.OK);
    }

    // --- ADMIN ONLY: Deleting a student ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Object>> deleteStudent(@PathVariable Long id) {
        Student existingStudent = service.getStudentById(id);
        if (existingStudent == null) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }

        service.deleteStudent(id);
        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(), "Student deleted successfully"),
                HttpStatus.OK);
    }
}