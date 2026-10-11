package com.nirman;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class NirmanApplication {

    public static void main(String[] args) {
        SpringApplication.run(NirmanApplication.class, args);
    }
}
