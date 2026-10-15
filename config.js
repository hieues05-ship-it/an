/**
 * BrewLite — cấu hình chung.
 * Backend sẵn sàng? Đặt USE_MOCK = false và sửa API_URL.
 */
window.BL = window.BL || {};

BL.CONFIG = {
  USE_MOCK: true,
  API_URL: 'http://localhost:3001',
  MOCK_DELAY: 600, // ms — để thấy loading state
};

/**
 * Nơi đọc token đăng nhập (Task 7 sẽ lưu token vào đây).
 * Trả về null nếu chưa đăng nhập.
 */
BL.getToken = function () {
  try {
    return localStorage.getItem('brewlite_token');
  } catch (e) {
    return null;
  }
};
