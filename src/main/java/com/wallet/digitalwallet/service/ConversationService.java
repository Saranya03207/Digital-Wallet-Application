package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wallet.digitalwallet.dto.ContactResponseDTO;
import com.wallet.digitalwallet.dto.ConversationDetailsDTO;
import com.wallet.digitalwallet.dto.SendMessageRequest;
import com.wallet.digitalwallet.entity.Conversation;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.entity.TransactionStatus;
import com.wallet.digitalwallet.entity.TransactionType;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.repository.ConversationRepository;
import com.wallet.digitalwallet.repository.TransactionRepository;
import com.wallet.digitalwallet.repository.UserRepository;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ContactResponseDTO> getRecentContacts(Long userId) {
        Set<Long> seenIds = new LinkedHashSet<>();
        List<ContactResponseDTO> result = new ArrayList<>();

        // First check Conversation table
        List<Conversation> convs = conversationRepository.findByUserOrderByUpdatedAtDesc(userId);
        for (Conversation c : convs) {
            Long contactId = c.getUser1Id().equals(userId) ? c.getUser2Id() : c.getUser1Id();
            if (seenIds.add(contactId)) {
                userRepository.findById(contactId).ifPresent(contact -> {
                    if (contact.getStatus() != Status.BLOCKED) {
                        result.add(buildContactDTO(contact, userId, c.getUpdatedAt(), getTransactionCountBetween(userId, contactId)));
                    }
                });
            }
        }

        // Also check transactions in case historical transactions don't have conversation entries yet
        List<Transaction> txs = transactionRepository.findBySenderIdOrReceiverIdOrderByTransactionDateDesc(userId, userId);
        for (Transaction t : txs) {
            if (t.getSender() == null || t.getReceiver() == null) continue;
            Long contactId = t.getSender().getId().equals(userId) ? t.getReceiver().getId() : t.getSender().getId();
            if (contactId.equals(userId)) continue;
            if (seenIds.add(contactId)) {
                userRepository.findById(contactId).ifPresent(contact -> {
                    if (contact.getStatus() != Status.BLOCKED) {
                        result.add(buildContactDTO(contact, userId, t.getTransactionDate(), getTransactionCountBetween(userId, contactId)));
                    }
                });
            }
        }

        return result;
    }

    public List<ContactResponseDTO> getFrequentlyPaidContacts(Long userId) {
        List<Object[]> rows = transactionRepository.findFrequentlyPaidReceiverIds(userId);
        List<ContactResponseDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            Long contactId = (Long) row[0];
            Long totalCount = (Long) row[1];
            if (contactId == null || contactId.equals(userId)) continue;
            userRepository.findById(contactId).ifPresent(contact -> {
                if (contact.getStatus() != Status.BLOCKED) {
                    ContactResponseDTO dto = buildContactDTO(contact, userId, null, totalCount);
                    result.add(dto);
                }
            });
        }
        return result;
    }

    public List<ContactResponseDTO> searchContacts(String keyword, Long currentUserId) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        List<User> users = userRepository.searchAllContacts(keyword.trim(), currentUserId);
        List<ContactResponseDTO> result = new ArrayList<>();
        for (User u : users) {
            if (u.getStatus() != Status.BLOCKED) {
                long count = getTransactionCountBetween(currentUserId, u.getId());
                result.add(buildContactDTO(u, currentUserId, null, count));
            }
        }
        return result;
    }

    public ConversationDetailsDTO getConversationDetails(Long userId, Long contactId) {
        User contact = userRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        if (contact.getStatus() == Status.BLOCKED) {
            throw new RuntimeException("Cannot open conversation. Account is blocked.");
        }

        ContactResponseDTO contactDto = buildContactDTO(contact, userId, null, getTransactionCountBetween(userId, contactId));
        List<Transaction> history = transactionRepository.findConversationHistory(userId, contactId);

        return new ConversationDetailsDTO(contactDto, history);
    }

    @Transactional
    public Transaction sendMessage(SendMessageRequest request) {
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        if (sender.getStatus() == Status.BLOCKED || receiver.getStatus() == Status.BLOCKED) {
            throw new RuntimeException("Cannot send message or transfer to a blocked account.");
        }

        Transaction msg = new Transaction();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setAmount(new BigDecimal("0.01"));
        msg.setTransactionType(TransactionType.TRANSFER);
        msg.setTransactionStatus(TransactionStatus.SUCCESS);
        msg.setRemarks(request.getMessage());
        msg.setMessage(request.getMessage());
        msg.setIsMessage(true);
        msg.setMessageType("TEXT");
        msg.setTransactionDate(LocalDateTime.now());
        
        String convId = getOrComputeConversationId(request.getSenderId(), request.getReceiverId());
        msg.setConversationId(convId);

        transactionRepository.save(msg);
        updateOrCreateConversation(request.getSenderId(), request.getReceiverId(), request.getMessage(), null);

        return msg;
    }

    @Transactional
    public void updateOrCreateConversation(Long userA, Long userB, String lastMsg, BigDecimal lastTxAmount) {
        String convId = getOrComputeConversationId(userA, userB);
        Conversation conv = conversationRepository.findByConversationId(convId).orElseGet(() -> {
            Conversation c = new Conversation();
            c.setConversationId(convId);
            c.setUser1Id(Math.min(userA, userB));
            c.setUser2Id(Math.max(userA, userB));
            return c;
        });

        if (lastMsg != null) {
            conv.setLastMessage(lastMsg);
        }
        if (lastTxAmount != null) {
            conv.setLastTransaction(lastTxAmount);
        }
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);
    }

    public String getOrComputeConversationId(Long id1, Long id2) {
        long min = Math.min(id1, id2);
        long max = Math.max(id1, id2);
        return "conv_" + min + "_" + max;
    }

    private ContactResponseDTO buildContactDTO(User contact, Long currentUserId, LocalDateTime lastTime, long totalTransactions) {
        ContactResponseDTO dto = new ContactResponseDTO();
        dto.setUserId(contact.getId());
        dto.setFullName(contact.getFullName());
        dto.setUpiId(contact.getUpiId());
        dto.setProfileImage(contact.getProfileImage());
        dto.setTotalTransactions(totalTransactions);

        // Mask phone number: e.g. XXXXX X4067
        String phone = contact.getMobileNumber();
        if (phone != null && phone.length() >= 10) {
            dto.setMaskedMobileNumber("XXXXX X" + phone.substring(phone.length() - 4));
        } else {
            dto.setMaskedMobileNumber(phone);
        }

        dto.setLastTransactionTime(formatRelativeTime(lastTime));
        dto.setTrustBadge(computeTrustBadge(contact, currentUserId));
        dto.setStatus(contact.getStatus() != null ? contact.getStatus().name() : "ACTIVE");
        return dto;
    }

    private long getTransactionCountBetween(Long userId, Long contactId) {
        long count = transactionRepository.countBySenderIdAndReceiverId(userId, contactId);
        count += transactionRepository.countBySenderIdAndReceiverId(contactId, userId);
        return count;
    }

    private String computeTrustBadge(User contact, Long currentUserId) {
        if (contact.getStatus() == Status.BLOCKED) {
            return "Blocked";
        }
        return "🟢 Verified UPI";
    }

    private String formatRelativeTime(LocalDateTime date) {
        if (date == null) return "Recent";
        LocalDateTime now = LocalDateTime.now();
        long mins = ChronoUnit.MINUTES.between(date, now);
        if (mins < 1) return "Just now";
        if (mins < 60) return mins + " mins ago";
        long hours = ChronoUnit.HOURS.between(date, now);
        if (hours < 24 && date.toLocalDate().equals(now.toLocalDate())) {
            return hours <= 2 ? hours + " Hours Ago" : "Today";
        }
        if (date.toLocalDate().equals(now.toLocalDate().minusDays(1))) {
            return "Yesterday";
        }
        return DateTimeFormatter.ofPattern("dd MMM").format(date);
    }
}
