/**
 * Smoke-test 2 trang thật bằng jsdom + HTTP server nội bộ:
 *   node run-page-tests.js
 * - index.html : 20 thẻ, tìm kiếm "ca phe", chip danh mục, thêm nhanh
 * - orders.html: 7 đơn, mở/đóng panel, 401/empty state
 * Kết quả in ra console và ghi ra page-test-results.txt (UTF-8).
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { JSDOM } = require('jsdom');

/* ---------- ghi log ra cả console lẫn file ---------- */
let out = '';
function log(line) {
  out += line + '\n';
  console.log(line);
}

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; log('[PASS] ' + name); }
  else { fail++; log('[FAIL] ' + name); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- HTTP server tĩnh ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; res.end('not found'); return; }
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});

/** Tải trang qua server thật; chờ tới khi predicate thỏa hoặc hết timeout. */
function loadPage(port, file, query, predicate) {
  const url = 'http://127.0.0.1:' + port + '/' + file + (query || '');
  return JSDOM.fromURL(url, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  }).then((dom) => waitFor(dom, predicate, 5000));
}

async function waitFor(dom, predicate, timeout) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (!predicate || predicate(dom.window.document)) return dom;
    } catch (e) { /* DOM chưa sẵn sàng — đợi vòng sau */ }
    await sleep(100);
  }
  return dom; // hết giờ vẫn trả về để test tự báo fail
}

(async function () {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  /* ============ TRANG MENU ============ */
  log('--- index.html ---');
  const menu = await loadPage(port, 'index.html', '',
    (d) => d.querySelectorAll('.product-card').length === 20);
  const md = menu.window.document;

  check('render đủ 20 thẻ sản phẩm', md.querySelectorAll('.product-card').length === 20);
  check('thẻ có ảnh alt', Array.from(md.querySelectorAll('.product-card')).every((c) => {
    const img = c.querySelector('img');
    return img && img.getAttribute('alt');
  }));
  check('giá format "29.000đ"', md.body.innerHTML.indexOf('29.000đ') !== -1);
  check('1 món "Hết hàng"', md.querySelectorAll('.stock-badge').length === 1);
  check('nút thêm nhanh có mặt', md.querySelectorAll('.btn-add').length === 20);
  check('món hết hàng bị disable', !!md.querySelector('.product-card.out-of-stock .btn-add[disabled]'));
  check('chip danh mục render (5 danh mục + Tất cả)',
    md.querySelectorAll('#category-filter .chip').length === 6);

  // Tìm kiếm "ca phe" (debounce 300ms)
  const input = md.getElementById('search-input');
  input.value = 'ca phe';
  input.dispatchEvent(new menu.window.Event('input', { bubbles: true }));
  await sleep(700);
  const found = md.querySelectorAll('.product-card');
  check('tìm "ca phe" còn kết quả và có "Cà phê sữa đá"',
    found.length > 0 &&
    Array.from(found).some((c) => c.textContent.indexOf('Cà phê sữa đá') !== -1));
  check('URL giữ ?q=', menu.window.location.search.indexOf('q=ca+phe') !== -1);

  // Không có kết quả → no-results
  input.value = 'zzzzz';
  input.dispatchEvent(new menu.window.Event('input', { bubbles: true }));
  await sleep(700);
  check('no-results state hiện "Không tìm thấy món phù hợp"',
    md.body.innerHTML.indexOf('Không tìm thấy món phù hợp') !== -1);
  check('có nút "Xóa bộ lọc"', !!md.getElementById('clear-filters-btn'));

  md.getElementById('clear-filters-btn').click();
  await sleep(150);
  check('xóa bộ lọc → trở lại lưới 20 thẻ', md.querySelectorAll('.product-card').length === 20);

  // Chip danh mục
  const traChip = Array.from(md.querySelectorAll('#category-filter .chip'))
    .find((c) => c.getAttribute('data-category') === 'Trà');
  traChip.click();
  await sleep(150);
  check('lọc "Trà" còn 4 món', md.querySelectorAll('.product-card').length === 4);

  // Thêm nhanh
  Array.from(md.querySelectorAll('#category-filter .chip'))[0].click();
  await sleep(150);
  const badge = md.querySelector('.cart-count');
  const addBtn = md.querySelector('.product-card:not(.out-of-stock) .btn-add');
  addBtn.click();
  await sleep(80);
  check('badge giỏ hàng hiện sau khi thêm', badge && !badge.hidden);
  check('phản hồi "✓" trên nút', addBtn.textContent === '✓');

  /* ============ TRANG ĐƠN ============ */
  log('--- orders.html ---');
  const ordersPage = await loadPage(port, 'orders.html', '',
    (d) => d.querySelectorAll('.order-card').length === 7);
  const od = ordersPage.window.document;

  const orderCards = od.querySelectorAll('.order-card');
  check('render đủ 7 đơn', orderCards.length === 7);
  check('đủ badge trạng thái (≥6 màu khác nhau)',
    new Set(Array.from(orderCards).map((c) => c.querySelector('.badge').className)).size >= 6);
  check('đơn mới nhất #1051 đứng đầu',
    orderCards[0] && orderCards[0].querySelector('.order-id').textContent.trim() === '#1051');
  check('mỗi đơn có aria-expanded=false',
    Array.from(od.querySelectorAll('.order-head')).every((h) => h.getAttribute('aria-expanded') === 'false'));

  // Mở panel đơn đầu
  const head = od.querySelector('.order-head');
  head.click();
  await sleep(80);
  const panel = od.getElementById(head.getAttribute('aria-controls'));
  check('bấm → aria-expanded=true và panel mở',
    head.getAttribute('aria-expanded') === 'true' && panel.classList.contains('open'));
  check('panel có danh sách món + name/size/qty/lineTotal',
    panel.querySelectorAll('.order-items li').length === 3 &&
    panel.innerHTML.indexOf('Cà phê sữa đá') !== -1 &&
    panel.innerHTML.indexOf('Size M · x2') !== -1);
  check('footer hiện tổng cộng 116.000đ', panel.innerHTML.indexOf('116.000đ') !== -1);

  head.click();
  await sleep(80);
  check('bấm nữa → aria-expanded=false và panel đóng',
    head.getAttribute('aria-expanded') === 'false' && !panel.classList.contains('open'));

  // Fallback thiếu tên sản phẩm (đơn #1048)
  const order1048 = Array.from(od.querySelectorAll('.order-card'))
    .find((c) => c.getAttribute('data-order-id') === '1048');
  order1048.querySelector('.order-head').click();
  await sleep(80);
  check('item thiếu productName → "Sản phẩm #3"',
    order1048.innerHTML.indexOf('Sản phẩm #3') !== -1);

  /* ============ STATE FLAGS ============ */
  log('--- ?mock flags ---');
  const emptyMenu = await loadPage(port, 'index.html', '?mock=empty',
    (d) => d.body.innerHTML.indexOf('Hiện chưa có món nào') !== -1);
  check('menu ?mock=empty → "Hiện chưa có món nào"',
    emptyMenu.window.document.body.innerHTML.indexOf('Hiện chưa có món nào') !== -1);

  const errMenu = await loadPage(port, 'index.html', '?mock=error',
    (d) => !!d.getElementById('retry-btn'));
  check('menu ?mock=error → nút "Thử lại"',
    !!errMenu.window.document.getElementById('retry-btn'));

  const unauth = await loadPage(port, 'orders.html', '?mock=unauth',
    (d) => d.body.innerHTML.indexOf('Vui lòng đăng nhập để xem đơn') !== -1);
  check('orders ?mock=unauth → "Vui lòng đăng nhập để xem đơn"',
    unauth.window.document.body.innerHTML.indexOf('Vui lòng đăng nhập để xem đơn') !== -1);

  const emptyOrders = await loadPage(port, 'orders.html', '?mock=empty',
    (d) => d.body.innerHTML.indexOf('Bạn chưa có đơn nào') !== -1);
  check('orders ?mock=empty → "Bạn chưa có đơn nào"',
    emptyOrders.window.document.body.innerHTML.indexOf('Bạn chưa có đơn nào') !== -1);

  /* ============ KẾT LUẬN ============ */
  log('---');
  log(pass + ' pass / ' + fail + ' fail');
  fs.writeFileSync(path.join(__dirname, 'page-test-results.txt'), out, 'utf8');
  server.close();
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => {
  log('RUNNER ERROR: ' + (e && e.stack ? e.stack : e));
  try { fs.writeFileSync(path.join(__dirname, 'page-test-results.txt'), out, 'utf8'); } catch (err) {}
  process.exit(1);
});


