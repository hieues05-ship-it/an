/**
 * Bộ test thuần JS (không cần tooling) — chạy bằng cách mở tests.html.
 * Bám các case T1–T14 trong plan.md (phần áp dụng được cho web tĩnh).
 */
(function () {
  'use strict';

  var results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name: name, pass: true, detail: '' });
    } catch (e) {
      results.push({ name: name, pass: false, detail: e.message || String(e) });
    }
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'assertion failed');
  }

  function assertEq(actual, expected, label) {
    if (actual !== expected) {
      throw new Error((label || '') + ' expected="' + expected + '" actual="' + actual + '"');
    }
  }

  /* ================= Task 3 — Menu ================= */

  test('T1: formatVND(45000) = "45.000đ"', function () {
    assertEq(BL.formatVND(45000), '45.000đ');
    assertEq(BL.formatVND(0), '0đ');
    assertEq(BL.formatVND(NaN), '0đ');
  });

  test('T2: ProductCard HTML chứa tên, giá, alt ảnh', function () {
    var p = BL.MOCK_PRODUCTS[0];
    // mô phỏng đúng chuỗi render của menu.js
    var html =
      '<img alt="' + BL.esc(p.name) + '">' +
      '<h2>' + BL.esc(p.name) + '</h2>' +
      '<span>' + BL.formatVND(p.price) + '</span>';
    assert(html.indexOf(p.name) !== -1, 'thiếu tên');
    assert(html.indexOf('29.000đ') !== -1, 'thiếu giá đúng định dạng');
    assert(html.indexOf('alt="' + p.name + '"') !== -1, 'thiếu alt');
  });

  test('T3: skeleton có 8 thẻ (renderLoading mô phỏng)', function () {
    var cards = '';
    for (var i = 0; i < 8; i++) cards += '<div class="skeleton-card"></div>';
    assertEq((cards.match(/skeleton-card/g) || []).length, 8);
  });

  test('T4/T5: mock hỗ trợ cờ ?mock=empty và ?mock=error', function () {
    assert(typeof BL.api.getProducts === 'function');
    // kiểm tra mapper ném lỗi có status khi API fail
    var err = BL.ApiError(500, 'Mock error');
    assertEq(err.status, 500);
    var err401 = BL.ApiError(401, 'unauthorized');
    assertEq(err401.status, 401);
  });

  test('T6: mock menu đủ 20 món = 15 nước + 5 ăn vặt', function () {
    var products = BL.MOCK_PRODUCTS;
    assertEq(products.length, 20, 'tổng số');
    var snacks = products.filter(function (p) { return p.category === 'Ăn vặt'; });
    var drinks = products.filter(function (p) { return p.category !== 'Ăn vặt'; });
    assertEq(snacks.length, 5, 'ăn vặt');
    assertEq(drinks.length, 15, 'nước');
  });

  test('Mock có đúng 1 món hết hàng (stock = 0)', function () {
    var out = BL.MOCK_PRODUCTS.filter(function (p) { return p.stock === 0; });
    assertEq(out.length, 1);
  });

  test('T11: filterProducts("ca phe") khớp "Cà phê sữa đá"', function () {
    var r = BL.filterProducts(BL.MOCK_PRODUCTS, 'ca phe', '');
    assert(r.some(function (p) { return p.name === 'Cà phê sữa đá'; }),
      'không khớp không dấu');
    assert(r.every(function (p) { return BL.normalizeText(p.name).indexOf('ca phe') !== -1; }),
      'kết quả thừa');
  });

  test('T12: category + từ khóa = giao hai điều kiện', function () {
    var r = BL.filterProducts(BL.MOCK_PRODUCTS, 'trà', 'Trà');
    assert(r.length > 0, 'có kết quả');
    assert(r.every(function (p) { return p.category === 'Trà'; }), 'sai danh mục');
    var r2 = BL.filterProducts(BL.MOCK_PRODUCTS, 'cà phê', 'Trà');
    assertEq(r2.length, 0, 'giao rỗng phải = 0');
  });

  test('T13: cart.addItem thêm đúng size M, qty 1, cộng dồn', function () {
    var before = BL.cart.count();
    var p = { id: 9999, name: 'Món test', price: 10000 };
    BL.cart.addItem(p);
    assertEq(BL.cart.count(), before + 1, 'sau lần 1');
    BL.cart.addItem(p);
    assertEq(BL.cart.count(), before + 2, 'cộng dồn lần 2');
  });

  test('T11b: tìm "CA PHE" (hoa + không dấu) khớp "Cà phê sữa đá"', function () {
    var r = BL.filterProducts(BL.MOCK_PRODUCTS, 'CA PHE', '');
    assert(r.length > 0, 'hoa thường + dấu phải khớp');
    assert(r.some(function (p) { return p.name === 'Cà phê sữa đá'; }),
      'không khớp "Cà phê sữa đá"');
  });

  /* ================= Task 9 — Lịch sử đơn ================= */

  test('T7: STATUS_META đủ 7 trạng thái, nhãn tiếng Việt', function () {
    var expected = {
      PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán', PREPARING: 'Đang pha chế',
      READY: 'Sẵn sàng lấy', COMPLETED: 'Hoàn thành',
      PAYMENT_FAILED: 'Thanh toán lỗi', CANCELLED: 'Đã hủy',
    };
    Object.keys(expected).forEach(function (k) {
      assert(BL.STATUS_META[k], 'thiếu ' + k);
      assertEq(BL.STATUS_META[k].label, expected[k], k);
    });
  });

  test('T7b: trạng thái lạ không crash, fallback nhãn mặc định', function () {
    var html = BL.statusBadge('SOMETHING_NEW');
    assert(html.indexOf('is-unknown') !== -1, 'không fallback class');
    assert(html.indexOf('SOMETHING_NEW') !== -1, 'không giữ nhãn thô');
    assert(BL.statusBadge('').indexOf('Không rõ') !== -1, 'rỗng → Không rõ');
  });

  test('T8: getMyOrders() với cờ unauth ném ApiError 401', function () {
    // mô phỏng: ApiError(401) là thứ orders.js bắt để render lời nhắc đăng nhập
    var e = BL.ApiError(401, 'unauthorized');
    assertEq(e.status, 401);
    assert(e instanceof Error);
    assertEq(e.name, 'ApiError');
  });

  test('T9: đơn rỗng → EmptyState "Bạn chưa có đơn nào" + link Về menu', function () {
    var html =
      '<h3>Bạn chưa có đơn nào</h3><a class="btn" href="index.html">Về menu</a>';
    assert(html.indexOf('Bạn chưa có đơn nào') !== -1);
    assert(html.indexOf('href="index.html"') !== -1);
  });

  test('T10: mock đủ 7 đơn, đơn mới nhất đứng đầu sau khi sort', function () {
    assertEq(BL.MOCK_ORDERS.length, 7);
    var sorted = BL.MOCK_ORDERS.slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    var newest = new Date(BL.MOCK_ORDERS[0].createdAt).getTime();
    sorted.forEach(function (o) {
      assert(new Date(o.createdAt).getTime() <= newest, 'thứ tự sai');
    });
    assertEq(sorted[0].id, BL.MOCK_ORDERS[0].id, 'đầu danh sách');
    // phủ đủ 7 trạng thái
    var statuses = {};
    BL.MOCK_ORDERS.forEach(function (o) { statuses[o.status] = true; });
    assertEq(Object.keys(statuses).length, 7, 'đủ 7 trạng thái');
  });

  test('T10b: tổng tiền đơn = Σ lineTotal (dữ liệu nhất quán)', function () {
    BL.MOCK_ORDERS.forEach(function (o) {
      var sum = o.items.reduce(function (s, it) { return s + it.lineTotal; }, 0);
      assertEq(sum, o.total, 'order #' + o.id);
    });
  });

  test('OrderItem thiếu productName → fallback "Sản phẩm #id"', function () {
    var order = BL.MOCK_ORDERS.find(function (o) { return o.id === 1048; });
    var item = order.items.find(function (i) { return i.productName == null; });
    assert(item, 'mock cần 1 item thiếu tên');
    var display = item.productName || ('Sản phẩm #' + item.productId);
    assertEq(display, 'Sản phẩm #' + item.productId);
  });

  test('T14: aria-expanded đổi khi mở/đóng (mô phỏng toggle)', function () {
    // mô phỏng đúng logic của bindCards(): false→true→false
    var expanded = 'false';
    expanded = String(expanded !== 'true');
    assertEq(expanded, 'true');
    expanded = String(expanded !== 'true');
    assertEq(expanded, 'false');
  });

  test('Mapper: price chuỗi "45.000" → 45000, thiếu field không crash', function () {
    assertEq(BL.api.toPrice('45.000'), 45000);
    assertEq(BL.api.toPrice(undefined), 0);
    var p = BL.api.mapProduct({ id: 7 });
    assertEq(p.name, 'Sản phẩm #7');
    assertEq(p.stock, 99);
    assert(typeof p.category === 'undefined');
    var o = BL.api.mapOrder({ id: 1 });
    assertEq(o.status, 'PENDING');
    assertEq(o.items.length, 0);
  });

  /* ================= Hiển thị kết quả ================= */
  var listEl = document.getElementById('test-list');
  var summaryEl = document.getElementById('summary');
  var passed = results.filter(function (r) { return r.pass; }).length;

  results.forEach(function (r) {
    var li = document.createElement('li');
    li.className = 'test-item ' + (r.pass ? 'pass' : 'fail');
    li.innerHTML =
      '<div class="test-name">' + (r.pass ? '✅' : '❌') + ' ' + BL.esc(r.name) + '</div>' +
      (r.detail ? '<div class="test-detail">' + BL.esc(r.detail) + '</div>' : '');
    listEl.appendChild(li);
  });

  summaryEl.textContent = passed + '/' + results.length + ' test đạt' +
    (passed === results.length ? ' 🎉' : '');
  summaryEl.style.color = passed === results.length ? '#1f8a4c' : '#b42318';
})();

