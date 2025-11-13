import { useState, ChangeEvent, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Button,
  Divider,
  Box,
  type AlertColor,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";

type User = {
  email: string;
  password: string;
};

type SignInProps = {
  setLogin: () => void;
};

function SignIn({ setLogin }: SignInProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User>({
    email: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({
    open: false,
    message: "",
    type: "error",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
        // axios는 응답 헤더 키를 소문자로 노출
        const authHeader =
          response.headers["authorization"] ??
          response.headers["Authorization"];

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.slice(7); // "Bearer " 제거 → 순수 JWT만 저장
          localStorage.setItem("jwt", token);
          setLogin(); // Header의 handleLoginSuccess 호출 → 자동 로그아웃 타이머 예약
          handleClose(); // 모달 닫기
        } else {
          // Authorization 헤더가 없거나 형식이 다르면 에러 처리
          setSnackbar({
            open: true,
            message:
              "로그인 응답에 토큰이 없습니다. 잠시 후 다시 시도해주세요.",
            type: "error",
          });
        }

        // const jwtToken = response.headers.authorization;
        // if (jwtToken) {
        //   localStorage.setItem("jwt", jwtToken);
        //   setLogin();
        //   handleClose();
        // }
      })
      .catch((err) => {
        setOpen(true);
        console.log(err);
        setSnackbar({
          open: true,
          message: "이메일 혹은 비밀번호가 일치하지 않습니다.",
          type: "error",
        });
      });
  };

  return (
    <>
      <button className="header-login" onClick={handleOpen}>
        로그인
      </button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ textAlign: "center" }}>
          Login
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
            type="email"
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            label="이메일"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            label="비밀번호"
            fullWidth
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
        </DialogContent>
        {/* 메인 로그인 버튼 */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            mt: 0.5,
            mb: 1,
            py: 1.1,
            borderRadius: 999,
            fontWeight: 600,
            textTransform: "none",
            background:
              "linear-gradient(90deg, #00C9FF 0%, #009FE3 50%, #0072FF 100%)",
            "&:hover": {
              background:
                "linear-gradient(90deg, #00b0e6 0%, #008ed0 50%, #005fd6 100%)",
            },
          }}
        >
          로그인 하기
        </Button>

        {/* Divider (짧게) */}
        <Divider
          sx={{
            my: 1,
            mx: "auto",
            width: "80%",
            fontSize: "0.85rem",
          }}
        >
          소셜 계정으로 로그인하기
        </Divider>

        {/* 소셜 로그인 버튼 그룹 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 0.5,
            pb: 0.5,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            sx={{
              textTransform: "none",
              justifyContent: "flex-start",
              borderRadius: 999,
              fontWeight: 500,
              px: 1.5,
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "1px solid #dadce0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                mr: 1.5,
              }}
            >
              G
            </Box>
            Continue with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              textTransform: "none",
              justifyContent: "flex-start",
              borderRadius: 999,
              fontWeight: 500,
              px: 1.5,
              borderColor: "#03C75A",
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "4px",
                backgroundColor: "#03C75A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: "#fff",
                mr: 1.5,
              }}
            >
              N
            </Box>
            Continue with Naver
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              textTransform: "none",
              justifyContent: "flex-start",
              borderRadius: 999,
              fontWeight: 500,
              px: 1.5,
              borderColor: "#FEE500",
              backgroundColor: "#FFFBE6",
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#FEE500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#3C1E1E",
                mr: 1.5,
              }}
            >
              K
            </Box>
            Continue with Kakao
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.type}
          sx={{
            width: "auto",
            minWidth: "fit-content",
            borderRadius: "8px",
            px: 2,
            py: 1,
            fontSize: "0.95rem",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SignIn;
