package com.project.team.Service1;

import com.project.team.Entity.User;
import com.project.team.Repository.UserRepository;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import static org.springframework.security.core.userdetails.User.withUsername;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<User> user = userRepository.findByEmail(username);

        UserBuilder builder = null;

        if(user.isPresent()) {
            User currentUser = user.get();

            builder = withUsername(username);
            builder.password(currentUser.getPassword());

        } else {
            throw new UsernameNotFoundException("User not found.");
        }

        return builder.build();
    }

}
