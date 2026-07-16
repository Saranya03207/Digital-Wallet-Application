package com.wallet.digitalwallet.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.wallet.digitalwallet.entity.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByConversationId(String conversationId);

    @Query("SELECT c FROM Conversation c WHERE c.user1Id = :userId OR c.user2Id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserOrderByUpdatedAtDesc(@Param("userId") Long userId);
}
