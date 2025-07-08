// ✅ FILE: ManageCheckHang.js (React frontend component)
import React, { useState, useEffect } from 'react';
import './ManageCheckHang.css';
import axios from 'axios';
import logo from '../image/logo.png';
import { useNavigate } from 'react-router-dom';

const ManageCheckHang = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Tensp: '', NSX: '', HSD: '', Songayhethan: '', Songaysanxuat: '', Luuy: ''
  });

  const [selectedForm, setSelectedForm] = useState('form1');
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user?.id_nguoidung) {
      console.warn('🚫 Không có id_nguoidung. Chuyển về trang đăng nhập.');
      navigate('/');
      return;
    }
    console.clear();
    console.log('✅ Đã đăng nhập với ID người dùng:', user.id_nguoidung);
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '---';
    const date = new Date(isoString);
    date.setHours(date.getHours() + 5);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '---';
    const date = new Date(isoString);
    date.setHours(date.getHours() + 7);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    now.setHours(now.getHours() + 7); // điều chỉnh về múi giờ VN

    const { Tensp, NSX, HSD, Songayhethan, Songaysanxuat, Luuy } = formData;
    let daysToExpire = parseInt(Songayhethan) || 0;

    if (NSX && HSD) {
      const nsxDate = new Date(NSX);
      const hsdDate = new Date(HSD);
      if (!isNaN(nsxDate) && !isNaN(hsdDate)) {
        daysToExpire = Math.ceil((hsdDate - now) / (1000 * 60 * 60 * 24));
      }
    }

    const thoigiantaoString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const dataToSend = {
      Tensp,
      NSX: NSX || null,
      HSD: HSD || null,
      Songayhethan: daysToExpire || null,
      Songaysanxuat: parseInt(Songaysanxuat) || 0,
      Luuy,
      Thoigiantao: thoigiantaoString,
      id_nguoidung: user.id_nguoidung
    };

    console.log('📤 Gửi dữ liệu:', dataToSend);

    try {
      await axios.post('https://checkhang-production.up.railway.app/checkhang', dataToSend);
      setMessage('✅ Thêm thành công');
      await fetchData();
    } catch (err) {
      setMessage('❌ Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (thoigiantaoISO) => {
    try {
      await axios.delete(`https://checkhang-production.up.railway.app/checkhang/${encodeURIComponent(thoigiantaoISO)}`);
      await fetchData();
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`https://checkhang-production.up.railway.app/checkhang-user/${user.id_nguoidung}`);
      const enrichedData = res.data.map(item => {
        let nsxDate, hsdDate;
        if (item.NSX && !item.HSD && item.Songaysanxuat) {
          nsxDate = new Date(item.NSX);
          hsdDate = new Date(nsxDate);
          hsdDate.setDate(nsxDate.getDate() + parseInt(item.Songaysanxuat));
        } else if (!item.NSX && item.HSD && item.Songaysanxuat) {
          hsdDate = new Date(item.HSD);
          nsxDate = new Date(hsdDate);
          nsxDate.setDate(hsdDate.getDate() - parseInt(item.Songaysanxuat));
        } else if (item.NSX && item.HSD) {
          nsxDate = new Date(item.NSX);
          hsdDate = new Date(item.HSD);
        } else {
          return { ...item, _sortKey: 99999 };
        }

        const totalDays = Math.ceil((hsdDate - nsxDate) / (1000 * 60 * 60 * 24));
        const thresholdDate20 = new Date(hsdDate);
        thresholdDate20.setDate(hsdDate.getDate() - Math.ceil(totalDays * 0.2));
        const remaining20 = Math.round((thresholdDate20.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));

        return { ...item, _sortKey: remaining20 };
      });

      enrichedData.sort((a, b) => a._sortKey - b._sortKey);
      setData(enrichedData);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    }
  };

  const calculatePercentRemaining = (nsx, hsd, percent, songaySanXuat = 0) => {
    if (!hsd && !nsx) return '---';
    const now = new Date();
    let nsxDate, hsdDate;

    if (nsx && !hsd && songaySanXuat) {
      nsxDate = new Date(nsx);
      hsdDate = new Date(nsxDate);
      hsdDate.setDate(nsxDate.getDate() + parseInt(songaySanXuat));
    } else if (!nsx && hsd && songaySanXuat) {
      hsdDate = new Date(hsd);
      nsxDate = new Date(hsdDate);
      nsxDate.setDate(hsdDate.getDate() - parseInt(songaySanXuat));
    } else if (nsx && hsd) {
      nsxDate = new Date(nsx);
      hsdDate = new Date(hsd);
    } else {
      return '---';
    }

    if (isNaN(nsxDate) || isNaN(hsdDate)) return '---';

    const totalDays = Math.ceil((hsdDate - nsxDate) / (1000 * 60 * 60 * 24));
    const thresholdDate = new Date(hsdDate);
    thresholdDate.setDate(hsdDate.getDate() - Math.ceil(totalDays * percent));
    const remaining = Math.round((thresholdDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));

    return remaining >= 0
      ? `Còn ${remaining} ngày đến ${percent * 100}%`
      : `Đã quá ${Math.abs(remaining)} ngày khỏi ${percent * 100}%`;
  };

  return (
    <div className="container">
      <header className="header">
        <button className="logout-button" onClick={handleLogoutClick}>Đăng xuất</button>
        <img src={logo} alt="Co.op Food" className="logo" />
      </header>

      <h2>Thêm Sản Phẩm Kiểm Tra</h2>

      <div>
        <label>Chọn loại form:</label>
        <select onChange={(e) => setSelectedForm(e.target.value)} value={selectedForm}>
          <option value="form1">Form 1: Tên + NSX + HSD + Lưu ý</option>
          <option value="form2">Form 2: Tên + NSX + Số ngày SX + Lưu ý</option>
          <option value="form3">Form 3: Tên + HSD + Số ngày SX + Lưu ý</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input type="text" name="Tensp" placeholder="Tên SP" onChange={handleChange} required />
        {(selectedForm === 'form1' || selectedForm === 'form2') && (
          <input type="date" name="NSX" onChange={handleChange} />
        )}
        {(selectedForm === 'form1' || selectedForm === 'form3') && (
          <input type="date" name="HSD" onChange={handleChange} />
        )}
        {(selectedForm === 'form2' || selectedForm === 'form3') && (
          <input type="number" name="Songaysanxuat" placeholder="Số ngày sản xuất" onChange={handleChange} />
        )}
        <input type="text" name="Luuy" placeholder="Lưu ý" onChange={handleChange} />
        <button type="submit">Thêm</button>
      </form>
      <p>{message}</p>

      <h3>Danh sách sản phẩm đã thêm</h3>
      <table className="product-table">
        <thead>
          <tr>
            <th>Thời gian tạo</th>
            <th>Tên SP</th>
            <th>NSX</th>
            <th>HSD</th>
            <th>Còn 30%</th>
            <th>Còn 20%</th>
            <th>Số ngày SX</th>
            <th>Lưu ý</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{formatDateTime(item.Thoigiantao)}</td>
              <td>{item.Tensp}</td>
              <td>{item.NSX ? formatDate(item.NSX) : '---'}</td>
              <td>{item.HSD ? formatDate(item.HSD) : '---'}</td>
              <td>{calculatePercentRemaining(item.NSX, item.HSD, 0.3, item.Songaysanxuat)}</td>
              <td>{calculatePercentRemaining(item.NSX, item.HSD, 0.2, item.Songaysanxuat)}</td>
              <td>{item.Songaysanxuat ? item.Songaysanxuat + ' ngày' : 'Không có'}</td>
              <td>{item.Luuy}</td>
              <td><button onClick={() => handleDelete(item.Thoigiantao)}>Xóa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCheckHang;