package com.project.team.Exception;
import com.project.team.Dto.ErrorResponseRecord;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;


@RestControllerAdvice   // @RestController에서 발생하는 예외를 전역적으로 처리합니다.
public class GlobalExceptionHandler {

    /**
     * 리소스를 찾지 못했을 때 발생하는 사용자 지정 예외
     *
     * @param ex - ResourceNotFoundException
     * @return 404 HttpStatus.NOT_FOUND
     */
    // @ExceptionHandler: 특정 예외 클래스를 지정하여 처리할 메소드를 정의합니다.
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseRecord> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", ""));
        // 구성된 에러 메시지와 함께 HTTP 404 (Not Found) 상태 코드를 응답합니다.
        return new ResponseEntity<>(errorResponseRecord, HttpStatus.NOT_FOUND);
    }

    /**
     * 권한이 없을 때 발생하는 예외 처리
     *
     * @param ex - AccessDeniedException
     * @return 403 HttpStatus.FORBIDDEN
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseRecord> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(errorResponseRecord, HttpStatus.FORBIDDEN);
    }

    /**
     * 중복 이메일 시 발생하는 사용자 지정 예외
     *
     * @param ex - EmailExistsException
     * @return 409 HttpStatus.CONFLICT
     */
    // @ExceptionHandler: 특정 예외 클래스를 지정하여 처리할 메소드를 정의합니다.
    @ExceptionHandler(EmailExistsException.class)
    public ResponseEntity<ErrorResponseRecord> EmailExistsException(EmailExistsException ex, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Email Exists",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", ""));
        // 구성된 에러 메시지와 함께 HTTP 404 (Not Found) 상태 코드를 응답합니다.
        return new ResponseEntity<>(errorResponseRecord, HttpStatus.CONFLICT);
    }

    /**
     * 권한이 없을 때 (403)
     * TravelPermissionService에서 발생한 PermissionDeniedException을 처리합니다.
     */
    @ExceptionHandler(PermissionDeniedException.class)
    public ResponseEntity<ErrorResponseRecord> handlePermissionDeniedException(PermissionDeniedException ex, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(errorResponseRecord, HttpStatus.FORBIDDEN);
    }


    /**
     * 잘못된 요청일 때 (400)
     * TravelPermissionService에서 발생하는 BadRequestException을 처리합니다.
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponseRecord> handleBadRequestException(BadRequestException ex, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(errorResponseRecord, HttpStatus.BAD_REQUEST);
    }






    @ExceptionHandler({UsernameNotFoundException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponseRecord> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "UnAuthorized",
                "자격 증명에 실패하였습니다. (이메일 또는 비밀번호 불일치)",
                request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(errorResponseRecord, HttpStatus.UNAUTHORIZED);
    }

    /**
     * 위에서 지정하지 않은 모든 예외를 처리
     *
     * @param ex - Exception
     * @return 500 HttpStatus.INTERNAL_SERVER_ERROR
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseRecord> handleGlobalException(Exception ex, WebRequest request) {
        ErrorResponseRecord errorResponseRecord = new ErrorResponseRecord(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        // 예상치 못한 에러이므로 HTTP 500 (Internal Server Error) 상태 코드를 응답합니다.
        return new ResponseEntity<>(errorResponseRecord, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
