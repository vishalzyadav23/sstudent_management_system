package com.example.sms.service;

import com.example.sms.entity.Attendance;
import com.example.sms.entity.Course;
import com.example.sms.entity.Student;
import com.example.sms.repository.AttendanceRepository;
import com.example.sms.repository.CourseRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepo;
    @Autowired
    private StudentRepository studentRepo;
    @Autowired
    private CourseRepository courseRepo;

    // Faculty marks attendance for a student
    public Attendance markAttendance(Long studentId, Long courseId, LocalDate date, String status) {
        Student student = studentRepo.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setCourse(course);
        attendance.setDate(date);
        attendance.setStatus(status.toUpperCase()); // "PRESENT" or "ABSENT"

        return attendanceRepo.save(attendance);
    }

    // Calculates the attendance percentage for a student in a specific course
    public double getAttendancePercentage(Long studentId, Long courseId) {
        List<Attendance> records = attendanceRepo.findByStudentIdAndCourseId(studentId, courseId);

        if (records.isEmpty())
            return 0.0;

        long presentCount = records.stream()
                .filter(a -> a.getStatus().equals("PRESENT"))
                .count();

        return ((double) presentCount / records.size()) * 100;
    }
}