package com.example.sms.controller;

import com.example.sms.entity.Course;
import com.example.sms.entity.Enrollment;
import com.example.sms.entity.Faculty;
import com.example.sms.entity.Marks;
import com.example.sms.entity.Attendance;
import com.example.sms.service.*;
import com.example.sms.repository.StudentRepository;
import com.example.sms.repository.CourseRepository;
import com.example.sms.repository.MarksRepository;
import com.example.sms.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp")
@CrossOrigin(origins = "http://localhost:3000") // Allows React to talk to this API
public class ErpController {

    @Autowired
    private CourseService courseService;
    @Autowired
    private FacultyService facultyService;
    @Autowired
    private EnrollmentService enrollmentService;
    @Autowired
    private MarksService marksService;

    // (Removed unused attendanceService to clear the yellow warning)

    // --- REPOSITORIES ADDED FOR QUICK DATA ENTRY ---
    @Autowired
    private StudentRepository studentRepo;
    @Autowired
    private CourseRepository courseRepo;
    @Autowired
    private MarksRepository marksRepo;
    @Autowired
    private AttendanceRepository attendanceRepo;

    // --- COURSE APIs ---
    @PostMapping("/courses")
    public Course addCourse(@RequestBody Course course) {
        return courseService.addCourse(course);
    }

    @GetMapping("/courses")
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    // --- DELETE COURSE API ---
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().body("{\"message\": \"Subject deleted successfully\"}");
    }

    // --- FACULTY APIs ---
    @PostMapping("/faculty")
    public Faculty addFaculty(@RequestBody Faculty faculty) {
        return facultyService.addFaculty(faculty);
    }

    @GetMapping("/faculty")
    public List<Faculty> getAllFaculty() {
        return facultyService.getAllFaculty();
    }

    // --- DELETE FACULTY API ---
    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok().body("{\"message\": \"Faculty removed successfully\"}");
    }

    // --- ENROLLMENT APIs ---
    @PostMapping("/enroll")
    public ResponseEntity<?> enrollStudent(@RequestBody Map<String, Object> payload) {
        Long studentId = ((Number) payload.get("studentId")).longValue();
        Long courseId = ((Number) payload.get("courseId")).longValue();
        Long facultyId = ((Number) payload.get("facultyId")).longValue();
        String semester = (String) payload.get("semester");
        String section = (String) payload.get("section");

        Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId, facultyId, semester, section);
        return ResponseEntity.ok(enrollment);
    }

    // ==========================================
    // --- STUDENT PORTAL APIs ---
    // ==========================================

    @GetMapping("/student/{studentId}/classes")
    public ResponseEntity<List<Enrollment>> getStudentClasses(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getClassesForStudent(studentId));
    }

    @GetMapping("/student/{studentId}/marks")
    public ResponseEntity<List<Marks>> getStudentMarks(@PathVariable Long studentId) {
        return ResponseEntity.ok(marksService.getStudentReportCard(studentId));
    }

    // --- NEW: FETCH STUDENT ATTENDANCE ---
    @GetMapping("/student/{studentId}/attendance")
    public ResponseEntity<?> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceRepo.findByStudentId(studentId));
    }

    // ==========================================
    // --- ACADEMIC RECORD UPDATES (Admin/Faculty) ---
    // ==========================================

    // --- NEW: PUBLISH GRADES ---
    @PostMapping("/marks/publish")
    public ResponseEntity<?> publishMarks(@RequestBody Map<String, Object> payload) {
        try {
            Long studentId = ((Number) payload.get("studentId")).longValue();
            Long courseId = ((Number) payload.get("courseId")).longValue();

            // FIXED: Changed from .intValue() to .doubleValue() to match your Marks entity
            Double internal = ((Number) payload.get("internalMarks")).doubleValue();
            Double semester = ((Number) payload.get("semesterMarks")).doubleValue();

            // Auto-calculate total and grade using Double
            Double total = internal + semester;
            String grade = total >= 90 ? "A+"
                    : total >= 80 ? "A" : total >= 70 ? "B" : total >= 60 ? "C" : total >= 50 ? "D" : "F";

            Marks marks = new Marks();
            marks.setStudent(studentRepo.findById(studentId).get());
            marks.setCourse(courseRepo.findById(courseId).get());

            // FIXED: These now pass Double values correctly
            marks.setInternalMarks(internal);
            marks.setSemesterMarks(semester);
            marks.setTotalMarks(total);
            marks.setGrade(grade);

            marksRepo.save(marks);
            return ResponseEntity.ok().body("{\"message\": \"Marks published successfully!\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Failed to publish marks.\"}");
        }
    }

    // --- NEW: LOG DAILY ATTENDANCE ---
    @PostMapping("/attendance/log")
    public ResponseEntity<?> logAttendance(@RequestBody Map<String, Object> payload) {
        try {
            Long studentId = ((Number) payload.get("studentId")).longValue();
            Long courseId = ((Number) payload.get("courseId")).longValue();
            java.time.LocalDate date = java.time.LocalDate.parse((String) payload.get("date"));
            String status = (String) payload.get("status");

            Attendance att = new Attendance();
            att.setStudent(studentRepo.findById(studentId).get());
            att.setCourse(courseRepo.findById(courseId).get());
            att.setDate(date);
            att.setStatus(status);

            attendanceRepo.save(att);
            return ResponseEntity.ok().body("{\"message\": \"Attendance logged successfully!\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Failed to log attendance.\"}");
        }
    }

    // ==========================================
    // --- NEW: ADMIN QUICK VIEW APIs ---
    // ==========================================

    // --- NEW: Fetch specific student Marks for the Admin Dashboard ---
    @GetMapping("/marks/student/{id}")
    public ResponseEntity<?> getMarksForStudent(@PathVariable Long id) {
        return ResponseEntity.ok(marksRepo.findByStudentId(id));
    }

    // --- NEW: Fetch specific student Attendance for the Admin Dashboard ---
    @GetMapping("/attendance/student/{id}")
    public ResponseEntity<?> getAttendanceForStudent(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceRepo.findByStudentId(id));
    }
}