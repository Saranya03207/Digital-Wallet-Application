package com.wallet.digitalwallet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.ai.AIService;
import com.wallet.digitalwallet.ai.InvestigationRequest;
import com.wallet.digitalwallet.ai.InvestigationResponse;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;

@Service
public class InvestigationService {

    @Autowired
    private AIService aiService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WalletRepository walletRepository;

    public void investigate(Transaction transaction) {

        User sender = transaction.getSender();

        InvestigationRequest request =
                new InvestigationRequest();

        // -----------------------------
        // Transaction Information
        // -----------------------------

        request.setAmount(
                transaction.getAmount().doubleValue());

        request.setHour(
                transaction.getTransactionDate().getHour());

        request.setDay(
                transaction.getTransactionDate()
                        .getDayOfWeek()
                        .getValue());

        // -----------------------------
        // Wallet Information
        // -----------------------------
        double senderBalance =
                walletRepository
                        .findByUser_Id(sender.getId())
                        .orElseThrow()
                        .getBalance()
                        .doubleValue();

        request.setSenderBalance(senderBalance);

        double receiverBalance =
                walletRepository
                        .findByUser_Id(
                                transaction.getReceiver().getId())
                        .orElseThrow()
                        .getBalance()
                        .doubleValue();

        request.setReceiverBalance(receiverBalance);

        // -----------------------------
        // Behaviour Features
        // -----------------------------

        Double avg =
                transactionRepository
                        .getAverageTransactionAmount(
                                sender.getId());

        request.setAverageAmount(
                avg == null ? 0 : avg);

        request.setTransactionsToday(
                transactionRepository
                        .countTodayTransactions(
                                sender.getId()));

        request.setTransactionsLastHour(
                transactionRepository
                        .countTransactionsAfter(
                                sender.getId(),
                                transaction.getTransactionDate()
                                        .minusHours(1)));

        request.setNewReceiver(

                transactionRepository
                        .countBySenderIdAndReceiverId(
                                sender.getId(),
                                transaction.getReceiver().getId())
                        == 1

                        ? 1

                        : 0);

        request.setNightTransaction(

                transaction.getTransactionDate()
                        .getHour() < 6

                        ? 1

                        : 0);

        request.setAccountAgeDays(

        	    (int)

        	    java.time.temporal.ChronoUnit.DAYS.between(

        	        sender.getCreatedAt().toLocalDate(),

        	        java.time.LocalDate.now()

        	    )

        	);

        request.setRepeatedReceiver(

                transactionRepository
                        .countBySenderIdAndReceiverId(

                                sender.getId(),

                                transaction.getReceiver().getId()

                        ));

        request.setDeviceChanged(0);

        // -----------------------------
        // Call AI
        // -----------------------------

        InvestigationResponse response =
                aiService.investigate(request);

        // -----------------------------
        // Update Transaction
        // -----------------------------

        transaction.setAiPrediction(
                response.getPrediction());

        transaction.setAiScore(
                response.getScore());

        transaction.setAiReason(
                response.getReason());

        // -----------------------------
        // AI Decision
        // -----------------------------

        if ("Fraud".equalsIgnoreCase(
                response.getPrediction())) {

            transaction.setRemarks(
                    "Automatically Blocked");

            sender.setStatus(Status.BLOCKED);

            userRepository.save(sender);

        }

        else if ("Suspicious".equalsIgnoreCase(
                response.getPrediction())) {

            transaction.setRemarks(
                    "Under AI Monitoring");

        }

        else {

            transaction.setRemarks(
                    "AI Cleared");

        }

        transactionRepository.save(transaction);

    }

}