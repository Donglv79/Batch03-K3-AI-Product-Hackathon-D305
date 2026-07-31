"use client";

import { useState } from "react";
import { UserAccount, USER_ACCOUNTS } from "@/lib/vlearnData";

type Props = {
  onLogin: (account: UserAccount) => void;
};

export default function LoginScreen({ onLogin }: Props) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const account = USER_ACCOUNTS.find(
      (item) =>
        item.loginId.toLowerCase() === loginId.trim().toLowerCase() &&
        item.password === password.trim()
    );
    if (!account) {
      setError("Sai mã đăng nhập hoặc mật khẩu.");
      return;
    }
    setError("");
    onLogin(account);
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">VLearn Quiz AI</div>
        <h1>Đăng nhập</h1>
        <p>Chọn đúng tài khoản cố định để vào vai trò tương ứng.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Mã đăng nhập
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="sv20230001 hoặc gv_comp2010"
              autoComplete="username"
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn btn-primary login-btn">
            Đăng nhập
          </button>
        </form>

        <div className="login-hints">
          <div>Sinh viên: `sv20230001` / `student123`</div>
          <div>Giảng viên: `gv_comp2010` / `teacher123`</div>
        </div>
      </div>
    </div>
  );
}
