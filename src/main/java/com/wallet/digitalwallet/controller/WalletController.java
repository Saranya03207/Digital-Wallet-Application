package com.wallet.digitalwallet.controller;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.Wallet;

import org.springframework.web.bind.annotation.*;
import com.wallet.digitalwallet.dto.TransferMoneyRequest;
import com.wallet.digitalwallet.dto.WithdrawMoneyRequest;
import com.wallet.digitalwallet.dto.AddMoneyRequest;
import com.wallet.digitalwallet.service.WalletService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@RestController
@RequestMapping("/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;
    
    @PostMapping("/add-money")
    public String addMoney(
            @RequestBody AddMoneyRequest request) {

        return walletService.addMoney(request);
    }

    @PostMapping("/transfer")
    public String transferMoney(
            @RequestBody TransferMoneyRequest request) {

        return walletService.transferMoney(request);
    }
    @GetMapping("/balance/{userId}")
    public String checkBalance(
            @PathVariable Long userId) {

        return walletService.checkBalance(userId);
    }
    @GetMapping("/history/{userId}")
    public List<Transaction> getHistory(
            @PathVariable Long userId) {

        return walletService
                .getTransactionHistory(userId);
    }

    @GetMapping("/details/{userId}")
    public Wallet getWalletDetails(
            @PathVariable Long userId) {

        return walletService.getWalletDetails(userId);
    }
}