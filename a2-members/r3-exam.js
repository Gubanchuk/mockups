// Variant «My exam» (YBG-1877, round 3): Claire's plan as the spine, every number counts only the student's subjects.
(function () {
  var I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
  };
  var NEW = '<span class="ex-new">New</span>';
  var lastLeft = null;
  var planOpen = {};

  function top(phone, R) {
    var view = R.state.view;
    var items = [['Home', ' data-view="home"', view === 'home'], ['Lessons', ' data-view="lessons"', view === 'lessons'],
      ['Practice tests', R.go('The Practice tests page (/a2/practice_tests)'), false], ['Forum', R.go('The Forum (/a2/forums)'), false]];
    var tabs = items.map(function (t) {
      return '<a href="#" class="ex-tab' + (t[2] ? ' is-on' : '') + '"' + t[1] + (t[2] ? ' aria-current="page"' : '') + '>' + t[0] + '</a>';
    }).join('');
    var me = '<div class="ex-me-w"><button type="button" class="ex-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '"><img src="assets/avatar.png" alt="">' +
      (phone ? '' : '<span>' + R.NAME + '</span>' + I.chev) + '</button>' + (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div>';
    return '<header class="ex-top"><div class="ex-top-in">' +
      '<a href="#" class="ex-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>' +
      (phone ? '' : '<nav class="ex-tabs" aria-label="Member area">' + tabs + '</nav>') + me +
      '</div>' + (phone ? '<nav class="ex-tabs" aria-label="Member area">' + tabs + '</nav>' : '') + '</header>';
  }

  function plan(m, R, phone) {
    var steps = m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      var mark = st.state === 'done' ? I.check : String(n + 1);
      var extra = '';
      if (st.state === 'now' && st.k === 'lessons') {
        extra = '<div class="ex-step-bar" role="img" aria-label="' + m.done + ' of ' + m.total + ' lessons done"><i style="width:' + (m.done / m.total * 100).toFixed(1) + '%"></i></div>' +
          '<p class="ex-step-meta">' + m.done + ' of ' + m.total + ' lessons in your plan</p>';
      }
      if (st.state === 'now' && st.k === 'final') {
        extra = '<p class="ex-step-meta">' + finalShort(m) + '</p>';
      }
      return '<li class="ex-step is-' + st.state + '">' +
        '<span class="ex-dot" aria-hidden="true">' + mark + '</span>' +
        '<div class="ex-step-body"><h3>' + p.title + (st.isNew ? NEW : '') + '</h3>' +
        '<p>' + p.text + '</p>' + extra + '</div></li>';
    }).join('');
    // The plan is a band above the page: open for a new student on a computer, folded to one line otherwise
    // (on a phone the open plan would push the start button off the first screen)
    var open = planOpen[m.key] != null ? planOpen[m.key] : m.key === 'new' && !phone;
    var head = '<div class="ex-plan-hi"><h1 class="ex-hello">Hey there, ' + R.NAME + '! <span aria-hidden="true">👋</span></h1>' +
      '<p class="ex-lead">Here\'s the game plan, simple and stress-free:</p></div>';
    var toggle = '<button type="button" class="ex-plan-tg" data-plan aria-expanded="' + open + '">' + (open ? 'Hide the plan' : 'Show the plan') + I.chev + '</button>';
    var folded = '';
    if (!open && m.cur > -1) {
      var dots = m.steps.map(function (st, n) {
        return '<span class="ex-pd is-' + st.state + '">' + (st.state === 'done' ? I.check : n + 1) + '</span>';
      }).join('<i aria-hidden="true"></i>');
      var cs = m.steps[m.cur], cp = R.PLAN[cs.k];
      // Folded, the current step says where the student is, not the whole explanation
      var short = cs.k === 'lessons' ? m.done + ' of ' + m.total + ' lessons in your plan'
        : cs.k === 'final' ? finalShort(m) : cp.text;
      folded = '<div class="ex-plan-now"><div class="ex-pdots" role="img" aria-label="Step ' + (m.cur + 1) + ' of 5">' + dots + '</div>' +
        '<div class="ex-pcur"><h3>' + cp.title + (cs.isNew ? NEW : '') + '</h3><p>' + short + '</p></div></div>';
    }
    return '<section class="ex-plan' + (open ? ' is-open' : '') + '" aria-label="Game plan"><div class="ex-plan-in">' +
      '<div class="ex-plan-top">' + head + folded + toggle + '</div>' +
      (open ? '<ol class="ex-steps">' + steps + '</ol>' : '') + '</div></section>';
  }

  function finalShort(m) {
    return m.untaken ? m.untaken + ' practice test' + (m.untaken > 1 ? 's' : '') + ' left' : m.passed.length + ' of ' + m.myTests.length + " tests at Claire's 90% goal";
  }

  function now(m) {
    var h, meta, btn, note = '', where, pace = null;
    if (m.next && m.S.done !== 'all') {
      var s = m.next.sec;
      h = m.next.title;
      meta = s.name + ' · Lesson ' + (m.next.idx + 1) + ' of ' + s.total;
      btn = m.done === 0 ? 'Start learning' : 'Continue learning';
      where = 'The lesson page: ' + h;
      if (m.S.lastStudied) note = 'Last studied ' + m.S.lastStudied;
      pace = window.R3.pace(m);
    } else if (m.nextTest) {
      h = m.nextTest.name;
      meta = m.nextTest.sec.name + ' · ' + m.nextTest.q + ' questions' + (m.nextTest.score != null ? ' · your best so far ' + m.nextTest.score + '%' : '');
      btn = 'Take the test';
      where = 'The practice test: ' + h;
      note = 'All lessons in your subjects are done';
    } else {
      h = 'You\'re ready for the exam';
      meta = 'Every practice test in your subjects is at 90% or more';
      btn = 'Review practice tests';
      where = 'The Practice tests page (/a2/practice_tests)';
    }
    return '<section class="ex-now" aria-label="Up next">' +
      '<h2 class="ex-next">' + h + '</h2>' +
      '<p class="ex-next-meta">' + meta + '</p>' +
      '<div class="ex-act"><a href="#" class="ex-btn"' + window.R3.go(where) + '>' + btn + I.arrow + '</a>' + (note ? '<span class="ex-note">' + note + '</span>' : '') + '</div>' +
      (pace ? '<p class="ex-pace' + (pace.warn ? ' is-warn' : '') + '">' + pace.text + ' ' + NEW + '</p>' : '') +
      // A new reply sits under the main button, so it never pushes the button off the first screen
      window.R3.replyNotice(m) + '</section>';
  }

  function retakeLine(m) {
    var by = {};
    m.taken.forEach(function (t) { if (t.score < m.PASS) by[t.sec.name] = (by[t.sec.name] || 0) + 1; });
    var names = Object.keys(by).map(function (n) { return by[n] > 1 ? n + ' ×' + by[n] : n; });
    return names.length ? '<span class="ex-retake">To reach Claire\'s 90%, retake: ' + names.join(', ') + '.</span>' : '';
  }

  function chips(m, R) {
    var req = m.secs.filter(function (s) { return s.required; }).map(function (s) {
      return '<span class="ex-chip is-req">' + I.check + s.name + '</span>';
    }).join('');
    var opt = m.secs.filter(function (s) { return s.optional; }).map(function (s) {
      return '<button type="button" class="ex-chip is-opt' + (s.picked ? ' is-on' : '') + '" data-subject="' + s.id + '" aria-pressed="' + s.picked + '">' +
        '<span class="ex-box" aria-hidden="true">' + (s.picked ? I.check : '') + '</span>' + s.name + '</button>';
    }).join('');
    return '<div class="ex-chips">' + req + opt + '</div>';
  }

  function exam(m, R) {
    var S = m.S;
    var editing = !S.exam || R.state.edit === 'exam';
    var date = !editing
      ? '<div class="ex-days"><span class="ex-days-n">' + S.exam.days + '</span><span class="ex-days-t">' + (S.exam.days === 1 ? 'day' : 'days') + ' until your exam<b>' + S.exam.long + '</b><a href="#" class="ex-link" data-edit="exam">Change</a></span></div>' +
        '<p class="ex-target">' + (S.target ? 'Your school needs <b>' + S.target + '%</b>' : 'Score your school needs: <a href="#" class="ex-link" data-edit="exam">add it</a>') + '</p>'
      : '<div class="ex-ask"><span class="ex-ask-ic">' + I.cal + '</span><div><p class="ex-ask-q">' + (S.exam ? 'Change your exam details' : 'When is your exam?') + '</p>' +
        R.examForm(m) + (S.exam ? '' : '<p class="ex-ask-hint">Ask your school which score they need, too.</p>') + '</div></div>';
    var left = m.left > 0
      ? '<div class="ex-left"><span class="ex-left-n" data-left="' + m.left + '">' + m.left + '</span>' +
        '<span class="ex-left-t"><span>lessons left</span></span></div>'
      // All lessons done: the figure is the tests still to take, measured against the school's score
      : '<div class="ex-left"><span class="ex-left-n">' + (m.untaken || m.aboveBar) + '</span>' +
        '<span class="ex-left-t">' + (m.untaken ? 'practice test' + (m.untaken > 1 ? 's' : '') + ' left' : 'tests above ' + m.barLabel) +
        '<b>' + (m.aboveBar === m.taken.length ? 'All ' + m.taken.length + ' taken are above ' : m.aboveBar + ' of ' + m.taken.length + ' taken are above ') + m.barLabel + '.' +
        // Both bars in one place, named by subject: a second bare number next to the big one read as the same tests
        (S.target ? retakeLine(m) : '') + '</b></span></div>';
    var hint = S.chosen
      ? 'Biology, Chemistry, Anatomy and Physiology, and Critical Thinking depend on your school. Tap one to add it or take it off.'
      : 'Your school decides on Biology, Chemistry, Anatomy and Physiology, and Critical Thinking. Not sure yet? Keep them on and ask.';
    return '<section class="ex-exam" aria-label="Your exam">' +
      '<div class="ex-exam-head"><h2>Your exam</h2>' + NEW + '</div>' +
      '<div class="ex-exam-grid' + (editing ? ' is-editing' : '') + '">' +
        '<div class="ex-exam-date">' + date + '</div>' +
        '<div class="ex-exam-subj"><h3>Subjects on your exam' + R.tip(R.TIPS.subjects) + '</h3>' + chips(m, R) + '<p class="ex-hint">' + hint + '</p></div>' +
        left +
      '</div>' + R.courseBar(m) + '</section>';
  }

  function diagCell(s, m) {
    // The quiz itself lives in the intro row, in the column that carries its name
    if (s.intro) return '<td class="ex-c-diag">' + diagLink() + '</td>';
    if (s.diag == null) return '<td class="ex-c-diag"><span class="ex-dim">–</span></td>';
    var weak = s.diag <= 2;
    var bars = '';
    for (var i = 0; i < 5; i++) bars += '<i' + (i < s.diag ? ' class="on"' : '') + '></i>';
    return '<td class="ex-c-diag"><span class="ex-pips' + (weak ? ' is-weak' : '') + '" role="img" aria-label="' + s.diag + ' of 5 right">' + bars + '</span>' +
      '<span class="ex-diag-n">' + s.diag + ' of 5 right</span>' + (window.R3.needsFocus(s, m) ? '<span class="ex-focus">Focus here</span>' : '') + '</td>';
  }

  // Every test is a link: a taken one shows its score (green at or above the school's bar) and a Retake under Claire's 90%,
  // one not taken yet says "Take test N". Before a subject's lessons are done its tests are only mentioned, so nobody reads them as "take these first".
  function testsHtml(s, m) {
    var R = window.R3;
    var open = s.done >= s.total || s.tests.some(function (t) { return t.score != null; });
    if (!open) return '<span class="ex-dim">' + s.tests.length + ' practice test' + (s.tests.length > 1 ? 's' : '') + ' after the lessons</span>';
    return s.tests.map(function (t, i) {
      var go = R.go('The practice test: ' + t.name);
      if (t.score == null) return '<a href="#" class="ex-tact"' + go + '>Take test ' + (i + 1) + '</a>';
      return '<a href="#" class="ex-score ' + (t.score >= m.bar ? 'is-pass' : 'is-low') + '"' + go + '>Test ' + (i + 1) + ' · ' + t.score + '%</a>' +
        (t.score < m.PASS ? '<a href="#" class="ex-tact is-quiet"' + go + '>Retake</a>' : '');
    }).join('');
  }

  function diagLink() {
    return '<a href="#" class="ex-dlink"' + window.R3.go('The lesson page: Diagnostic Test') + '>Diagnostic quiz · lesson 4, 40 questions</a>';
  }

  function testsCell(s, m) {
    if (!s.tests.length) return '<td class="ex-c-tests"><span class="ex-dim">' + (s.intro ? '–' : 'No practice tests') + '</span></td>';
    return '<td class="ex-c-tests">' + testsHtml(s, m) + '</td>';
  }

  function subjects(m, R) {
    var rows = m.mine.map(function (s) {
      var pct = s.done / s.total * 100;
      var st = s.done >= s.total ? 'is-done' : (s.done > 0 ? 'is-going' : 'is-fresh');
      var isNext = m.next && m.next.sec.id === s.id && m.S.done !== 'all';
      return '<tr class="' + st + (isNext ? ' is-here' : '') + '">' +
        '<th scope="row"><span class="ex-sname">' + s.name + '</span>' + (s.optional ? '<span class="ex-stag">Depends on your school</span>' : '') + '</th>' +
        '<td class="ex-c-les"><span class="ex-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span><span class="ex-les-n">' +
          (s.done >= s.total ? I.check + 'All ' + s.total + ' done' : (s.done === 0 ? s.total + ' lessons' : s.done + ' of ' + s.total)) + '</span></td>' +
        diagCell(s, m) + testsCell(s, m) + '</tr>';
    }).join('');
    var off = m.skipped.length
      ? '<div class="ex-off"><span>Not on your exam:</span>' + m.skipped.map(function (s) {
          return '<button type="button" class="ex-off-chip" data-subject="' + s.id + '">' + I.plus + s.name + '</button>';
        }).join('') + '</div>'
      : '';
    return '<section class="ex-subjects" aria-label="Your subjects">' +
      '<div class="ex-sec-head"><h2>Your subjects</h2><a href="#" class="ex-link" data-view="lessons">All lessons</a></div>' +
      '<div class="ex-table-wrap"><table class="ex-table"><thead><tr><th scope="col">Subject</th><th scope="col">Lessons</th>' +
      '<th scope="col">Diagnostic quiz ' + NEW + R.tip(R.TIPS.diag) + '</th><th scope="col">Practice tests' + R.tip(R.TIPS.tests, 'end') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      off + '</section>';
  }

  function subjectsPhone(m) {
    var rows = m.mine.map(function (s) {
      var pct = s.done / s.total * 100;
      var focus = window.R3.needsFocus(s, m);
      // The intro row names the diagnostic quiz, so a new student finds it on a phone too
      var tests = s.tests.length ? testsHtml(s, m) : (s.intro ? diagLink() : '');
      return '<li class="ex-prow' + (s.done >= s.total ? ' is-done' : '') + '"><div class="ex-prow-top"><span class="ex-sname">' + s.name + '</span>' +
        '<span class="ex-les-n">' + (s.done >= s.total ? 'All ' + s.total + ' done' : (s.done === 0 ? s.total + ' lessons' : s.done + ' of ' + s.total)) + '</span></div>' +
        '<span class="ex-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span>' +
        ((s.diag != null && !s.intro) || tests ? '<div class="ex-prow-meta">' + (s.diag != null && !s.intro ? '<span class="ex-diag-n' + (focus ? ' is-weak' : '') + '">Diagnostic ' + s.diag + ' of 5 right' + (focus ? ' · focus here' : '') + '</span>' : '') + tests + '</div>' : '') +
        '</li>';
    }).join('');
    var off = m.skipped.length
      ? '<div class="ex-off"><span>Not on your exam:</span>' + m.skipped.map(function (s) {
          return '<button type="button" class="ex-off-chip" data-subject="' + s.id + '">' + I.plus + s.name + '</button>';
        }).join('') + '</div>'
      : '';
    // The diagnostic results are new on this page: say so on a phone too, next to what the hint explains
    return '<section class="ex-subjects" aria-label="Your subjects"><div class="ex-sec-head"><h2>Your subjects</h2></div>' +
      '<p class="ex-plegend">Diagnostic quiz results ' + NEW + window.R3.tip(window.R3.TIPS.diag, 'end') + '</p><ul class="ex-plist">' + rows + '</ul>' + off + '</section>';
  }

  function comments(m, R) {
    var list = m.S.comments;
    var body = list.length ? '<ul class="ex-clist">' + list.map(function (c) {
      // Two dates, each with its own word: when the student asked and when Claire replied
      return '<li><p class="ex-c-where">On <a href="#"' + R.go('The lesson page: ' + c.lesson) + '>' + c.lesson + '</a> · asked ' + c.time + '</p><p class="ex-c-q">' + R.esc(c.text) + '</p>' +
        (c.reply ? '<div class="ex-c-reply"><p class="ex-c-who">' + c.reply.name + ' replied ' + c.reply.time + '</p><p>' + R.esc(c.reply.text) + '</p></div>' : '') + '</li>';
    }).join('') + '</ul>'
      : '<p class="ex-empty">When you ask a question under a lesson, it shows up here with Claire\'s reply.</p>';
    return '<section class="ex-comments" aria-label="Your questions" data-qs><div class="ex-sec-head"><h2>Your questions</h2></div>' + body + '</section>';
  }

  window.R3V = {
    render: function (m, phone) {
      var R = window.R3;
      if (R.state.view === 'lessons') return '<div class="ex' + (phone ? ' is-phone' : '') + '">' + top(phone, R) + R.lessonsView(m) + '</div>';
      return '<div class="ex' + (phone ? ' is-phone' : '') + '">' + top(phone, R) +
        '<div class="ex-body">' + plan(m, R, phone) +
        '<main class="ex-work">' + now(m) + exam(m, R) + (phone ? subjectsPhone(m) : subjects(m, R)) + comments(m, R) + '</main>' +
        '</div></div>';
    },
    onClick: function (e, R) {
      var t = e.target.closest('[data-plan]');
      if (!t) return false;
      var k = R.state.state;
      planOpen[k] = t.getAttribute('aria-expanded') !== 'true';
      R.rerender();
      return true;
    },
    after: function (stage, m) {
      // Signature: the "lessons left" figure counts to its new value when a subject is added or taken off
      var els = stage.querySelectorAll('.ex-left-n');
      if (lastLeft != null && lastLeft.key === m.key && lastLeft.v !== m.left && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var from = lastLeft.v, to = m.left, t0 = performance.now();
        [].forEach.call(els, function (el) { el.classList.add('is-counting'); });
        (function tick(t) {
          var k = Math.min(1, (t - t0) / 520), e = 1 - Math.pow(1 - k, 4);
          var v = Math.round(from + (to - from) * e);
          [].forEach.call(els, function (el) { el.textContent = v; });
          if (k < 1) requestAnimationFrame(tick); else [].forEach.call(els, function (el) { el.classList.remove('is-counting'); });
        })(t0);
      }
      lastLeft = { key: m.key, v: m.left };
    }
  };
})();
