package com.wallet.digitalwallet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.Wallet;

import org.springframework.web.bind.annotation.*;
import com.wallet.digitalwallet.dto.TransferMoneyRequest;
import com.wallet.digitalwallet.dto.AddMoneyRequest;
import com.wallet.digitalwallet.dto.WithdrawMoneyRequest;
import com.wallet.digitalwallet.service.WalletService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private WalletService walletService;
    
    @PostMapping("/add-money")
    public String addMoney(
            @RequestBody AddMoneyRequest request) {

        return walletService.addMoney(request);
    }

    @PostMapping("/withdraw")
    public String withdrawMoney(
            @RequestBody WithdrawMoneyRequest request) {

        return walletService.withdrawMoney(request);
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
    
    @GetMapping(
            "/statement/{userId}")
    public ResponseEntity<byte[]>
    downloadStatement(
            @PathVariable
            Long userId)
            throws Exception {

        byte[] pdf =
                walletService
                .downloadStatement(
                        userId);

        return ResponseEntity.ok()

                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=WalletPayStatement.pdf")

                .contentType(
                        MediaType.APPLICATION_PDF)

                .body(pdf);
    }

    @GetMapping("/statement-csv/{userId}")
    public ResponseEntity<byte[]> downloadStatementCsv(@PathVariable Long userId) {
        byte[] csv = walletService.downloadStatementCsv(userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=WalletPayStatement.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csv);
    }
}