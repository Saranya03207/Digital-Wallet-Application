package com.wallet.digitalwallet.repository;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wallet.digitalwallet.entity.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

	Optional<Wallet> findByUser_Id(Long id);

	@Query("SELECT SUM(w.balance) FROM Wallet w")
	BigDecimal getTotalWalletBalance();
	
	List<Wallet> findAll();
	
	
}