package com.wallet.digitalwallet.dto;

public class UserRequestDTO {

    private String fullName;
    private String email;
    private String mobileNumber;
    private String password;
    private String aadhaarNumber;

    public UserRequestDTO() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(
            String aadhaarNumber) {

        this.aadhaarNumber =
                aadhaarNumber;
    }
}