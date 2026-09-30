/* =========================================================
   finder.js — "나에게 맞는 전형 찾기"
   질문 2개로 지원 가능한 전형을 알려줍니다.
   (최종 판단은 반드시 담임선생님·학교와 확인)
   ========================================================= */
(function () {
  var QUESTIONS = [
    {
      id: 'hwacheon',
      text: '화천군에 있는 중학교에 3년 동안 다녔나요?',
      help: '2027년 3월 말 이전에 전학 와서 화천 중학교를 졸업(예정)한 경우도 포함돼요.',
      options: [ { label: '네', value: 'yes' }, { label: '아니요', value: 'no' } ]
    },
    {
      id: 'criteria',
      text: '아래 두 조건을 모두 충족하나요?',
      help: '① 1학년 1학기, 2학년 1·2학기, 3학년 1학기 각각 국어·영어·수학 평균 50점 이상<br>② 미인정 결석(환산)이 1·2학년 각 3일 이하, 3학년 2일 이하 (2026. 9. 30. 기준)',
      options: [ { label: '둘 다 충족해요', value: 'yes' }, { label: '아니요 / 잘 모르겠어요', value: 'no' } ],
      showIf: function (a) { return a.hwacheon === 'yes'; }
    }
  ];

  var answers = {};
  var root;

  function visibleQuestions() {
    var out = [];
    for (var i = 0; i < QUESTIONS.length; i++) {
      var q = QUESTIONS[i];
      if (!q.showIf || q.showIf(answers)) out.push(q);
    }
    return out;
  }

  function isDone() {
    var qs = visibleQuestions();
    for (var i = 0; i < qs.length; i++) if (!answers[qs[i].id]) return false;
    return true;
  }

  function resultHtml() {
    var r = [];
    if (answers.hwacheon === 'yes' && answers.criteria === 'yes') {
      r.push('<li><strong>지역인재 학교장 추천</strong>(4명) 또는 <strong>소프트웨어 역량 우수자</strong>(24명) 중 <u>한 곳</u>을 골라 특별전형에 지원할 수 있어요. 지역인재는 중학교 교장선생님의 추천서가 필요하니 담임선생님께 먼저 여쭤보세요.</li>');
    } else if (answers.hwacheon === 'yes') {
      r.push('<li><strong>소프트웨어 역량 우수자</strong> 전형(24명)에 지원할 수 있어요. 지역인재 조건을 정확히 모르겠다면 담임선생님께 성적·출결 기준을 확인해 보세요.</li>');
    } else {
      r.push('<li><strong>소프트웨어 역량 우수자</strong> 전형(24명)에 지원할 수 있어요. 지역인재 전형은 화천 지역 중학교 출신만 지원할 수 있어요.</li>');
    }
    r.push('<li>특별전형에서 떨어져도 12월 <strong>일반전형</strong>(4명)에 다시 지원할 수 있어요.</li>');
    r.push('<li>합격하면 입학을 포기하더라도 <strong>다른 전기·후기 고등학교(인문계 일반고 등)에 지원할 수 없어요</strong>. 다른 전기고에 먼저 합격한 경우에도 이 학교에 지원할 수 없어요.</li>');
    return '<div class="finder-result" role="status"><h3>이렇게 지원할 수 있어요</h3><ul>' + r.join('') + '</ul>' +
      '<p class="finder-foot">안내용 결과예요. 최종 자격은 담임선생님이나 학교 교무부(' + KAIH.school.tel + ')에 꼭 확인하세요.</p>' +
      '<button type="button" class="btn-ghost" data-reset>처음부터 다시</button></div>';
  }

  function render() {
    var qs = visibleQuestions();
    var html = '';
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i];
      html += '<fieldset class="finder-q"><legend><span class="finder-step">질문 ' + (i + 1) + '</span>' + q.text + '</legend>' +
        '<p class="finder-help">' + q.help + '</p><div class="finder-opts">';
      for (var j = 0; j < q.options.length; j++) {
        var o = q.options[j];
        var on = answers[q.id] === o.value;
        html += '<button type="button" class="opt' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" data-q="' + q.id + '" data-v="' + o.value + '">' + o.label + '</button>';
      }
      html += '</div></fieldset>';
    }
    if (isDone()) html += resultHtml();
    root.innerHTML = html;
  }

  function onClick(e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    if (btn.hasAttribute('data-reset')) {
      answers = {};
      render();
      return;
    }
    var q = btn.getAttribute('data-q');
    if (!q) return;
    answers[q] = btn.getAttribute('data-v');
    // 첫 질문 답이 바뀌면 뒤 질문 답은 초기화
    if (q === 'hwacheon') delete answers.criteria;
    render();
  }

  KAIH.initFinder = function (el) {
    root = el;
    root.addEventListener('click', onClick);
    render();
  };
})();
