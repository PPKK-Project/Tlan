package com.project.team;

import com.project.team.Entity.*;
import com.project.team.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
@RequiredArgsConstructor
public class TeamApplication implements CommandLineRunner {
    public static void main(String[] args) {
        SpringApplication.run(TeamApplication.class, args);
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TravelRepository travelRepository;
    private final AccommodationRepository accommodationRepository;
    private final AttractionRepository attractionRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public void run(String... args) throws Exception {
        User user = new User("user", passwordEncoder.encode("user"), "user");
        userRepository.save(user);
        Travel travel = new Travel(user, "JP");
        Accommodation accommodation = new Accommodation(travel,"숙박지", "호텔", "호텔입니다", "주소", 35.123234, 128.135);
        Restaurant restaurant = new Restaurant(travel, "식당", "레스토랑", "식당인데용", 35.1232345, 128.135);
        Attraction attraction = new Attraction(travel, "관광지", "관광지입니다", 35.123234, 128.1245);

        travelRepository.save(travel);
        accommodationRepository.save(accommodation);
        restaurantRepository.save(restaurant);
        attractionRepository.save(attraction);
    }
}
