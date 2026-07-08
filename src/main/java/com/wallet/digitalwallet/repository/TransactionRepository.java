package com.wallet.digitalwallet.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionType;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    // ==========================================
    // Existing Methods
    // ==========================================

    List<Transaction> findBySenderIdOrReceiverIdOrderByTransactionDateDesc(
            Long senderId,
            Long receiverId);

    long countByTransactionType(
            TransactionType transactionType);

    long count();

    List<Transaction> findAllByOrderByTransactionDateDesc();

    long countByAiPrediction(String aiPrediction);

    long countByAiPredictionIsNotNull();

    List<Transaction> findByAiPredictionOrderByTransactionDateDesc(
            String prediction);

    @Modifying
    @Query("""
        UPDATE Transaction t
        SET t.remarks = :remarks
        WHERE t.transactionId = :id
    """)
    void updateRemarks(
            @Param("id") Long id,
            @Param("remarks") String remarks);

    // ==========================================
    // AI Behaviour Queries
    // ==========================================

    // User average transaction amount

    @Query("""
        SELECT AVG(t.amount)
        FROM Transaction t
        WHERE t.sender.id = :userId
    """)
    Double getAverageTransactionAmount(
            @Param("userId") Long userId);

    // Today's transaction count

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
        WHERE t.sender.id = :userId
        AND DATE(t.transactionDate)=CURRENT_DATE
    """)
    long countTodayTransactions(
            @Param("userId") Long userId);

    // Transactions in last hour

    @Query("""
    		SELECT COUNT(t)
    		FROM Transaction t
    		WHERE t.sender.id = :userId
    		AND t.transactionDate >= :time
    		""")
    		long countTransactionsAfter(
    		        @Param("userId") Long userId,
    		        @Param("time") LocalDateTime time);
    // Previous transactions to same receiver

    long countBySenderIdAndReceiverId(
            Long senderId,
            Long receiverId);

    // Sender total transactions

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
        WHERE t.sender.id=:userId
    """)
    long countSenderTransactions(
            @Param("userId") Long userId);

    // Average transaction during last 30 days

    @Query("""
        SELECT AVG(t.amount)
        FROM Transaction t
        WHERE t.sender.id=:userId
        AND t.transactionDate>=:date
    """)
    Double getAverageLast30Days(
            @Param("userId") Long userId,
            @Param("date") LocalDateTime date);

    // Largest previous transaction

    @Query("""
        SELECT MAX(t.amount)
        FROM Transaction t
        WHERE t.sender.id=:userId
    """)
    Double getMaximumTransaction(
            @Param("userId") Long userId);
    
    

}