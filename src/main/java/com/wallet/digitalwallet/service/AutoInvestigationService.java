package com.wallet.digitalwallet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wallet.digitalwallet.entity.Transaction;

@Service
public class AutoInvestigationService {

    @Autowired
    private InvestigationService investigationService;

    public void investigate(Transaction transaction) {

        investigationService.investigate(transaction);

    }

}