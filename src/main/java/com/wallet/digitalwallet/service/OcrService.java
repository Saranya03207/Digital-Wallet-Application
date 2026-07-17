package com.wallet.digitalwallet.service;

import java.io.File;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class OcrService {

    private static final String OCR_API_URL = "https://api.ocr.space/parse/image";
    private static final String API_KEY = "helloworld"; // Free tier test key

    public String extractTextFromImage(File imageFile) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("apikey", API_KEY);
            body.add("language", "eng");
            body.add("isOverlayRequired", false);
            body.add("detectOrientation", true);
            body.add("scale", true);
            body.add("OCREngine", 2);
            
            // Extract extension from filename or default to jpg so OCR.space doesn't reject with E216
            String fname = imageFile.getName().toLowerCase();
            String filetype = "jpg";
            if (fname.endsWith(".png")) filetype = "png";
            else if (fname.endsWith(".pdf")) filetype = "pdf";
            else if (fname.endsWith(".gif")) filetype = "gif";
            else if (fname.endsWith(".webp")) filetype = "webp";
            body.add("filetype", filetype);

            body.add("file", new FileSystemResource(imageFile));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(OCR_API_URL, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String jsonBody = response.getBody();
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(jsonBody);
                JsonNode parsedResults = root.path("ParsedResults");
                if (parsedResults.isArray() && parsedResults.size() > 0) {
                    String rawText = parsedResults.get(0).path("ParsedText").asText();
                    System.out.println("Clean ParsedText from OCR.space for file [" + imageFile.getName() + "]:\n" + rawText);
                    return rawText;
                } else {
                    System.err.println("No ParsedResults in OCR.space response: " + jsonBody);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("OCR Extraction Failed: " + e.getMessage());
        }
        return "";
    }
}
