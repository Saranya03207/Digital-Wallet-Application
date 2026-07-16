package com.wallet.digitalwallet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig
        implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        registry.addResourceHandler(
                "/profile-images/**")
                .addResourceLocations(
                        "file:uploads/profile/");

        registry.addResourceHandler(
                "/kyc-images/**")
                .addResourceLocations(
                        "file:uploads/kyc/");
    }
}