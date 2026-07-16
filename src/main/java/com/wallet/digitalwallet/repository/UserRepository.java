package com.wallet.digitalwallet.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.User;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findById(Long id);

    long countByStatus(Status status);

    List<User> findByFullNameContainingIgnoreCase(
            String fullname);

    Optional<User> findByUpiId(String upiId);

    Optional<User> findByMobileNumber(String mobileNumber);

    boolean existsByEmail(
            String email);

    boolean existsByMobileNumber(
            String mobileNumber);

    boolean existsByAadhaarNumber(
            String aadhaarNumber);

    @org.springframework.data.jpa.repository.Query("""
        SELECT u FROM User u
        WHERE (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(u.mobileNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(u.upiId) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND u.id != :currentUserId
          AND u.status != com.wallet.digitalwallet.entity.Status.BLOCKED
    """)
    List<User> searchAllContacts(
            @org.springframework.data.repository.query.Param("keyword") String keyword,
            @org.springframework.data.repository.query.Param("currentUserId") Long currentUserId);
}