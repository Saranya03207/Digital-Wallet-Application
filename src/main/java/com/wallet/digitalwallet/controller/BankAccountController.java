package com.wallet.digitalwallet.controller;

import com.wallet.digitalwallet.entity.BankAccount;
import com.wallet.digitalwallet.repository.BankAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bank")
@CrossOrigin(origins = "*")
public class BankAccountController {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @GetMapping("/list/{userId}")
    public ResponseEntity<List<BankAccount>> getLinkedBanks(@PathVariable Long userId) {
        List<BankAccount> accounts = bankAccountRepository.findByUserId(userId);
        return ResponseEntity.ok(accounts);
    }

    @PostMapping("/link")
    public ResponseEntity<?> linkBankAccount(@RequestBody BankAccount bankAccount) {
        if (bankAccount.getUserId() == null) {
            return ResponseEntity.badRequest().body("User ID is required");
        }
        if (bankAccount.getBankName() == null || bankAccount.getBankName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Bank Name is required");
        }
        if (bankAccount.getAccountNumber() == null || bankAccount.getAccountNumber().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Account Number is required");
        }
        if (bankAccount.getIfscCode() == null || bankAccount.getIfscCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("IFSC Code is required");
        }
        if (bankAccount.getAccountHolderName() == null || bankAccount.getAccountHolderName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Account Holder Name is required");
        }

        // Save the bank account details
        BankAccount saved = bankAccountRepository.save(bankAccount);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/unlink/{id}")
    public ResponseEntity<?> unlinkBankAccount(@PathVariable Long id) {
        if (!bankAccountRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bankAccountRepository.deleteById(id);
        return ResponseEntity.ok("Bank Account unlinked successfully");
    }
}
