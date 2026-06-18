package com.wallet.digitalwallet.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wallet.digitalwallet.dto.DashboardResponse;
import com.wallet.digitalwallet.service.AdminService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/total-users")
    public long getTotalUsers() {
        return adminService.getTotalUsers();
    }
    
    @GetMapping("/total-transactions")
    public long getTotalTransactions() {
        return adminService.getTotalTransactions();
    }
    
    @GetMapping("/total-wallet-balance")
    public BigDecimal getTotalWalletBalance() {
        return adminService.getTotalWalletBalance();
    }
    
    @GetMapping("/active-users")
    public long getActiveUsersCount() {
        return adminService.getActiveUsersCount();
    }

    @GetMapping("/blocked-users")
    public long getBlockedUsersCount() {
        return adminService.getBlockedUsersCount();
    }
    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {

        return adminService.getDashboard();
    }
    @GetMapping("/transaction-stats")
    public Map<String, Long> getTransactionStats() {

        return adminService.getTransactionStats();
    }
}