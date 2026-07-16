package com.wallet.digitalwallet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http)
	        throws Exception {

	    http
	        .csrf(csrf -> csrf.disable())
	        .httpBasic(basic -> basic.disable())
	        .authorizeHttpRequests(auth -> auth
	            .requestMatchers(
	                "/swagger-ui/**",
	                "/v3/api-docs/**",
	                "/test/**",
	                "/users/**"
	            ).permitAll()
	            .anyRequest().permitAll()
	        );

	    return http.build();
	}
}