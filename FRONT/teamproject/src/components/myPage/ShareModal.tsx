import React, { useState } from "react";
import "../../css/ShareModal.css"; // 모달 스타일을 위한 CSS 파일

type ShareModalProps = {
  onClose: () => void;
  onShare: (email: string, role: string) => void;
  planTitle: string;
};

const ShareModal: React.FC<ShareModalProps> = ({
  onClose,
  onShare,
  planTitle,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ROLE_VIEWER");

  const handleShareClick = () => {
    const trimmedEmail = email.trim(); // 입력된 이메일의 앞뒤 공백 제거

    // 간단한 이메일 형식 유효성 검사
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      alert("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    onShare(trimmedEmail, role);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>'{planTitle}' 플랜 공유하기</h2>
        <p>공유할 사용자의 이메일과 권한을 선택해주세요.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="modal-input"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="modal-input"
        >
          {/* API 명세에 맞는 실제 role 값을 사용하세요 */}
          <option value="ROLE_VIEWER">보기 권한</option>
          <option value="ROLE_EDITOR">수정 권한</option>
        </select>
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">
            취소
          </button>
          <button onClick={handleShareClick} className="share-button">
            공유
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
