***Digital Wallet***
create database digital_wallet_db;
show tables;
use digital_wallet_db;
SHOW CREATE TABLE users;
DESC users;
DESC notifications;

***DELETE***
DELETE from notifications;
DELETE from users;
DELETE from wallet;
DELETE from transactions;
DELETE FROM users WHERE user_id=8;
DELETE FROM wallet WHERE user_id = 8;
DELETE FROM transactions WHERE transaction_type="WITHDRAW";

***SELECT***
select * from users;
select * from wallet;
select * from transactions;
select * from notifications;
select * from users order by user_id desc;
SELECT
user_id,
full_name,
email,
email_verified
FROM users;

***ALTER***
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users
ADD COLUMN daily_transferred_amount DECIMAL(12,2)
DEFAULT 0;
ALTER TABLE users
ADD COLUMN mobile_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users
ADD COLUMN upi_id VARCHAR(100) UNIQUE;
ALTER TABLE transactions
ADD COLUMN upi_transaction_id VARCHAR(100);
ALTER TABLE users
ADD COLUMN daily_transfer_limit DECIMAL(12,2)
DEFAULT 50000;
ALTER TABLE users
ADD COLUMN reward_points INT DEFAULT 0;
ALTER TABLE users
ADD profile_image VARCHAR(255);
UPDATE transactions
SET upi_transaction_id =
CONCAT('TXN', transaction_id)
WHERE upi_transaction_id IS NULL;
ALTER TABLE users
ADD COLUMN transaction_pin VARCHAR(20);
ALTER TABLE users
ADD COLUMN aadhaar_number VARCHAR(12) UNIQUE;

UPDATE users
SET email_verified = 1
WHERE email='ashmitha@gmail.com';

CREATE TABLE users(
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile_number VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER','ADMIN') DEFAULT 'USER',
    status ENUM('ACTIVE','BLOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO wallet
(user_id,balance,wallet_status,created_at)
VALUES
(1,0,'ACTIVE',NOW());

 create table wallet (
 wallet_id BIGINT primary key auto_increment,
 user_id BIGINT unique not null,
 balance decimal(12,2) default 0.00 check(balance>=0),
 wallet_status enum('ACTIVE','FROZEN') default 'ACTIVE',
 created_at timestamp default current_timestamp,
 constraint fk_wallet_user
 foreign key (user_id)
 references users(user_id)
 );

 create table transactions(
 transaction_id bigint primary key auto_increment,
 sender_user_id bigint not null,
 receiver_user_id bigint,
 amount decimal(12,2) not null check(amount>0),
 transaction_type enum('ADD_MONEY','TRANSFER','WITHDRAW') not null,
 transaction_status enum('SUCCESS','FAILED','PENDING')default 'SUCCESS',
 remarks varchar(255),
 transaction_date timestamp default current_timestamp,
 constraint fk_sender
 foreign key(sender_user_id)
 references users(user_id),
 constraint fk_receiver
 foreign key (receiver_user_id)
 references users(user_id)
 );

 CREATE TABLE beneficiary (
    beneficiary_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    beneficiary_user_id BIGINT NOT NULL,
    nickname VARCHAR(50) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_beneficiary_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id),
    CONSTRAINT fk_beneficiary_receiver
    FOREIGN KEY (beneficiary_user_id)
    REFERENCES users(user_id)
);

 CREATE TABLE admin_audit_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id)
    REFERENCES users(user_id)
);
CREATE TABLE rewards (
    reward_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    points INT,
    reward_message VARCHAR(255),
    created_at DATETIME
);
