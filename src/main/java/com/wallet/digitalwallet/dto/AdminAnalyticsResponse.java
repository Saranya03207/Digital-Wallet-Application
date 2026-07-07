package com.wallet.digitalwallet.dto;

import java.math.BigDecimal;
import java.util.Map;

public class AdminAnalyticsResponse {

    private Map<String,Long> transactionTypes;

    private Map<String,Long> dailyTransactions;

    private long totalTransactions;

    private BigDecimal totalVolume;

    private BigDecimal averageAmount;

    private long successfulTransactions;

    private long failedTransactions;

    public Map<String, Long> getTransactionTypes() {
        return transactionTypes;
    }

    public void setTransactionTypes(Map<String, Long> transactionTypes) {
        this.transactionTypes = transactionTypes;
    }

    public Map<String, Long> getDailyTransactions() {
        return dailyTransactions;
    }

    public void setDailyTransactions(Map<String, Long> dailyTransactions) {
        this.dailyTransactions = dailyTransactions;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public BigDecimal getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(BigDecimal totalVolume) {
        this.totalVolume = totalVolume;
    }

    public BigDecimal getAverageAmount() {
        return averageAmount;
    }

    public void setAverageAmount(BigDecimal averageAmount) {
        this.averageAmount = averageAmount;
    }

    public long getSuccessfulTransactions() {
        return successfulTransactions;
    }

    public void setSuccessfulTransactions(long successfulTransactions) {
        this.successfulTransactions = successfulTransactions;
    }

    public long getFailedTransactions() {
        return failedTransactions;
    }

    public void setFailedTransactions(long failedTransactions) {
        this.failedTransactions = failedTransactions;
    }
}