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

    boolean existsByEmail(
            String email);

    boolean existsByMobileNumber(
            String mobileNumber);

    boolean existsByAadhaarNumber(
            String aadhaarNumber);
}