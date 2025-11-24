import { ChangeEvent, useState, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpType } from "../../util/types";
import axios from "axios";
import "../../css/signUp.css";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setSignUp({ email: "", password: "", passwordCheck: "", nickname: "" });
    setErrors({ email: "", password: "", passwordCheck: "", nickname: "" });
  };

  const [loading, setLoading] = useState(false); // 회원가입 진행중 표시

  const [signUp, setSignUp] = useState<SignUpType>({
    email: "",
    password: "",
    passwordCheck: "",
    nickname: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordCheck: "",
    nickname: "",
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

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    if (!snackbar.open) return;
    const timer = window.setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [snackbar.open]);

  // 이메일, 비밀번호 조건 설정
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-]).{8,}$/;

  // 비밀번호/비밀번호 입력칸 비교할 때 둘 중 하나가 바뀌면 바로 반영되게 함
  useEffect(() => {
    if (!signUp.password || !signUp.passwordCheck) {
      // 둘 중 하나라도 비어있으면 에러 제거
      setErrors((prev) => ({ ...prev, passwordCheck: "" }));
      return;
    } else if (signUp.password && signUp.passwordCheck) {
      // 둘 다 값이 있을 때만 비교
      const match = signUp.password === signUp.passwordCheck;
      setErrors((prev) => ({
        ...prev,
        passwordCheck: match ? "" : "비밀번호가 일치하지 않습니다.",
      }));
    }
  }, [signUp.password, signUp.passwordCheck]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSignUp({ ...signUp, [event.target.name]: event.target.value });

    // 입력할 때마다 검사
    if (event.target.name === "email") {
      if (!event.target.value) {
        setErrors({ ...errors, email: "" }); // 아무 입력 없으면 에러 제거
      } else if (!emailRegex.test(event.target.value)) {
        setErrors({ ...errors, email: "올바른 이메일 형식이 아닙니다." });
      } else {
        setErrors({ ...errors, email: "" });
      }
    }

    if (event.target.name === "password") {
      if (!event.target.value) {
        setErrors({ ...errors, password: "" });
      } else if (!passwordRegex.test(event.target.value)) {
        setErrors({
          ...errors,
          password:
            "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.",
        });
      } else {
        // 비밀번호 수정하려고 지웠을 때 밑에랑 안맞을 때 비교
        const match = signUp.passwordCheck === event.target.value;
        setErrors({
          ...errors,
          password: "",
          passwordCheck: match ? "" : "비밀번호가 일치하지 않습니다.",
        });
      }
    }

    // 입력한 비밀번호랑 맞지 않을 때
    if (event.target.name === "passwordCheck") {
      const match = event.target.value === signUp.password;
      setErrors({
        ...errors,
        passwordCheck: match ? "" : "비밀번호가 일치하지 않습니다.",
      });
    }

    if (event.target.name === "nickname") {
      if (!event.target.value) {
        setErrors({ ...errors, nickname: "" });
      } else if (
        event.target.value.length < 2 ||
        event.target.value.length > 10
      ) {
        setErrors({
          ...errors,
          nickname: "닉네임은 2~10자 사이여야 합니다.",
        });
      } else {
        setErrors({ ...errors, nickname: "" });
      }
    }
  };

  // 모든 조건이 올바른지 체크
  const isFormValid =
    emailRegex.test(signUp.email) &&
    passwordRegex.test(signUp.password) &&
    signUp.password === signUp.passwordCheck &&
    signUp.nickname.length >= 2 &&
    signUp.nickname.length <= 10 &&
    !errors.email &&
    !errors.password &&
    !errors.passwordCheck &&
    !errors.nickname;

  const handleSave = async () => {
    // 모든 조건 통과 확인 (유효성 검사)
    if (errors.email || errors.password || errors.nickname) return;
    if (!signUp.email || !signUp.password || !signUp.nickname) return;

    setLoading(true); // 로딩 시작

    try {
      // 구조분해로 백엔드에 데이터를 보낼 때 passwordCheck를 뺴서 보냄
      const { passwordCheck, ...userData } = signUp;

      await axios.post(`${import.meta.env.VITE_BASE_URL}/signup`, userData);
      handleClose();
      localStorage.setItem("signUpJustNow", "true");
      navigate("/");
    } catch (error) {
      console.error("회원가입 실패:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setSnackbar({
            open: true,
            message: "이미 가입되어 있는 이메일입니다.",
            type: "error",
          });
        } else {
          setSnackbar({
            open: true,
            message: "회원가입에 실패했습니다. 다시 시도해주세요.",
            type: "error",
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: "알 수 없는 오류가 발생했습니다.",
          type: "error",
        });
      }
    } finally {
      setLoading(false); // 무조건 로딩 끝
    }
  };

  return (
    <>
      <div className="signup-page">
        <div className="signup-card">
          <div className="signup-logo-area">
            <div className="signup-logo" onClick={() => navigate("/")}>
              TLAN
            </div>
          </div>

          {/* 이메일 */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              value={signUp.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`form-input password-input ${
                  errors.password ? "input-error" : ""
                }`}
                value={signUp.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-password-btn"
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
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="passwordCheck" className="form-label">
              비밀번호 확인
            </label>
            <div className="password-wrapper">
              <input
                id="passwordCheck"
                name="passwordCheck"
                type={showPassword ? "text" : "password"}
                className={`form-input password-input ${
                  errors.passwordCheck ? "input-error" : ""
                }`}
                value={signUp.passwordCheck}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-password-btn"
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
            {errors.passwordCheck && (
              <p className="error-text">{errors.passwordCheck}</p>
            )}
          </div>

          {/* 닉네임 */}
          <div className="form-group">
            <label htmlFor="nickname" className="form-label">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              className={`form-input ${errors.nickname ? "input-error" : ""}`}
              value={signUp.nickname}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={10}
            />
            {errors.nickname && <p className="error-text">{errors.nickname}</p>}
          </div>

          {/* 제출 버튼 */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid || loading}
            className="signup-submit"
          >
            {loading ? (
              <>
                <span className="spinner" /> 회원가입중...
              </>
            ) : (
              "회원가입"
            )}
          </button>

          <p className="signin-helper">
            이미 가입 되어있으신가요?{" "}
            <a href="/signin" className="signin-link">
              로그인하러가기
            </a>
          </p>
        </div>
        {snackbar.open && (
          <div className={`toast toast-${snackbar.type}`}>
            {snackbar.message}
          </div>
        )}
      </div>
    </>
  );
}

export default SignUp;
