// Version «One goal» (YBG-1877, round 4): a learning-platform home in the manner of Coursera's My learning.
// The page shows one goal card (the exam, how far along, the next lesson) and the subjects as plain rows.
(function () {
  var I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4.5M5 5h11.5l-2 4 2 4H5"/></svg>'
  };
  var planOpen = {};

  function top(m, phone, R) {
    var view = R.state.view;
    var items = [['Home', ' data-view="home"', view === 'home'], ['Lessons', ' data-view="lessons"', view === 'lessons'],
      [phone ? 'Tests' : 'Practice tests', R.go('The Practice tests page (/a2/practice_tests)'), false], ['Questions', ' data-view="questions"', view === 'questions'],
      ['Forum', R.go('The Forum (/a2/forums)'), false]];
    var nav = '<nav class="go-nav" aria-label="Member area">' + items.map(function (t) {
      return '<a href="#" class="go-nav-a' + (t[2] ? ' is-on' : '') + '"' + t[1] + (t[2] ? ' aria-current="page"' : '') + '>' + t[0] + '</a>';
    }).join('') + '</nav>';
    var me = '<div class="go-me-w"><button type="button" class="go-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '" aria-label="Your account"><img src="assets/avatar.png" alt="">' +
      (phone ? '' : '<span>' + R.NAME + '</span>') + I.chev + '</button>' + (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div>';
    return '<header class="go-top"><div class="go-top-in"><a href="#" class="go-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>' +
      (phone ? '' : nav) + '<div class="go-tools">' + me + '</div></div>' + (phone ? nav : '') + '</header>';
  }

  // Greeting with Claire's plan folded to one line; the whole plan opens in place
  function hello(m, R, phone) {
    var open = planOpen[m.key] != null ? planOpen[m.key] : m.done === 0 && !phone;
    var cs = m.cur > -1 ? m.steps[m.cur] : null;
    var line = cs ? '<p class="go-step">Claire\'s plan, step ' + (m.cur + 1) + ' of 4: <b>' + R.PLAN[cs.k].title + '</b></p>' : '';
    var steps = open ? '<div class="go-plan"><p class="go-plan-lead">Here\'s the game plan, simple and stress-free:</p><ol>' + m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      return '<li class="is-' + st.state + '"><span class="go-pn">' + (st.state === 'done' ? I.check : n + 1) + '</span><div><h3>' + p.title + '</h3><p>' + p.text + '</p></div></li>';
    }).join('') + '</ol></div>' : '';
    return '<section class="go-hi"><div class="go-hi-row"><div><h1>' + (m.done === 0 ? 'Welcome, ' : 'Welcome back, ') + R.NAME + '</h1>' + line + '</div>' +
      '<button type="button" class="go-plan-tg" data-gplan aria-expanded="' + open + '">' + (open ? 'Hide the plan' : 'See the whole plan') + I.chev + '</button></div>' + steps + '</section>';
  }

  // The one goal: the exam with the new features, Claire's own goal without them
  function goal(m, R) {
    var S = m.S, title, sub;
    if (m.nf && S.exam) {
      title = 'Your exam: ' + S.exam.long;
      sub = R.days(S.exam.days) + ' left' + (S.target ? ' · your school needs ' + S.target + '%' : '') + ' <a href="#" class="go-ch" data-view="settings">Change</a>';
    } else if (m.nf) {
      title = 'Your HESI A2 exam';
      sub = 'No exam date yet. <a href="#" class="go-ch" data-view="settings">Add the date</a>';
    } else {
      title = 'Your HESI A2 course';
      sub = 'Claire\'s goal: over 90% on the final practice test.';
    }

    var nextH, nextMeta, btn, where;
    if (m.next && S.done !== 'all') {
      var s = m.next.sec;
      nextH = m.next.title; nextMeta = (s.intro ? 'Intro section' : s.name) + ' · Lesson ' + (m.next.idx + 1) + ' of ' + s.total + (m.nf && S.lastStudied ? ' · last studied ' + S.lastStudied : '');
      btn = m.done === 0 ? 'Start learning' : 'Continue learning'; where = 'The lesson page: ' + nextH;
    } else if (m.nf && m.nextTest) {
      nextH = m.nextTest.name; nextMeta = m.nextTest.sec.name + ' · ' + m.nextTest.q + ' questions' + (m.nextTest.score != null ? ' · best so far ' + m.nextTest.score + '%' : '');
      btn = m.nextTest.score != null ? 'Retake the test' : 'Take the test'; where = 'The practice test: ' + nextH;
    } else {
      nextH = 'Practice tests'; nextMeta = 'All lessons are done. Score over 90%, and you\'re more than ready for the real exam.';
      btn = 'Go to practice tests'; where = 'The Practice tests page (/a2/practice_tests)';
    }

    var pct = m.total ? m.done / m.total * 100 : 0;
    var pace = m.nf ? R.pace(m) : null;
    var prog = m.done === 0
      ? '<p class="go-prog-t">' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + ' · videos of 6 to 9 minutes, each with a short quiz</p>'
      : '<div class="go-prog"><span class="go-prog-track" role="img" aria-label="' + Math.round(pct) + '% of lessons done"><i style="width:' + pct.toFixed(1) + '%"></i></span>' +
        '<p class="go-prog-t"><b>' + Math.round(pct) + '%</b> · ' + m.done + ' of ' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + (m.left ? '' : ' · all done') + '</p></div>';
    return '<section class="go-card" aria-label="Your goal"><div class="go-card-head">' +
      '<div><h2>' + title + (m.nf ? ' ' + R.tag() : '') + '</h2><p class="go-sub">' + sub + '</p></div></div>' + prog +
      (pace ? '<p class="go-pace' + (pace.warn ? ' is-warn' : '') + '">' + pace.text + ' ' + R.tag() + '</p>' : '') +
      '<div class="go-next"><div class="go-next-t"><h3>' + nextH + '</h3><p>' + nextMeta + '</p></div>' +
      '<a href="#" class="go-btn"' + R.go(where) + '>' + btn + I.arrow + '</a></div></section>';
  }

  function subjects(m, R) {
    var cur = m.next && m.S.done !== 'all' ? m.next.sec.id : null;
    var rows = m.mine.map(function (s) {
      var pct = s.done / s.total * 100, done = s.done >= s.total;
      return '<li class="go-row' + (done ? ' is-done' : '') + (s.id === cur ? ' is-here' : '') + '">' +
        '<div class="go-row-name"><a href="#" data-view="lessons">' + s.name + '</a></div>' +
        // A subject not started keeps its place in the row but shows no empty bar
        '<span class="go-row-bar' + (s.done ? '' : ' is-empty') + '"><i style="width:' + pct.toFixed(1) + '%"></i></span>' +
        '<span class="go-row-n">' + (done ? I.check + 'All ' + s.total + ' lessons' : s.done === 0 ? s.total + ' lessons' : s.done + ' of ' + s.total) + '</span>' + (m.nf && R.testsList(s, m) ? '<div class="go-row-tests">' + R.testsList(s, m) + '</div>' : '') + '</li>';
    }).join('');
    var off = m.nf && m.chosen && m.skipped.length
      ? '<p class="go-off">Not on your exam: ' + m.skipped.map(function (s) { return s.name; }).join(', ') + '. <a href="#" data-view="settings">Change in Exam settings</a></p>' : '';
    return '<section class="go-sec" aria-label="Subjects"><div class="go-sec-h"><h2>' + (m.chosen ? 'Subjects on your exam' : 'Subjects') + '</h2>' +
      (m.nf && m.taken.length ? R.tag() : '') + '<a href="#" class="go-link" data-view="lessons">All lessons' + I.right + '</a></div>' +
      R.testsLegend(m) + '<ul class="go-rows">' + rows + '</ul>' + off + '</section>';
  }

  function remind(m) {
    if (!m.nf || m.setup !== 'skipped') return '';
    return '<a href="#" class="go-remind" data-view="settings"><b>Set your goal:</b> tell us your exam date and subjects, and the plan counts only what is on your exam.<span>' + I.right + '</span></a>';
  }

  // Shared parts as sheets in the same column as the goal card
  function box(html) { return html ? '<div class="go-box">' + html + '</div>' : ''; }

  window.R4V = {
    render: function (m, phone) {
      var R = window.R4, v = R.state.view, cls = 'go' + (phone ? ' is-phone' : '');
      if (v === 'setup') {
        return '<div class="' + cls + ' is-setup"><header class="go-top"><div class="go-top-in"><span class="go-logo"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></span>' +
          '<span class="go-setup-n">Set your goal</span></div></header>' + R.setupView(m) + '</div>';
      }
      if (v === 'settings') return '<div class="' + cls + '">' + top(m, phone, R) + R.settingsView(m) + '</div>';
      if (v === 'lessons') return '<div class="' + cls + '">' + top(m, phone, R) + R.lessonsView(m) + '</div>';
      if (v === 'questions') return '<div class="' + cls + '">' + top(m, phone, R) + R.questionsView(m) + '</div>';
      return '<div class="' + cls + '">' + top(m, phone, R) + '<main class="go-wrap">' + hello(m, R, phone) + remind(m) + goal(m, R) + box(R.answers(m)) + box(R.diagnostic(m)) + subjects(m, R) + '</main></div>';
    },
    onClick: function (e, R) {
      var t = e.target.closest('[data-gplan]');
      if (!t) return false;
      planOpen[R.state.state] = t.getAttribute('aria-expanded') !== 'true';
      R.rerender();
      return true;
    }
  };
})();
