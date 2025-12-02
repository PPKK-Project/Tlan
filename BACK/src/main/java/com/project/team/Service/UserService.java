package com.project.team.Service;

import com.project.team.Dto.PatchUsersRecord;
import com.project.team.Dto.UserResponse;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.security.Principal;

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

    // 유저 수정
    @Transactional
    public ResponseEntity<Void> patchUsers(PatchUsersRecord dto, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));

        boolean isModified = false;

        // oauth2 닉네임 변경

        if(user.getPassword().equals("social")){
            if (dto.nickname() != null) {
                user.setNickname(dto.nickname());
                userRepository.save(user);
                return ResponseEntity.ok().build();
            }
        }



        // 현재 비밀번호 확인
        if(!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new AccessDeniedException("권한이 없습니다.");
        }


        // 닉네임 변경: 새로운 닉네임이 제공되었고, 기존 닉네임과 다를 경우
        if (dto.nickname() != null && !dto.nickname().isEmpty() && !user.getNickname().equals(dto.nickname())) {
            user.setNickname(dto.nickname());
            isModified = true;
        }

        // 비밀번호 변경: 새로운 비밀번호가 제공되었을 경우
        if (dto.newpassword() != null && !dto.newpassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.newpassword()));
            isModified = true;
        }
        if (isModified) {
            userRepository.save(user);
        }

        return ResponseEntity.ok().build();
    }

    // 비밀번호 수정
//    public ResponseEntity<Void> patchPassword(PatchUsersRecord dto, Principal principal) {
//        User user = userRepository.findByEmail(principal.getName())
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));
//
//        if(!passwordEncoder.matches(dto.password(), user.getPassword())) {
//            throw new AccessDeniedException("권한이 없습니다.");
//        }
//
//        user.setPassword(dto.password());
//        userRepository.save(user);
//
//        return ResponseEntity.ok().build();
//    }

    /**
     * [GET] 현재 로그인한 사용자 정보(ID, 이메일, 닉네임) 조회
     */
    public UserResponse getUserInfo(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("해당 사용자를 찾을 수 없습니다: " + principal.getName()));
        return new UserResponse(user.getId(), user.getEmail(), user.getNickname());
    }
}
