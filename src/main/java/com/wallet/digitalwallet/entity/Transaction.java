package com.wallet.digitalwallet.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @ManyToOne
    @JoinColumn(name = "sender_user_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_user_id")
    private User receiver;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_status")
    private TransactionStatus transactionStatus;

    private String remarks;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;
    
    public String getAiReason() {
		return aiReason;
	}

	public void setAiReason(String aiReason) {
		this.aiReason = aiReason;
	}

	private String upiTransactionId;
    
 // AI Fraud Detection

    @Column(name = "ai_prediction")
    private String aiPrediction;

    public String getAiPrediction() {
		return aiPrediction;
	}

	public void setAiPrediction(String aiPrediction) {
		this.aiPrediction = aiPrediction;
	}

	public Double getAiScore() {
		return aiScore;
	}

	public void setAiScore(Double aiScore) {
		this.aiScore = aiScore;
	}

	@Column(name = "ai_score")
    private Double aiScore;

    @Column(length = 500)
    private String aiReason;
    
    

    public String getUpiTransactionId() {
		return upiTransactionId;
	}

	public void setUpiTransactionId(String upiTransactionId) {
		this.upiTransactionId = upiTransactionId;
	}

	public Transaction() {
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public TransactionStatus getTransactionStatus() {
        return transactionStatus;
    }

    public void setTransactionStatus(TransactionStatus transactionStatus) {
        this.transactionStatus = transactionStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
   
}