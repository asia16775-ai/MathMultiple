/* clock.js — นาฬิกาเข็มแบบ SVG สำหรับ Unit 7: Time
   ใช้ร่วมกันทุกหน้าของ Unit 7  •  by: Miss Jay & Miss Pim */
(function (w) {
  'use strict';

  var ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

  /* 1–59 เป็นคำอ่าน */
  function numWord(n) {
    if (n < 20) return ONES[n];
    var t = Math.floor(n / 10), o = n % 10;
    return o ? TENS[t] + '-' + ONES[o] : TENS[t];
  }

  function hourWord(h) { return ONES[((h + 11) % 12) + 1]; }

  /* ---------- วาดหน้าปัด ---------- */
  function point(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  /* drawClock(target, h, m, opts)
     target = element ที่จะใส่ SVG (หรือ id)
     opts.size   ขนาดเป็น px (ค่าเริ่มต้น 190)
     opts.hideHands  true = ไม่วาดเข็ม (ให้เด็กวาดเอง / ใช้เป็นแบบเปล่า)
     opts.mark   'right' ใส่เครื่องหมายมุมฉากตรงกลาง (ไม่ใช้ในหน้านี้)  */
  function drawClock(target, h, m, opts) {
    var el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    opts = opts || {};
    var S = opts.size || 190, C = 100, s = [];

    s.push('<svg viewBox="0 0 200 200" width="' + S + '" height="' + S + '" role="img" aria-label="clock">');
    s.push('<circle cx="100" cy="100" r="95" fill="#fff" stroke="#0277bd" stroke-width="5"/>');
    s.push('<circle cx="100" cy="100" r="86" fill="#f5fbff" stroke="none"/>');

    /* ขีดนาที 60 ขีด */
    var i, p1, p2;
    for (i = 0; i < 60; i++) {
      var big = i % 5 === 0;
      p1 = point(C, C, big ? 78 : 82, i * 6);
      p2 = point(C, C, 88, i * 6);
      s.push('<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) +
        '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) +
        '" stroke="' + (big ? '#0277bd' : '#b0bec5') + '" stroke-width="' + (big ? 4 : 2) +
        '" stroke-linecap="round"/>');
    }

    /* ตัวเลข 1–12 */
    for (i = 1; i <= 12; i++) {
      var p = point(C, C, 64, i * 30);
      s.push('<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 8).toFixed(1) +
        '" text-anchor="middle" font-family="Mali, Comic Sans MS, sans-serif" font-size="22" font-weight="700" fill="#01579b">' +
        i + '</text>');
    }

    if (!opts.hideHands) {
      var mAng = m * 6, hAng = (h % 12) * 30 + m * 0.5;
      /* เข็มสั้น = ชั่วโมง */
      var ph = point(C, C, 46, hAng);
      s.push('<line x1="100" y1="100" x2="' + ph[0].toFixed(1) + '" y2="' + ph[1].toFixed(1) +
        '" stroke="#c62828" stroke-width="9" stroke-linecap="round"/>');
      /* เข็มยาว = นาที */
      var pm = point(C, C, 72, mAng);
      s.push('<line x1="100" y1="100" x2="' + pm[0].toFixed(1) + '" y2="' + pm[1].toFixed(1) +
        '" stroke="#1565c0" stroke-width="6" stroke-linecap="round"/>');
    }
    s.push('<circle cx="100" cy="100" r="7" fill="#37474f"/>');
    s.push('</svg>');
    el.innerHTML = s.join('');
  }

  /* ---------- อ่านเวลา ---------- */
  function two(n) { return n < 10 ? '0' + n : '' + n; }

  /* 3:05 */
  function digital(h, m) { return h + ':' + two(m); }

  /* วิธีอ่านแบบตัวเลข — "three o'five" / "five thirty-eight" / "six o'clock" */
  function readNumber(h, m) {
    if (m === 0) return hourWord(h) + " o'clock";
    if (m < 10) return hourWord(h) + " o'" + numWord(m);
    return hourWord(h) + ' ' + numWord(m);
  }

  /* วิธีอ่านแบบ past — "15 minutes past 9" / "quarter past 9" / "half past 9" */
  function readPast(h, m) {
    if (m === 0) return hourWord(h) + " o'clock";
    if (m === 15) return 'quarter past ' + h;
    if (m === 30) return 'half past ' + h;
    return m + ' minutes past ' + h;
  }

  /* วิธีอ่านแบบ to — "15 minutes to 8" / "quarter to 8" */
  function readTo(h, m) {
    if (m === 0) return null;
    var left = 60 - m, nh = (h % 12) + 1;
    if (left === 15) return 'quarter to ' + nh;
    return left + ' minutes to ' + nh;
  }

  /* ---------- แปลงเวลา ---------- */
  function toMinutes(h, m) { return h * 60 + m; }
  function toHours(total) { return { h: Math.floor(total / 60), m: total % 60 }; }

  /* ---------- ช่วงเวลา ---------- */
  /* ห่างกันกี่นาที จาก a ไป b (นาทีตั้งแต่เที่ยงคืน) */
  function duration(a, b) { var d = b - a; if (d < 0) d += 24 * 60; return d; }
  function hm(total) {
    var o = toHours(total);
    if (o.h === 0) return o.m + ' min';
    if (o.m === 0) return o.h + ' h';
    return o.h + ' h ' + o.m + ' min';
  }

  w.Clock = {
    draw: drawClock, digital: digital, two: two,
    readNumber: readNumber, readPast: readPast, readTo: readTo,
    numWord: numWord, hourWord: hourWord,
    toMinutes: toMinutes, toHours: toHours, duration: duration, hm: hm
  };
})(window);
