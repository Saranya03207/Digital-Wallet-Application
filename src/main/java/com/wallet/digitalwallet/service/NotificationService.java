package com.wallet.digitalwallet.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.entity.Notification;
import com.wallet.digitalwallet.repository.NotificationRepository;

@Service
public class NotificationService {


	    @Autowired
	    private NotificationRepository notificationRepository;

	    public List<Notification>
	    getNotifications(Long userId){

	        return notificationRepository
	            .findByReceiverUserIdOrderByCreatedAtDesc(
	                    userId);
	    }
	    public long getUnreadCount(Long userId) {

	        return notificationRepository
	                .countByReceiverUserIdAndIsReadFalse(
	                        userId);
	    }
	    public String markAsRead(
	            Long notificationId) {

	        Notification notification =
	                notificationRepository
	                        .findById(notificationId)
	                        .orElseThrow(() ->
	                                new RuntimeException(
	                                        "Notification Not Found"));

	        notification.setRead(true);

	        notificationRepository.save(notification);

	        return "Notification Read";
	    }

}
