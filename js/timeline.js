/* =========================================================
   timeline.js — D-day 카운터와 전형 일정 타임라인
   ========================================================= */
(function () {
  var DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  // 'YYYY-MM-DD' → 그날 0시 (브라우저 현지 시간)
  function toDate(s) {
    var p = s.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function today() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function fmt(s) {
    var d = toDate(s);
    return (d.getMonth() + 1) + '. ' + d.getDate() + '.(' + DAYS[d.getDay()] + ')';
  }

  function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }

  // 일정의 상태: done(지남) / now(진행 중) / next(가장 가까운 다음 일정) / later
  function statusOf(item, t) {
    var s = toDate(item.start);
    var e = toDate(item.end || item.start);
    if (t > e) return 'done';
    if (t >= s && t <= e) return 'now';
    return 'later';
  }

  function renderTimeline(el) {
    var t = today();
    var list = KAIH.schedule;
    var nextMarked = false;
    var html = '';
    var lastGroup = '';

    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var st = statusOf(it, t);
      if (st === 'later' && !nextMarked) { st = 'next'; nextMarked = true; }
      if (st === 'now') nextMarked = true;

      if (it.group !== lastGroup) {
        html += '<li class="tl-group"><span>' + it.group + '</span></li>';
        lastGroup = it.group;
      }

      var dateText = fmt(it.start) + (it.end ? ' ~ ' + fmt(it.end) : '');
      var tag = '';
      if (st === 'now') tag = '<span class="tl-tag tl-tag-now">진행 중</span>';
      else if (st === 'next') tag = '<span class="tl-tag tl-tag-next">다음 일정 · D-' + daysBetween(t, toDate(it.start)) + '</span>';
      else if (st === 'done') tag = '<span class="tl-tag tl-tag-done">지남</span>';

      html += '<li class="tl-item is-' + st + '">' +
        '<div class="tl-date"><strong>' + dateText + '</strong>' + (it.time ? '<span>' + it.time + '</span>' : '') + '</div>' +
        '<div class="tl-body"><h3>' + it.title + ' ' + tag + '</h3>' + (it.note ? '<p>' + it.note + '</p>' : '') + '</div>' +
        '</li>';
    }
    el.innerHTML = html;
  }

  // 히어로의 D-day: 아직 끝나지 않은 첫 번째 "접수" 일정 기준
  function renderDday(el) {
    var t = today();
    var list = KAIH.schedule;
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var s = toDate(it.start);
      var e = toDate(it.end || it.start);
      if (t > e) continue;
      var label = it.group + ' ' + it.title;
      if (t >= s) {
        el.innerHTML = '<span class="dday-num">' + (it.end ? '진행 중' : '오늘') + '</span><span class="dday-label">' + label + (it.time ? ' · ' + it.time : '') + '</span>';
      } else {
        el.innerHTML = '<span class="dday-num">D-' + daysBetween(t, s) + '</span><span class="dday-label">' + label + '까지 (' + fmt(it.start) + ')</span>';
      }
      return;
    }
    el.innerHTML = '<span class="dday-label">2027학년도 입학 전형이 모두 끝났습니다.</span>';
  }

  KAIH.renderTimeline = renderTimeline;
  KAIH.renderDday = renderDday;
})();
