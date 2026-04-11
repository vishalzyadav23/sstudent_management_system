package com.example.sms.service;

import com.example.sms.entity.Student;
import com.example.sms.repository.AttendanceRepository;
import com.example.sms.repository.EnrollmentRepository;
import com.example.sms.repository.MarksRepository;
import com.example.sms.repository.StudentRepository;
import com.example.sms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    @Autowired
    private UserRepository userRepository;

    // --- NEW ERP REPOSITORIES FOR CLEANUP ---
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Student addStudent(Student student) {
        return repo.save(student);
    }

    public List<Student> getAllStudents() {
        return repo.findAll();
    }

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

    @Transactional // <-- CRITICAL: Ensures all deletes happen as one unit
    public void deleteStudent(Long id) {
        // 1. Get the exact student object
        Student student = repo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

        // 2. Safely delete all Grades/Marks linked to this student
        marksRepository.findByStudentId(id).forEach(mark -> marksRepository.delete(mark));

        // 3. Safely delete all Attendance records linked to this student
        attendanceRepository.findByStudentId(id).forEach(attendance -> attendanceRepository.delete(attendance));

        // 4. Safely delete all Class Enrollments linked to this student
        enrollmentRepository.findByStudentId(id).forEach(enrollment -> enrollmentRepository.delete(enrollment));

        // 5. Find the linked User account using the exact Student object and delete it
        userRepository.findByStudent(student).ifPresent(user -> {
            userRepository.delete(user);
        });

        // 6. FORCE the database to execute all deletions RIGHT NOW to clear constraints
        marksRepository.flush();
        attendanceRepository.flush();
        enrollmentRepository.flush();
        userRepository.flush();

        // 7. Now it is 100% safe to delete the student profile without throwing a 500
        // error
        repo.deleteById(id);
    }
}