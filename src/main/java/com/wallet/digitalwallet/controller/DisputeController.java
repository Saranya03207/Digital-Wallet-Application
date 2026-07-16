package com.wallet.digitalwallet.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.wallet.digitalwallet.dto.DisputeRequestDTO;
import com.wallet.digitalwallet.dto.DisputeResolveDTO;
import com.wallet.digitalwallet.dto.TransactionResponseDTO;
import com.wallet.digitalwallet.service.DisputeService;

@RestController
@CrossOrigin(origins = "*")
public class DisputeController {

    @Autowired
    private DisputeService disputeService;

    @PostMapping("/wallet/dispute/raise")
    public String raiseDispute(@RequestBody DisputeRequestDTO request) {
        return disputeService.raiseDispute(request);
    }

    @GetMapping("/admin/disputes")
    public List<TransactionResponseDTO> getAllDisputes() {
        return disputeService.getAllDisputes();
    }

    @PostMapping({"/admin/dispute/resolve", "/wallet/dispute/resolve"})
    public String resolveDispute(@RequestBody DisputeResolveDTO request) {
        return disputeService.resolveDispute(request);
    }
}
