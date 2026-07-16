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

    private Map<String, BigDecimal> dailyVolume;
    private Map<String, Long> monthlyTransactions;
    private Map<String, BigDecimal> monthlyVolume;
    private Map<String, Long> yearlyTransactions;
    private Map<String, BigDecimal> yearlyVolume;

    public Map<String, BigDecimal> getDailyVolume() {
        return dailyVolume;
    }

    public void setDailyVolume(Map<String, BigDecimal> dailyVolume) {
        this.dailyVolume = dailyVolume;
    }

    public Map<String, Long> getMonthlyTransactions() {
        return monthlyTransactions;
    }

    public void setMonthlyTransactions(Map<String, Long> monthlyTransactions) {
        this.monthlyTransactions = monthlyTransactions;
    }

    public Map<String, BigDecimal> getMonthlyVolume() {
        return monthlyVolume;
    }

    public void setMonthlyVolume(Map<String, BigDecimal> monthlyVolume) {
        this.monthlyVolume = monthlyVolume;
    }

    public Map<String, Long> getYearlyTransactions() {
        return yearlyTransactions;
    }

    public void setYearlyTransactions(Map<String, Long> yearlyTransactions) {
        this.yearlyTransactions = yearlyTransactions;
    }

    public Map<String, BigDecimal> getYearlyVolume() {
        return yearlyVolume;
    }

    public void setYearlyVolume(Map<String, BigDecimal> yearlyVolume) {
        this.yearlyVolume = yearlyVolume;
    }

    private Map<String, Long> weeklyTransactions;
    private Map<String, BigDecimal> weeklyVolume;

    public Map<String, Long> getWeeklyTransactions() {
        return weeklyTransactions;
    }

    public void setWeeklyTransactions(Map<String, Long> weeklyTransactions) {
        this.weeklyTransactions = weeklyTransactions;
    }

    public Map<String, BigDecimal> getWeeklyVolume() {
        return weeklyVolume;
    }

    public void setWeeklyVolume(Map<String, BigDecimal> weeklyVolume) {
        this.weeklyVolume = weeklyVolume;
    }
}