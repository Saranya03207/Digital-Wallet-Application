package com.wallet.digitalwallet.controller;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.wallet.digitalwallet.entity.Kyc;
import com.wallet.digitalwallet.entity.KycStatus;
import com.wallet.digitalwallet.service.KycService;

@RestController
@RequestMapping("/kyc")
@CrossOrigin(origins = "*")
public class KycController {

    @Autowired
    private KycService kycService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitKyc(
            @RequestParam("userId") Long userId,
            @RequestParam("aadhaar") MultipartFile aadhaar,
            @RequestParam(value = "aadhaarBack", required = false) MultipartFile aadhaarBack,
            @RequestParam("selfie") MultipartFile selfie) {
        try {
            Kyc kyc = kycService.submitKyc(userId, aadhaar, aadhaarBack, selfie);
            return ResponseEntity.ok(kyc);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("File upload failed: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getKycStatus(@PathVariable("userId") Long userId) {
        Optional<Kyc> kycOpt = kycService.getKycByUserId(userId);
        if (kycOpt.isPresent()) {
            return ResponseEntity.ok(kycOpt.get());
        } else {
            // Return a default pending/unstarted state representation
            return ResponseEntity.ok().body("{\"kycStatus\":\"PENDING\",\"unstarted\":true}");
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Kyc>> getAllKycRequests() {
        return ResponseEntity.ok(kycService.getAllKycRequests());
    }

    @PostMapping("/admin/action")
    public ResponseEntity<?> updateKycStatus(
            @RequestParam("kycId") Long kycId,
            @RequestParam("status") KycStatus status,
            @RequestParam(value = "reason", required = false) String reason) {
        try {
            Kyc updatedKyc = kycService.updateKycStatus(kycId, status, reason);
            return ResponseEntity.ok(updatedKyc);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/extract")
    public ResponseEntity<?> extractOcrData(
            @RequestParam("aadhaar") MultipartFile aadhaar,
            @RequestParam(value = "aadhaarBack", required = false) MultipartFile aadhaarBack) {
        try {
            java.util.Map<String, String> data = kycService.extractOcrData(aadhaar, aadhaarBack);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to extract data: " + e.getMessage());
        }
    }
}
