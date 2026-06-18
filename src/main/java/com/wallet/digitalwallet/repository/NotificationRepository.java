package com.wallet.digitalwallet.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wallet.digitalwallet.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification>
    findByReceiverUserIdOrderByCreatedAtDesc(
            Long receiverUserId);

    long countByReceiverUserIdAndIsReadFalse(
            Long receiverUserId);
}