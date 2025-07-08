// MultipleFiles/Login.js
import React, { useState } from 'react';
import './Login.css'; // Đảm bảo import file CSS mới
import logo from '../image/logo.png'; // Import hình ảnh logo

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Thêm trạng thái cho thông báo lỗi

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await fetch('https://checkhang-production.up.railway.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user)); // ✅ Lưu user vào localStorage
        onLoginSuccess(data.user); // ✅ Gọi callback để App.js điều hướng sang /manage
      } else {
        setErrorMessage(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      console.error('Lỗi kết nối server:', err);
      setErrorMessage('Không kết nối được tới máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Co.op Food" className="login-logo" /> {/* Thêm logo */}
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Tên Đăng Nhập:</label> {/* Thêm htmlFor cho accessibility */}
          <input
            type="text"
            id="username" // Thêm id
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username" // Gợi ý tự động điền
          />
        </div>
        <div>
          <label htmlFor="password">Mật Khẩu:</label> {/* Thêm htmlFor cho accessibility */}
          <input
            type="password"
            id="password" // Thêm id
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password" // Gợi ý tự động điền
          />
        </div>
          <button type="submit">Đăng Nhập</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Hiển thị lỗi nếu có */}
      </form>
    </div>
  );
};

export default Login;
