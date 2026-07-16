package com.wallet.digitalwallet.dto;

public class DisputeResolveDTO {
    private Long transactionId;
    private String action; // "REFUND" or "REJECT"
    private String adminRemark;

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getAdminRemark() {
        return adminRemark;
    }

    public void setAdminRemark(String adminRemark) {
        this.adminRemark = adminRemark;
    }
}
