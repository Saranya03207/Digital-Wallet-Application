package com.wallet.digitalwallet.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIService {

    private static final String AI_URL =
            "http://localhost:8000";

    private final RestTemplate restTemplate =
            new RestTemplate();

    // ==========================================
    // Initial Transaction Prediction
    // ==========================================

    public AIPrediction predict(AIRequest request) {

        try {

            ResponseEntity<AIPrediction> response =
                    restTemplate.postForEntity(

                            AI_URL + "/predict",

                            request,

                            AIPrediction.class

                    );

            return response.getBody();

        }

        catch (Exception e) {

            e.printStackTrace();

            AIPrediction prediction =
                    new AIPrediction();

            prediction.setPrediction("Unknown");
            prediction.setScore(0.0);
            prediction.setReason("AI Server Offline");

            return prediction;

        }

    }

    // ==========================================
    // Deep Investigation
    // ==========================================

    public InvestigationResponse investigate(
            InvestigationRequest request) {

        try {

            ResponseEntity<InvestigationResponse> response =
                    restTemplate.postForEntity(

                            AI_URL + "/investigate",

                            request,

                            InvestigationResponse.class

                    );

            return response.getBody();

        }

        catch (Exception e) {

            e.printStackTrace();

            InvestigationResponse response =
                    new InvestigationResponse();

            response.setPrediction("Unknown");
            response.setScore(0.0);
            response.setReason("Investigation Server Offline");

            return response;

        }

    }

}