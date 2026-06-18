package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.dto.DashboardResponse;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.TransactionType;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    // Total Users
    public long getTotalUsers() {
        return userRepository.count();
    }

    // Total Transactions
    public long getTotalTransactions() {
        return transactionRepository.count();
    }

    // Total Wallet Balance
    public BigDecimal getTotalWalletBalance() {
        return walletRepository.getTotalWalletBalance();
    }

    // Active Users Count
    public long getActiveUsersCount() {
        return userRepository.countByStatus(Status.ACTIVE);
    }

    // Blocked Users Count
    public long getBlockedUsersCount() {
        return userRepository.countByStatus(Status.BLOCKED);
    }

    // Dashboard API
    public DashboardResponse getDashboard() {

        DashboardResponse dashboard = new DashboardResponse();

        dashboard.setTotalUsers(getTotalUsers());
        dashboard.setActiveUsers(getActiveUsersCount());
        dashboard.setBlockedUsers(getBlockedUsersCount());
        dashboard.setTotalTransactions(getTotalTransactions());
        dashboard.setTotalWalletBalance(getTotalWalletBalance());

        return dashboard;
    }

    // Transaction Statistics
    public Map<String, Long> getTransactionStats() {

        Map<String, Long> stats = new HashMap<>();

        stats.put(
                "addMoneyTransactions",
                transactionRepository.countByTransactionType(
                        TransactionType.ADD_MONEY));

        stats.put(
                "transferTransactions",
                transactionRepository.countByTransactionType(
                        TransactionType.TRANSFER));

        stats.put(
                "withdrawTransactions",
                transactionRepository.countByTransactionType(
                        TransactionType.WITHDRAW));

        return stats;
    }
}