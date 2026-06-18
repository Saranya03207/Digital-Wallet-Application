package com.wallet.digitalwallet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(
            String email,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "WalletPay Email Verification");

        message.setText(
                "Your WalletPay OTP is : "
                        + otp
                        + "\n\nValid for 5 minutes.");

        mailSender.send(message);

        System.out.println(
                "Mail Sent Successfully To : "
                        + email);
    }
    public void sendMoneyReceivedMail(
            String email,
            String subject,
            String body) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    public void sendMoneySentMail(
            String email,
            String subject,
            String body) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    public void sendSecurityMail(
            String email,
            String subject,
            String body) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
    
    public void sendPasswordChangedMail(
            String email,
            String name) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "WalletPay Password Changed");

        message.setText(
                "Dear " + name +
                ",\n\nYour WalletPay account password was changed successfully."
                + "\n\nIf you did not perform this action, please contact support immediately."
                + "\n\nWalletPay Security Team");

        mailSender.send(message);
    }
}