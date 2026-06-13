import { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const studentAccounts = Array.from(
  { length: 45 },
  (_, index) => {
    const number = String(index + 1).padStart(3, "0");

    return {
      studentId: `411277${number}`,
      password: "0000",
    };
  }
);

export default function LoginPage({
  setPage,
  setVendorLogin,
  setCurrentStudent
}) {
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const handleStudentLogin = async () => {
    const trimmedStudentId = studentId.trim();
    const trimmedPassword = studentPassword.trim();

    const defaultAccount = studentAccounts.find(
      (account) => account.studentId === trimmedStudentId
    );

    if (!defaultAccount) {
      alert("學生帳號或密碼錯誤");
      return;
    }

    try {
      const studentRef = doc(db, "students", trimmedStudentId);
      const studentSnap = await getDoc(studentRef);

      let studentData;

      if (studentSnap.exists()) {
        studentData = studentSnap.data();
      } else {
        if (trimmedPassword !== defaultAccount.password) {
          alert("學生帳號或密碼錯誤");
          return;
        }

        studentData = {
          studentId: trimmedStudentId,
          password: "0000",
          nickname: `學生${trimmedStudentId.slice(-2)}號`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(studentRef, studentData);
      }

      if (studentData.password !== trimmedPassword) {
        alert("學生帳號或密碼錯誤");
        return;
      }

      setCurrentStudent({
        studentId: studentData.studentId,
        password: studentData.password,
        nickname:
          studentData.nickname || `學生${studentData.studentId.slice(-2)}號`,
      });

      setPage("student");
    } catch (error) {
      console.error("學生登入失敗：", error);
      alert("登入失敗，請稍後再試");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>學餐點餐系統</h1>
        <p>請輸入學生帳號，或進入店家後台</p>

        <input
          className="login-input"
          placeholder="學生帳號，例如 411277037"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="密碼，預設 0000"
          value={studentPassword}
          onChange={(e) => setStudentPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleStudentLogin();
            }
          }}
        />

        <button
          className="student-btn"
          onClick={handleStudentLogin}
        >
          學生登入
        </button>

        <button
          className="vendor-btn"
          onClick={() => {
            setPage("vendor");
            setVendorLogin(false);
          }}
        >
          店家登入
        </button>
      </div>
    </div>
  );
}