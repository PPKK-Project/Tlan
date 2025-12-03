import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "../../css/ShareModal.css";

type ProfileEditModalProps = {
  onClose: () => void;
};

// 사용자 정보를 가져오는 함수
const fetchUserInfo = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/users/nickname`
  );
  return response.data;
};

// 프로필 정보(닉네임, 비밀번호)를 업데이트하는 통합 함수
const updateProfile = async (data: {nickname:string, password:string, newpassword?:string}) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_BASE_URL}/users`, // 백엔드 DTO에 맞는 엔드포인트
    data
  );
  return response.data;
};

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"nickname" | "password">(
    "nickname"
  );
  const [nickname, setNickname] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState(""); // 현재 비밀번호 (인증용)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    password: "",
    newPassword: "",
    nickname: "",
  });
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-]).{8,}$/;

  // 현재 사용자 정보를 불러오는 쿼리
  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
  });

  // 사용자 정보가 로드되면 닉네임 상태 업데이트
  useEffect(() => {
    if (userInfo) {
      setNickname(userInfo.nickname || "");
    }
  }, [userInfo]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      alert("프로필 정보가 성공적으로 변경되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      onClose();
    },
    onError: (error: AxiosError<{message?: string}>) => {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "알 수 없는 오류가 발생했습니다.";
      alert(
        `프로필 업데이트에 실패했습니다: ${msg}`
      );
    },
  });

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    mutation.mutate({
      nickname: nickname,
      password: password, // 현재 비밀번호 (인증용)
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ ...errors, newPassword: "" }); // 에러 초기화

    if (newPassword && !passwordRegex.test(newPassword)) {
      setErrors({
        ...errors,
        newPassword:
          "비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.",
      });
      return;
    }
    if (!password) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (!newPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    mutation.mutate({
      nickname: nickname, // 닉네임은 그대로 유지
      password: password, // 현재 비밀번호 (인증용)
      newpassword: newPassword, // 새 비밀번호
    });
  };

  if (isLoading) {
    return <div>Loading...</div>; // 간단한 로딩 처리
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>개인정보 수정</h2>
        <div className="modal-tab-container">
          <button
            className={`modal-tab ${activeTab === "nickname" ? "active" : ""}`}
            onClick={() => setActiveTab("nickname")}
          >
            닉네임 변경
          </button>
          <button
            className={`modal-tab ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            비밀번호 변경
          </button>
        </div>

        {activeTab === "nickname" && (
          <form onSubmit={handleNicknameSubmit}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="새 닉네임"
              className="modal-input"
              required
              maxLength={10}
            />
            <div className="password-input-wrapper">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호 (필수)"
                className="modal-input"
                required
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? "숨김" : "보기"}
              </button>
            </div>
            <p
              style={{
                color: "gray",
                fontSize: "10px",
                marginTop: "5px",
                textAlign: "left",
              }}
            >
              구글, 카카오, 네이버 유저들은 현재 비밀번호를 무엇이든 입력하셔도 무관합니다.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                취소
              </button>
              <button type="submit" className="share-button">
                변경하기
              </button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) {
                  setErrors({ ...errors, newPassword: "" });
                }
              }}
              placeholder="새 비밀번호"
              className="modal-input"
            />
            {errors.newPassword && (
              <p
                style={{
                  color: "red",
                  fontSize: "12px",
                  marginTop: "-10px",
                  marginBottom: "10px",
                }}
              >
                {errors.newPassword}
              </p>
            )}
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="modal-input"
              disabled={!newPassword}
            />
            <div className="password-input-wrapper">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호 (필수)"
                className="modal-input"
                required
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? "숨김" : "보기"}
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                취소
              </button>
              <button type="submit" className="share-button">
                변경하기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditModal;
