package com.travel.travelproject;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TravelprojectApplication {
	public static void main(String[] args) {
		SpringApplication.run(TravelprojectApplication.class, args);

	}

}