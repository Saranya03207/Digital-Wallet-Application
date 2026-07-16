package com.wallet.digitalwallet.dto;

import java.math.BigDecimal;

public class TransferMoneyRequest {

    private Long senderUserId;
    private Long receiverUserId;
    private BigDecimal amount;
    private String transactionPin;
    private String paymentNote;
    private String conversationId;

    public Long getSenderUserId() {
        return senderUserId;
    }

    public void setSenderUserId(Long senderUserId) {
        this.senderUserId = senderUserId;
    }

    public Long getReceiverUserId() {
        return receiverUserId;
    }

    public void setReceiverUserId(Long receiverUserId) {
        this.receiverUserId = receiverUserId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    

    public String getTransactionPin() {
        return transactionPin;
    }

    public void setTransactionPin(
            String transactionPin) {

        this.transactionPin =
                transactionPin;
    }

    public String getPaymentNote() {
        return paymentNote;
    }

    public void setPaymentNote(String paymentNote) {
        this.paymentNote = paymentNote;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }
}