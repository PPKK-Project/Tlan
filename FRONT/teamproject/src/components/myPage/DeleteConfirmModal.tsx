import React from "react";
import "../../css/ShareModal.css"; // 기존 모달 스타일 재사용

type DeleteConfirmModalProps = {
  planTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  planTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>플랜 삭제 확인</h2>
        <p className="modal-description">
          '{planTitle}' 플랜을 정말 삭제하시겠습니까?
          <br />
          삭제된 플랜은 복구할 수 없습니다.
        </p>
        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-button">
            취소
          </button>
          <button onClick={onConfirm} className="delete-button">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
