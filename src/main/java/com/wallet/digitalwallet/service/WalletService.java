package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.wallet.digitalwallet.dto.AddMoneyRequest;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionStatus;
import com.wallet.digitalwallet.entity.TransactionType;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;
import org.springframework.transaction.annotation.Transactional;
import com.wallet.digitalwallet.entity.WalletStatus;
import com.wallet.digitalwallet.entity.Notification;
import com.wallet.digitalwallet.repository.NotificationRepository;
import com.wallet.digitalwallet.service.EmailService;
import com.wallet.digitalwallet.dto.TransferMoneyRequest;

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

	public String addMoney(AddMoneyRequest request) {

	    if(request.getAmount()
	            .compareTo(BigDecimal.ZERO) <= 0){

	        return "Amount must be greater than zero";
	    }

	    Wallet wallet = walletRepository
	            .findByUser_Id(request.getUserId())
	            .orElseThrow(() ->
	                    new RuntimeException(
	                            "Wallet not found"));

	    wallet.setBalance(
	            wallet.getBalance()
	                    .add(request.getAmount()));

	    walletRepository.save(wallet);

	    return "₹"
	            + request.getAmount()
	            + " Added Successfully";
	}
	
	
	@Transactional
	public String transferMoney(TransferMoneyRequest request) {

		// Prevent self transfer
		if (request.getSenderUserId().equals(request.getReceiverUserId())) {

			return "Cannot transfer money to yourself";
		}

		// Prevent zero or negative amount
		if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

			return "Amount must be greater than zero";
		}

		Wallet senderWallet = walletRepository.findByUser_Id(request.getSenderUserId())
				.orElseThrow(() -> new RuntimeException("Sender wallet not found"));

		Wallet receiverWallet = walletRepository.findByUser_Id(request.getReceiverUserId())
				.orElseThrow(() -> new RuntimeException("Receiver wallet not found"));

		User sender = userRepository.findById(request.getSenderUserId())
				.orElseThrow(() -> new RuntimeException("Sender not found"));

		User receiver = userRepository.findById(request.getReceiverUserId())
				.orElseThrow(() -> new RuntimeException("Receiver not found"));

		// Sender status
		if (sender.getStatus() == Status.BLOCKED) {
			return "Sender Account Blocked";
		}

		// Receiver status
		if (receiver.getStatus() == Status.BLOCKED) {
			return "Receiver Account Blocked";
		}

		// Receiver wallet status
		if (receiverWallet.getWalletStatus() != WalletStatus.ACTIVE) {

			return "Receiver Wallet Inactive";
		}

		// Balance validation
		if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {

			return "Insufficient Balance";
		}
		if(sender.getTransactionPin() == null){

		    return "Please Set Transaction PIN";
		}
		if(!sender.getTransactionPin()
		        .equals(request.getTransactionPin())){

		    return "Invalid Transaction PIN";
		}

		// Debit sender
		senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));

		// Credit receiver
		receiverWallet.setBalance(receiverWallet.getBalance().add(request.getAmount()));

		walletRepository.save(senderWallet);
		walletRepository.save(receiverWallet);

		// Transaction History
		Transaction transaction = new Transaction();

		String upiTxnId = "WP" + System.currentTimeMillis();

		transaction.setUpiTransactionId(upiTxnId);

		transaction.setSender(sender);
		transaction.setReceiver(receiver);
		transaction.setAmount(request.getAmount());
		transaction.setTransactionType(TransactionType.TRANSFER);
		transaction.setTransactionStatus(TransactionStatus.SUCCESS);
		transaction.setRemarks("UPI Transfer");
		transaction.setTransactionDate(LocalDateTime.now());

		transactionRepository.save(transaction);
		// Receiver Notification

		Notification receiverNotification = new Notification();

		String receiverMessage = "Dear " + receiver.getFullName() + ",\n\nYou received ₹" + request.getAmount()
				+ " from " + sender.getFullName() + "\n\nUPI Transaction ID : " + upiTxnId + "\nSender UPI : "
				+ sender.getUpiId() + "\nAvailable Balance : ₹" + receiverWallet.getBalance() + "\nDate : "
				+ LocalDateTime.now();

		receiverNotification.setReceiverUserId(receiver.getId());

		receiverNotification.setMessage(receiverMessage);

		receiverNotification.setRead(false);

		receiverNotification.setCreatedAt(LocalDateTime.now());

		notificationRepository.save(receiverNotification);

		// Sender Notification

		Notification senderNotification = new Notification();

		String senderMessage = "Dear " + sender.getFullName() + ",\n\n₹" + request.getAmount()
				+ " transferred successfully to " + receiver.getFullName() + "\n\nUPI Transaction ID : " + upiTxnId
				+ "\nReceiver UPI : " + receiver.getUpiId() + "\nAvailable Balance : ₹" + senderWallet.getBalance()
				+ "\nDate : " + LocalDateTime.now();

		senderNotification.setReceiverUserId(sender.getId());

		senderNotification.setMessage(senderMessage);

		senderNotification.setRead(false);

		senderNotification.setCreatedAt(LocalDateTime.now());

		notificationRepository.save(senderNotification);
		
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

		Wallet wallet = walletRepository.findByUser_Id(userId)
				.orElseThrow(() -> new RuntimeException("Wallet not found"));

		return "Current Balance = " + wallet.getBalance();
	}

	public List<Transaction> getTransactionHistory(Long userId) {

		return transactionRepository.findBySenderIdOrReceiverIdOrderByTransactionDateDesc(userId, userId);
	}

	public Wallet getWalletDetails(Long userId) {

		return walletRepository.findByUser_Id(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
	}
}