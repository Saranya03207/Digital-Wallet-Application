package com.wallet.digitalwallet.controller;

import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/rewards")
@CrossOrigin(origins = "*")
public class RewardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    // GET /rewards/{userId} — get current reward points
    @GetMapping("/{userId}")
    public ResponseEntity<?> getPoints(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        int points = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
        Map<String, Object> response = new HashMap<>();
        response.put("points", points);
        response.put("cashbackValue", points / 10.0); // 10 points = ₹1
        response.put("fullName", user.getFullName());
        return ResponseEntity.ok(response);
    }

    // POST /rewards/redeem — redeem points for wallet cashback
    @PostMapping("/redeem")
    public ResponseEntity<String> redeemPoints(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        int pointsToRedeem = Integer.parseInt(body.get("points").toString());

        if (pointsToRedeem < 100) {
            return ResponseEntity.badRequest().body("Minimum 100 points required to redeem");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int currentPoints = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
        if (currentPoints < pointsToRedeem) {
            return ResponseEntity.badRequest().body("Insufficient reward points");
        }

        // Deduct points
        user.setRewardPoints(currentPoints - pointsToRedeem);
        userRepository.save(user);

        // Credit cashback to wallet (10 points = ₹1)
        BigDecimal cashback = BigDecimal.valueOf(pointsToRedeem / 10.0);
        Wallet wallet = walletRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setBalance(wallet.getBalance().add(cashback));
        walletRepository.save(wallet);

        return ResponseEntity.ok("🎉 ₹" + cashback + " cashback added to your wallet! (" + pointsToRedeem + " points redeemed)");
    }
}
