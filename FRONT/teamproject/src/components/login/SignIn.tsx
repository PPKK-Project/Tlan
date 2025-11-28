import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import axios from "axios";
import "../../css/signIn.css";
import { useNavigate, useLocation, Link } from "react-router-dom";

type User = {
  email: string;
  password: string;
};


function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User>({
    email: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "info" | "warning" | "error";
  }>({
    open: false,
    message: "",
    type: "error",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  };

  // 토스트 자동 닫기
  useEffect(() => {
    if (!snackbar.open) return;
    const timer = window.setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [snackbar.open]);

  // 소셜 로그인 후 리다이렉트
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) return;

    localStorage.setItem("jwt", token);
    localStorage.setItem("loginJustNow", "true");

    navigate("/", { replace: true });
  }, [location.search, navigate]);

  const handleLogin = () => {
    if (!user.email || !user.password) {
      setSnackbar({
        open: true,
        message: "이메일과 비밀번호를 모두 입력해주세요.",
        type: "warning",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BASE_URL}/login`, user, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const authHeader =
          response.headers["authorization"] ??
          response.headers["Authorization"];

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.slice(7);
          localStorage.setItem("jwt", token);
          localStorage.setItem("loginJustNow", "true");

          navigate("/");
        } else {
          setSnackbar({
            open: true,
            message:
              "로그인 응답에 토큰이 없습니다. 잠시 후 다시 시도해주세요.",
            type: "error",
          });
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        const backendMessage =
          err.response?.data?.message || err.response?.data;

        if (status === 403) {
          setSnackbar({
            open: true,
            message: backendMessage || "이메일 인증 완료 후 로그인 해주세요.",
            type: "error",
          });
        } else if (status === 401) {
          setSnackbar({
            open: true,
            message:
              backendMessage || "이메일 혹은 비밀번호가 일치하지 않습니다.",
            type: "error",
          });
        } else {
          // 기타 에러
          setSnackbar({
            open: true,
            message:
              backendMessage ||
              "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            type: "error",
          });
        }
      });
  };

  const isFormValid = !!user.email && !!user.password;

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-logo-area">
          <div className="signin-logo" onClick={() => navigate("/")}>
            TLAN
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            value={user.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            비밀번호
          </label>
          <div className="password-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-input password-input"
              value={user.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={handleTogglePassword}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {showPassword ? (
                // 눈 감은 아이콘
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9-3.5-11-8 0-1.16.26-2.27.74-3.28" />
                  <path d="M6.1 6.1A9.77 9.77 0 0 1 12 4c5 0 9 3.5 11 8a10.52 10.52 0 0 1-2.22 3.34" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                // 눈 뜬 아이콘
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={!isFormValid}
          className="signin-submit"
        >
          로그인
        </button>

        <p className="signin-helper">
          아직 회원이 아니세요?{" "}
          <Link to="/signup" className="signin-link">
            이메일회원가입
          </Link>
        </p>

        <div className="signin-divider">
          <span>or</span>
        </div>

        <p className="signin-sns-title">SNS 간편 로그인</p>

        <div className="signin-sns-row">
          <button
            className="sns-btn sns-google"
            type="button"
            onClick={() =>
            (window.location.href = `${import.meta.env.VITE_BASE_URL
              }/oauth2/authorization/google`)
            }
          >
            G
          </button>
          <button
            className="sns-btn sns-kakao"
            type="button"
            onClick={() =>
            (window.location.href = `${import.meta.env.VITE_BASE_URL
              }/oauth2/authorization/kakao`)
            }
          >
            K
          </button>
          <button
            className="sns-btn sns-naver"
            type="button"
            onClick={() =>
            (window.location.href = `${import.meta.env.VITE_BASE_URL
              }/oauth2/authorization/naver`)
            }
          >
          </button>
        </div>
      </div>

      {snackbar.open && (
        <div className={`toast toast-${snackbar.type}`}>{snackbar.message}</div>
      )}
    </div>
  );
}

export default SignIn;
