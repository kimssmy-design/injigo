/* =========================================================
   docs.js — 전형별 제출 서류 체크리스트 + 서식 내려받기
   체크 표시는 화면에서만 쓰는 용도(저장 안 됨)
   ========================================================= */
(function () {
  var TABS = [
    { key: 'sw', label: 'SW 역량 우수자' },
    { key: 'local', label: '지역인재 추천' },
    { key: 'genGw', label: '일반 (강원 중학교)' },
    { key: 'genOut', label: '일반 (다른 시·도·검정고시)' }
  ];

  var current = 'sw';
  var withGed = false;
  var root;

  function itemsHtml(items, prefix) {
    var h = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var id = prefix + '-' + i;
      h += '<li><label for="' + id + '"><input type="checkbox" id="' + id + '">' +
        '<span class="doc-name">' + it.name + (it.form ? ' <em class="doc-form">' + it.form + '</em>' : '') + '</span>' +
        (it.note ? '<span class="doc-note">' + it.note + '</span>' : '') +
        '</label></li>';
    }
    return h;
  }

  function render() {
    var d = KAIH.docs;
    var set = d[current];
    var tabs = '<div class="doc-tabs" role="tablist">';
    for (var i = 0; i < TABS.length; i++) {
      var on = TABS[i].key === current;
      tabs += '<button type="button" role="tab" aria-selected="' + on + '" class="doc-tab' + (on ? ' is-on' : '') + '" data-tab="' + TABS[i].key + '">' + TABS[i].label + '</button>';
    }
    tabs += '</div>';

    var html = tabs +
      '<div class="doc-panel" role="tabpanel">' +
      '<p class="doc-how"><strong>제출 방법</strong> ' + set.how + '</p>' +
      '<ul class="doc-list">' + itemsHtml(set.items, current) + '</ul>';

    // 지역인재·강원 중학교 전형은 중학교 재학(졸업)생 대상이라 검정고시 선택지를 숨김
    var gedAllowed = (current === 'sw' || current === 'genOut');
    if (gedAllowed) {
      html += '<label class="ged-toggle"><input type="checkbox" data-ged' + (withGed ? ' checked' : '') + '> 검정고시 합격자예요</label>';
    }

    if (gedAllowed && withGed) {
      html += '<div class="doc-ged"><p class="doc-how"><strong>추가 서류</strong> ' + d.ged.how + '</p>' +
        '<ul class="doc-list">' + itemsHtml(d.ged.items, current + '-ged') + '</ul></div>';
    }
    html += '</div>';
    root.innerHTML = html;
  }

  function onClick(e) {
    var tab = e.target.closest('[data-tab]');
    if (tab) {
      current = tab.getAttribute('data-tab');
      render();
      return;
    }
    if (e.target.hasAttribute && e.target.hasAttribute('data-ged')) {
      withGed = e.target.checked;
      render();
    }
  }

  function renderDownloads(el) {
    var h = '';
    var list = KAIH.downloads;
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      h += '<a class="dl-card" href="' + f.file + '" download="' + f.saveAs + '">' +
        '<span class="dl-type">HWPX</span>' +
        '<span class="dl-text"><strong>' + f.title + '</strong><span>' + f.desc + '</span></span>' +
        '<span class="dl-action">내려받기 <small>' + f.size + '</small></span></a>';
    }
    el.innerHTML = h;
  }

  function renderLater(el) {
    var h = '';
    var list = KAIH.docs.later;
    for (var i = 0; i < list.length; i++) {
      h += '<li><strong>' + list[i].name + '</strong> <em class="doc-form">' + list[i].form + '</em><span>' + list[i].note + '</span></li>';
    }
    el.innerHTML = h;
  }

  KAIH.initDocs = function (el) {
    root = el;
    root.addEventListener('click', onClick);
    render();
  };
  KAIH.renderDownloads = renderDownloads;
  KAIH.renderLater = renderLater;
})();
