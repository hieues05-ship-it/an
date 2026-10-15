/**
 * Lớp API — CHỖ DUY NHẤT biết backend.
 * - USE_MOCK = true  : đọc dữ liệu từ mocks (kèm delay để thấy loading).
 * - USE_MOCK = false : fetch API thật, gắn Authorization, ném ApiError{status}.
 *
 * Cờ giả lập state: ?mock=error | ?mock=empty | ?mock=unauth
 * (phục vụ demo/test các state không cần đổi code).
 */
window.BL = window.BL || {};

BL.ApiError = function ApiError(status, message) {
  var err = new Error(message || 'API error');
  err.name = 'ApiError';
  err.status = status;
  return err;
};

BL.api = (function () {
  var cfg = BL.CONFIG;

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  /** Đọc cờ ?mock= trên URL. */
  function mockFlag() {
    try {
      return new URLSearchParams(window.location.search).get('mock');
    } catch (e) {
      return null;
    }
  }

  /** fetch wrapper: gắn token, JSON, ném ApiError khi !ok. */
  async function request(path, options) {
    var headers = Object.assign({ 'Content-Type': 'application/json' }, (options || {}).headers);
    var token = BL.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var res;
    try {
      res = await fetch(cfg.API_URL + path, Object.assign({}, options, { headers: headers }));
    } catch (e) {
      throw BL.ApiError(0, 'Không thể kết nối máy chủ');
    }
    if (res.status === 401) throw BL.ApiError(401, 'unauthorized');
    if (!res.ok) throw BL.ApiError(res.status, 'API error ' + res.status);
    var data = await res.json();
    // API có thể trả { data: [...] } (phân trang) — bóc ra cho đồng nhất.
    if (data && !Array.isArray(data) && Array.isArray(data.data)) return data.data;
    return data;
  }

  /** ===== GET /products ===== */
  async function getProducts() {
    if (cfg.USE_MOCK) {
      await delay(cfg.MOCK_DELAY);
      var flag = mockFlag();
      if (flag === 'error') throw BL.ApiError(500, 'Mock error');
      if (flag === 'empty') return [];
      return BL.MOCK_PRODUCTS.map(mapProduct);
    }
    var raw = await request('/products');
    return (Array.isArray(raw) ? raw : []).map(mapProduct);
  }

  /** ===== GET /orders/me ===== */
  async function getMyOrders() {
    if (cfg.USE_MOCK) {
      await delay(cfg.MOCK_DELAY);
      var flag = mockFlag();
      if (flag === 'unauth') throw BL.ApiError(401, 'unauthorized');
      if (flag === 'error') throw BL.ApiError(500, 'Mock error');
      if (flag === 'empty') return [];
      return BL.MOCK_ORDERS.map(mapOrder);
    }
    if (!BL.getToken()) throw BL.ApiError(401, 'unauthorized'); // chưa đăng nhập → không gọi vô ích
    var raw = await request('/orders/me');
    return (Array.isArray(raw) ? raw : []).map(mapOrder);
  }

  /**
   * ===== Mapper: backend → type của UI =====
   * Backend đổi tên field / thiếu field? Chỉ sửa 2 hàm này.
   */
  function toPrice(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (typeof v === 'string') {
      // "45.000" hoặc "45000" → 45000; "45.5" không phải VND → làm tròn.
      var cleaned = v.replace(/\./g, '').replace(/[^0-9-]/g, '');
      var n = parseInt(cleaned, 10);
      return isFinite(n) ? n : 0;
    }
    return 0;
  }

  function mapProduct(raw) {
    raw = raw || {};
    return {
      id: raw.id,
      name: raw.name || 'Sản phẩm #' + raw.id,
      price: toPrice(raw.price),
      imageUrl: raw.imageUrl || raw.image || null,
      stock: typeof raw.stock === 'number' ? raw.stock : 99,
      category: raw.category || undefined, // backend chưa có → undefined → ẩn bộ lọc
      emoji: raw.emoji || undefined,
    };
  }

  function mapOrder(raw) {
    raw = raw || {};
    var items = Array.isArray(raw.items) ? raw.items : [];
    return {
      id: raw.id,
      userId: raw.userId,
      status: raw.status || 'PENDING',
      total: toPrice(raw.total),
      createdAt: raw.createdAt || raw.created_at || '',
      items: items.map(function (it) {
        it = it || {};
        return {
          id: it.id,
          orderId: it.orderId != null ? it.orderId : raw.id,
          productId: it.productId,
          productName: it.productName || null, // null → UI fallback "Sản phẩm #id"
          size: it.size || 'M',
          qty: Number(it.qty) || 1,
          lineTotal: toPrice(it.lineTotal),
        };
      }),
    };
  }

  return {
    getProducts: getProducts,
    getMyOrders: getMyOrders,
    mapProduct: mapProduct,
    mapOrder: mapOrder,
    toPrice: toPrice,
  };
})();
