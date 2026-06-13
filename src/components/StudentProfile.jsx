import { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function StudentProfile({
  currentStudent,
  setCurrentStudent,
  onClose
}) {
  const [nickname, setNickname] = useState(
    currentStudent?.nickname || ""
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const saveNickname = async () => {
    if (!currentStudent?.studentId) {
      alert("找不到學生資料");
      return;
    }

    if (!nickname.trim()) {
      alert("暱稱不可空白");
      return;
    }

    try {
      const studentRef = doc(db, "students", currentStudent.studentId);

      await setDoc(
        studentRef,
        {
          studentId: currentStudent.studentId,
          nickname: nickname.trim(),
          password: currentStudent.password || "0000",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setCurrentStudent({
        ...currentStudent,
        nickname: nickname.trim()
      });

      alert("暱稱已更新！");
    } catch (error) {
      console.error("更新暱稱失敗：", error);
      alert("暱稱更新失敗，請稍後再試");
    }
  };

  const changePassword = async () => {
    if (!currentStudent?.studentId) {
      alert("找不到學生資料");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("請完整輸入目前密碼、新密碼與確認密碼");
      return;
    }

    if (newPassword.length < 4) {
      alert("新密碼至少需要 4 個字元");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("新密碼與確認密碼不一致");
      return;
    }

    try {
      const studentRef = doc(db, "students", currentStudent.studentId);
      const studentSnap = await getDoc(studentRef);

      const studentData = studentSnap.exists()
        ? studentSnap.data()
        : currentStudent;

      const databasePassword = studentData.password || "0000";

      if (currentPassword !== databasePassword) {
        alert("目前密碼錯誤");
        return;
      }

      await setDoc(
        studentRef,
        {
          studentId: currentStudent.studentId,
          nickname: nickname.trim() || currentStudent.nickname,
          password: newPassword,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setCurrentStudent({
        ...currentStudent,
        nickname: nickname.trim() || currentStudent.nickname,
        password: newPassword
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      alert("密碼已更新！下次登入請使用新密碼");
    } catch (error) {
      console.error("修改密碼失敗：", error);
      alert("密碼修改失敗，請稍後再試");
    }
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

        <div className="profile-divider"></div>

        <h3>修改密碼</h3>

        <label>
          目前密碼
        </label>

        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="請輸入目前密碼"
        />

        <label>
          新密碼
        </label>

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="請輸入新密碼"
        />

        <label>
          確認新密碼
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="請再次輸入新密碼"
        />

        <button
          className="submit-order-btn"
          onClick={changePassword}
        >
          更新密碼
        </button>
      </div>
    </div>
  );
}