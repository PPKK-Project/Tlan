import { ChangeEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SignUpType } from "../../../types";
import axios from "axios";

function SignUp() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSignUp({ email: "", password: "", nickname: "" });
  };

  const [signUp, setSignUp] = useState<SignUpType>({
    email: "",
    password: "",
    nickname: "",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSignUp({ ...signUp, [event.target.name]: event.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/signup`, signUp);
      alert("회원가입 완료!");
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
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            type="password"
            value={signUp.password}
            onChange={handleChange}
            label="비밀번호"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            name="nickname"
            value={signUp.nickname}
            onChange={handleChange}
            label="닉네임"
            fullWidth
          />
        </DialogContent>
        <button onClick={handleSave}> 회원가입 하기</button> <br />
        <br />
      </Dialog>
    </>
  );
}

export default SignUp;
