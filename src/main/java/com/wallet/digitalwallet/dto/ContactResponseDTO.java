package com.wallet.digitalwallet.dto;

public class ContactResponseDTO {
    private Long userId;
    private String fullName;
    private String upiId;
    private String maskedMobileNumber;
    private String profileImage;
    private String lastTransactionTime;
    private Long totalTransactions;
    private String trustBadge; // "🟢 Trusted Contact", "🟡 New Contact", "🔴 High Risk User"
    private String status; // "ACTIVE", "BLOCKED", etc.

    public ContactResponseDTO() {
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

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getMaskedMobileNumber() {
        return maskedMobileNumber;
    }

    public void setMaskedMobileNumber(String maskedMobileNumber) {
        this.maskedMobileNumber = maskedMobileNumber;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getLastTransactionTime() {
        return lastTransactionTime;
    }

    public void setLastTransactionTime(String lastTransactionTime) {
        this.lastTransactionTime = lastTransactionTime;
    }

    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public String getTrustBadge() {
        return trustBadge;
    }

    public void setTrustBadge(String trustBadge) {
        this.trustBadge = trustBadge;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
