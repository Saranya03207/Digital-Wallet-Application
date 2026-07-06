package com.wallet.digitalwallet.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionType;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

	List<Transaction>
	findBySenderIdOrReceiverIdOrderByTransactionDateDesc(
	        Long senderId,
	        Long receiverId);
	
    long countByTransactionType(
            TransactionType transactionType);
    
    long count();
}