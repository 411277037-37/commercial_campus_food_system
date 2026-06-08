import { useState } from "react";

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

  const handleStudentLogin = () => {
    const found = studentAccounts.find(
      (account) =>
        account.studentId === studentId &&
        account.password === studentPassword
    );

    if (!found) {
      alert("學生帳號或密碼錯誤");
      return;
    }

    setCurrentStudent({
      ...found,
      nickname: `學生${found.studentId.slice(-2)}號`
    });

    setPage("student");
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