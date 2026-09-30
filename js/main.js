/* =========================================================
   main.js — 각 영역 그리기, 메뉴 이동, 리플릿 크게 보기
   (data.js → timeline.js → finder.js → docs.js → main.js 순서로 불러옵니다)
   ========================================================= */
(function () {
  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 홍보 영상 ---------- */
  function renderVideo() {
    var v = KAIH.video;
    var el = $('video-box');
    if (v.youtubeId) {
      el.innerHTML = '<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.youtubeId) +
        '" title="' + esc(v.title) + '" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
      return;
    }
    el.innerHTML =
      '<a class="video-link" href="' + v.url + '" target="_blank" rel="noopener">' +
      '<span class="video-play" aria-hidden="true"></span>' +
      '<span class="video-text"><strong>' + esc(v.title) + '</strong><span>' + esc(v.desc) + '</span>' +
      '<span class="video-go">학교 홈페이지에서 영상 보기 (새 창)</span></span></a>' +
      '<p class="video-more"><a href="' + v.listUrl + '" target="_blank" rel="noopener">다른 홍보영상도 보기</a></p>';
  }

  /* ---------- 학교 소개 ---------- */
  function renderAbout() {
    var a = KAIH.about;
    var h = '';
    for (var i = 0; i < a.talents.length; i++) {
      h += '<li><strong>' + a.talents[i].name + '</strong><span>' + a.talents[i].desc + '</span></li>';
    }
    $('talents').innerHTML = h;

    h = '';
    for (i = 0; i < a.support.length; i++) {
      var s = a.support[i];
      h += '<div class="support-item"><h3><span aria-hidden="true">' + s.icon + '</span> ' + s.title + '</h3><ul>';
      for (var j = 0; j < s.items.length; j++) h += '<li>' + s.items[j] + '</li>';
      h += '</ul></div>';
    }
    $('support').innerHTML = h;

    h = '';
    for (i = 0; i < a.roadmap.length; i++) {
      var r = a.roadmap[i];
      h += '<li class="road-step"><span class="road-grade">' + r.grade + '<small>학년</small></span><ul>';
      for (j = 0; j < r.items.length; j++) h += '<li>' + r.items[j] + '</li>';
      h += '</ul></li>';
    }
    $('roadmap').innerHTML = h;

    h = '';
    for (i = 0; i < a.careers.length; i++) {
      h += '<div class="career"><h3>' + a.careers[i].title + '</h3><p>' + a.careers[i].body + '</p></div>';
    }
    $('careers').innerHTML = h;
  }

  /* ---------- 모집 정원 + 전형 ---------- */
  function renderQuota() {
    var q = KAIH.quota;
    var h = '<div class="quota-bar" aria-hidden="true">';
    for (var i = 0; i < q.tracks.length; i++) {
      var t = q.tracks[i];
      h += '<span class="qb qb-' + t.key + '" style="flex:' + t.count + '">' + t.count + '</span>';
    }
    h += '</div><ul class="quota-legend">';
    for (i = 0; i < q.tracks.length; i++) {
      h += '<li><i class="qb-' + q.tracks[i].key + '"></i>' + q.tracks[i].name + ' ' + q.tracks[i].count + '명</li>';
    }
    h += '</ul><p class="quota-sum">' + q.dept + ' ' + q.classes + '학급, 총 <strong>' + q.total + '명</strong></p>';
    $('quota').innerHTML = h;

    h = '';
    for (i = 0; i < KAIH.tracks.length; i++) {
      var tr = KAIH.tracks[i];
      h += '<article class="track track-' + tr.key + '"><p class="track-badge">' + tr.badge + '</p><h3>' + tr.name + '</h3>' +
        '<dl><dt>누가</dt><dd>' + tr.who + '</dd><dt>어떻게</dt><dd>' + tr.how + '</dd></dl></article>';
    }
    $('tracks').innerHTML = h;
  }

  /* ---------- 전형 방법 ---------- */
  function partsHtml(stage) {
    var h = '<div class="score-bar">';
    for (var i = 0; i < stage.parts.length; i++) {
      var p = stage.parts[i];
      h += '<span style="flex:' + p.score + '"><b>' + p.score + '</b>' + p.name + '</span>';
    }
    return h + '</div>';
  }

  function renderScoring() {
    var s = KAIH.scoring;
    var h = '<h3>특별전형</h3>' +
      '<div class="score-stage"><p class="score-title">1차 서류 전형 · ' + s.special.stage1.total + '점</p>' + partsHtml(s.special.stage1) + '</div>' +
      '<div class="score-stage"><p class="score-title">2차 전형 · ' + s.special.stage2.total + '점</p>' + partsHtml(s.special.stage2) + '</div><ul class="plain">';
    for (var i = 0; i < s.special.notes.length; i++) h += '<li>' + s.special.notes[i] + '</li>';
    h += '</ul><h3>일반전형</h3><ul class="plain">';
    for (i = 0; i < s.general.notes.length; i++) h += '<li>' + s.general.notes[i] + '</li>';
    h += '</ul>';
    $('scoring').innerHTML = h;
  }

  /* ---------- 꼭 알아둘 점 ---------- */
  function renderNotices() {
    var h = '';
    for (var i = 0; i < KAIH.notices.length; i++) {
      var n = KAIH.notices[i];
      h += '<div class="notice' + (n.highlight ? ' is-hl' : '') + '"><h3>' + n.title + '</h3><p>' + n.body + '</p></div>';
    }
    $('notices').innerHTML = h;
  }

  /* ---------- 기사·링크 ---------- */
  function renderNews() {
    var h = '';
    for (var i = 0; i < KAIH.news.length; i++) {
      var n = KAIH.news[i];
      h += '<li><a href="' + n.url + '" target="_blank" rel="noopener">' +
        '<span class="news-meta">' + n.source + ' | ' + n.date + '</span>' +
        '<strong>' + n.title + '</strong><span class="news-sum">' + n.summary + '</span></a></li>';
    }
    $('news-list').innerHTML = h;

    h = '';
    for (i = 0; i < KAIH.links.length; i++) {
      h += '<li><a href="' + KAIH.links[i].url + '" target="_blank" rel="noopener">' + KAIH.links[i].title + '</a></li>';
    }
    $('links').innerHTML = h;
  }

  /* ---------- 문의 ---------- */
  function renderContact() {
    var s = KAIH.school;
    $('contact').innerHTML =
      '<a class="contact-tel" href="tel:' + s.tel.replace(/-/g, '') + '">' + s.telLabel + ' ' + s.tel + '</a>' +
      '<p>' + s.address + '</p>' +
      '<p><a href="' + s.homepage + '" target="_blank" rel="noopener">학교 홈페이지 바로가기</a></p>';
  }

  /* ---------- 상단 메뉴: 현재 위치 표시 ---------- */
  function initNav() {
    var links = document.querySelectorAll('.nav a');
    if (!('IntersectionObserver' in window)) return;
    var map = {};
    for (var i = 0; i < links.length; i++) map[links[i].getAttribute('href').slice(1)] = links[i];
    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        if (!entries[k].isIntersecting) continue;
        var id = entries[k].target.id;
        for (var key in map) map[key].classList.toggle('is-on', key === id);
        var on = map[id];
        if (on && on.scrollIntoView) on.parentNode.scrollLeft = on.offsetLeft - 16;
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    for (var id in map) {
      var sec = $(id);
      if (sec) io.observe(sec);
    }
  }

  /* ---------- 리플릿 크게 보기 ---------- */
  function initLightbox() {
    var box = $('lightbox');
    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('[data-close]').focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    $('open-leaflet').addEventListener('click', open);
    box.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close') || e.target === box) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) close();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    KAIH.renderDday($('dday'));
    renderVideo();
    renderAbout();
    renderQuota();
    KAIH.initFinder($('finder'));
    KAIH.renderTimeline($('timeline'));
    renderScoring();
    KAIH.initDocs($('docs'));
    KAIH.renderDownloads($('downloads'));
    KAIH.renderLater($('later'));
    renderNotices();
    renderNews();
    renderContact();
    initNav();
    initLightbox();
  });
})();
