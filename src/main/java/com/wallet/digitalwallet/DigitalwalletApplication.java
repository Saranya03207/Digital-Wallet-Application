package com.wallet.digitalwallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class DigitalwalletApplication {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixDatabaseSchema() {
        try {
            jdbcTemplate.execute("ALTER TABLE transactions MODIFY COLUMN transaction_status VARCHAR(50) DEFAULT 'SUCCESS'");
            jdbcTemplate.execute("ALTER TABLE transactions MODIFY COLUMN remarks VARCHAR(1000)");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS support_tickets (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "user_id BIGINT, " +
                    "full_name VARCHAR(255), " +
                    "email VARCHAR(255), " +
                    "mobile_number VARCHAR(50), " +
                    "subject VARCHAR(255), " +
                    "message TEXT, " +
                    "status VARCHAR(50) DEFAULT 'PENDING', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS bank_accounts (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "user_id BIGINT, " +
                    "bank_name VARCHAR(255), " +
                    "account_number VARCHAR(255), " +
                    "ifsc_code VARCHAR(255), " +
                    "account_holder_name VARCHAR(255), " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            try {
                jdbcTemplate.execute("ALTER TABLE support_tickets ADD COLUMN mobile_number VARCHAR(50)");
            } catch (Exception ignored) {}
            System.out.println("Database schema fixed: transaction_status, remarks altered, support_tickets and bank_accounts tables created.");
        } catch (Exception e) {
            System.out.println("Schema modification note: " + e.getMessage());
        }
    }

	public static void main(String[] args) {
	SpringApplication.run(DigitalwalletApplication.class, args);
		System.out.println("Started Spring boot application");
	}

}
