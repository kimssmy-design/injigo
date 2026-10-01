/* =========================================================
   exam.js — 기출문제 풀이 · 즉시 채점 · 타이머 · 기록 저장
   (exam-data.js 다음에 불러옵니다)
   - 보기를 누르면 바로 정답/오답을 보여줍니다 (한 번 고르면 고정)
   - 풀던 기록과 타이머는 이 기기(브라우저)에만 저장됩니다
   ========================================================= */
(function () {
  var KEY = 'kaih-exam-v1';
  var CIRCLE = ['①', '②', '③', '④', '⑤'];
  var SUBJECTS = ['kor', 'math', 'eng'];

  var state = load();
  var timerId = null;

  function $(id) { return document.getElementById(id); }

  /* ---------- 저장 / 불러오기 ---------- */
  function load() {
    var base = { year: '2026', subj: 'kor', onlyWrong: false, ans: {}, time: {}, paused: {} };
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var s = JSON.parse(raw);
      for (var k in base) if (s[k] === undefined) s[k] = base[k];
      if (!KAIH.exam[s.year]) s.year = base.year;
      if (SUBJECTS.indexOf(s.subj) < 0) s.subj = base.subj;
      return s;
    } catch (e) {
      return base;
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 저장 불가 환경이면 무시 */ }
  }

  function setKey() { return state.year + '-' + state.subj; }
  function curSet() { return KAIH.exam[state.year][state.subj]; }
  function curAns() {
    var k = setKey();
    if (!state.ans[k]) state.ans[k] = {};
    return state.ans[k];
  }

  /* ---------- 집계 ---------- */
  function stats(year, subj) {
    var set = KAIH.exam[year][subj];
    var ans = state.ans[year + '-' + subj] || {};
    var done = 0, right = 0;
    for (var i = 0; i < set.items.length; i++) {
      var it = set.items[i];
      if (ans[it.n]) {
        done++;
        if (ans[it.n] === it.a) right++;
      }
    }
    return { total: set.items.length, done: done, right: right };
  }

  /* ---------- 타이머 (경과 시간) ---------- */
  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function timerRunning() {
    var st = stats(state.year, state.subj);
    return st.done > 0 && st.done < st.total && !state.paused[setKey()];
  }

  function tick() {
    if (document.hidden || !timerRunning()) return;
    var k = setKey();
    state.time[k] = (state.time[k] || 0) + 1;
    var el = $('timer-text');
    if (el) el.textContent = fmtTime(state.time[k]);
    var rt = $('result-time');
    if (rt) rt.textContent = fmtTime(state.time[k]);
    if (state.time[k] % 5 === 0) save();
  }

  function startTicker() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, 1000);
  }

  /* ---------- 상단 탭 ---------- */
  function renderTabs() {
    var years = Object.keys(KAIH.exam).sort().reverse();
    var h = '';
    for (var i = 0; i < years.length; i++) {
      var on = years[i] === state.year;
      h += '<button type="button" class="tab' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" data-year="' + years[i] + '">' + years[i] + '년</button>';
    }
    $('year-tabs').innerHTML = h;

    h = '';
    for (i = 0; i < SUBJECTS.length; i++) {
      var s = SUBJECTS[i];
      var st = stats(state.year, s);
      var onS = s === state.subj;
      h += '<button type="button" class="tab tab-subj' + (onS ? ' is-on' : '') + '" aria-pressed="' + onS + '" data-subj="' + s + '">' +
        KAIH.exam[state.year][s].label + '<small>' + st.done + '/' + st.total + '</small></button>';
    }
    $('subj-tabs').innerHTML = h;
  }

  /* ---------- 상태 막대 ---------- */
  function renderStatus() {
    var st = stats(state.year, state.subj);
    var k = setKey();
    var paused = !!state.paused[k];
    var pct = Math.round(st.done / st.total * 100);
    var timerLabel;
    if (st.done === 0) timerLabel = '첫 문제를 고르면 시작';
    else if (st.done === st.total) timerLabel = '완료';
    else timerLabel = paused ? '일시정지' : '진행 중';

    $('status').innerHTML =
      '<div class="st-row">' +
        '<span class="st-progress"><b>' + st.done + '</b> / ' + st.total + ' 풀이 · 맞힘 <b>' + st.right + '</b></span>' +
        '<span class="st-timer" title="' + timerLabel + '"><span aria-hidden="true">⏱</span> <span id="timer-text">' + fmtTime(state.time[k] || 0) + '</span>' +
          (st.done > 0 && st.done < st.total ? ' <button type="button" class="mini" data-act="pause">' + (paused ? '계속' : '멈춤') + '</button>' : '') +
        '</span>' +
      '</div>' +
      '<div class="st-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '<div class="st-row st-actions">' +
        '<label class="chk"><input type="checkbox" data-act="filter"' + (state.onlyWrong ? ' checked' : '') + '> 틀린 문제만 보기</label>' +
        '<span><button type="button" class="mini" data-act="retry-wrong">틀린 문제 다시 풀기</button> ' +
        '<button type="button" class="mini" data-act="reset">처음부터</button></span>' +
      '</div>';
  }

  /* ---------- 문항 카드 ---------- */
  function passageHtml(set, key, open) {
    var p = set.sets[key];
    var label = key.replace('-', '~') + '번 공통 지문';
    var img = '<img src="' + p.img + '" width="' + p.w + '" height="' + p.h + '" loading="lazy" alt="' + label + '">';
    if (open) return '<figure class="passage"><figcaption>' + label + '</figcaption>' + img + '</figure>';
    return '<details class="passage-mini"><summary>' + label + ' 다시 보기</summary>' + img + '</details>';
  }

  function cardInner(it, showPassageOpen) {
    var set = curSet();
    var ans = curAns();
    var picked = ans[it.n];
    var h = '';
    if (it.set) h += passageHtml(set, it.set, showPassageOpen);
    h += '<img class="q-img" src="' + it.img + '" width="' + it.w + '" height="' + it.h + '" loading="lazy" alt="' + it.n + '번 문항">';
    h += '<div class="opts" role="group" aria-label="' + it.n + '번 답 고르기">';
    for (var i = 1; i <= 5; i++) {
      var cls = 'opt';
      if (picked) {
        if (i === it.a) cls += ' is-answer';
        else if (i === picked) cls += ' is-wrong';
      }
      h += '<button type="button" class="' + cls + '" data-n="' + it.n + '" data-c="' + i + '"' + (picked ? ' disabled' : '') +
        ' aria-label="' + it.n + '번 ' + CIRCLE[i - 1] + '">' + CIRCLE[i - 1] + '</button>';
    }
    h += '</div>';
    if (picked) {
      var ok = picked === it.a;
      h += '<p class="fb ' + (ok ? 'fb-ok' : 'fb-no') + '" role="status">' +
        (ok ? '<b>정답이에요!</b>' : '<b>아쉬워요.</b> 정답은 ' + CIRCLE[it.a - 1] + '번') +
        '<span class="fb-topic">' + it.area + ' · ' + it.topic + '</span></p>';
    }
    return h;
  }

  function visibleItems() {
    var set = curSet();
    var ans = curAns();
    var out = [];
    for (var i = 0; i < set.items.length; i++) {
      var it = set.items[i];
      if (state.onlyWrong && !(ans[it.n] && ans[it.n] !== it.a)) continue;
      out.push(it);
    }
    return out;
  }

  function renderList() {
    var list = visibleItems();
    var seenSet = {};
    var h = '';
    if (!list.length) {
      h = '<p class="empty">' + (state.onlyWrong ? '틀린 문제가 없어요. 👍' : '문항이 없습니다.') + '</p>';
    }
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var openPassage = it.set && !seenSet[it.set];
      if (it.set) seenSet[it.set] = true;
      h += '<article class="q" id="q-' + it.n + '" data-open="' + (openPassage ? 1 : 0) + '">' + cardInner(it, openPassage) + '</article>';
    }
    $('qlist').innerHTML = h;
  }

  function updateCard(n) {
    var el = $('q-' + n);
    if (!el) return;
    var set = curSet();
    for (var i = 0; i < set.items.length; i++) {
      if (set.items[i].n === n) {
        el.innerHTML = cardInner(set.items[i], el.getAttribute('data-open') === '1');
        return;
      }
    }
  }

  /* ---------- 결과 ---------- */
  function renderResult() {
    var set = curSet();
    var ans = curAns();
    var st = stats(state.year, state.subj);
    var h = '<h2>' + state.year + '년 ' + set.label + ' 결과</h2>';

    if (st.done === 0) {
      $('result').innerHTML = h + '<p class="muted">문제를 풀면 여기에 영역별 결과가 쌓여요.</p>';
      return;
    }
    var score = Math.round(st.right / st.total * 100);
    h += '<p class="score"><b>' + st.right + '</b> / ' + st.total + '문항' +
      (st.done === st.total ? ' <span class="score-pct">' + score + '점 (100점 환산)</span>' : ' <span class="muted">(' + (st.total - st.done) + '문항 남음)</span>') +
      ' <span class="muted">· 걸린 시간 <span id="result-time">' + fmtTime(state.time[setKey()] || 0) + '</span></span></p>';

    h += '<ul class="areas">';
    for (var a = 0; a < set.areas.length; a++) {
      var name = set.areas[a], tot = 0, dn = 0, rt = 0;
      for (var i = 0; i < set.items.length; i++) {
        var it = set.items[i];
        if (it.area !== name) continue;
        tot++;
        if (ans[it.n]) { dn++; if (ans[it.n] === it.a) rt++; }
      }
      var pct = dn ? Math.round(rt / dn * 100) : 0;
      h += '<li><span class="area-name">' + name + '</span>' +
        '<span class="area-bar" aria-hidden="true"><i style="width:' + (dn ? pct : 0) + '%"></i></span>' +
        '<span class="area-num">' + rt + ' / ' + dn + (dn < tot ? ' <small>(' + tot + '문항 중)</small>' : '') + '</span></li>';
    }
    h += '</ul>';

    var wrong = [];
    for (i = 0; i < set.items.length; i++) {
      it = set.items[i];
      if (ans[it.n] && ans[it.n] !== it.a) wrong.push(it);
    }
    if (wrong.length) {
      h += '<h3>틀린 문항</h3><ul class="wrong">';
      for (i = 0; i < wrong.length; i++) {
        h += '<li><a href="#q-' + wrong[i].n + '" data-jump="' + wrong[i].n + '">' + wrong[i].n + '번</a> ' + wrong[i].topic + '</li>';
      }
      h += '</ul>';
    } else if (st.done === st.total) {
      h += '<p class="muted">모두 맞혔어요! 다른 과목도 도전해 보세요.</p>';
    }
    $('result').innerHTML = h;
  }

  function renderAll() {
    renderTabs();
    renderStatus();
    renderList();
    renderResult();
  }

  /* ---------- 이벤트 ---------- */
  function onClick(e) {
    var t = e.target.closest('button, a[data-jump]');
    if (!t) return;

    if (t.hasAttribute('data-year')) {
      state.year = t.getAttribute('data-year');
      state.onlyWrong = false;
      save(); renderAll(); scrollTopOfExam();
      return;
    }
    if (t.hasAttribute('data-subj')) {
      state.subj = t.getAttribute('data-subj');
      state.onlyWrong = false;
      save(); renderAll(); scrollTopOfExam();
      return;
    }
    if (t.hasAttribute('data-c')) {
      var n = Number(t.getAttribute('data-n'));
      var ans = curAns();
      if (ans[n]) return;
      ans[n] = Number(t.getAttribute('data-c'));
      save();
      updateCard(n);
      renderTabs(); renderStatus(); renderResult();
      return;
    }
    if (t.hasAttribute('data-jump')) {
      e.preventDefault();
      var el = $('q-' + t.getAttribute('data-jump'));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var act = t.getAttribute('data-act');
    if (act === 'pause') {
      state.paused[setKey()] = !state.paused[setKey()];
      save(); renderStatus();
    } else if (act === 'retry-wrong') {
      var a = curAns(), items = curSet().items, cnt = 0;
      for (var i = 0; i < items.length; i++) {
        if (a[items[i].n] && a[items[i].n] !== items[i].a) { delete a[items[i].n]; cnt++; }
      }
      if (!cnt) { alert('틀린 문제가 없어요.'); return; }
      state.onlyWrong = false;
      save(); renderAll();
    } else if (act === 'reset') {
      if (!confirm(state.year + '년 ' + curSet().label + ' 풀이 기록과 시간을 모두 지울까요?')) return;
      state.ans[setKey()] = {};
      state.time[setKey()] = 0;
      state.paused[setKey()] = false;
      state.onlyWrong = false;
      save(); renderAll(); scrollTopOfExam();
    }
  }

  function onChange(e) {
    if (e.target.getAttribute('data-act') === 'filter') {
      state.onlyWrong = e.target.checked;
      save(); renderList(); scrollTopOfExam();
    }
  }

  function scrollTopOfExam() {
    var el = $('exam-top');
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
  }

  /* ---------- 맨 위로 버튼 ---------- */
  function initToTop() {
    var btn = $('to-top');
    if (!btn) return;
    function toggle() { btn.hidden = window.scrollY < 600; }
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = $('exam');
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });
    window.addEventListener('pagehide', save);
    renderAll();
    startTicker();
    initToTop();
  });
})();
