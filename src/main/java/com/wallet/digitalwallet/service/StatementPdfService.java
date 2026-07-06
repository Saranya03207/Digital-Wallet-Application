package com.wallet.digitalwallet.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.entity.Wallet;

@Service
public class StatementPdfService {

    public byte[] generateStatement(
            User user,
            Wallet wallet,
            List<Transaction> transactions)
            throws Exception {

        Document document =
                new Document();

        ByteArrayOutputStream out =
                new ByteArrayOutputStream();

        PdfWriter.getInstance(
                document,
                out);

        document.open();

        Font title =
                new Font(
                        Font.FontFamily.HELVETICA,
                        18,
                        Font.BOLD);

        Paragraph heading =
                new Paragraph(
                        "WalletPay Account Statement",
                        title);

        heading.setAlignment(
                Element.ALIGN_CENTER);

        document.add(heading);

        document.add(new Paragraph(" "));

        document.add(
                new Paragraph(
                        "Account Holder : "
                                + user.getFullName()));

        document.add(
                new Paragraph(
                        "UPI ID : "
                                + user.getUpiId()));

        document.add(
                new Paragraph(
                        "Email : "
                                + user.getEmail()));

        document.add(
                new Paragraph(
                        "Current Balance : ₹"
                                + wallet.getBalance()));

        document.add(new Paragraph(" "));

        PdfPTable table =
                new PdfPTable(4);

        table.setWidthPercentage(100);

        table.addCell("Date");
        table.addCell("Txn ID");
        table.addCell("Type");
        table.addCell("Amount");

        double credit = 0;
        double debit = 0;

        for(Transaction txn : transactions){

            table.addCell(
                    txn.getTransactionDate()
                    .format(
                            DateTimeFormatter.ofPattern(
                                    "dd-MM-yyyy")));

            table.addCell(
                    txn.getUpiTransactionId());

            String type;

            if(txn.getReceiver()
                    .getId()
                    .equals(user.getId())){

                type = "CREDIT";

                credit +=
                        txn.getAmount()
                        .doubleValue();

            }else{

                type = "DEBIT";

                debit +=
                        txn.getAmount()
                        .doubleValue();
            }

            table.addCell(type);

            table.addCell(
                    "₹" + txn.getAmount());
        }

        document.add(table);

        document.add(new Paragraph(" "));

        document.add(
                new Paragraph(
                        "Total Credits : ₹"
                                + credit));

        document.add(
                new Paragraph(
                        "Total Debits : ₹"
                                + debit));

        document.add(
                new Paragraph(
                        "Closing Balance : ₹"
                                + wallet.getBalance()));

        document.close();

        return out.toByteArray();
    }
}