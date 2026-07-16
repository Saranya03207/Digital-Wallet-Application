package com.wallet.digitalwallet.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class OcrDataExtractor {

    public String extractDob(String text) {
        // Look for DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY with optional spaces
        Pattern pattern = Pattern.compile("(\\d{2}\\s*[/\\-\\.]\\s*\\d{2}\\s*[/\\-\\.]\\s*\\d{4})");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).replaceAll("\\s+", "").replace("/", "-").replace(".", "-"); // Standardize on dash
        }
        return "Not Found";
    }

    public String extractAadhaarNumber(String text) {
        // Look for 12 digits like 4444 4623 4067 or 444446234067
        Pattern pattern = Pattern.compile("\\b(\\d{4}\\s*\\d{4}\\s*\\d{4})\\b");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String clean = matcher.group(1).replaceAll("\\s+", "");
            return "XXXX XXXX " + clean.substring(8);
        }
        return "Not Found";
    }

    public String extractGender(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("female")) {
            return "FEMALE";
        } else if (lower.contains("male")) {
            // Because "female" contains "male", check female first.
            return "MALE";
        } else if (lower.contains("transgender")) {
            return "TRANSGENDER";
        }
        return "Not Found";
    }

    public String extractPinCode(String text) {
        // Look for exactly 6 digits, possibly with space like 600 028 or 600028
        // Using word boundary to avoid matching longer numbers like phone numbers
        Pattern pattern = Pattern.compile("\\b(\\d{6}|\\d{3}\\s\\d{3})\\b");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).replace(" ", ""); // standardize on 6 contiguous digits
        }
        return "Not Found";
    }
    
    public String extractState(String text) {
        // Common Indian states check (can be expanded)
        String[] states = {
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
            "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
            "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
        };
        
        String lowerText = text.toLowerCase();
        for (String state : states) {
            if (lowerText.contains(state.toLowerCase())) {
                return state;
            }
        }
        return "Not Found";
    }
}
