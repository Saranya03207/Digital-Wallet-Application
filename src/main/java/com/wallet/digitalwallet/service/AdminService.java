package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.dto.AdminDashboardResponse;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionType;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;


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
    
    public List<Transaction> getAllTransactions(){

        return transactionRepository
                .findAll();
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
}