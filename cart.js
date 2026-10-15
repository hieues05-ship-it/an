/**
 * Giỏ hàng — store TỐI THIỂU cho nút thêm nhanh (Task 3).
 * Người làm Task 5 sẽ thay phần trong này bằng store chính thức,
 * chỉ cần giữ nguyên API: addItem(item), count(), subscribe(fn).
 *
 * Quy ước: thêm nhanh dùng size 'M', không topping, qty 1.
 */
window.BL = window.BL || {};

BL.cart = (function () {
  var KEY = 'brewlite_cart';
  var items = [];
  var listeners = [];

  try {
    items = JSON.parse(localStorage.getItem(KEY)) || [];
    if (!Array.isArray(items)) items = [];
  } catch (e) {
    items = [];
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) { /* localStorage có thể bị chặn trên file:// — bỏ qua */ }
  }

  function notify() {
    listeners.forEach(function (fn) {
      try { fn(); } catch (e) { /* listener lỗi không được phá trang */ }
    });
  }

  return {
    /** Thêm 1 sản phẩm (size M, không topping); cộng dồn nếu đã có. */
    addItem: function (product) {
      var size = 'M';
      var found = null;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.productId === product.id && it.size === size && !it.topping) {
          found = it;
          break;
        }
      }
      if (found) {
        found.qty += 1;
      } else {
        items.push({
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          size: size,
          qty: 1,
          topping: null,
        });
      }
      persist();
      notify();
    },

    count: function () {
      return items.reduce(function (s, i) { return s + (i.qty || 0); }, 0);
    },

    subscribe: function (fn) {
      listeners.push(fn);
    },

    /** Gắn badge số lượng vào mọi .cart-count trên trang (Header chung). */
    mountBadges: function () {
      var render = function () {
        var n = BL.cart.count();
        document.querySelectorAll('.cart-count').forEach(function (el) {
          el.textContent = String(n);
          el.hidden = n === 0;
        });
      };
      render();
      BL.cart.subscribe(render);
    },
  };
})();
