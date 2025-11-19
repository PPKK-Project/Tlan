import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/signIn.css"; // 로그인과 같은 카드 스타일 재사용

type Status = "loading" | "success" | "error";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VerifyEmail() {
  const query = useQuery();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("이메일 인증 중입니다...");

  // StrictMode로 useEffect가 두 번 실행되는 걸 막기 위한 플래그
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    const token = query.get("token");

    if (!token) {
      setStatus("error");
      setMessage("토큰이 없습니다. 이메일 인증 메일을 다시 요청해 주세요.");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/verify-email`, {
        params: { token },
      })
      .then(() => {
        setStatus("success");
        setMessage("이메일 인증이 완료되었습니다. 이제 로그인 할 수 있습니다.");

        // 2초 뒤 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/signIn", {
            state: {
              toast: {
                message: "이메일 인증이 완료되었습니다. 로그인 해주세요.",
                type: "success",
              },
            },
          });
        }, 2000);
      })
      .catch((err) => {
        setStatus("error");
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data ||
          "이메일 인증에 실패했습니다. 토큰이 만료되었을 수 있습니다.";

        setMessage(backendMessage);
      });
  }, [query, navigate]);

  return (
    <div className="signin-page">
      <div className="signin-card">
        {/* 상단 로고 영역 그대로 재사용 */}
        <div className="signin-logo-area">
          <div className="signin-logo" onClick={() => navigate("/")}>
            TLAN
          </div>
        </div>

        {/* 이메일 인증 타이틀 */}
        <h2 className="verify-title">이메일 인증</h2>

        {/* 상태 메시지 */}
        <p className="verify-message">{message}</p>

        {/* 로딩일 때 살짝 흐릿한 느낌/스피너 넣고 싶으면 */}
        {status === "loading" && (
          <div className="verify-spinner" aria-label="loading" />
        )}

        {/* 버튼 영역 */}
        <div className="verify-actions">
          {status === "success" && (
            <button
              type="button"
              className="signin-submit"
              onClick={() =>
                navigate("/signIn", {
                  state: {
                    toast: {
                      message: "이메일 인증이 완료되었습니다.",
                      type: "success",
                    },
                  },
                })
              }
            >
              로그인 하러 가기
            </button>
          )}

          {status === "error" && (
            <button
              type="button"
              className="verify-secondary-btn"
              onClick={() => navigate("/")}
            >
              메인으로 돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
