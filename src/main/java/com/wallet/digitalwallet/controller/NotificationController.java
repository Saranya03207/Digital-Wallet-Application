package com.wallet.digitalwallet.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.wallet.digitalwallet.entity.Notification;
import com.wallet.digitalwallet.service.NotificationService;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<Notification>
    getNotifications(
            @PathVariable Long userId){

        return notificationService
                .getNotifications(userId);
    }
    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(
            @PathVariable Long userId) {

        return notificationService
                .getUnreadCount(userId);
    }
    @PutMapping("/read/{notificationId}")
    public String markAsRead(
            @PathVariable Long notificationId) {

        return notificationService
                .markAsRead(notificationId);
    }
}