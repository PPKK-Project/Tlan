import { ChangeEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Snackbar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SignUpType } from "../../../types";
import axios from "axios";

function SignUp() {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSignUp({ email: "", password: "", nickname: "" });
    setErrors({ email: "", password: "", nickname: "" });
  };

  const [signUp, setSignUp] = useState<SignUpType>({
    email: "",
    password: "",
    nickname: "",
  });

  const [ errors, setErrors ] = useState({
    email:"",
    password: "",
    nickname: ""
  })

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|-]).{8,}$/;


  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSignUp({ ...signUp, [event.target.name]: event.target.value });

    // 👉 입력할 때마다 검사
    if (event.target.name === "email") {
      if (!event.target.value) {
        setErrors({ ...errors, email: "" }); // 아무 입력 없으면 에러 제거
      }
      else if (!emailRegex.test(event.target.value)) {
        setErrors({ ...errors, email: "올바른 이메일 형식이 아닙니다." });
      } else {
        setErrors({ ...errors, email: "" });
      }
    }

    if (event.target.name === "password") {
      if(!event.target.value) {
        setErrors({ ...errors, password: ""});
      }
      else if (!passwordRegex.test(event.target.value)) {
        setErrors({
          ...errors,
          password: "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.",
        });
      } else {
        setErrors({ ...errors, password: "" });
      }
    }

    if (event.target.name === "nickname") {
      if(!event.target.value) {
        setErrors({ ...errors, nickname: ""});
      }
      else if (event.target.value.length < 2 || event.target.value.length > 10) {
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
    signUp.nickname.length >= 2 &&
    signUp.nickname.length <= 10 &&
    !errors.email &&
    !errors.password &&
    !errors.nickname;


  const handleSave = async () => {
     // 🔹 모든 조건 통과 확인
    if (errors.email || errors.password || errors.nickname) return;
    if (!signUp.email || !signUp.password || !signUp.nickname) return;

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/signup`, signUp);
      setSnackbarOpen(true);
      handleClose();
    } catch (error) {
      console.error("회원가입 실패:", error);
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
            type="password"
            value={signUp.password}
            onChange={handleChange}
            label="비밀번호"
            fullWidth
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 2 }}
          />
          <TextField
            name="nickname"
            value={signUp.nickname}
            onChange={handleChange}
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
          border: isFormValid
            ? "1.8px solid #0072FF"
            : "1.8px solid #bfbfbf", // ✅ 얇은 테두리
          background: "transparent", // ✅ 배경 투명
          color: isFormValid ? "#0072FF" : "#bfbfbf",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: isFormValid ? "pointer" : "not-allowed",
          transition: "all 0.3s ease",
          display: "flex",
          justifyContent: "center", // ✅ 글자 중앙 정렬
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
        message="회원가입 되었습니다."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}

export default SignUp;
