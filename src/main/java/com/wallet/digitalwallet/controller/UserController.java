package com.wallet.digitalwallet.controller;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.wallet.digitalwallet.dto.ChangePasswordRequest;
import com.wallet.digitalwallet.dto.ForgotPasswordRequest;
import com.wallet.digitalwallet.dto.LoginRequest;
import com.wallet.digitalwallet.dto.LoginResponse;
import com.wallet.digitalwallet.dto.ResetPasswordRequest;
import com.wallet.digitalwallet.dto.SetPinRequest;
import com.wallet.digitalwallet.dto.UserRequestDTO;
import com.wallet.digitalwallet.dto.UserResponseDTO;
import com.wallet.digitalwallet.dto.UserUpdateRequest;
import com.wallet.digitalwallet.dto.VerifyOtpRequest;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.service.UserService;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public UserResponseDTO registerUser(
            @RequestBody UserRequestDTO request) {

        return userService.registerUser(request);
    }
    
    @PostMapping("/verify-otp")
    public String verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        return userService.verifyOtp(
                request);
    }
    
    @PostMapping("/resend-otp")
    public String resendOtp(
            @RequestParam String email) {

        return userService
                .resendOtp(email);
    }
    
    @GetMapping("/search")
    public List<User> searchUsers(
            @RequestParam String keyword,
            @RequestParam Long currentUserId) {

        return userService.searchUsers(
                keyword,
                currentUserId);
    }
    
    @GetMapping("/search-upi")
    public List<User> searchByUpiId(
            @RequestParam String upiId) {

        User user =
                userService.searchByUpiId(upiId);

        return List.of(user);
    }
    @GetMapping("/search-name")
    public List<User> searchUsersByName(
            @RequestParam String keyword,
            @RequestParam Long currentUserId) {

        return userService.searchUsersByName(
                keyword,
                currentUserId);
    }
    
    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    @PutMapping("/block/{id}")
    public String blockUser(
            @PathVariable Long id) {

        return userService.blockUser(id);
    }

    @PutMapping("/activate/{id}")
    public String activateUser(
            @PathVariable Long id) {

        return userService.activateUser(id);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        return userService.login(request);
    }
    

    @DeleteMapping("/{id}")
    public String deleteUser(
            @PathVariable Long id) {

        return userService.deleteUser(id);
    }
    @PutMapping("/update/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request) {

        return userService.updateUser(id, request);
    }
    @PostMapping("/upload-image/{id}")
    public User uploadImage(
            @PathVariable Long id,
             @RequestParam("file") MultipartFile file)
            throws IOException {

        return userService.uploadProfileImage(id, file);
    }
    
    @PutMapping("/set-pin/{id}")
    public String setTransactionPin(
            @PathVariable Long id,
            @RequestBody SetPinRequest request) {

        return userService
                .setTransactionPin(id, request);
    }
    
    @PostMapping("/forgot-password")
    public String forgotPassword(
            @RequestBody ForgotPasswordRequest request)
    {
        return userService
                .forgotPassword(request);
    }
    
    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestBody ResetPasswordRequest request)
    {
        return userService
                .resetPassword(request);
    }
    
    @PostMapping("/change-password")
    public String changePassword(
            @RequestBody
            ChangePasswordRequest request)
    {

        return userService
                .changePassword(request);
    }
}