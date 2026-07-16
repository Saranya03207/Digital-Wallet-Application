package com.wallet.digitalwallet.dto;

import java.util.List;
import com.wallet.digitalwallet.entity.Transaction;

public class ConversationDetailsDTO {
    private ContactResponseDTO contact;
    private List<Transaction> history;

    public ConversationDetailsDTO() {
    }

    public ConversationDetailsDTO(ContactResponseDTO contact, List<Transaction> history) {
        this.contact = contact;
        this.history = history;
    }

    public ContactResponseDTO getContact() {
        return contact;
    }

    public void setContact(ContactResponseDTO contact) {
        this.contact = contact;
    }

    public List<Transaction> getHistory() {
        return history;
    }

    public void setHistory(List<Transaction> history) {
        this.history = history;
    }
}
