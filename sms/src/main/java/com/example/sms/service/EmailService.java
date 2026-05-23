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

    // Grabs your email from application.properties
    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(toEmail);
        message.setSubject("EduCore ERP - Password Reset Request");

        message.setText("Hello,\n\n"
                + "We received a request to reset your password for your EduCore ERP account.\n\n"
                + "Please click the secure link below to set a new password:\n"
                + resetLink + "\n\n"
                + "If you did not request this, please ignore this email. Your account is safe.\n\n"
                + "Best Regards,\n"
                + "EduCore IT Support");

        mailSender.send(message);
        System.out.println("✅ SUCCESS: Email handed off to Google SMTP for " + toEmail);
    }

    public void sendHealthAlertEmail(String[] toEmails, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(toEmails);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
        System.out.println("✅ SUCCESS: Health alert email sent to " + String.join(", ", toEmails));
    }
}
