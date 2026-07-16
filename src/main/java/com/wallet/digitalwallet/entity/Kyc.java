package com.wallet.digitalwallet.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "kyc")
public class Kyc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kyc_id")
    private Long kycId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "masked_aadhaar_number")
    private String maskedAadhaarNumber;

    private String dob;
    private String gender;
    private String address;
    private String state;

    @Column(name = "pin_code")
    private String pinCode;

    @Column(name = "aadhaar_image_path")
    private String aadhaarImagePath;

    @Column(name = "selfie_image_path")
    private String selfieImagePath;

    @Column(name = "face_match_score")
    private Double faceMatchScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status")
    private KycStatus kycStatus;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Kyc() {
    }

    public Long getKycId() {
        return kycId;
    }

    public void setKycId(Long kycId) {
        this.kycId = kycId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMaskedAadhaarNumber() {
        return maskedAadhaarNumber;
    }

    public void setMaskedAadhaarNumber(String maskedAadhaarNumber) {
        this.maskedAadhaarNumber = maskedAadhaarNumber;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPinCode() {
        return pinCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
    }

    public String getAadhaarImagePath() {
        return aadhaarImagePath;
    }

    public void setAadhaarImagePath(String aadhaarImagePath) {
        this.aadhaarImagePath = aadhaarImagePath;
    }

    public String getSelfieImagePath() {
        return selfieImagePath;
    }

    public void setSelfieImagePath(String selfieImagePath) {
        this.selfieImagePath = selfieImagePath;
    }

    public Double getFaceMatchScore() {
        return faceMatchScore;
    }

    public void setFaceMatchScore(Double faceMatchScore) {
        this.faceMatchScore = faceMatchScore;
    }

    public KycStatus getKycStatus() {
        return kycStatus;
    }

    public void setKycStatus(KycStatus kycStatus) {
        this.kycStatus = kycStatus;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
