package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.dto.AIDashboardResponse;
import com.wallet.digitalwallet.dto.AdminAnalyticsResponse;
import com.wallet.digitalwallet.dto.AdminDashboardResponse;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionType;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import com.wallet.digitalwallet.dto.TransactionResponseDTO;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public AdminDashboardResponse getDashboard() {

        AdminDashboardResponse response =
                new AdminDashboardResponse();

        response.setTotalUsers(
                userRepository.count());

        response.setActiveUsers(
                userRepository.countByStatus(
                        Status.ACTIVE));

        response.setBlockedUsers(
                userRepository.countByStatus(
                        Status.BLOCKED));

        response.setTotalTransactions(
                transactionRepository.count());

        BigDecimal total =
                BigDecimal.ZERO;

        for (Wallet wallet :
                walletRepository.findAll()) {

            total =
                    total.add(
                            wallet.getBalance());
        }

        response.setTotalWalletBalance(total);

        return response;
    }
    
   
    public Map<String, Long> getTransactionTypeAnalytics() {

        Map<String, Long> map =
                new HashMap<>();

        map.put(
                "TRANSFER",
                transactionRepository
                        .countByTransactionType(
                                TransactionType.TRANSFER));

        map.put(
                "ADD_MONEY",
                transactionRepository
                        .countByTransactionType(
                                TransactionType.ADD_MONEY));

        map.put(
                "WITHDRAW",
                transactionRepository
                        .countByTransactionType(
                                TransactionType.WITHDRAW));

        return map;

    }
    
    public Map<String, Long> getDailyTransactions() {

        Map<String, Long> map =
                new LinkedHashMap<>();

        List<Transaction> list =
                transactionRepository.findAll();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd-MM");

        for(Transaction txn : list){

            String day =
                    txn.getTransactionDate()
                            .format(formatter);

            map.put(
                    day,
                    map.getOrDefault(day,0L)+1
            );

        }

        return map;

    }
    
    public List<TransactionResponseDTO> getAllTransactions() {

        List<Transaction> transactions =
                transactionRepository.findAllByOrderByTransactionDateDesc();

        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

    }
    
    private TransactionResponseDTO convertToDTO(Transaction transaction) {

        TransactionResponseDTO dto =
                new TransactionResponseDTO();

        dto.setTransactionId(
                transaction.getTransactionId());

        dto.setUpiTransactionId(
                transaction.getUpiTransactionId());

        dto.setSenderName(
                transaction.getSender().getFullName());

        dto.setReceiverName(
                transaction.getReceiver().getFullName());

        dto.setAmount(
                transaction.getAmount());

        dto.setTransactionType(
                transaction.getTransactionType().name());

        dto.setTransactionStatus(
                transaction.getTransactionStatus().name());

        dto.setTransactionDate(
                transaction.getTransactionDate());

        dto.setAiPrediction(
                transaction.getAiPrediction());

        dto.setAiScore(
                transaction.getAiScore());

        dto.setAiReason(
                transaction.getAiReason());
        
        dto.setRemarks(
                transaction.getRemarks());

        return dto;
    }
    
    public AdminAnalyticsResponse getAnalytics(){

        AdminAnalyticsResponse response =
                new AdminAnalyticsResponse();

        response.setTransactionTypes(
                getTransactionTypeAnalytics());

        response.setDailyTransactions(
                getDailyTransactions());

        response.setTotalTransactions(
                transactionRepository.count());

        BigDecimal volume = BigDecimal.ZERO;

        for(Transaction t : transactionRepository.findAll()){

            volume =
                    volume.add(t.getAmount());

        }

        response.setTotalVolume(volume);

        if(transactionRepository.count()>0){

            response.setAverageAmount(

                    volume.divide(

                            BigDecimal.valueOf(
                                    transactionRepository.count()),
                            2,
                            BigDecimal.ROUND_HALF_UP)

            );

        }

        return response;

    }
    
    public AIDashboardResponse getAIDashboard() {

        AIDashboardResponse response = new AIDashboardResponse();

        List<Transaction> transactions = transactionRepository.findAll();

        response.setTotalTransactions(transactions.size());

        long analysed = transactions.stream()
                .filter(t -> t.getAiPrediction() != null)
                .count();

        response.setAnalysedTransactions(analysed);

        long normal = transactions.stream()
                .filter(t -> "Normal".equalsIgnoreCase(t.getAiPrediction()))
                .count();

        response.setNormalTransactions(normal);

        long suspicious = transactions.stream()
                .filter(t -> "Suspicious".equalsIgnoreCase(t.getAiPrediction()))
                .count();

        response.setSuspiciousTransactions(suspicious);

        long fraud = transactions.stream()
                .filter(t -> "Fraud".equalsIgnoreCase(t.getAiPrediction()))
                .count();

        response.setFraudTransactions(fraud);

        double avgScore = transactions.stream()
                .filter(t -> t.getAiScore() != null)
                .mapToDouble(Transaction::getAiScore)
                .average()
                .orElse(0);

        response.setAverageScore(avgScore);

        return response;
    }
    
    public List<TransactionResponseDTO> getHighRiskTransactions() {

        return transactionRepository
                .findAll()
                .stream()

                .filter(t ->

                        "Suspicious".equalsIgnoreCase(t.getAiPrediction())

                        ||

                        "Fraud".equalsIgnoreCase(t.getAiPrediction())

                )

                .map(this::convertToDTO)

                .toList();

    }
    
    @Transactional
    public String investigateTransaction(Long transactionId) {

        Transaction transaction =
                transactionRepository
                        .findById(transactionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Transaction Not Found"));

        transaction.setRemarks("Under Investigation");

        transactionRepository.save(transaction);

        return "Transaction marked as Under Investigation";

    }
    
}