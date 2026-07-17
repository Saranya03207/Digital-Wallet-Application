package com.wallet.digitalwallet.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class OcrDataExtractor {

    public String extractDob(String text) {
        String[] lines = text.split("\\r?\\n");
        Pattern dobPattern = Pattern.compile("(\\d{2}\\s*[/\\-\\.]\\s*\\d{2}\\s*[/\\-\\.]\\s*\\d{4}|\\d{4})");
        
        // 1. Line-by-line check near DOB/Birth/YOB keywords
        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            if (lower.contains("dob") || lower.contains("birth") || lower.contains("yob") || lower.contains("பிறந்த")) {
                Matcher m = dobPattern.matcher(lines[i]);
                if (m.find()) {
                    return m.group(1).replaceAll("\\s+", "").replace("/", "-").replace(".", "-");
                }
                if (i + 1 < lines.length) {
                    Matcher mNext = dobPattern.matcher(lines[i + 1]);
                    if (mNext.find()) {
                        return mNext.group(1).replaceAll("\\s+", "").replace("/", "-").replace(".", "-");
                    }
                }
            }
        }

        // 2. Strict fallback check: skip any line that mentions 'issue' or whose adjacent line mentions 'issue'
        Pattern strictDatePattern = Pattern.compile("(\\d{2}\\s*[/\\-\\.]\\s*\\d{2}\\s*[/\\-\\.]\\s*\\d{4})");
        for (int i = 0; i < lines.length; i++) {
            String lower = lines[i].toLowerCase();
            String prevLower = (i > 0) ? lines[i - 1].toLowerCase() : "";
            if (lower.contains("issued") || lower.contains("issue") || prevLower.contains("issued") || prevLower.contains("issue")) {
                continue;
            }
            Matcher matcher = strictDatePattern.matcher(lines[i]);
            if (matcher.find()) {
                String date = matcher.group(1).replaceAll("\\s+", "").replace("/", "-").replace(".", "-");
                // Exclude common issue dates from 2011-2026
                if (date.endsWith("-2014") || date.endsWith("-2015") || date.endsWith("-2016") || date.endsWith("-2017") || date.endsWith("-2018")) {
                    continue;
                }
                return date;
            }
        }
        return "Not Found";
    }

    public String extractName(String text) {
        String[] lines = text.split("\\r?\\n");
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            // Clean out non-English letters/spaces so mixed lines become pure English
            String cleanEnglish = line.replaceAll("[^A-Za-z\\s\\.]", " ").replaceAll("\\s+", " ").trim();
            if (cleanEnglish.length() < 3 || cleanEnglish.length() > 50) continue;
            String lower = cleanEnglish.toLowerCase();
            if (lower.contains("government") || lower.contains("india") || lower.contains("aadhaar") ||
                lower.contains("unique") || lower.contains("authority") || lower.contains("dob") ||
                lower.contains("birth") || lower.contains("female") || lower.contains("male") ||
                lower.contains("issued") || lower.contains("address") || lower.contains("proof") ||
                lower.contains("help") || lower.contains("uidai") || lower.contains("father") ||
                lower.contains("husband") || lower.contains("details")) {
                continue;
            }
            if (cleanEnglish.matches("^[A-Za-z\\s\\.]{3,50}$")) {
                // Ensure it has at least two words (first and last name) or length > 6
                if (cleanEnglish.split("\\s+").length >= 2 || cleanEnglish.length() > 6) {
                    return cleanEnglish;
                }
            }
        }
        return "Not Found";
    }

    public String extractAddress(String text) {
        String[] lines = text.split("\\r?\\n");
        StringBuilder addressBuilder = new StringBuilder();
        boolean addressStarted = false;
        for (String line : lines) {
            String clean = line.trim();
            String lower = clean.toLowerCase();
            if (lower.contains("address:") || lower.contains("address") || lower.contains("d/o") || lower.contains("s/o") || lower.contains("w/o") || lower.contains("c/o") || lower.contains("thante")) {
                addressStarted = true;
                if (lower.startsWith("address:") || lower.equals("address")) {
                    String remainder = clean.substring(clean.indexOf(":") + 1).trim();
                    if (!remainder.isEmpty()) {
                        addressBuilder.append(remainder).append(", ");
                    }
                    continue;
                }
            }
            if (addressStarted) {
                if (lower.contains("www.") || lower.contains("help") || clean.contains("1947") || clean.matches(".*\\d{4}\\s*\\d{4}\\s*\\d{4}.*") || lower.contains("vid :") || lower.contains("aadhaar is proof")) {
                    break;
                }
                if (!clean.isEmpty() && !clean.contains("------")) {
                    addressBuilder.append(clean).append(", ");
                    // If this line contains the PIN code (e.g., Tamil Nadu - 636111), that is the end of the address!
                    if (clean.matches(".*\\b[1-8]\\d{5}\\b.*")) {
                        break;
                    }
                }
            }
        }
        String addr = addressBuilder.toString().trim();
        if (addr.endsWith(",")) {
            addr = addr.substring(0, addr.length() - 1).trim();
        }
        addr = addr.replaceAll(",?\\s*&?\\s*1947.*$", "").trim();
        if (addr.endsWith(",")) {
            addr = addr.substring(0, addr.length() - 1).trim();
        }
        if (!addr.isEmpty() && addr.length() > 5) {
            return addr;
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
        String[] lines = text.split("\\r?\\n");
        Pattern pinPattern = Pattern.compile("\\b([1-8]\\d{5}|[1-8]\\d{2}\\s\\d{3})\\b");
        
        // Priority 1: Look on lines near state names or address keywords (e.g. Tamil Nadu - 636111)
        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("nadu") || lower.contains("kerala") || lower.contains("karnataka") || 
                lower.contains("andhra") || lower.contains("telangana") || lower.contains("maharashtra") || 
                lower.contains("delhi") || lower.contains("gujarat") || lower.contains("bengal") || 
                lower.contains("pradesh") || lower.contains("dist:") || lower.contains("po:") || lower.contains("-")) {
                Matcher m = pinPattern.matcher(line);
                if (m.find()) {
                    return m.group(1).replace(" ", "");
                }
            }
        }

        // Priority 2: Look inside lines that come after "Address:" keyword
        boolean addressStarted = false;
        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("address:") || lower.contains("address") || lower.contains("d/o") || lower.contains("s/o") || lower.contains("w/o")) {
                addressStarted = true;
            }
            if (addressStarted) {
                Matcher m = pinPattern.matcher(line);
                if (m.find()) {
                    return m.group(1).replace(" ", "");
                }
            }
        }

        // Priority 3: Generic fallback
        Matcher matcher = pinPattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).replace(" ", "");
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
