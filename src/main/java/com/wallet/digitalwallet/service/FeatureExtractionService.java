package com.wallet.digitalwallet.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.ai.AIRequest;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.repository.TransactionRepository;

@Service
public class FeatureExtractionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public AIRequest buildRequest(
            User sender,
            User receiver,
            Wallet senderWallet,
            Wallet receiverWallet,
            Transaction transaction) {

        AIRequest request = new AIRequest();

        // =====================================
        // Basic Features
        // =====================================

        request.setAmount(
                transaction.getAmount().doubleValue());

        request.setHour(
                transaction.getTransactionDate().getHour());

        request.setDay(
                transaction.getTransactionDate()
                        .getDayOfWeek()
                        .getValue());

        request.setSenderBalance(
                senderWallet.getBalance().doubleValue());

        request.setReceiverBalance(
                receiverWallet.getBalance().doubleValue());

        // =====================================
        // Behaviour Features
        // =====================================

        Double averageAmount =
                transactionRepository
                .getAverageTransactionAmount(
                        sender.getId());

        if (averageAmount == null) {

            averageAmount = 0.0;

        }

        long todayTransactions =
                transactionRepository
                .countTodayTransactions(
                        sender.getId());

        long lastHourTransactions =
                transactionRepository
                .countTransactionsAfter(

                        sender.getId(),

                        LocalDateTime.now()
                                .minusHours(1)

                );

        long previousReceiverTransactions =
                transactionRepository
                .countBySenderIdAndReceiverId(

                        sender.getId(),

                        receiver.getId()

                );

        /*
         * Temporary mapping
         *
         * We will redesign the Python model
         * later to accept these directly.
         */

        request.setTransactionsLastHour(

                (int) lastHourTransactions

        );

        request.setAverageAmount(
                averageAmount);

        request.setTodayTransactions(
                (int) todayTransactions);

        request.setTransactionsLastHour(
                (int) lastHourTransactions);

        request.setNewReceiver(
                previousReceiverTransactions == 0 ? 1 : 0);

        request.setNightTransaction(
                transaction.getTransactionDate().getHour() <= 5 ? 1 : 0);

        return request;

    }

}