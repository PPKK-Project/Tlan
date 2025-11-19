package com.project.team.Service;

import com.project.team.Dto.PatchUsersRecord;
import com.project.team.Dto.UserSignUpRequest;
import com.project.team.Entity.EmailVerificationToken;
import com.project.team.Entity.User;
import com.project.team.Exception.AccessDeniedException;
import com.project.team.Exception.EmailExistsException;
import com.project.team.Repository.EmailVerificationTokenRepository;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository tokenRepository;
    private final MailService mailService;

    // 회원 가입
    public ResponseEntity<?> signUp(UserSignUpRequest dto) {
        if(userRepository.existsByEmail(dto.email())) {
            throw new EmailExistsException("이미 존재하는 Email 입니다.");
        }

        User user = new User(dto.email(), passwordEncoder.encode(dto.password()), dto.nickname());

        User savedUser = userRepository.save(user);

        EmailVerificationToken token = EmailVerificationToken.create(user);
        tokenRepository.save(token);
        mailService.sendVerificationMail(savedUser, token.getToken());

        return ResponseEntity.ok(savedUser);

    }

    // 닉네임 수정
    public ResponseEntity<Void> patchNickname(PatchUsersRecord dto, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));

        if(!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new AccessDeniedException("권한이 없습니다.");
        }

        user.setNickname(dto.nickname());
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    // 닉네임 조회
    public String getNickname(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found " + principal.getName()));
        return user.getNickname();
    }
}
