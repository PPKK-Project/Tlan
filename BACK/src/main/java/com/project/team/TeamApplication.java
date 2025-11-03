package com.project.team;

import com.project.team.Entity.User;
import com.project.team.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
<<<<<<< HEAD
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class TeamApplication implements CommandLineRunner {
=======
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TeamApplication {
>>>>>>> main

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

    public TeamApplication(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static void main(String[] args) {
		SpringApplication.run(TeamApplication.class, args);
	}

<<<<<<< HEAD
	@Override
	public void run(String... args) throws Exception {
		User user = new User("user", passwordEncoder.encode("user"), "user");
		userRepository.save(user);
	}
}
=======
}
>>>>>>> main
