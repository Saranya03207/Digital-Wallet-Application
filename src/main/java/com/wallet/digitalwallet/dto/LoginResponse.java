package com.wallet.digitalwallet.dto;

public class LoginResponse {

    private Long userId;
    private String fullName;
    private String role;
    private String message;
    private String upiId;

    public LoginResponse() {
    }

    public LoginResponse(
            Long userId,
            String fullName,
            String role,
            String message,
            String upiId) {

        this.userId = userId;
        this.fullName = fullName;
        this.role = role;
        this.message = message;
        this.upiId = upiId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }
}