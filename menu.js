/**
 * Task 3 — Trang Menu (index.html)
 * State machine: loading → error | empty | no-results | success.
 * Lọc (tìm kiếm + danh mục) chạy hoàn toàn phía client qua BL.filterProducts.
 */
(function () {
  'use strict';

  var state = {
    products: [],      // toàn bộ sản phẩm (1 lần fetch)
    q: '',             // từ khóa (?q=)
    category: '',      // danh mục (?category=)
    loading: true,
    error: null,
  };

  var content, searchInput, searchClear, searchbar, categoryFilter, toolbar, toastEl;
  var toastTimer = null;

  /* ---------- URL state ---------- */
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    state.category = params.get('category') || '';
  }

  function writeUrl() {
    var params = new URLSearchParams(window.location.search);
    if (state.q) params.set('q', state.q); else params.delete('q');
    if (state.category) params.set('category', state.category); else params.delete('category');
    var qs = params.toString();
    history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
  }

  /* ---------- Helpers ---------- */
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 1600);
  }

  /* ---------- Render: state boxes ---------- */
  function renderLoading() {
    var cards = '';
    for (var i = 0; i < 8; i++) {
      cards +=
        '<div class="skeleton-card">' +
          '<div class="sk sk-thumb"></div>' +
          '<div class="sk sk-line"></div>' +
          '<div class="sk sk-line short"></div>' +
        '</div>';
    }
    content.innerHTML =
      '<div class="skeleton-grid" aria-busy="true" aria-label="Đang tải menu">' + cards + '</div>';
  }

  function renderError() {
    content.innerHTML =
      '<div class="state-box">' +
        '<div class="state-icon" aria-hidden="true">⚠️</div>' +
        '<h3>Không tải được menu</h3>' +
        '<p>' + BL.esc(state.error && state.error.message ? state.error.message : 'Đã có lỗi xảy ra') + '</p>' +
        '<button type="button" class="btn" id="retry-btn">Thử lại</button>' +
      '</div>';
    document.getElementById('retry-btn').addEventListener('click', load);
  }

  function renderEmpty() {
    content.innerHTML =
      '<div class="state-box">' +
        '<div class="state-icon" aria-hidden="true">🍽️</div>' +
        '<h3>Hiện chưa có món nào</h3>' +
        '<p>Menu đang được cập nhật, bạn quay lại sau nhé.</p>' +
      '</div>';
  }

  function renderNoResults() {
    content.innerHTML =
      '<div class="state-box">' +
        '<div class="state-icon" aria-hidden="true">🔍</div>' +
        '<h3>Không tìm thấy món phù hợp</h3>' +
        '<p>Thử đổi từ khóa hoặc xóa bộ lọc nhé.</p>' +
        '<button type="button" class="btn btn-ghost" id="clear-filters-btn">Xóa bộ lọc</button>' +
      '</div>';
    document.getElementById('clear-filters-btn').addEventListener('click', function () {
      state.q = '';
      state.category = '';
      searchInput.value = '';
      searchbar.classList.remove('has-value');
      writeUrl();
      renderToolbar();
      renderGrid();
    });
  }

  /* ---------- Render: lưới sản phẩm ---------- */
  function productCardHtml(p) {
    var out = p.stock <= 0;
    var price = BL.formatVND(p.price);
    return (
      '<article class="product-card' + (out ? ' out-of-stock' : '') + '" data-id="' + p.id + '">' +
        '<a class="card-link" href="product.html?id=' + p.id + '" data-detail-link>' +
          '<div class="product-thumb">' +
            (out ? '<span class="stock-badge">Hết hàng</span>' : '') +
            '<img src="' + BL.esc(BL.productImage(p)) + '" alt="' + BL.esc(p.name) + '" loading="lazy" onerror="this.onerror=null;this.src=BL.fallbackImage();">' +
          '</div>' +
          '<div class="card-body">' +
            (p.category ? '<span class="product-category">' + BL.esc(p.category) + '</span>' : '') +
            '<h2 class="product-name">' + BL.esc(p.name) + '</h2>' +
            '<div class="product-footer">' +
              '<span class="product-price">' + price + '</span>' +
              '<button type="button" class="btn-add" data-add ' +
                (out ? 'disabled ' : '') +
                'aria-label="Thêm ' + BL.esc(p.name) + ' vào giỏ">+</button>' +
            '</div>' +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }

  function renderGrid() {
    var list = BL.filterProducts(state.products, state.q, state.category);

    if (list.length === 0) {
      // Khác với menu rỗng: ở đây dữ liệu có nhưng filter ra rỗng
      renderNoResults();
      return;
    }

    content.innerHTML =
      '<div class="product-grid">' + list.map(productCardHtml).join('') + '</div>';
  }

  /* ---------- Toolbar: chip danh mục ---------- */
  function renderToolbar() {
    var cats = BL.collectCategories(state.products);

    if (cats.length === 0) {
      // Backend chưa có category → ẩn chip lọc (giả định 6 trong plan)
      categoryFilter.innerHTML = '';
      toolbar.hidden = false; // vẫn luôn có ô tìm kiếm
      return;
    }

    toolbar.hidden = false;
    var html = '<button type="button" class="chip' + (!state.category ? ' active' : '') +
               '" data-category="" aria-pressed="' + (!state.category) + '">Tất cả</button>';
    cats.forEach(function (c) {
      var active = state.category === c;
      html += '<button type="button" class="chip' + (active ? ' active' : '') +
              '" data-category="' + BL.esc(c) + '" aria-pressed="' + active + '">' +
              BL.esc(c) + '</button>';
    });
    categoryFilter.innerHTML = html;
  }

  function bindToolbar() {
    // Search: debounce 300ms
    var timer = null;
    searchInput.addEventListener('input', function () {
      searchbar.classList.toggle('has-value', searchInput.value.length > 0);
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.q = searchInput.value;
        writeUrl();
        renderGrid();
      }, 300);
    });

    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchbar.classList.remove('has-value');
      state.q = '';
      writeUrl();
      searchInput.focus();
      renderGrid();
    });

    // Chip danh mục (event delegation)
    categoryFilter.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      state.category = chip.getAttribute('data-category') || '';
      writeUrl();
      renderToolbar();
      renderGrid();
    });
  }

  /* ---------- Thêm nhanh vào giỏ ---------- */
  function bindContent() {
    content.addEventListener('click', function (e) {
      var addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (addBtn.disabled) return;

        var card = addBtn.closest('.product-card');
        var id = Number(card.getAttribute('data-id'));
        var product = state.products.find(function (p) { return p.id === id; });
        if (!product) return;

        BL.cart.addItem(product); // size M, qty 1 (xem js/cart.js)

        // Phản hồi nút + toast
        addBtn.classList.add('added');
        addBtn.textContent = '✓';
        setTimeout(function () {
          addBtn.classList.remove('added');
          addBtn.textContent = '+';
        }, 900);
        showToast('Đã thêm "' + product.name + '" vào giỏ');
        return;
      }

      // Trang chi tiết sản phẩm là Task 4 — chưa có thì không điều hướng
      var link = e.target.closest('[data-detail-link]');
      if (link && !window.BL_HAS_PRODUCT_DETAIL) {
        e.preventDefault();
        showToast('Trang chi tiết sản phẩm (Task 4) chưa sẵn sàng');
      }
    });
  }

  /* ---------- Load dữ liệu ---------- */
  async function load() {
    state.loading = true;
    state.error = null;
    renderLoading();

    try {
      var products = await BL.api.getProducts();
      state.products = Array.isArray(products) ? products : [];
      state.loading = false;

      if (state.products.length === 0) {
        renderEmpty();
        toolbar.hidden = true;
        return;
      }
      renderToolbar();
      renderGrid();
    } catch (err) {
      state.loading = false;
      state.error = err;
      toolbar.hidden = true;
      renderError();
    }
  }

  /* ---------- Init ---------- */
  function init() {
    content = document.getElementById('content');
    searchInput = document.getElementById('search-input');
    searchClear = document.getElementById('search-clear');
    searchbar = document.getElementById('searchbar');
    categoryFilter = document.getElementById('category-filter');
    toolbar = document.getElementById('toolbar');
    toastEl = document.getElementById('toast');

    readUrl();
    searchInput.value = state.q;
    searchbar.classList.toggle('has-value', !!state.q);

    bindToolbar();
    bindContent();
    BL.cart.mountBadges();
    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

