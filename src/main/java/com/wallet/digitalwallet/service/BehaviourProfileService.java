package com.wallet.digitalwallet.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.ai.BehaviourProfile;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.WalletRepository;

@Service
public class BehaviourProfileService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    public BehaviourProfile buildProfile(User sender, User receiver) {

        BehaviourProfile profile = new BehaviourProfile();

        // =========================================
        // Average Transaction Amount
        // =========================================

        Double average =
                transactionRepository.getAverageTransactionAmount(
                        sender.getId());

        profile.setAverageAmount(
                average == null ? 0 : average);

        // =========================================
        // Maximum Transaction
        // =========================================

        Double maximum =
                transactionRepository.getMaximumTransaction(
                        sender.getId());

        profile.setMaximumAmount(
                maximum == null ? 0 : maximum);

        // =========================================
        // Minimum Transaction
        // =========================================

        Double minimum =
                transactionRepository.getMinimumTransaction(
                        sender.getId());

        profile.setMinimumAmount(
                minimum == null ? 0 : minimum);

        // =========================================
        // Today's Transactions
        // =========================================

        profile.setTransactionsToday(

                transactionRepository.countTodayTransactions(
                        sender.getId())

        );

        // =========================================
        // Transactions Last Hour
        // =========================================

        profile.setTransactionsLastHour(

                transactionRepository.countTransactionsAfter(

                        sender.getId(),

                        LocalDateTime.now().minusHours(1)

                )

        );

        // =========================================
        // Total Transactions
        // =========================================

        profile.setTotalTransactions(

                transactionRepository.countSenderTransactions(
                        sender.getId())

        );

        // =========================================
        // Receiver Frequency
        // =========================================

        long receiverCount =
                transactionRepository.countBySenderIdAndReceiverId(

                        sender.getId(),

                        receiver.getId()

                );

        profile.setReceiverFrequency(receiverCount);

        profile.setNewReceiver(receiverCount == 0);

        // =========================================
        // Account Age
        // =========================================

        int accountAge = (int) ChronoUnit.DAYS.between(

                sender.getCreatedAt().toLocalDate(),

                LocalDate.now()

        );

        profile.setAccountAgeDays(accountAge);

        // =========================================
        // Sender Balance
        // =========================================

        double senderBalance =
                walletRepository.findByUser_Id(sender.getId())
                        .orElseThrow()
                        .getBalance()
                        .doubleValue();

        profile.setSenderBalance(senderBalance);

        // =========================================
        // Receiver Balance
        // =========================================

        double receiverBalance =
                walletRepository.findByUser_Id(receiver.getId())
                        .orElseThrow()
                        .getBalance()
                        .doubleValue();

        profile.setReceiverBalance(receiverBalance);

        // =========================================
        // Wallet Usage %
        // =========================================

        if (senderBalance > 0) {

            profile.setBalanceUsagePercentage(

                    (profile.getAverageAmount() / senderBalance) * 100

            );

        } else {

            profile.setBalanceUsagePercentage(0);

        }

        // =========================================
        // Preferred Time
        // (Temporary - Later we'll calculate this
        // from transaction history)
        // =========================================

        profile.setPreferredStartHour(7);

        profile.setPreferredEndHour(22);

        // =========================================
        // Night Transaction
        // =========================================

        int currentHour = LocalDateTime.now().getHour();

        profile.setNightTransaction(

                currentHour >= 0 && currentHour < 6

        );

        return profile;

    }

}