global.window = global;
global.location = { search: '', pathname: '/' };
global.history = { replaceState: function () {} };
const store = {};
function makeEl(id) {
  return {
    id: id, className: '', innerHTML: '', textContent: '', style: {}, children: [],
    appendChild: function (c) { this.children.push(c); },
    addEventListener: function () {},
    querySelectorAll: function () { return []; },
    setAttribute: function () {}, getAttribute: function () { return null; }
  };
}
global.document = {
  readyState: 'complete',
  addEventListener: function () {},
  querySelectorAll: function () { return []; },
  getElementById: function (id) { if (!store[id]) store[id] = makeEl(id); return store[id]; },
  createElement: function () { return makeEl(''); }
};
const fs = require('fs');
const files = ['config.js','format.js','filter.js','status.js','mocks-products.js','mocks-orders.js','api.js','cart.js','tests.js'];
for (const f of files) {
  try { eval(fs.readFileSync('js/' + f, 'utf8')); }
  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.stack); process.exit(1); }
}
const list = store['test-list'];
let pass = 0, fail = 0;
for (const li of list.children) {
  const isPass = li.className.indexOf('pass') !== -1;
  // strip html tags for console
  const text = li.innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log((isPass ? '[PASS] ' : '[FAIL] ') + text);
  isPass ? pass++ : fail++;
}
console.log('---');
console.log(store['summary'].textContent + '  (node runner: ' + pass + ' pass / ' + fail + ' fail)');
if (fail > 0) process.exit(1);
