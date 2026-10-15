# BrewLite — Frontend tĩnh (Task 3 + Task 9)

Frontend **HTML/CSS/JS thuần** (không build, không framework) bám theo `plan.md`:

| Task | Trang | Nội dung |
|---|---|---|
| **Task 3** | `index.html` (`/`) | Menu **15 món nước + 5 món ăn vặt**, tìm kiếm, lọc danh mục, thêm nhanh vào giỏ |
| **Task 9** | `orders.html` (`/orders`) | Lịch sử đơn hàng — badge trạng thái, bấm mở rộng xem món |

## Chạy dự án

```powershell
# Cách 1: mở trực tiếp bằng trình duyệt (double-click index.html)
# Cách 2 (khuyên dùng): serve bằng server tĩnh
npx serve .
# hoặc
npm start
```

Mở `http://localhost:3000` (hoặc port `npx serve` báo).

## Cấu trúc

```
procnpm/
├─ index.html            # Task 3 — trang Menu
├─ orders.html           # Task 9 — trang Lịch sử đơn
├─ tests.html            # Trang test trên trình duyệt
├─ css/styles.css        # CSS thuần (responsive 360px → desktop)
├─ js/
│  ├─ config.js          # ⚙️ USE_MOCK, API_URL, getToken()
│  ├─ format.js          # formatVND, formatDate, esc, ảnh fallback
│  ├─ filter.js          # filterProducts (thuần, test được)
│  ├─ status.js          # STATUS_META — nhãn/màu 7 trạng thái
│  ├─ api.js             # lớp API: mock ⇄ fetch thật + Mapper
│  ├─ mocks-products.js  # 20 sản phẩm mẫu (1 món stock=0)
│  ├─ mocks-orders.js    # 7 đơn mẫu (đủ 7 trạng thái)
│  ├─ cart.js            # store giỏ TỐI THIỂU (dùng chung Task 5)
│  ├─ menu.js            # controller trang Menu
│  ├─ orders.js          # controller trang Đơn
│  └─ tests.js           # logic test cho tests.html
├─ run-tests-node.js     # chạy test thuần bằng Node
└─ run-page-tests.js     # smoke-test 2 trang bằng jsdom (cần npm install)
```

## Chuyển sang backend thật

Sửa **1 file** `js/config.js`:

```js
BL.CONFIG = {
  USE_MOCK: false,                // ← tắt mock
  API_URL: 'http://localhost:3001',
  ...
};
```

- `GET /products` và `GET /orders/me` được gọi qua `js/api.js` (gắn `Authorization: Bearer <token>` từ `getToken()`).
- **Backend đổi tên field?** Chỉ sửa `mapProduct` / `mapOrder` / `toPrice` trong `js/api.js`.
- Token do Task 7 lưu vào `localStorage['brewlite_token']` — không cần sửa chỗ khác.

## Giả lập state (demo/test không cần đổi code)

| URL | Hiệu ứng |
|---|---|
| `index.html?mock=error` | Menu lỗi + nút **Thử lại** |
| `index.html?mock=empty` | Menu rỗng (EmptyState) |
| `orders.html?mock=unauth` | Chưa đăng nhập (401) |
| `orders.html?mock=error` | Lỗi tải đơn + **Thử lại** |
| `orders.html?mock=empty` | Chưa có đơn nào |
| `index.html?q=ca+pe&category=Trà` | state tìm kiếm/lọc lưu trên URL |

## Chạy test

```powershell
npm install          # 1 lần (cài jsdom cho test trang)
npm test             # test thuần logic  (run-tests-node.js) — 19 assert
npm run test:pages   # smoke-test jsdom  (run-page-tests.js)  — 28 assert
npm run test:all     # chạy cả hai
```

Hoặc mở `tests.html` trực tiếp trên trình duyệt để xem kết quả test T1–T14.

## Điểm nối với các Task khác (theo plan.md)

| Task | Chỗ đã chừa |
|---|---|
| Task 4 — Chi tiết sản phẩm | Thẻ món là `<a href="product.html?id=...">`; khi chưa có thì chặn điều hướng (bật bằng `window.BL_HAS_PRODUCT_DETAIL = true`) |
| Task 5 — Giỏ hàng | `js/cart.js` chỉ lộ `addItem/count/subscribe`; Header có slot `.cart-count` |
| Task 7 — Đăng nhập | `getToken()` trong `config.js`; 401 → trang nhắc đăng nhập, link `login.html` |
| Header/layout chung | Header dùng lại ở 2 trang, dễ thay thế |

## Trạng thái UI đã xử lý

- **Menu:** loading (skeleton) · error (Thử lại) · empty · no-results (Xóa bộ lọc) · success — món `stock=0` hiện "Hết hàng" + disable nút `+`.
- **Đơn hàng:** loading · error · chưa đăng nhập (401) · empty · success; đơn mới nhất lên đầu; mở/đóng bằng chuột **và bàn phím** (Enter/Space nhờ `<button>` + `aria-expanded`).
