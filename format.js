/**
 * Hàm thuần — định dạng & tiện ích chuỗi (không phụ thuộc DOM trang).
 */
window.BL = window.BL || {};

/** 45000 → "45.000đ" */
BL.formatVND = function (n) {
  var num = Number(n);
  if (!Number.isFinite(num)) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
};

/** ISO → "14/10/2026 · 09:15" */
BL.formatDate = function (iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  var p = function (x) { return String(x).padStart(2, '0'); };
  return (
    p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() +
    ' · ' + p(d.getHours()) + ':' + p(d.getMinutes())
  );
};

/** Escape chuỗi trước khi nhúng vào HTML (an toàn với dữ liệu từ API). */
BL.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

/**
 * Ảnh sản phẩm: dùng imageUrl nếu backend có, ngược lại sinh SVG data-URI
 * theo danh mục (dự án chạy được cả khi offline, không cần domain ảnh ngoài).
 */
var BL_IMAGE_COLORS = {
  'Cà phê': ['#6f4e37', '#a5764f'],
  'Trà': ['#4f6f3d', '#93b46e'],
  'Đá xay': ['#6d4fb0', '#b39ddb'],
  'Nước ép': ['#d96f4c', '#f2cc8f'],
  'Ăn vặt': ['#c26a06', '#fbbf24'],
};

BL.productImage = function (p) {
  if (p && p.imageUrl) return p.imageUrl;
  var colors = BL_IMAGE_COLORS[(p && p.category) || ''] || ['#6b7280', '#9ca3af'];
  var emoji = (p && p.emoji) || '☕';
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + colors[0] + '"/>' +
    '<stop offset="1" stop-color="' + colors[1] + '"/>' +
    '</linearGradient></defs>' +
    '<rect width="400" height="300" fill="url(#g)"/>' +
    '<text x="200" y="172" font-size="110" text-anchor="middle">' + emoji + '</text>' +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

/** Placeholder khi ảnh lỗi (onerror của thẻ sản phẩm). */
BL.fallbackImage = function () {
  return BL.productImage({ category: '', emoji: '🥤' });
};
