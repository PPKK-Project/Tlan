import { ChangeEvent, useState, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { SignUpType } from "../../../types";
import axios from "axios";
import "./signUp.css";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); //  에러 메시지 상태
  const navigate = useNavigate();

  const handleClose = () => {
    setSignUp({ email: "", password: "", passwordCheck: "", nickname: "" });
    setErrors({ email: "", password: "", passwordCheck: "", nickname: "" });
  };

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

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  };

  // 이메일, 비밀번호 조건 설정
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|-]).{8,}$/;

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

    try {
      // 구조분해로 백엔드에 데이터를 보낼 때 passwordCheck를 뺴서 보냄
      const { passwordCheck, ...userData } = signUp;

      await axios.post(`${import.meta.env.VITE_BASE_URL}/signup`, userData);
      handleClose();
      navigate("/");
    } catch (error) {
      console.error("회원가입 실패:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setErrorMessage("이미 가입되어 있는 이메일입니다.");
          setErrorSnackbarOpen(true);
        } else {
          setErrorMessage("회원가입에 실패했습니다. 다시 시도해주세요.");
          setErrorSnackbarOpen(true);
        }
      }
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
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
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
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
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
            disabled={!isFormValid}
            className="signup-submit"
          >
            회원가입
          </button>

          <p className="signin-helper">
            이미 가입 되어있으신가요?{" "}
            <a href="/signin" className="signin-link">
              로그인하러가기
            </a>
          </p>
        </div>
        {/* 에러 메시지 */}
        {errorSnackbarOpen && (
          <div className="toast toast-error">{errorMessage}</div>
        )}
      </div>
    </>
  );
}

export default SignUp;
