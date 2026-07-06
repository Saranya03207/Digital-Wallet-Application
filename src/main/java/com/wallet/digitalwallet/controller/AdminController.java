package com.wallet.digitalwallet.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wallet.digitalwallet.dto.AdminDashboardResponse;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.service.AdminService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {

        return adminService.getDashboard();
    }
    
    @GetMapping("/all-transactions")
    public List<Transaction> allTransactions(){

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
}