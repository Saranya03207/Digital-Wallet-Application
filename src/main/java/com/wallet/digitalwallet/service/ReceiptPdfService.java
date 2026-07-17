package com.wallet.digitalwallet.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.User;

@Service
public class ReceiptPdfService {

    public byte[] generateReceipt(Transaction txn, User requestingUser) throws Exception {
        Document document = new Document(PageSize.A5);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        // Colors
        BaseColor purple = new BaseColor(99, 102, 241);
        BaseColor lightGray = new BaseColor(241, 245, 249);
        BaseColor green = new BaseColor(16, 185, 129);
        BaseColor red = new BaseColor(239, 68, 68);

        // ─── Header ───
        Font brandFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, purple);
        Paragraph brand = new Paragraph("WalletPay", brandFont);
        brand.setAlignment(Element.ALIGN_CENTER);
        document.add(brand);

        Font subFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.GRAY);
        Paragraph sub = new Paragraph("Digital Payment Receipt", subFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        document.add(sub);

        document.add(new Paragraph(" "));

        // ─── Status Badge ───
        boolean isSuccess = txn.getTransactionStatus() != null &&
                txn.getTransactionStatus().name().equals("SUCCESS");
        Font statusFont = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD,
                isSuccess ? green : red);
        Paragraph status = new Paragraph(isSuccess ? "✓  Payment Successful" : "✗  Payment Failed", statusFont);
        status.setAlignment(Element.ALIGN_CENTER);
        document.add(status);

        // ─── Amount ───
        Font amountFont = new Font(Font.FontFamily.HELVETICA, 28, Font.BOLD, BaseColor.BLACK);
        Paragraph amount = new Paragraph("₹" + txn.getAmount(), amountFont);
        amount.setAlignment(Element.ALIGN_CENTER);
        document.add(amount);

        document.add(new Paragraph(" "));

        // ─── Details Table ───
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{40f, 60f});

        Font labelFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.GRAY);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.BLACK);

        String[][] rows = {
            {"Transaction ID", txn.getUpiTransactionId() != null ? txn.getUpiTransactionId() : "N/A"},
            {"Date & Time", txn.getTransactionDate() != null ?
                    txn.getTransactionDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) : "N/A"},
            {"Type", txn.getTransactionType() != null ? txn.getTransactionType().name() : "N/A"},
            {"From", txn.getSender() != null ? txn.getSender().getFullName() : "N/A"},
            {"To", txn.getReceiver() != null ? txn.getReceiver().getFullName() : "N/A"},
            {"Sender UPI", txn.getSender() != null && txn.getSender().getUpiId() != null ?
                    txn.getSender().getUpiId() : "N/A"},
            {"Receiver UPI", txn.getReceiver() != null && txn.getReceiver().getUpiId() != null ?
                    txn.getReceiver().getUpiId() : "N/A"},
            {"Remarks", txn.getRemarks() != null ? txn.getRemarks() : "—"},
            {"Status", txn.getTransactionStatus() != null ? txn.getTransactionStatus().name() : "N/A"},
        };

        for (String[] row : rows) {
            PdfPCell labelCell = new PdfPCell(new Phrase(row[0], labelFont));
            labelCell.setBorderColor(lightGray);
            labelCell.setPadding(6);
            labelCell.setBackgroundColor(lightGray);

            PdfPCell valueCell = new PdfPCell(new Phrase(row[1], valueFont));
            valueCell.setBorderColor(lightGray);
            valueCell.setPadding(6);

            table.addCell(labelCell);
            table.addCell(valueCell);
        }
        document.add(table);

        document.add(new Paragraph(" "));

        // ─── Footer ───
        Font footerFont = new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC, BaseColor.GRAY);
        Paragraph footer = new Paragraph(
            "This is an auto-generated receipt from WalletPay.\n" +
            "For queries contact: support@walletpay.in", footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }
}
