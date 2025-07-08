// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import ManageCheckHang from './components/ManageCheckHang';

function App() {
  const [user, setUser] = useState(null);

  // Khi load lại trang → lấy user từ localStorage nếu có
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log('🔁 Khôi phục user từ localStorage:', JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginWrapper setUser={setUser} />} />
        <Route path="/manage" element={<ManageCheckHang user={user} onLogout={() => {
          localStorage.removeItem('user');
          setUser(null);
        }} />} />
      </Routes>
    </Router>
  );
}

// Component trung gian để xử lý đăng nhập và chuyển hướng
const LoginWrapper = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData)); // Lưu vĩnh viễn
    setUser(userData); // Lưu tạm trong state
    navigate('/manage');
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
};

export default App;
