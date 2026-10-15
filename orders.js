/**
 * Task 9 (phần UI) — Trang Lịch sử đơn (orders.html)
 * State machine: loading → unauthenticated(401) | error | empty | success.
 * Mỗi thẻ đơn có nút mở rộng (aria-expanded) — mở nhiều đơn cùng lúc.
 */
(function () {
  'use strict';

  var state = {
    orders: [],
    error: null,
  };

  var content;

  /* ---------- Render: loading ---------- */
  function renderLoading() {
    var html = '';
    for (var i = 0; i < 3; i++) {
      html +=
        '<div class="order-skeleton">' +
          '<div class="sk sk-line"></div>' +
          '<div class="sk sk-line"></div>' +
          '<div class="sk sk-line"></div>' +
        '</div>';
    }
    content.innerHTML =
      '<div class="order-list" aria-busy="true" aria-label="Đang tải đơn hàng">' + html + '</div>';
  }

  /* ---------- Render: chưa đăng nhập (401) ---------- */
  function renderUnauthenticated() {
    content.innerHTML =
      '<div class="state-box">' +
        '<div class="state-icon" aria-hidden="true">🔐</div>' +
        '<h3>Vui lòng đăng nhập để xem đơn</h3>' +
        '<p>Đơn hàng của bạn sẽ hiển thị tại đây sau khi đăng nhập.</p>' +
        '<a class="btn" href="login.html">Đăng nhập</a>' +
        ' <a class="btn btn-ghost" href="index.html">Về menu</a>' +
      '</div>';
  }

  /* ---------- Render: lỗi ---------- */
  function renderError() {
    content.innerHTML =
      '<div class="state-box">' +
        '<div class="state-icon" aria-hidden="true">⚠️</div>' +
        '<h3>Không tải được danh sách đơn</h3>' +
        '<p>' + BL.esc(state.error && state.error.message ? state.error.message : 'Đã có lỗi xảy ra') + '</p>' +
        '<button type="button" class="btn" id="retry-btn">Thử lại</button>' +
      '</div>';
    document.getElementById('retry-btn').addEventListener('click', load);
  }

  /* ---------- Render: rỗng ---------- */
  function renderEmpty() {
    content.innerHTML =
      '<div class="state-box">' +
        '<div class="state-icon" aria-hidden="true">🧾</div>' +
        '<h3>Bạn chưa có đơn nào</h3>' +
        '<p>Chọn món yêu thích và đặt đơn đầu tiên nhé!</p>' +
        '<a class="btn" href="index.html">Về menu</a>' +
      '</div>';
  }

  /* ---------- Render: danh sách đơn ---------- */
  function orderCardHtml(o) {
    var itemCount = (o.items || []).length;
    var panelId = 'order-panel-' + o.id;
    var headId = 'order-head-' + o.id;

    // Danh sách món (mở rộng)
    var itemsHtml = '';
    if (itemCount > 0) {
      itemsHtml = '<ul class="order-items">' +
        o.items.map(function (it) {
          var name = it.productName || ('Sản phẩm #' + it.productId);
          return (
            '<li>' +
              '<span class="item-name">' + BL.esc(name) + '</span>' +
              '<span class="item-total">' + BL.formatVND(it.lineTotal) + '</span>' +
              '<span class="item-meta">Size ' + BL.esc(it.size) + ' · x' + it.qty + '</span>' +
            '</li>'
          );
        }).join('') +
        '</ul>' +
        '<div class="order-panel-footer">' +
          '<span>Tổng cộng</span>' +
          '<span class="grand">' + BL.formatVND(o.total) + '</span>' +
        '</div>';
    }

    return (
      '<article class="order-card" data-order-id="' + o.id + '">' +
        '<button type="button" class="order-head" id="' + headId + '" ' +
          'aria-expanded="false" aria-controls="' + panelId + '">' +
          '<span class="order-id">#' + BL.esc(String(o.id)) + '</span>' +
          '<span class="order-status-cell">' + BL.statusBadge(o.status) + '</span>' +
          '<span class="order-date">' + BL.esc(BL.formatDate(o.createdAt)) + '</span>' +
          '<span class="order-toggle-cell">' +
            '<span class="order-total">Tổng: ' + BL.formatVND(o.total) + '</span>' +
            (itemCount > 0
              ? '<span class="item-count">' + BL.itemCountLabel(itemCount) + '</span>' +
                '<span class="chevron" aria-hidden="true">▼</span>'
              : '') +
          '</span>' +
        '</button>' +
        (itemCount > 0
          ? '<div class="order-panel" id="' + panelId + '" role="region" aria-labelledby="' + headId + '">' +
              itemsHtml +
            '</div>'
          : '') +
      '</article>'
    );
  }

  function renderList() {
    // Mới nhất lên đầu (createdAt giảm dần)
    var sorted = state.orders.slice().sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    content.innerHTML = '<div class="order-list">' + sorted.map(orderCardHtml).join('') + '</div>';
    bindCards();
  }

  /* ---------- Mở/đóng chi tiết đơn (nEnter/Space nhờ <button>) ---------- */
  function bindCards() {
    content.querySelectorAll('.order-head').forEach(function (head) {
      head.addEventListener('click', function () {
        var expanded = head.getAttribute('aria-expanded') === 'true';
        var panelId = head.getAttribute('aria-controls');
        var panel = document.getElementById(panelId);
        if (!panel) return;

        head.setAttribute('aria-expanded', String(!expanded));
        panel.classList.toggle('open', !expanded);
      });
    });
  }

  /* ---------- Load dữ liệu ---------- */
  async function load() {
    state.error = null;
    renderLoading();

    try {
      var orders = await BL.api.getMyOrders();
      state.orders = Array.isArray(orders) ? orders : [];

      if (state.orders.length === 0) {
        renderEmpty();
        return;
      }
      renderList();
    } catch (err) {
      state.error = err;
      if (err && err.status === 401) {
        renderUnauthenticated();
      } else {
        renderError();
      }
    }
  }

  /* ---------- Init ---------- */
  function init() {
    content = document.getElementById('content');
    BL.cart.mountBadges();
    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


