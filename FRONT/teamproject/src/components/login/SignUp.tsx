import { ChangeEvent, useState, useEffect, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { SignUpType } from "../../../types";
import axios from "axios";

function SignUp() {
  const [open, setOpen] = useState(false); // 모달창 열림 상태
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 보여주는 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false); // 성공 시 띄워주는 Snackbar 상태
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false); // 에러용 Snackbar 상태
  const [errorMessage, setErrorMessage] = useState(""); //  에러 메시지 상태

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
      setSnackbarOpen(true);
      handleClose();
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
      <button className="header-signin transparent-signin" onClick={handleOpen}>
        회원가입
      </button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ textAlign: "center" }}>
          회원 가입
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            name="email"
            value={signUp.email}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            label="이메일"
            fullWidth
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            value={signUp.password}
            onChange={handleChange}
            label="비밀번호"
            fullWidth
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="passwordCheck"
            type={showPassword ? "text" : "password"}
            value={signUp.passwordCheck}
            onChange={handleChange}
            label="비밀번호 확인"
            fullWidth
            error={!!errors.passwordCheck}
            helperText={errors.passwordCheck}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="nickname"
            value={signUp.nickname}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            label="닉네임"
            fullWidth
            error={!!errors.nickname}
            helperText={errors.nickname}
            inputProps={{ maxLength: 10 }}
          />
        </DialogContent>
        <button
          onClick={handleSave}
          disabled={!isFormValid}
          style={{
            marginTop: "20px",
            marginBottom: "12px",
            padding: "10px 30px",
            borderRadius: "30px",
            border: isFormValid ? "1.8px solid #0072FF" : "1.8px solid #bfbfbf", // 얇은 테두리
            background: "transparent", // 배경 투명
            color: isFormValid ? "#0072FF" : "#bfbfbf",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: isFormValid ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            display: "flex",
            justifyContent: "center", // 글자 중앙 정렬
            alignItems: "center",
            alignSelf: "center",
          }}
          onMouseOver={(e) => {
            if (isFormValid) {
              e.currentTarget.style.background = "#0072FF";
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseOut={(e) => {
            if (isFormValid) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#0072FF";
            }
          }}
        >
          회원가입 하기
        </button>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{
            width: "auto",
            minWidth: "fit-content",
            borderRadius: "8px",
            px: 2,
            py: 1,
            fontSize: "0.95rem",
          }}
        >
          회원가입에 성공하셨습니다.! 🎉
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setErrorSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          sx={{
            width: "auto",
            minWidth: "fit-content",
            borderRadius: "8px",
            px: 2,
            py: 1,
            fontSize: "0.95rem",
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SignUp;
