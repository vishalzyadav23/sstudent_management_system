package com.example.sms.repository;

import com.example.sms.entity.MedicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
    List<MedicalDocument> findByStudentIdOrderByUploadedAtDesc(Long studentId);
}
