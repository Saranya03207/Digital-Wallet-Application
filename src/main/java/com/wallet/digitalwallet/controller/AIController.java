package com.wallet.digitalwallet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.wallet.digitalwallet.ai.AIPrediction;
import com.wallet.digitalwallet.ai.AIRequest;
import com.wallet.digitalwallet.ai.AIService;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins="*")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/predict")
    public AIPrediction predict(
            @RequestBody AIRequest request){

        return aiService.predict(request);

    }

}