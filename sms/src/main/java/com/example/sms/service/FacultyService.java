package com.example.sms.service;

import com.example.sms.entity.Faculty;
import com.example.sms.repository.FacultyRepository;
import com.example.sms.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepo;

    @Autowired
    private EnrollmentRepository enrollmentRepo;

    public Faculty addFaculty(Faculty faculty) {
        return facultyRepo.save(faculty);
    }

    public List<Faculty> getAllFaculty() {
        return facultyRepo.findAll();
    }

    // --- NEW: SAFE DELETE LOGIC ---
    @Transactional
    public void deleteFaculty(Long id) {
        // 1. Delete all Enrollments linked to this professor
        enrollmentRepo.findAll().stream()
                .filter(e -> e.getFaculty() != null && e.getFaculty().getId().equals(id))
                .forEach(enrollmentRepo::delete);

        // 2. Force the database to clear these constraints right now
        enrollmentRepo.flush();

        // 3. Safely delete the professor profile
        facultyRepo.deleteById(id);
    }
}