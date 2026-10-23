// Version «My exam» (YBG-1877, round 4): Claire's plan on a blue band, one goal under it, then the subjects.
// The exam details live in the band as one line; changing them is a separate Settings page.
(function () {
  var I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
  };
  var planOpen = {};

  function top(m, phone, R) {
    var view = R.state.view;
    var items = [['Home', ' data-view="home"', view === 'home'], ['Lessons', ' data-view="lessons"', view === 'lessons'],
      [phone ? 'Tests' : 'Practice tests', R.go('The Practice tests page (/a2/practice_tests)'), false], ['Questions', ' data-view="questions"', view === 'questions'],
      ['Forum', R.go('The Forum (/a2/forums)'), false]];
    var tabs = items.map(function (t) {
      return '<a href="#" class="ex-tab' + (t[2] ? ' is-on' : '') + '"' + t[1] + (t[2] ? ' aria-current="page"' : '') + '>' + t[0] + '</a>';
    }).join('');
    var me = '<div class="ex-me-w"><button type="button" class="ex-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '"><img src="assets/avatar.png" alt="">' +
      (phone ? '' : '<span>' + R.NAME + '</span>') + I.chev + '</button>' + (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div>';
    return '<header class="ex-top"><div class="ex-top-in">' +
      '<a href="#" class="ex-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>' +
      (phone ? '' : '<nav class="ex-tabs" aria-label="Member area">' + tabs + '</nav>') +
      '<div class="ex-tools">' + me + '</div>' +
      '</div>' + (phone ? '<nav class="ex-tabs" aria-label="Member area">' + tabs + '</nav>' : '') + '</header>';
  }

  // The exam goal is part of the plan band: one quiet line, the form is in Settings
  function examLine(m, R) {
    if (!m.nf) return '';
    var S = m.S, bits = [], add;
    if (S.exam) bits.push('<b>Exam on ' + S.exam.long + '</b>', R.days(S.exam.days) + ' left');
    else if (!S.target) bits.push('<b>No exam date or school score yet</b>');
    else bits.push('<b>No exam date yet</b>');
    if (S.target) bits.push('your school needs ' + S.target + '%');
    add = S.exam && S.target ? 'Change' : !S.exam && !S.target ? 'Add them' : S.exam ? "Add your school's score" : 'Add the date';
    var link = '<a href="#" class="ex-goal-ch" data-view="settings">' + add + '</a>';
    return '<p class="ex-goal">' + I.cal + bits.map(function (b) { return '<span>' + b + '</span>'; }).join('<i aria-hidden="true">·</i>') + link + R.tag() + '</p>';
  }

  function plan(m, R, phone) {
    var open = planOpen[m.key] != null ? planOpen[m.key] : m.done === 0 && !phone;
    var steps = m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      return '<li class="ex-step is-' + st.state + '"><span class="ex-dot" aria-hidden="true">' + (st.state === 'done' ? I.check : n + 1) + '</span>' +
        '<div class="ex-step-body"><h3>' + p.title + '</h3><p>' + p.text + '</p></div></li>';
    }).join('');
    var folded = '';
    if (!open && m.cur > -1) {
      var dots = m.steps.map(function (st, n) {
        return '<span class="ex-pd is-' + st.state + '">' + (st.state === 'done' ? I.check : n + 1) + '</span>';
      }).join('<i aria-hidden="true"></i>');
      var cs = m.steps[m.cur], cp = R.PLAN[cs.k];
      folded = '<div class="ex-plan-now"><div class="ex-pdots" role="img" aria-label="Step ' + (m.cur + 1) + ' of 4">' + dots + '</div>' +
        '<div class="ex-pcur"><span class="ex-pcur-k">Claire&#39;s plan, step ' + (m.cur + 1) + ' of 4</span><h3>' + cp.title + '</h3></div></div>';
    }
    var toggle = '<button type="button" class="ex-plan-tg" data-plan aria-expanded="' + open + '">' + (open ? 'Hide the plan' : 'Show the plan') + I.chev + '</button>';
    return '<section class="ex-plan' + (open ? ' is-open' : '') + '" aria-label="Game plan"><div class="ex-plan-in">' +
      '<div class="ex-plan-top"><div class="ex-plan-hi"><h1 class="ex-hello">Hey there, ' + R.NAME + '! <span aria-hidden="true">👋</span></h1>' +
        // Claire's line about the plan shows with the plan itself; folded, it read as a slogan
        (open ? '<p class="ex-lead">Here\'s the game plan, simple and stress-free:</p>' : '') + '</div>' +
        folded + toggle + '</div>' + examLine(m, R) +
      (open ? '<ol class="ex-steps">' + steps + '</ol>' : '') + '</div></section>';
  }

  // One goal: what to do now, and how far the plan has come
  function goal(m, R) {
    var h, meta, btn, note = '', where, pace = null;
    if (m.next && m.S.done !== 'all') {
      var s = m.next.sec;
      h = m.next.title;
      meta = (s.intro ? 'Intro section' : s.name) + ' · Lesson ' + (m.next.idx + 1) + ' of ' + s.total;
      btn = m.done === 0 ? 'Start learning' : 'Continue learning';
      where = 'The lesson page: ' + h;
      if (m.nf && m.S.lastStudied) note = 'Last studied ' + m.S.lastStudied + ' ' + R.tag();
      pace = m.nf ? R.pace(m) : null;
    } else if (!m.nf) {
      // The live site knows the lessons are done; the practice tests page is the next stop
      h = 'Time for the practice tests';
      meta = 'All lessons are done. Score over 90%, and you\'re more than ready for the real exam.';
      btn = 'Go to practice tests';
      where = 'The Practice tests page (/a2/practice_tests)';
    } else if (m.nextTest) {
      h = m.nextTest.name;
      meta = m.nextTest.sec.name + ' · ' + m.nextTest.q + ' questions' + (m.nextTest.score != null ? ' · best so far ' + m.nextTest.score + '%' : '');
      btn = m.nextTest.score != null ? 'Retake the test' : 'Take the test';
      where = 'The practice test: ' + h;
      note = m.untaken ? R.plural(m.untaken, 'practice test') + ' not taken yet' : m.passed.length + ' of ' + m.myTests.length + ' tests at 90% or more';
      pace = R.pace(m);
    } else {
      h = 'You\'re ready for the exam';
      meta = 'Every practice test in your subjects is at 90% or more.';
      btn = 'Review practice tests';
      where = 'The Practice tests page (/a2/practice_tests)';
    }
    var pct = m.total ? m.done / m.total * 100 : 0;
    // Nothing done yet: the size of the plan, not a zero and an empty bar
    if (m.done === 0) return goalBox(h, meta, btn, note, where, pace, m, R,
      '<p class="ex-prog-zero"><b>' + m.total + '</b> lessons' + (m.chosen ? ' in your plan' : '') + '. Lesson videos are 6 to 9 minutes, with a short quiz after each.</p>');
    // All lessons done: one line instead of a full bar that says nothing new
    if (!m.left) return goalBox(h, meta, btn, note, where, pace, m, R, '<p class="ex-prog-zero is-done">' + I.check + 'All ' + m.total + ' lessons done.</p>');
    var progress = '<div class="ex-prog"><div class="ex-prog-top"><span><b>' + m.done + '</b> of ' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + '</span>' +
      (m.left ? '<span>' + m.left + ' to go</span>' : '<span class="is-ok">' + I.check + 'All lessons done</span>') + '</div>' +
      '<div class="ex-prog-track" role="img" aria-label="' + m.done + ' of ' + m.total + ' lessons done"><i style="width:' + pct.toFixed(1) + '%"></i></div></div>';
    return goalBox(h, meta, btn, note, where, pace, m, R, progress);
  }

  function goalBox(h, meta, btn, note, where, pace, m, R, progress) {
    return '<section class="ex-goalbox" aria-label="Up next"><div class="ex-goal-main">' +
      '<h2 class="ex-next">' + h + '</h2><p class="ex-next-meta">' + meta + '</p>' +
      '<div class="ex-act"><a href="#" class="ex-btn"' + R.go(where) + '>' + btn + I.arrow + '</a>' + (note ? '<span class="ex-note">' + note + '</span>' : '') + '</div></div>' +
      '<div class="ex-goal-side"><h3 class="ex-side-h">' + (m.done === 0 ? 'The course' : 'Your progress') + '</h3>' + progress +
      (pace ? '<p class="ex-pace' + (pace.warn ? ' is-warn' : '') + '">' + pace.text + ' ' + R.tag() + '</p>' : '') + '</div></section>';
  }

  function subjects(m, R) {
    var cur = m.next && m.S.done !== 'all' ? m.next.sec.id : null;
    var rows = m.mine.map(function (s) {
      var pct = s.done / s.total * 100, full = s.done >= s.total;
      var extra = m.nf ? R.testsList(s, m) : '';
      // A subject not started has no empty bar: it read as a page still loading
      return '<li class="ex-row' + (full ? ' is-done' : '') + (s.id === cur ? ' is-here' : '') + '">' +
        '<div class="ex-row-top"><span class="ex-sname">' + s.name + (s.id === cur ? '<span class="ex-now">In progress</span>' : '') + '</span>' +
        '<span class="ex-les-n">' + (full ? I.check + 'All ' + s.total + ' lessons done' : (s.done === 0 ? s.total + ' lessons' : s.done + ' of ' + s.total + ' lessons')) + '</span></div>' +
        (s.done > 0 ? '<span class="ex-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span>' : '') + extra + '</li>';
    }).join('');
    var off = m.nf && m.chosen && m.skipped.length
      ? '<p class="ex-off">Not on your exam: ' + m.skipped.map(function (s) { return s.name; }).join(', ') + '. <a href="#" class="ex-link" data-view="settings">Change in Exam settings</a></p>'
      : '';
    return '<section class="ex-subjects" aria-label="Your subjects">' +
      '<div class="ex-sec-head"><h2>' + (m.chosen ? 'Subjects on your exam' : 'Subjects') + '</h2>' + (m.nf && m.taken.length ? R.tag() : '') + '<a href="#" class="ex-link" data-view="lessons">All lessons</a></div>' +
      R.testsLegend(m) + '<ul class="ex-rows">' + rows + '</ul>' + off + '</section>';
  }

  // Setup reminder for a student who skipped the first visit
  function skipped(m) {
    if (!m.nf || m.setup !== 'skipped') return '';
    return '<a href="#" class="ex-remind" data-view="settings">' + I.cal + '<span><b>Tell us about your exam</b> and your plan will count only your subjects.</span><span class="ex-remind-go">Set it up</span></a>';
  }

  // Shared parts sit in the page's run of sections, divided by rules
  function wrap(html) { return html ? '<section class="ex-part">' + html + '</section>' : ''; }

  window.R4V = {
    render: function (m, phone) {
      var R = window.R4, v = R.state.view, cls = 'ex' + (phone ? ' is-phone' : '');
      if (v === 'setup') {
        return '<div class="' + cls + ' is-setup"><header class="ex-top is-bare"><div class="ex-top-in"><span class="ex-logo"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></span></div></header>' +
          '<div class="ex-page">' + R.setupView(m) + '</div></div>';
      }
      if (v === 'settings') return '<div class="' + cls + '">' + top(m, phone, R) + '<div class="ex-page">' + R.settingsView(m) + '</div></div>';
      if (v === 'lessons') return '<div class="' + cls + '">' + top(m, phone, R) + '<div class="ex-page">' + R.lessonsView(m) + '</div></div>';
      if (v === 'questions') return '<div class="' + cls + '">' + top(m, phone, R) + '<div class="ex-page">' + R.questionsView(m) + '</div></div>';
      return '<div class="' + cls + '">' + top(m, phone, R) + plan(m, R, phone) +
        '<main class="ex-work">' + skipped(m) + goal(m, R) + wrap(R.answers(m)) + wrap(R.diagnostic(m)) + subjects(m, R) + '</main></div>';
    },
    onClick: function (e, R) {
      var t = e.target.closest('[data-plan]');
      if (!t) return false;
      planOpen[R.state.state] = t.getAttribute('aria-expanded') !== 'true';
      R.rerender();
      return true;
    }
  };
})();
