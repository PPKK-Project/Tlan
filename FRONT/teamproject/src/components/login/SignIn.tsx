import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios, { AxiosRequestConfig } from "axios";

type User = {
  email: string;
  password: string;
}

function SignIn() {
  const [ isAuthenticated, setAuth ] = useState(false);
  const [open, setOpen] = useState(false);
  const [ user, setUser ] = useState<User>({
    email: '',
    password: ''
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUser({...user, [event.target.name]: event.target.value});
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getAxiosConfig = (): AxiosRequestConfig => {
    const token = sessionStorage.getItem("jwt")?.replace("Bearer ", "");

    return {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    };
  };

  const handleLogin = () => {
    axios.post(`${import.meta.env.VITE_BASE_URL}/login`, user, {
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      const jwtToken = response.headers.authorization;
      if(jwtToken !== null) {
        sessionStorage.setItem("jwt", jwtToken);
        setAuth(true);
      }
    })
    .catch(err => {
      setOpen(true);
      console.log(err);
    })
  }

  if(isAuthenticated) {
    return(<>로그인 성공</>)
  } else {
    return (
    <>
      <button className="header-login" onClick={handleOpen}>
        로그인
      </button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ textAlign: "center" }}>Login
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
          <TextField name="email" onChange={handleChange}variant="outlined" margin="normal" label="이메일" fullWidth sx={{ mb: 2 }} />
          <TextField name="password" onChange={handleChange}type="password" label="비밀번호" fullWidth />
        </DialogContent>
        <button onClick={handleLogin}> 로그인 하기</button> <br />
      </Dialog>
    </>
  );
  }

}

export default SignIn;
