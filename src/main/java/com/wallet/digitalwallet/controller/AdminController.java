package com.wallet.digitalwallet.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wallet.digitalwallet.dto.AIDashboardResponse;
import com.wallet.digitalwallet.dto.AdminAnalyticsResponse;
import com.wallet.digitalwallet.dto.AdminDashboardResponse;
import com.wallet.digitalwallet.dto.TransactionResponseDTO;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.service.AdminService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;
    
    

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {

        return adminService.getDashboard();
    }
    
    @GetMapping("/transactions")
    public List<TransactionResponseDTO> getTransactions() {
        return adminService.getAllTransactions();
    }
    
    @GetMapping("/analytics/type")
    public Map<String, Long> transactionTypeAnalytics() {

        return adminService.getTransactionTypeAnalytics();

    }
    
    @GetMapping("/analytics/daily")
    public Map<String, Long> dailyAnalytics() {

        return adminService.getDailyTransactions();

    }
    
    @GetMapping("/analytics")
    public AdminAnalyticsResponse analytics(){

        return adminService.getAnalytics();

    }
    
    @GetMapping("/ai-dashboard")
    public AIDashboardResponse getAIDashboard() {

        return adminService.getAIDashboard();

    }
    
    @GetMapping("/high-risk-transactions")
    public List<TransactionResponseDTO> getHighRiskTransactions() {

        return adminService.getHighRiskTransactions();

    }
    
    @PostMapping("/investigate/{id}")
    public String investigateTransaction(

            @PathVariable Long id

    ) {

        return adminService.investigateTransaction(id);

    }
}