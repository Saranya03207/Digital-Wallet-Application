package com.wallet.digitalwallet.ai;

public class BehaviourProfile {

    // Transaction Behaviour
    private double averageAmount;
    private double maximumAmount;
    private double minimumAmount;

    // Transaction Frequency
    private long transactionsToday;
    private long transactionsLastHour;
    private long totalTransactions;

    // Receiver Behaviour
    private long receiverFrequency;
    private boolean newReceiver;

    // Time Behaviour
    private int preferredStartHour;
    private int preferredEndHour;
    private boolean nightTransaction;

    // Account Behaviour
    private int accountAgeDays;

    // Wallet Behaviour
    private double senderBalance;
    private double receiverBalance;
    private double balanceUsagePercentage;

    public BehaviourProfile() {
    }

    public double getAverageAmount() {
        return averageAmount;
    }

    public void setAverageAmount(double averageAmount) {
        this.averageAmount = averageAmount;
    }

    public double getMaximumAmount() {
        return maximumAmount;
    }

    public void setMaximumAmount(double maximumAmount) {
        this.maximumAmount = maximumAmount;
    }

    public double getMinimumAmount() {
        return minimumAmount;
    }

    public void setMinimumAmount(double minimumAmount) {
        this.minimumAmount = minimumAmount;
    }

    public long getTransactionsToday() {
        return transactionsToday;
    }

    public void setTransactionsToday(long transactionsToday) {
        this.transactionsToday = transactionsToday;
    }

    public long getTransactionsLastHour() {
        return transactionsLastHour;
    }

    public void setTransactionsLastHour(long transactionsLastHour) {
        this.transactionsLastHour = transactionsLastHour;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getReceiverFrequency() {
        return receiverFrequency;
    }

    public void setReceiverFrequency(long receiverFrequency) {
        this.receiverFrequency = receiverFrequency;
    }

    public boolean isNewReceiver() {
        return newReceiver;
    }

    public void setNewReceiver(boolean newReceiver) {
        this.newReceiver = newReceiver;
    }

    public int getPreferredStartHour() {
        return preferredStartHour;
    }

    public void setPreferredStartHour(int preferredStartHour) {
        this.preferredStartHour = preferredStartHour;
    }

    public int getPreferredEndHour() {
        return preferredEndHour;
    }

    public void setPreferredEndHour(int preferredEndHour) {
        this.preferredEndHour = preferredEndHour;
    }

    public boolean isNightTransaction() {
        return nightTransaction;
    }

    public void setNightTransaction(boolean nightTransaction) {
        this.nightTransaction = nightTransaction;
    }

    public int getAccountAgeDays() {
        return accountAgeDays;
    }

    public void setAccountAgeDays(int accountAgeDays) {
        this.accountAgeDays = accountAgeDays;
    }

    public double getSenderBalance() {
        return senderBalance;
    }

    public void setSenderBalance(double senderBalance) {
        this.senderBalance = senderBalance;
    }

    public double getReceiverBalance() {
        return receiverBalance;
    }

    public void setReceiverBalance(double receiverBalance) {
        this.receiverBalance = receiverBalance;
    }

    public double getBalanceUsagePercentage() {
        return balanceUsagePercentage;
    }

    public void setBalanceUsagePercentage(double balanceUsagePercentage) {
        this.balanceUsagePercentage = balanceUsagePercentage;
    }
}