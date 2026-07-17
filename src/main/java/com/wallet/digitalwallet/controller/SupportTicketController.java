package com.wallet.digitalwallet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.wallet.digitalwallet.entity.SupportTicket;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.repository.SupportTicketRepository;
import com.wallet.digitalwallet.repository.UserRepository;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private UserRepository userRepository;

    // Public endpoint: Submit query/unblock request
    @PostMapping("/support/submit")
    public String submitTicket(@RequestBody SupportTicket ticket) {
        // If user email is associated with a blocked user, auto-append that info to subject
        if (ticket.getEmail() != null) {
            Optional<User> userOpt = userRepository.findByEmail(ticket.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                ticket.setUserId(user.getId());
                if (user.getStatus() == Status.BLOCKED) {
                    ticket.setSubject("[Blocked Account Request] " + ticket.getSubject());
                }
            }
        }
        supportTicketRepository.save(ticket);
        return "Ticket submitted successfully!";
    }

    // Admin endpoint: Get all support tickets
    @GetMapping("/support/tickets")
    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAllByOrderByIdDesc();
    }

    // Admin endpoint: Resolve a support ticket
    @PostMapping("/support/resolve/{id}")
    public String resolveTicket(@PathVariable Long id) {
        Optional<SupportTicket> ticketOpt = supportTicketRepository.findById(id);
        if (ticketOpt.isPresent()) {
            SupportTicket ticket = ticketOpt.get();
            ticket.setStatus("RESOLVED");
            supportTicketRepository.save(ticket);
            return "Ticket marked as resolved!";
        }
        throw new RuntimeException("Ticket not found!");
    }

    // Admin endpoint: Unblock a user
    @PostMapping("/support/unblock/{userId}")
    public String unblockUser(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(Status.ACTIVE);
            userRepository.save(user);
            
            // Also resolve any pending tickets for this user
            List<SupportTicket> tickets = supportTicketRepository.findAllByOrderByIdDesc();
            for (SupportTicket ticket : tickets) {
                if (userId.equals(ticket.getUserId()) && "PENDING".equals(ticket.getStatus())) {
                    ticket.setStatus("RESOLVED");
                    supportTicketRepository.save(ticket);
                }
            }
            return "User account successfully unblocked and active!";
        }
        throw new RuntimeException("User not found!");
    }
}
