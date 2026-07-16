package com.wallet.digitalwallet.service;

import java.io.File;

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
                
                // Parse ParsedText from JSON
                String searchKey = "\"ParsedText\":\"";
                int startIndex = jsonBody.indexOf(searchKey);
                if (startIndex != -1) {
                    startIndex += searchKey.length();
                    int endIndex = jsonBody.indexOf("\",\"ErrorMessage\"", startIndex);
                    if (endIndex == -1) {
                        endIndex = jsonBody.indexOf("\",\"ErrorDetails\"", startIndex);
                    }
                    if (endIndex != -1) {
                        String rawText = jsonBody.substring(startIndex, endIndex);
                        return rawText.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\\/", "/");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("OCR Extraction Failed: " + e.getMessage());
        }
        return "";
    }
}
