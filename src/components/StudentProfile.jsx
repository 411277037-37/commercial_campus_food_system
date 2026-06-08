import { useState } from "react";

export default function StudentProfile({
  currentStudent,
  setCurrentStudent,
  onClose
}) {
  const [nickname, setNickname] = useState(
    currentStudent?.nickname || ""
  );

  const saveNickname = () => {
    if (!nickname.trim()) {
      alert("暱稱不可空白");
      return;
    }

    setCurrentStudent({
      ...currentStudent,
      nickname: nickname.trim()
    });

    alert("暱稱已更新！");
    onClose();
  };

  return (
    <div className="student-profile-page">
      <div className="student-profile-card">
        <button
          className="page-back-btn"
          onClick={onClose}
        >
          ←
        </button>

        <h2>我的資料</h2>

        <p>
          學號：
          {currentStudent?.studentId}
        </p>

        <label>
          顯示暱稱
        </label>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="請輸入暱稱"
        />

        <button
          className="submit-order-btn"
          onClick={saveNickname}
        >
          儲存暱稱
        </button>
      </div>
    </div>
  );
}