import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# ============================================
# Configuration
# ============================================

TOTAL_USERS = 1000

MIN_TRANSACTIONS = 50
MAX_TRANSACTIONS = 300

FRAUD_PERCENTAGE = 0.05

np.random.seed(42)
random.seed(42)

rows = []


# ============================================
# Random User Generator
# ============================================

def create_user(user_id):

    profile = {}

    profile["userId"] = user_id

    # account age
    profile["accountAge"] = random.randint(30, 1500)

    # average spending pattern
    profile["averageAmount"] = random.randint(100, 6000)

    # spending variation
    profile["stdAmount"] = profile["averageAmount"] * random.uniform(0.2, 0.8)

    # favourite receivers
    profile["receiverCount"] = random.randint(3, 15)

    # active hours
    profile["startHour"] = random.randint(6, 10)

    profile["endHour"] = random.randint(19, 23)

    # wallet balance
    profile["walletBalance"] = random.randint(5000, 300000)

    return profile


# ============================================
# Normal Transaction Generator
# ============================================

def generate_normal_transaction(user):

    amount = abs(

        np.random.normal(

            user["averageAmount"],

            user["stdAmount"]

        )

    )

    amount = round(max(10, amount), 2)

    hour = random.randint(

        user["startHour"],

        user["endHour"]

    )

    day = random.randint(1, 7)

    receiver = random.randint(

        1,

        user["receiverCount"]

    )

    transaction = {

        "userId": user["userId"],

        "amount": amount,

        "hour": hour,

        "day": day,

        "receiverId": receiver,

        "accountAgeDays": user["accountAge"],

        "walletBalance": user["walletBalance"],

        "isFraud": 0

    }

    return transaction

# ============================================
# Fraud Transaction Generator
# ============================================

def generate_fraud_transaction(user):

    # Amount deviates significantly from user's normal behaviour
    amount = user["averageAmount"] * random.uniform(8, 20)

    amount = round(amount, 2)

    # Fraud usually happens at unusual hours
    hour = random.choice([0, 1, 2, 3, 4, 5, 23])

    day = random.randint(1, 7)

    # New receiver outside normal network
    receiver = random.randint(
        user["receiverCount"] + 1,
        user["receiverCount"] + 30
    )

    transaction = {

        "userId": user["userId"],

        "amount": amount,

        "hour": hour,

        "day": day,

        "receiverId": receiver,

        "accountAgeDays": user["accountAge"],

        "walletBalance": user["walletBalance"],

        "isFraud": 1

    }

    return transaction


# ============================================
# Feature Builder
# ============================================

def build_features(transaction, user, history):

    amount = transaction["amount"]

    wallet_balance = transaction["walletBalance"]

    history_amounts = [t["amount"] for t in history]

    if len(history_amounts) == 0:

        avg_amount = user["averageAmount"]

        max_amount = amount

        min_amount = amount

    else:

        avg_amount = np.mean(history_amounts)

        max_amount = np.max(history_amounts)

        min_amount = np.min(history_amounts)

    transactions_today = random.randint(1, 15)

    transactions_last_hour = random.randint(0, 5)

    receiver_frequency = len(

        [

            t for t in history

            if t["receiverId"] == transaction["receiverId"]

        ]

    )

    new_receiver = 1 if receiver_frequency == 0 else 0

    night_transaction = 1 if transaction["hour"] < 6 else 0

    device_changed = np.random.choice(

        [0, 1],

        p=[0.97, 0.03]

    )

    wallet_usage = round(

        (amount / wallet_balance) * 100,

        2

    )

    amount_deviation = round(

        abs(amount - avg_amount),

        2

    )

    row = {

        "userId": transaction["userId"],

        "amount": amount,

        "hour": transaction["hour"],

        "day": transaction["day"],

        "senderBalance": wallet_balance,

        "receiverBalance": random.randint(1000, 200000),

        "averageAmount": round(avg_amount, 2),

        "maximumAmount": round(max_amount, 2),

        "minimumAmount": round(min_amount, 2),

        "amountDeviation": amount_deviation,

        "transactionsToday": transactions_today,

        "transactionsLastHour": transactions_last_hour,

        "receiverFrequency": receiver_frequency,

        "newReceiver": new_receiver,

        "nightTransaction": night_transaction,

        "deviceChanged": device_changed,

        "accountAgeDays": transaction["accountAgeDays"],

        "walletUsage": wallet_usage,

        "isFraud": transaction["isFraud"]

    }

    return row

# ============================================
# Dataset Generation
# ============================================

print("Generating realistic WalletPay AI dataset...")

for user_id in range(1, TOTAL_USERS + 1):

    user = create_user(user_id)

    history = []

    transaction_count = random.randint(
        MIN_TRANSACTIONS,
        MAX_TRANSACTIONS
    )

    fraud_count = max(
        1,
        int(transaction_count * FRAUD_PERCENTAGE)
    )

    fraud_indexes = random.sample(
        range(transaction_count),
        fraud_count
    )

    for index in range(transaction_count):

        # ------------------------------------
        # Generate Transaction
        # ------------------------------------

        if index in fraud_indexes:

            transaction = generate_fraud_transaction(user)

        else:

            transaction = generate_normal_transaction(user)

        # ------------------------------------
        # Build Behaviour Features
        # ------------------------------------

        row = build_features(

            transaction,

            user,

            history

        )

        rows.append(row)

        # Store transaction history
        history.append(transaction)

        # ------------------------------------
        # User behaviour slowly changes
        # ------------------------------------

        if transaction["isFraud"] == 0:

            user["averageAmount"] = (

                user["averageAmount"] * 0.98 +

                transaction["amount"] * 0.02

            )

            user["walletBalance"] += random.randint(

                -1000,

                3000

            )

            user["walletBalance"] = max(

                1000,

                user["walletBalance"]

            )

# ============================================
# Create DataFrame
# ============================================

dataset = pd.DataFrame(rows)

# Shuffle dataset

dataset = dataset.sample(

    frac=1,

    random_state=42

).reset_index(drop=True)

# ============================================
# Display Summary
# ============================================

print()

print("====================================")

print("WalletPay AI Dataset Generated")

print("====================================")

print()

print(dataset.head())

print()

print("Shape :", dataset.shape)

print()

print("Fraud Distribution")

print(dataset["isFraud"].value_counts())

print()

print(dataset.describe())

# ============================================
# Save Dataset
# ============================================

dataset.to_csv(

    "walletpay_dataset_v2.csv",

    index=False

)

print()

print("Dataset Saved Successfully")

print("File : walletpay_dataset_v2.csv")