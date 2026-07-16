package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wallet.digitalwallet.dto.DisputeRequestDTO;
import com.wallet.digitalwallet.dto.DisputeResolveDTO;
import com.wallet.digitalwallet.dto.TransactionResponseDTO;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionStatus;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.WalletRepository;

@Service
public class DisputeService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Transactional
    public String raiseDispute(DisputeRequestDTO request) {
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction Not Found"));

        transaction.setDisputeStatus("RAISED");
        transaction.setDisputeReason(request.getReason());
        transaction.setRemarks("[Dispute Raised] " + request.getReason());
        transaction.setTransactionStatus(TransactionStatus.DISPUTED);

        transactionRepository.save(transaction);
        return "Dispute raised successfully. Our resolution team will review it within 24 hours.";
    }

    public List<TransactionResponseDTO> getAllDisputes() {
        return transactionRepository.findByDisputeStatusNotOrderByTransactionDateDesc("NONE")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public String resolveDispute(DisputeResolveDTO request) {
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction Not Found"));

        if ("REFUND".equalsIgnoreCase(request.getAction())) {
            // Refund sender
            if (transaction.getSender() != null) {
                Wallet senderWallet = walletRepository.findByUser_Id(transaction.getSender().getId())
                        .orElse(null);
                if (senderWallet != null && transaction.getAmount() != null) {
                    senderWallet.setBalance(senderWallet.getBalance().add(transaction.getAmount()));
                    walletRepository.save(senderWallet);
                }
            }
            // Deduct from receiver if possible
            if (transaction.getReceiver() != null) {
                Wallet receiverWallet = walletRepository.findByUser_Id(transaction.getReceiver().getId())
                        .orElse(null);
                if (receiverWallet != null && transaction.getAmount() != null) {
                    if (receiverWallet.getBalance().compareTo(transaction.getAmount()) >= 0) {
                        receiverWallet.setBalance(receiverWallet.getBalance().subtract(transaction.getAmount()));
                        walletRepository.save(receiverWallet);
                    }
                }
            }

            transaction.setDisputeStatus("REFUNDED");
            transaction.setTransactionStatus(TransactionStatus.REFUNDED);
            transaction.setRemarks("[Refunded] " + (request.getAdminRemark() != null ? request.getAdminRemark() : "Dispute resolved in user's favor"));
            transaction.setDisputeAdminRemark(request.getAdminRemark() != null ? request.getAdminRemark() : "Refund credited to sender account");
        } else {
            transaction.setDisputeStatus("REJECTED");
            transaction.setTransactionStatus(TransactionStatus.SUCCESS);
            transaction.setRemarks("[Dispute Rejected] " + (request.getAdminRemark() != null ? request.getAdminRemark() : "Transaction verified as valid"));
            transaction.setDisputeAdminRemark(request.getAdminRemark() != null ? request.getAdminRemark() : "Transaction verified by security team");
        }

        transactionRepository.save(transaction);
        return "Dispute resolved successfully with action: " + request.getAction();
    }

    private TransactionResponseDTO convertToDTO(Transaction transaction) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setUpiTransactionId(transaction.getUpiTransactionId());
        dto.setSenderName(transaction.getSender() != null ? transaction.getSender().getFullName() : "N/A");
        dto.setReceiverName(transaction.getReceiver() != null ? transaction.getReceiver().getFullName() : "N/A");
        dto.setAmount(transaction.getAmount());
        dto.setTransactionType(transaction.getTransactionType().name());
        dto.setTransactionStatus(transaction.getTransactionStatus().name());
        dto.setTransactionDate(transaction.getTransactionDate());
        dto.setAiPrediction(transaction.getAiPrediction());
        dto.setAiScore(transaction.getAiScore());
        dto.setAiReason(transaction.getAiReason());
        dto.setRemarks(transaction.getRemarks());
        dto.setDisputeStatus(transaction.getDisputeStatus());
        dto.setDisputeReason(transaction.getDisputeReason());
        dto.setDisputeAdminRemark(transaction.getDisputeAdminRemark());
        return dto;
    }
}
