import { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
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
        const jwtToken = response.headers.authorization;
        if (jwtToken) {
          sessionStorage.setItem("jwt", jwtToken);
          setLogin();
          handleClose();
        }
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
        <button onClick={handleLogin}> 로그인 하기</button> <br />
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
