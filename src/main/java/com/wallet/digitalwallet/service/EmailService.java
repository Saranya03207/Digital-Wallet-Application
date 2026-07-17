package com.wallet.digitalwallet.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ─────────────────────────────────────────────────────
    //  1. REGISTRATION / RESEND OTP
    // ─────────────────────────────────────────────────────
    public void sendOtp(String email, String otp) {
        sendHtmlMail(email, "WalletPay", "🔐 Your WalletPay Verification Code",
                buildOtpHtml(otp,
                        "Email Verification",
                        "Use the code below to verify your <strong>WalletPay</strong> account.",
                        "5 minutes",
                        "#1e3a5f", "#2563eb"));
    }

    // ─────────────────────────────────────────────────────
    //  2. FORGOT PASSWORD OTP
    // ─────────────────────────────────────────────────────
    public void sendForgotPasswordOtp(String email, String name, String otp) {
        sendHtmlMail(email, "WalletPay Security", "🔑 Password Reset Request",
                buildOtpHtml(otp,
                        "Password Reset",
                        "Hi <strong>" + name + "</strong>, use the code below to reset your WalletPay password.",
                        "5 minutes",
                        "#7c3aed", "#8b5cf6"));
    }

    // ─────────────────────────────────────────────────────
    //  3. PASSWORD CHANGED (Reset / Change)
    // ─────────────────────────────────────────────────────
    public void sendPasswordChangedMail(String email, String name) {
        String now = LocalDateTime.now().format(FORMATTER);
        sendHtmlMail(email, "WalletPay Security", "✅ Password Changed Successfully",
                buildAlertHtml(
                        "🔑", "Password Changed",
                        "Your WalletPay password was <strong>changed successfully</strong>.",
                        new String[][]{{"Name", name}, {"Date & Time", now}},
                        "If you did not make this change, contact our support immediately.",
                        "#dc2626", "#fef2f2", "#16a34a", "#f0fdf4"));
    }

    // ─────────────────────────────────────────────────────
    //  4. TRANSACTION PIN CHANGED / SET
    // ─────────────────────────────────────────────────────
    public void sendSecurityMail(String email, String subject, String body) {
        // Parse name from the body if present
        String name = "User";
        if (body.contains("Dear ")) {
            try { name = body.substring(body.indexOf("Dear ") + 5, body.indexOf(",")); }
            catch (Exception ignored) {}
        }
        String now = LocalDateTime.now().format(FORMATTER);
        sendHtmlMail(email, "WalletPay Security", "🔒 " + subject,
                buildAlertHtml(
                        "🔒", "Transaction PIN Updated",
                        "Your WalletPay transaction PIN was <strong>changed successfully</strong>.",
                        new String[][]{{"Name", name}, {"Date & Time", now}},
                        "If you did not perform this action, contact our support immediately.",
                        "#d97706", "#fffbeb", "#d97706", "#fffbeb"));
    }

    // ─────────────────────────────────────────────────────
    //  5. MONEY RECEIVED (Credit Alert)
    // ─────────────────────────────────────────────────────
    public void sendMoneyReceivedMail(String email, String subject, String body) {
        sendHtmlMail(email, "WalletPay", "💰 " + subject,
                buildTransactionHtml(body, "CREDIT", "Money Received", "#16a34a", "#dcfce7", "#15803d", "💰"));
    }

    // ─────────────────────────────────────────────────────
    //  6. MONEY SENT (Debit Alert)
    // ─────────────────────────────────────────────────────
    public void sendMoneySentMail(String email, String subject, String body) {
        sendHtmlMail(email, "WalletPay", "📤 " + subject,
                buildTransactionHtml(body, "DEBIT", "Money Sent", "#2563eb", "#dbeafe", "#1d4ed8", "📤"));
    }

    // ─────────────────────────────────────────────────────
    //  7. KYC APPROVED
    // ─────────────────────────────────────────────────────
    public void sendKycApprovedMail(String email, String name) {
        String now = LocalDateTime.now().format(FORMATTER);
        sendHtmlMail(email, "WalletPay KYC Team", "🎉 Your KYC Verification is Approved!",
                buildStatusNotificationHtml(
                        "🎉", "KYC Verification Approved",
                        "Hi <strong>" + name + "</strong>, your Aadhaar KYC documents have been reviewed and <strong>verified successfully</strong>.",
                        new String[][]{{"Status", "VERIFIED"}, {"Verification Date", now}, {"Daily Limit", "₹1,00,000"}},
                        "ℹ️ Good News",
                        "You now have full access to higher transaction limits and all WalletPay premium features.",
                        "#16a34a", "#f0fdf4"));
    }

    // ─────────────────────────────────────────────────────
    //  8. KYC REJECTED
    // ─────────────────────────────────────────────────────
    public void sendKycRejectedMail(String email, String name, String reason) {
        String now = LocalDateTime.now().format(FORMATTER);
        String reasonText = (reason != null && !reason.trim().isEmpty()) ? reason : "Documents unclear or details mismatched. Please upload clear front and back images.";
        sendHtmlMail(email, "WalletPay KYC Team", "❌ KYC Verification Rejected - Please Try Again",
                buildStatusNotificationHtml(
                        "⚠️", "KYC Verification Rejected",
                        "Hi <strong>" + name + "</strong>, unfortunately your Aadhaar KYC verification could not be approved.",
                        new String[][]{{"Status", "REJECTED"}, {"Reason", reasonText}, {"Reviewed On", now}},
                        "👉 Action Required",
                        "Please log in to WalletPay, navigate to KYC Verification, and upload clear, readable Aadhaar front and back images.",
                        "#dc2626", "#fef2f2"));
    }

    // ═══════════════════════════════════════════════════════
    //  PRIVATE SENDER
    // ═══════════════════════════════════════════════════════
    private void sendHtmlMail(String to, String senderName, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, senderName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("Mail Sent Successfully To : " + to);
        } catch (Exception e) {
            System.err.println("=== EMAIL ERROR === " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("EMAIL_SEND_FAILED: " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════
    //  TEMPLATE: OTP (Registration / Forgot Password)
    // ═══════════════════════════════════════════════════════
    private String buildOtpHtml(String otp, String title, String subtitle,
                                String validity, String gradStart, String gradEnd) {
        return wrap(
            // Header
            header(gradStart, gradEnd) +

            // Body
            "<tr><td style='padding:40px 40px 20px 40px;text-align:center;'>" +
            "<h2 style='color:#1e293b;font-size:22px;font-weight:700;margin:0 0 10px 0;'>" + title + "</h2>" +
            "<p style='color:#64748b;font-size:15px;margin:0 0 30px 0;line-height:1.7;'>" + subtitle + "<br>" +
            "This code expires in <strong>" + validity + "</strong>.</p>" +

            // OTP Box
            "<div style='background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px dashed " + gradEnd + ";" +
            "border-radius:14px;padding:26px 40px;margin:0 auto 30px auto;display:inline-block;'>" +
            "<p style='color:#64748b;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 10px 0;'>Your OTP Code</p>" +
            "<div style='font-size:44px;font-weight:800;letter-spacing:14px;color:" + gradStart + ";" +
            "font-family:Courier New,monospace;'>" + otp + "</div>" +
            "</div>" +

            // Warning box
            "<div style='background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;" +
            "padding:14px 18px;text-align:left;margin-bottom:24px;'>" +
            "<p style='color:#92400e;font-size:13px;margin:0;'>" +
            "<strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. " +
            "WalletPay will never ask for your OTP over call or chat.</p>" +
            "</div>" +

            "<p style='color:#94a3b8;font-size:13px;margin:0;'>Didn't request this? You can safely ignore this email.</p>" +
            "</td></tr>" +

            footer()
        );
    }

    // ═══════════════════════════════════════════════════════
    //  TEMPLATE: Security Alert (PIN, Password)
    // ═══════════════════════════════════════════════════════
    private String buildAlertHtml(String icon, String title, String subtitle,
                                  String[][] details, String warning,
                                  String alertColor, String alertBg,
                                  String successColor, String successBg) {
        StringBuilder detailRows = new StringBuilder();
        for (String[] row : details) {
            detailRows.append(
                "<tr>" +
                "<td style='padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9;width:40%;'>" + row[0] + "</td>" +
                "<td style='padding:10px 16px;color:#1e293b;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;'>" + row[1] + "</td>" +
                "</tr>"
            );
        }

        return wrap(
            header("#1e3a5f", "#2563eb") +

            "<tr><td style='padding:36px 40px 20px 40px;text-align:center;'>" +
            "<div style='font-size:52px;margin-bottom:12px;'>" + icon + "</div>" +
            "<h2 style='color:#1e293b;font-size:21px;font-weight:700;margin:0 0 10px 0;'>" + title + "</h2>" +
            "<p style='color:#64748b;font-size:14px;margin:0 0 28px 0;line-height:1.7;'>" + subtitle + "</p>" +

            // Details Table
            "<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;text-align:left;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'>" + detailRows + "</table>" +
            "</div>" +

            // Warning
            "<div style='background:" + alertBg + ";border-left:4px solid " + alertColor + ";border-radius:8px;" +
            "padding:14px 18px;text-align:left;margin-bottom:20px;'>" +
            "<p style='color:" + alertColor + ";font-size:13px;margin:0;'>" +
            "<strong>🚨 Not You?</strong> " + warning + "</p>" +
            "</div>" +
            "</td></tr>" +
            footer()
        );
    }

    private String buildStatusNotificationHtml(String icon, String title, String subtitle,
                                               String[][] details, String tipTitle, String tipText,
                                               String accentColor, String accentBg) {
        StringBuilder detailRows = new StringBuilder();
        for (String[] row : details) {
            detailRows.append(
                "<tr>" +
                "<td style='padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9;width:40%;'>" + row[0] + "</td>" +
                "<td style='padding:10px 16px;color:#1e293b;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;'>" + row[1] + "</td>" +
                "</tr>"
            );
        }

        return wrap(
            header("#1e3a5f", "#2563eb") +

            "<tr><td style='padding:36px 40px 20px 40px;text-align:center;'>" +
            "<div style='font-size:52px;margin-bottom:12px;'>" + icon + "</div>" +
            "<h2 style='color:#1e293b;font-size:21px;font-weight:700;margin:0 0 10px 0;'>" + title + "</h2>" +
            "<p style='color:#64748b;font-size:14px;margin:0 0 28px 0;line-height:1.7;'>" + subtitle + "</p>" +

            // Details Table
            "<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;text-align:left;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'>" + detailRows + "</table>" +
            "</div>" +

            // Tip/Action Box
            "<div style='background:" + accentBg + ";border-left:4px solid " + accentColor + ";border-radius:8px;" +
            "padding:14px 18px;text-align:left;margin-bottom:20px;'>" +
            "<p style='color:" + accentColor + ";font-size:13px;margin:0;'>" +
            "<strong>" + tipTitle + ":</strong> " + tipText + "</p>" +
            "</div>" +
            "</td></tr>" +
            footer()
        );
    }

    // ═══════════════════════════════════════════════════════
    //  TEMPLATE: Transaction (Credit / Debit)
    // ═══════════════════════════════════════════════════════
    private String buildTransactionHtml(String rawBody, String type,
                                        String title, String color,
                                        String bg, String darkColor, String icon) {
        // Parse the raw body into structured lines
        String[] lines = rawBody.split("\n");
        String name = "User";
        String amount = "";
        String txnId = "";
        String upi = "";
        String balance = "";
        String date = "";
        String party = "";

        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("Dear ") && line.endsWith(",")) {
                name = line.substring(5, line.length() - 1);
            } else if (line.contains("₹") && (line.contains("transferred") || line.contains("received"))) {
                amount = line;
            } else if (line.startsWith("UPI Transaction ID")) {
                txnId = line.replace("UPI Transaction ID : ", "").trim();
            } else if (line.startsWith("Sender UPI") || line.startsWith("Receiver UPI")) {
                upi = line.replace("Sender UPI : ", "").replace("Receiver UPI : ", "").trim();
            } else if (line.startsWith("Available Balance")) {
                balance = line.replace("Available Balance : ", "").trim();
            } else if (line.startsWith("Date")) {
                date = line.replace("Date : ", "").trim();
            } else if (line.startsWith("Sender") || line.startsWith("Received from")) {
                party = line;
            }
        }

        // Extract amount value
        String amountVal = "";
        if (!amount.isEmpty()) {
            int rupeeIdx = amount.indexOf("₹");
            int spaceIdx = amount.indexOf(" ", rupeeIdx);
            if (rupeeIdx >= 0 && spaceIdx > rupeeIdx) {
                amountVal = amount.substring(rupeeIdx, spaceIdx);
            }
        }

        return wrap(
            header("#1e3a5f", "#2563eb") +

            // Type Banner
            "<tr><td style='background:" + bg + ";padding:18px 40px;text-align:center;" +
            "border-bottom:3px solid " + color + ";'>" +
            "<span style='font-size:28px;'>" + icon + "</span>" +
            "<h2 style='color:" + darkColor + ";margin:4px 0 0 0;font-size:18px;font-weight:700;'>" + title + "</h2>" +
            "</td></tr>" +

            "<tr><td style='padding:32px 40px;'>" +

            // Greeting
            "<p style='color:#334155;font-size:15px;margin:0 0 24px 0;'>Dear <strong>" + name + "</strong>,</p>" +

            // Amount Card
            "<div style='background:" + bg + ";border:2px solid " + color + ";border-radius:14px;" +
            "padding:24px;text-align:center;margin-bottom:24px;'>" +
            "<p style='color:" + darkColor + ";font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;'>" +
            (type.equals("CREDIT") ? "Amount Received" : "Amount Debited") + "</p>" +
            "<div style='font-size:36px;font-weight:800;color:" + darkColor + ";'>" +
            (amountVal.isEmpty() ? "₹--" : amountVal) + "</div>" +
            "</div>" +

            // Details Table
            "<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'>" +
            detailRow("Transaction ID", txnId.isEmpty() ? "—" : txnId) +
            detailRow((type.equals("CREDIT") ? "Sender UPI" : "Receiver UPI"), upi.isEmpty() ? "—" : upi) +
            detailRow("Available Balance", balance.isEmpty() ? "—" : balance) +
            detailRow("Date & Time", date.isEmpty() ? LocalDateTime.now().format(FORMATTER) : date) +
            "</table></div>" +

            // Footer note
            "<div style='background:#f1f5f9;border-radius:8px;padding:12px 16px;'>" +
            "<p style='color:#64748b;font-size:12px;margin:0;text-align:center;'>" +
            "💡 Check your WalletPay app for full transaction history.</p>" +
            "</div>" +

            "</td></tr>" +
            footer()
        );
    }

    // ═══════════════════════════════════════════════════════
    //  SHARED HTML COMPONENTS
    // ═══════════════════════════════════════════════════════
    private String wrap(String content) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1.0'></head>" +
            "<body style='margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9;padding:36px 0;'>" +
            "<tr><td align='center'>" +
            "<table width='560' cellpadding='0' cellspacing='0' " +
            "style='background:#ffffff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.10);overflow:hidden;max-width:560px;'>" +
            content +
            "</table></td></tr></table>" +
            "</body></html>";
    }

    private String header(String gradStart, String gradEnd) {
        return "<tr><td style='background:linear-gradient(135deg," + gradStart + " 0%," + gradEnd + " 100%);" +
            "padding:32px 40px;text-align:center;'>" +
            "<div style='font-size:38px;margin-bottom:8px;'>💳</div>" +
            "<h1 style='color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:1px;'>WalletPay</h1>" +
            "<p style='color:rgba(255,255,255,0.7);margin:4px 0 0 0;font-size:11px;letter-spacing:3px;'>DIGITAL WALLET</p>" +
            "</td></tr>";
    }

    private String footer() {
        return "<tr><td style='background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 40px;text-align:center;'>" +
            "<p style='color:#94a3b8;font-size:12px;margin:0 0 4px 0;'>© 2026 WalletPay · All rights reserved</p>" +
            "<p style='color:#cbd5e1;font-size:11px;margin:0;'>This is an automated message. Please do not reply to this email.</p>" +
            "</td></tr>";
    }

    private String detailRow(String label, String value) {
        return "<tr>" +
            "<td style='padding:11px 18px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9;width:42%;'>" + label + "</td>" +
            "<td style='padding:11px 18px;color:#1e293b;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;'>" + value + "</td>" +
            "</tr>";
    }
}