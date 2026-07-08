package com.wallet.digitalwallet.ai;

public class AIRequest {

    private double amount;

    private int hour;

    private int day;

    private double senderBalance;

    private double receiverBalance;

    private double averageAmount;

    private int todayTransactions;

    private int transactionsLastHour;

    private int newReceiver;

    private int nightTransaction;

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
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

    public double getAverageAmount() {
        return averageAmount;
    }

    public void setAverageAmount(double averageAmount) {
        this.averageAmount = averageAmount;
    }

    public int getTodayTransactions() {
        return todayTransactions;
    }

    public void setTodayTransactions(int todayTransactions) {
        this.todayTransactions = todayTransactions;
    }

    public int getTransactionsLastHour() {
        return transactionsLastHour;
    }

    public void setTransactionsLastHour(int transactionsLastHour) {
        this.transactionsLastHour = transactionsLastHour;
    }

    public int getNewReceiver() {
        return newReceiver;
    }

    public void setNewReceiver(int newReceiver) {
        this.newReceiver = newReceiver;
    }

    public int getNightTransaction() {
        return nightTransaction;
    }

    public void setNightTransaction(int nightTransaction) {
        this.nightTransaction = nightTransaction;
    }

}