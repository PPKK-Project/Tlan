package com.project.team.Service;

import com.project.team.Dto.UserSignUpRequest;
import com.project.team.Entity.User;
import com.project.team.Exception.EmailExistsException;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원 가입
    public ResponseEntity<User> signUp(UserSignUpRequest signUpDto) {

        String email = signUpDto.email();

        if(userRepository.existsByEmail(email)) {
            throw new EmailExistsException("이미 존재하는 Email 입니다.");
        }

        User user = new User(signUpDto.email(), passwordEncoder.encode(signUpDto.password()), signUpDto.nickname());

        return ResponseEntity.ok(userRepository.save(user));

    }

}
