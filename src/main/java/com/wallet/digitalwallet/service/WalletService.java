package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wallet.digitalwallet.ai.AIPrediction;
import com.wallet.digitalwallet.ai.AIRequest;
import com.wallet.digitalwallet.ai.AIService;
import com.wallet.digitalwallet.dto.AddMoneyRequest;
import com.wallet.digitalwallet.dto.TransferMoneyRequest;
import com.wallet.digitalwallet.entity.Notification;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionStatus;
import com.wallet.digitalwallet.entity.TransactionType;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.entity.WalletStatus;
import com.wallet.digitalwallet.repository.NotificationRepository;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private StatementPdfService statementPdfService;

    @Autowired
    private AIService aiService;

    @Autowired
    private AutoInvestigationService autoInvestigationService;

    @Autowired
    private FeatureExtractionService featureExtractionService;

    public String addMoney(AddMoneyRequest request) {

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return "Amount must be greater than zero";
        }

        Wallet wallet = walletRepository
                .findByUser_Id(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));

        wallet.setBalance(
                wallet.getBalance().add(request.getAmount()));

        walletRepository.save(wallet);

        return "₹" + request.getAmount() + " Added Successfully";
    }

    @Transactional
    public String transferMoney(TransferMoneyRequest request) {

        if (request.getSenderUserId().equals(request.getReceiverUserId())) {
            return "Cannot transfer money to yourself";
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return "Amount must be greater than zero";
        }

        Wallet senderWallet = walletRepository
                .findByUser_Id(request.getSenderUserId())
                .orElseThrow(() ->
                        new RuntimeException("Sender wallet not found"));

        Wallet receiverWallet = walletRepository
                .findByUser_Id(request.getReceiverUserId())
                .orElseThrow(() ->
                        new RuntimeException("Receiver wallet not found"));

        User sender = userRepository
                .findById(request.getSenderUserId())
                .orElseThrow(() ->
                        new RuntimeException("Sender not found"));

        User receiver = userRepository
                .findById(request.getReceiverUserId())
                .orElseThrow(() ->
                        new RuntimeException("Receiver not found"));

        if (sender.getStatus() == Status.BLOCKED) {
            return "Sender Account Blocked";
        }

        if (receiver.getStatus() == Status.BLOCKED) {
            return "Receiver Account Blocked";
        }

        if (receiverWallet.getWalletStatus() != WalletStatus.ACTIVE) {
            return "Receiver Wallet Inactive";
        }

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            return "Insufficient Balance";
        }

        if (sender.getTransactionPin() == null) {
            return "Please Set Transaction PIN";
        }

        if (!sender.getTransactionPin().equals(request.getTransactionPin())) {
            return "Invalid Transaction PIN";
        }

        // Debit Sender
        senderWallet.setBalance(
                senderWallet.getBalance().subtract(request.getAmount()));

        // Credit Receiver
        receiverWallet.setBalance(
                receiverWallet.getBalance().add(request.getAmount()));

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // Create Transaction BEFORE AI

        Transaction transaction = new Transaction();

        transaction.setUpiTransactionId(
                "WP" + System.currentTimeMillis());

        transaction.setSender(sender);

        transaction.setReceiver(receiver);

        transaction.setAmount(request.getAmount());

        transaction.setTransactionType(
                TransactionType.TRANSFER);

        transaction.setTransactionStatus(
                TransactionStatus.SUCCESS);

        transaction.setRemarks("UPI Transfer");

        transaction.setTransactionDate(
                LocalDateTime.now());

        // Build AI Request using Feature Extraction

        AIRequest aiRequest =
                featureExtractionService.buildRequest(
                        sender,
                        receiver,
                        senderWallet,
                        receiverWallet,
                        transaction
                );

        AIPrediction prediction =
                aiService.predict(aiRequest);

        transaction.setAiPrediction(
                prediction.getPrediction());

        transaction.setAiScore(
                prediction.getScore());

        transaction.setAiReason(
                prediction.getReason());

        transactionRepository.save(transaction);

        autoInvestigationService.investigate(transaction);
        
        // ==============================
        // Receiver Notification
        // ==============================

        Notification receiverNotification =
                new Notification();

        String receiverMessage =
                "Dear " + receiver.getFullName()
                + ",\n\nYou received ₹"
                + request.getAmount()
                + " from "
                + sender.getFullName()
                + "\n\nUPI Transaction ID : "
                + transaction.getUpiTransactionId()
                + "\nSender UPI : "
                + sender.getUpiId()
                + "\nAvailable Balance : ₹"
                + receiverWallet.getBalance()
                + "\nDate : "
                + LocalDateTime.now();

        receiverNotification.setReceiverUserId(
                receiver.getId());

        receiverNotification.setMessage(
                receiverMessage);

        receiverNotification.setRead(false);

        receiverNotification.setCreatedAt(
                LocalDateTime.now());

        notificationRepository.save(receiverNotification);

        // ==============================
        // Sender Notification
        // ==============================

        Notification senderNotification =
                new Notification();

        String senderMessage =
                "Dear "
                + sender.getFullName()
                + ",\n\n₹"
                + request.getAmount()
                + " transferred successfully to "
                + receiver.getFullName()
                + "\n\nUPI Transaction ID : "
                + transaction.getUpiTransactionId()
                + "\nReceiver UPI : "
                + receiver.getUpiId()
                + "\nAvailable Balance : ₹"
                + senderWallet.getBalance()
                + "\nDate : "
                + LocalDateTime.now();

        senderNotification.setReceiverUserId(
                sender.getId());

        senderNotification.setMessage(
                senderMessage);

        senderNotification.setRead(false);

        senderNotification.setCreatedAt(
                LocalDateTime.now());

        notificationRepository.save(senderNotification);

        // ==============================
        // Email Alerts
        // ==============================

        emailService.sendMoneyReceivedMail(
                receiver.getEmail(),
                "WalletPay Credit Alert",
                receiverMessage);

        emailService.sendMoneySentMail(
                sender.getEmail(),
                "WalletPay Debit Alert",
                senderMessage);

        return "Transfer Successful";
    }
    public String checkBalance(Long userId) {

        Wallet wallet =
                walletRepository
                        .findByUser_Id(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Wallet not found"));

        return "Current Balance = ₹"
                + wallet.getBalance();

    }

    public List<Transaction> getTransactionHistory(Long userId) {

        return transactionRepository
                .findBySenderIdOrReceiverIdOrderByTransactionDateDesc(
                        userId,
                        userId);

    }

    public Wallet getWalletDetails(Long userId) {

        return walletRepository
                .findByUser_Id(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Wallet not found"));

    }

    public byte[] downloadStatement(Long userId)
            throws Exception {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User Not Found"));

        Wallet wallet =
                walletRepository
                        .findByUser_Id(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Wallet Not Found"));

        List<Transaction> transactions =
                transactionRepository
                        .findBySenderIdOrReceiverIdOrderByTransactionDateDesc(
                                userId,
                                userId);

        return statementPdfService.generateStatement(
                user,
                wallet,
                transactions);

    }

}