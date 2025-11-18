package com.project.team.Service;

import com.project.team.Entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendVerificationMail(User user, String token) {
        String subject = "이메일 인증을 완료해주세요.";

        String verifyLink = frontendUrl + "/verify-email?token=" + token;

        String html = """
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:24px 0;">
  <tr>
    <td align="center">
      <table width="480" cellpadding="0" cellspacing="0" 
             style="background:#ffffff;border-radius:16px;padding:32px 32px 24px 32px;
                    box-shadow:0 8px 20px rgba(0,0,0,0.06);font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <div style="font-size:24px;font-weight:700;color:#00bcd4;">TLAN</div>
          </td>
        </tr>
        <tr>
          <td style="font-size:16px;color:#333333;padding-bottom:8px;">
            안녕하세요, Tlan입니다.
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#555555;line-height:1.6;padding-bottom:24px;">
            아래 버튼을 클릭하여 이메일 인증을 완료해 주세요.<br/>
            이메일 인증을 완료하셔야 정상적으로 로그인 하실 수 있습니다.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <a href="%s"
               style="display:inline-block;padding:12px 28px;
                      background:#00bcd4;color:#ffffff;text-decoration:none;
                      border-radius:24px;font-size:15px;font-weight:600;">
              이메일 인증하기
            </a>
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888888;line-height:1.6;padding-top:8px;">
            만약 버튼이 보이지 않으면 아래 링크를 복사해서 브라우저 주소창에 붙여넣기 해주세요.<br/>
            <a href="%s" style="color:#00bcd4;text-decoration:underline;">%s</a>
          </td>
        </tr>
        <tr>
          <td style="font-size:11px;color:#aaaaaa;padding-top:24px;text-align:center;">
            이 메일은 발신 전용입니다. 문의가 필요하시면 Tlan 서비스 내 고객센터를 이용해 주세요.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
""".formatted(verifyLink, verifyLink, verifyLink);


        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true, "UTF-8" → HTML + 한글 깨짐 방지
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(html, true); // ★ true = HTML 모드

            mailSender.send(message);
        } catch (MessagingException e) {
            // 개발 단계에선 그냥 로그 찍어두면 됨
            e.printStackTrace();
        }
    }

}
