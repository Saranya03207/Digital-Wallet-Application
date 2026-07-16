package com.wallet.digitalwallet.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wallet.digitalwallet.entity.Kyc;
import com.wallet.digitalwallet.entity.KycStatus;

@Repository
public interface KycRepository extends JpaRepository<Kyc, Long> {
    Optional<Kyc> findByUser_Id(Long userId);
    List<Kyc> findByKycStatus(KycStatus kycStatus);
}
