package com.wallet.digitalwallet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.ai.AIService;
import com.wallet.digitalwallet.ai.BehaviourProfile;
import com.wallet.digitalwallet.ai.InvestigationRequest;
import com.wallet.digitalwallet.ai.InvestigationResponse;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;

@Service
public class InvestigationService {

    @Autowired
    private AIService aiService;

    @Autowired
    private BehaviourProfileService behaviourProfileService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public void investigate(Transaction transaction) {

        User sender = transaction.getSender();
        User receiver = transaction.getReceiver();

        // ==========================================
        // Build Behaviour Profile
        // ==========================================

        BehaviourProfile profile =
                behaviourProfileService.buildProfile(
                        sender,
                        receiver);

        // ==========================================
        // Build Investigation Request
        // ==========================================

        InvestigationRequest request =
                new InvestigationRequest();

        // Transaction Details

        request.setAmount(
                transaction.getAmount().doubleValue());

        request.setHour(
                transaction.getTransactionDate().getHour());

        request.setDay(
                transaction.getTransactionDate()
                        .getDayOfWeek()
                        .getValue());

        // Behaviour Features

        request.setAverageAmount(
                profile.getAverageAmount());

        request.setTransactionsToday(
                profile.getTransactionsToday());

        request.setTransactionsLastHour(
                profile.getTransactionsLastHour());

        request.setSenderBalance(
                profile.getSenderBalance());

        request.setReceiverBalance(
                profile.getReceiverBalance());

        request.setAccountAgeDays(
                profile.getAccountAgeDays());

        request.setRepeatedReceiver(
                profile.getReceiverFrequency());

        request.setNewReceiver(
                profile.isNewReceiver() ? 1 : 0);

        request.setNightTransaction(
                profile.isNightTransaction() ? 1 : 0);

        // Future Feature
        request.setDeviceChanged(0);

        // ==========================================
        // AI Investigation
        // ==========================================

        InvestigationResponse response =
                aiService.investigate(request);

        // ==========================================
        // Save AI Result
        // ==========================================

        transaction.setAiPrediction(
                response.getPrediction());

        transaction.setAiScore(
                response.getScore());

        transaction.setAiReason(
                response.getReason());

        // ==========================================
        // Decision
        // ==========================================

        switch (response.getPrediction()) {

            case "Fraud":

                transaction.setRemarks(
                        "Automatically Blocked by AI");

                sender.setStatus(Status.BLOCKED);

                userRepository.save(sender);

                break;

            case "Suspicious":

                transaction.setRemarks(
                        "Under AI Monitoring");

                break;

            default:

                transaction.setRemarks(
                        "AI Cleared");

        }

        transactionRepository.save(transaction);

    }

}