package com.wallet.digitalwallet.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.wallet.digitalwallet.dto.ContactResponseDTO;
import com.wallet.digitalwallet.dto.ConversationDetailsDTO;
import com.wallet.digitalwallet.dto.SendMessageRequest;
import com.wallet.digitalwallet.entity.Transaction;
import com.wallet.digitalwallet.service.ConversationService;

@RestController
@RequestMapping("/wallet/contacts")
@CrossOrigin(origins = "*")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @GetMapping("/recent")
    public List<ContactResponseDTO> getRecentContacts(@RequestParam Long userId) {
        return conversationService.getRecentContacts(userId);
    }

    @GetMapping("/frequent")
    public List<ContactResponseDTO> getFrequentlyPaidContacts(@RequestParam Long userId) {
        return conversationService.getFrequentlyPaidContacts(userId);
    }

    @GetMapping("/search")
    public List<ContactResponseDTO> searchContacts(@RequestParam String keyword, @RequestParam Long currentUserId) {
        return conversationService.searchContacts(keyword, currentUserId);
    }

    @GetMapping("/conversation/{userId}/{contactId}")
    public ConversationDetailsDTO getConversationDetails(@PathVariable Long userId, @PathVariable Long contactId) {
        return conversationService.getConversationDetails(userId, contactId);
    }

    @PostMapping("/send-message")
    public Transaction sendMessage(@RequestBody SendMessageRequest request) {
        return conversationService.sendMessage(request);
    }
}
