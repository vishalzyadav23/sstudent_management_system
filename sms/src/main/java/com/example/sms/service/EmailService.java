package com.example.sms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // This automatically grabs your email from application.properties!
    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();

        // FIXED: Now it dynamically uses the correct email without typos
        message.setFrom(senderEmail);

        // 2. Who is it going to?
        message.setTo(toEmail);

        // 3. The Subject Line
        message.setSubject("EduCore ERP - Password Reset Request");

        // 4. The actual email body
        message.setText("Hello,\n\n"
                + "We received a request to reset your password for your EduCore ERP account.\n\n"
                + "Please click the secure link below to set a new password:\n"
                + resetLink + "\n\n"
                + "If you did not request this, please ignore this email. Your account is safe.\n\n"
                + "Best Regards,\n"
                + "EduCore IT Support");

        // 5. Send it!
        mailSender.send(message);
        System.out.println("SUCCESS: Email handed off to Google SMTP for " + toEmail);
    }
}