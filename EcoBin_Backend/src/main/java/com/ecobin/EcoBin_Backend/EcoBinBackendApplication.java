package com.ecobin.EcoBin_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class EcoBinBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(EcoBinBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner migrateDatabase(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE scan_history ALTER COLUMN image_url TYPE text");
				jdbcTemplate.execute("ALTER TABLE scan_history ALTER COLUMN text_description TYPE text");
				jdbcTemplate.execute("ALTER TABLE waste_requests ALTER COLUMN image_url TYPE text");
				jdbcTemplate.execute("ALTER TABLE waste_requests ALTER COLUMN resolution_proof_url TYPE text");
				System.out.println("Database columns automatically migrated to TEXT successfully.");
			} catch (Exception e) {
				System.out.println("Database columns migration skipped or already done: " + e.getMessage());
			}
		};
	}
}
