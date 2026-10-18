(function () {
  var C = window.A2_COURSE;
  var NAME = 'Jordan';
  var ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chevR: '<svg class="nav-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    chevD: '<svg class="nav-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l4-4-4-4M14 12H4"/></svg>',
    burger: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 9h22M5 16h22M5 23h22"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  // Student states. "progress" and "done" are sample students; numbers are consistent with the course data.
  var STATES = {
    new: {
      done: { introduction: 0 }, tests: {}, lastSection: null, lastStudied: null
    },
    progress: {
      done: { introduction: 4, biology: 13, chemistry: 6 },
      tests: { 'DIAGNOSTIC A2 TEST': 64, 'A2 Biology Practice Test': 92 },
      lastSection: 'chemistry', lastStudied: '2 days ago',
      correct: 53, incorrect: 17, studentsAvg: 33.5,
      comments: [
        { name: NAME, time: '2 days ago', lesson: 'The Cell', text: 'Is the cell membrane the same thing as the cell wall?',
          reply: { name: 'Claire Corter', admin: true, time: '1 day ago', text: 'Not quite: plant cells have both, animal cells only have a membrane. The next lesson, Cellular organelles, goes through it.' } }
      ]
    },
    done: {
      done: 'all',
      tests: { 'DIAGNOSTIC A2 TEST': 70,
        'A2 Vocabulary and General Knowledge Practice Test': 91, 'A2 Vocabulary and General Knowledge Practice Test 2': 93,
        'A2 Math Practice Test': 78, 'A2 Math Practice Test 2': 88,
        'A2 Anatomy and Physiology Practice Test': 91, 'A2 Anatomy and Physiology Practice Test 2': 94,
        'A2 Grammar Practice Test': 85,
        'A2 Biology Practice Test': 92, 'A2 Biology Practice Test 2': 95,
        'A2 Chemistry Practice Test': 77 },
      lastSection: 'practice', lastStudied: 'yesterday',
      correct: 379, incorrect: 86, studentsAvg: 33.5,
      comments: [
        { name: NAME, time: '3 weeks ago', lesson: 'Ratios and Proportions', text: 'For dosage questions, should I always set it up as a proportion?',
          reply: { name: 'Claire Corter', admin: true, time: '3 weeks ago', text: 'Yes, it is the safest way under time pressure. Write what you know on the left and what you need on the right.' } },
        { name: NAME, time: '1 month ago', lesson: 'Prepositions II: Time', text: 'Is it "on the weekend" or "at the weekend" on the exam?',
          reply: { name: 'Claire Corter', admin: true, time: '1 month ago', text: 'The A2 uses American English, so "on the weekend".' } }
      ]
    }
  };

  var state = { state: 'progress', screen: 'laptop', page: 'new', side: 'open', pick: null, planOpen: { new: true, progress: false, done: false } };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // A practice test counts as passed at 90% or more: the goal in Claire's plan ("score over 90%").
  var PASS = 90;
  function isPassed(S, t) { return S.tests[t.name] != null && S.tests[t.name] >= PASS; }

  // Derived model for a student state
  function model(key) {
    var S = STATES[key];
    var secs = C.sections.map(function (s) {
      var n = S.done === 'all' ? s.lessons.length : (S.done[s.id] || 0);
      var tests = C.practiceTests.filter(function (t) { return t.subject === s.id || (s.id === 'introduction' && t.subject === null); });
      return { id: s.id, name: s.name, icon: s.icon, lessons: s.lessons, done: n, total: s.lessons.length, tests: tests };
    });
    var lessonsDone = secs.reduce(function (a, s) { return a + s.done; }, 0);
    var testsTaken = Object.keys(S.tests).length;
    var testsPassed = C.practiceTests.filter(function (t) { return isPassed(S, t); }).length;
    var answered = C.practiceTests.reduce(function (a, t) { return a + (S.tests[t.name] != null ? t.q : 0); }, 0);
    // Where the student is: the section after the last completed lesson (as Continue learning works on the site)
    var here;
    if (S.done === 'all') here = secs.length;            // the practice tests stop
    else if (!S.lastSection) here = 0;
    else {
      here = secs.findIndex(function (s) { return s.id === S.lastSection; });
      if (secs[here].done >= secs[here].total) here = Math.min(here + 1, secs.length);
    }
    return { key: key, S: S, secs: secs, lessonsDone: lessonsDone, lessonsTotal: 105, testsTaken: testsTaken, testsPassed: testsPassed, testsTotal: C.practiceTests.length,
      answered: answered, questions: 660, here: here };
  }

  function stopStatus(m, i) {
    if (i === m.secs.length) return m.lessonsDone === m.lessonsTotal ? (i === m.here ? 'here' : 'next') : 'next';
    var s = m.secs[i];
    if (s.done >= s.total) return i === m.here ? 'here' : 'done';
    return i === m.here ? 'here' : 'next';
  }

  // ---------- shell ----------
  function sidebar(m) {
    if (state.side === 'closed') {
      return '<aside class="side is-rail" aria-label="Member area menu">' +
        '<button class="side-toggle" data-side="toggle" aria-label="Expand the menu" aria-expanded="false">' + ICON.panel + '</button>' +
        '<nav class="rail">' +
          '<a class="rail-item is-active" href="#" aria-label="Dashboard" aria-current="page"><img src="assets/ic-dashboard.svg" alt=""></a>' +
          '<a class="rail-item" href="#" aria-label="Lessons"><img src="assets/ic-book.svg" alt=""></a>' +
          '<a class="rail-item" href="#" aria-label="Practice tests"><img src="assets/ic-practice.svg" alt=""></a>' +
          '<a class="rail-item" href="#" aria-label="Forums"><img src="assets/ic-forum.svg" alt=""></a>' +
        '</nav></aside>';
    }
    var secs = m.secs.map(function (s) {
      var full = s.done >= s.total;
      return '<li><a href="#"><img src="assets/' + s.icon + '" alt="">' + esc(s.name) +
        '<span class="sec-count' + (full ? ' is-full' : '') + '">(' + s.done + '/' + s.total + ')</span>' + ICON.chevR + '</a></li>';
    }).join('');
    var full = m.lessonsDone === m.lessonsTotal;
    return '<aside class="side" aria-label="Member area menu">' +
      '<button class="side-toggle" data-side="toggle" aria-label="Collapse the menu" aria-expanded="true">' + ICON.panel + '</button>' +
      '<a class="nav-item is-active" href="#" aria-current="page"><img src="assets/ic-dashboard.svg" alt="">Dashboard</a>' +
      '<a class="nav-item" href="#"><img src="assets/ic-book.svg" alt="">Lessons<span class="nav-count' + (full ? ' is-full' : '') + '">(' + m.lessonsDone + '/105 completed)</span>' + ICON.chevD + '</a>' +
      '<ul class="nav-secs">' + secs + '</ul>' +
      '<a class="nav-item" href="#"><img src="assets/ic-practice.svg" alt="">Practice tests</a>' +
      '<a class="nav-item" href="#"><img src="assets/ic-forum.svg" alt="">Forums</a>' +
    '</aside>';
  }
  function topbar() {
    return '<header class="top">' +
      '<img class="top-logo" src="assets/a2-logo.png" alt="Your Best Grade — HESI A2 MasterClass" width="1064" height="336">' +
      '<div class="top-right"><a class="top-profile" href="#"><img src="assets/avatar.png" alt="">My Profile</a><a class="top-out" href="#" aria-label="Log out">' + ICON.out + '</a></div>' +
      '<button class="burger" aria-label="Menu">' + ICON.burger + '</button>' +
    '</header>';
  }
  function footer() {
    return '<footer class="foot"><nav><a href="#">Terms and Conditions</a><a href="#">Privacy Policy</a><a href="#">support@yourbestgrade.com</a></nav>' +
      '<div>© 2026 Your Best Grade, Inc. All Rights Reserved.</div>' +
      '<div>HESI ® is a registered trademark of Elsevier Inc. NCLEX ® is a registered trademark of the NCSBN, Inc.</div></footer>';
  }

  // ---------- route ----------
  function route(m, picked) {
    var n = m.secs.length + 1;
    var fillTo = Math.min(m.here, n - 1);
    if (m.here < m.secs.length) fillTo += m.secs[m.here].done / m.secs[m.here].total;
    var stops = m.secs.map(function (s, i) {
      var st = stopStatus(m, i);
      return stop(i, st, s.icon, s.name, s.done + '/' + s.total, picked === i);
    });
    stops.push(stop(m.secs.length, stopStatus(m, m.secs.length), 'ic-practice.svg', 'Practice tests 90%+', m.testsPassed + '/' + m.testsTotal, picked === m.secs.length));
    return '<ol class="route" style="--p:' + (fillTo / (n - 1)) + '">' +
      '<span class="route-track" aria-hidden="true"></span><span class="route-fill" aria-hidden="true"></span>' + stops.join('') + '</ol>';
  }
  function stop(i, st, icon, name, count, isPicked) {
    var cls = 'stop is-' + st + (isPicked ? ' is-picked' : '');
    return '<li class="' + cls + '"><button class="stop-btn" data-stop="' + i + '" aria-pressed="' + (isPicked ? 'true' : 'false') + '">' +
      '<span class="stop-here">' + (st === 'here' ? '<span>You are here</span>' : '') + '</span>' +
      '<span class="stop-dot"><img src="assets/' + icon + '" alt=""></span>' +
      '<span class="stop-name">' + esc(name) + '</span><span class="stop-count">' + count + '</span></button></li>';
  }

  // ---------- now card ----------
  function nowCard(m, idx, phone) {
    var isHere = idx === m.here;
    var back = isHere ? '' : '<button class="now-back" data-stop="' + m.here + '">Back to where you are</button>';
    if (idx === m.secs.length) return testsCard(m, isHere, back);
    var s = m.secs[idx];
    var next = Math.min(s.done, s.total - 1);
    var complete = s.done >= s.total;
    var title = complete ? 'All ' + s.total + ' lessons done' : s.lessons[next];
    var pos = complete ? s.total + ' of ' + s.total + ' lessons' : 'Lesson ' + (next + 1) + ' of ' + s.total;
    var label = m.lessonsDone === 0 ? 'Start learning' : (isHere ? 'Continue learning' : 'Open this lesson');
    var act = complete ? '<a class="btn" href="#">Review ' + esc(s.name) + ICON.arrow + '</a>' : '<a class="btn" href="#">' + label + ICON.arrow + '</a>';
    // lessons window around the next lesson
    var win = phone ? 4 : 6;
    var from = Math.max(0, next - (phone ? 1 : 2)), to = Math.min(s.total, from + win);
    if (to - from < win) from = Math.max(0, to - win);
    var items = '';
    for (var k = from; k < to; k++) {
      var cls = k < s.done ? 'is-done' : (k === next && !complete ? 'is-next' : '');
      items += '<li class="' + cls + '"><span class="mark">' + (k < s.done ? ICON.check : '') + '</span><span>' + esc(s.lessons[k]) + '</span></li>';
    }
    var left = s.total - to;
    var more = left > 0 ? '<span class="more">+ ' + left + ' more lesson' + (left > 1 ? 's' : '') + '</span>' : '';
    var before = from > 0 ? '<span class="more more--before">' + ICON.check + from + ' completed above</span>' : '';
    var passed = s.tests.filter(function (t) { return isPassed(m.S, t); }).length;
    var tests = s.tests.length ? '<ul class="tests">' + s.tests.map(function (t) { return testRow(m, t); }).join('') + '</ul>'
      : '<p class="tests-none">This section has no practice test. Its questions are inside the lessons.</p>';
    return '<section class="sheet now" aria-live="polite">' +
      '<h2 class="now-title">' + esc(title) + '</h2>' +
      '<p class="now-sub"><img src="assets/' + s.icon + '" alt="">' + esc(s.name) + '<span class="dot">·</span>' + pos + '</p>' +
      '<div class="now-act">' + act + back + '</div>' +
      '<div class="now-split">' +
        '<div><h3 class="mini-h">Lessons Completed<b>' + s.done + ' / ' + s.total + '</b></h3>' + before + '<ul class="lessons">' + items + '</ul>' + more + '</div>' +
        '<div><h3 class="mini-h">Tests Passed<b>' + (s.tests.length ? passed + ' / ' + s.tests.length : '—') + '</b></h3>' + tests + '</div>' +
      '</div>' +
    '</section>';
  }
  function testRow(m, t, isNext) {
    var sc = m.S.tests[t.name];
    return '<li' + (isNext ? ' class="is-next"' : '') + '><span class="t-name">' + esc(t.name) + '</span><span class="t-row">' + t.q + ' questions' +
      (sc != null ? '<span class="t-score' + (sc >= PASS ? ' is-pass' : '') + '">My score ' + sc + '%</span>' : '<a href="#">Take this test</a>') + '</span></li>';
  }
  function testsCard(m, isHere, back) {
    var allDone = m.lessonsDone === m.lessonsTotal;
    var nextTest = C.practiceTests.filter(function (t) { return m.S.tests[t.name] == null; })[0];
    var title = nextTest ? nextTest.name : 'All practice tests taken';
    return '<section class="sheet now" aria-live="polite">' +
      '<h2 class="now-title">' + esc(title) + '</h2>' +
      '<p class="now-sub"><img src="assets/ic-practice.svg" alt="">Practice tests<span class="dot">·</span>' + m.testsTaken + ' of ' + m.testsTotal + ' taken · ' + m.testsPassed + ' at 90% or more</p>' +
      '<p class="now-goal">Finish with a final test – score over 90%, and you\'re more than ready for the real exam!</p>' +
      '<div class="now-act"><a class="btn" href="#">Go to practice tests' + ICON.arrow + '</a>' + back + '</div>' +
      '<div class="now-split">' +
        '<div><h3 class="mini-h">Not taken yet<b>' + (m.testsTotal - m.testsTaken) + '</b></h3><ul class="tests">' +
          C.practiceTests.filter(function (t) { return m.S.tests[t.name] == null; }).slice(0, 3).map(function (t, i) { return testRow(m, t, i === 0); }).join('') + '</ul>' +
          (m.testsTotal - m.testsTaken > 3 ? '<span class="more">+ ' + (m.testsTotal - m.testsTaken - 3) + ' more tests</span>' : '') + '</div>' +
        '<div><h3 class="mini-h">Taken<b>' + m.testsTaken + '</b></h3>' + (m.testsTaken ? '<ul class="tests">' +
          C.practiceTests.filter(function (t) { return m.S.tests[t.name] != null; }).slice(-3).map(function (t) { return testRow(m, t); }).join('') + '</ul>'
          : '<p class="tests-none">No practice tests taken yet.</p>') + '</div>' +
      '</div>' +
    '</section>';
  }

  // ---------- statistics ----------
  function stats(m) {
    var S = m.S;
    var lessonsPct = m.lessonsDone / m.lessonsTotal * 100;
    var head = '<h2 class="h2">Your Statistics</h2><p class="sub">Track your progress</p>' +
      stat('Lessons completed', m.lessonsDone + ' / ' + m.lessonsTotal, lessonsPct) +
      stat('Tests passed', m.testsPassed + ' / ' + m.testsTotal, m.testsPassed / m.testsTotal * 100);
    if (!m.answered) {
      return '<section class="sheet stats">' + head +
        '<p class="stats-empty">Your practice test results will appear here after your first test.</p></section>';
    }
    var perf = Math.round(S.correct / (S.correct + S.incorrect) * 1000) / 10;
    var scores = Object.keys(S.tests).map(function (k) { return S.tests[k]; });
    var myAvg = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length * 10) / 10;
    return '<section class="sheet stats">' + head +
      stat('Progression', m.answered + '/' + m.questions + ' questions', m.answered / m.questions * 100) +
      '<div class="stat"><div class="stat-top">Performance<b>' + perf + '%</b></div><div class="bar"><i style="--w:' + perf + '%"></i></div>' +
        '<div class="stat-note"><span class="ok">' + S.correct + ' total correct</span><span class="no">' + S.incorrect + ' total incorrect</span></div></div>' +
      '<div class="stat"><div class="stat-top">Comparative Performance<b>' + myAvg + '%</b></div>' +
        '<div class="compare" style="--w:' + myAvg + '%;--avg:' + S.studentsAvg + '%"><i></i><em></em></div>' +
        '<div class="stat-note"><span>my average</span><span>' + S.studentsAvg + '% students\' average</span></div></div>' +
    '</section>';
  }
  function stat(label, value, pct) {
    return '<div class="stat"><div class="stat-top">' + label + '<b>' + value + '</b></div><div class="bar"><i style="--w:' + pct + '%"></i></div></div>';
  }

  // ---------- game plan (texts as on the site) ----------
  function plan(m) {
    if (!state.planOpen[m.key]) {
      return '<section class="sheet plan-show"><span>Here\'s the game plan — simple and stress-free</span><button class="link-btn" data-plan="open">Show</button></section>';
    }
    return '<section class="sheet plan"><button class="plan-close" data-plan="close" aria-label="Hide the game plan">' + ICON.close + '</button>' +
      '<p class="plan-intro">Here\'s the game plan — simple and stress-free:</p><ol class="plan-steps">' +
      '<li><span class="em" aria-hidden="true">👉</span><span>Start with the <a href="#">intro section</a> – it\'ll show you how everything works around here</span></li>' +
      '<li><span class="em" aria-hidden="true">🧠</span><span>Take a quick <a href="#">diagnostic quiz</a> – to see where you\'re strong and where you can grow</span></li>' +
      '<li><span class="em" aria-hidden="true">📅</span><span>Learn a little each day – go lesson by lesson, take the short quizzes, and just keep moving (no pressure, no burnout — just steady progress)</span></li>' +
      '<li><span class="em" aria-hidden="true">🏁</span><span>Finish with a <a href="#">final test</a> – score over 90%, and you\'re more than ready for the real exam!</span></li>' +
      '</ol></section>';
  }

  // ---------- comments ----------
  function comments(m) {
    var list = m.S.comments || [];
    var body = list.length ? '<ul class="c-list">' + list.map(function (c) {
      return '<li class="c-item">' + cHead(c) + '<p class="c-where">in <a href="#">' + esc(c.lesson) + '</a></p><p class="c-text">' + esc(c.text) + '</p><button class="c-reply">Reply</button>' +
        (c.reply ? '<div class="c-sub">' + cHead(c.reply) + '<p class="c-text">' + esc(c.reply.text) + '</p></div>' : '') + '</li>';
    }).join('') + '</ul>'
      : '<p class="c-empty">When you ask a question under a lesson, it and the replies will show up here.</p>';
    return '<section class="sheet comments"><h2 class="h2">Recent Comments</h2><p class="sub">Your questions and the replies to them</p>' + body + '</section>';
  }
  function cHead(c) {
    return '<div class="c-head"><img src="assets/avatar.png" alt=""><span class="c-name">' + esc(c.name) + '</span>' + (c.admin ? '<span class="c-badge">Admin</span>' : '') + '<span class="c-time">' + esc(c.time) + '</span></div>';
  }


  // ================= Version 2: the game plan as a live checklist =================
  var VERSION = document.body.getAttribute('data-version') || 'path';
  var NEW = '<span class="new-tag">New</span>';
  var ICON2 = {
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 21V4"/><path d="M5.5 4.5h11l-2.2 4 2.2 4h-11"/></svg>'
  };

  function avg(S) {
    var v = Object.keys(S.tests).map(function (k) { return S.tests[k]; });
    return v.length ? Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length * 10) / 10 : null;
  }

  function planSteps(m) {
    var intro = m.secs[0];
    var diag = m.S.tests['DIAGNOSTIC A2 TEST'];
    var lessonsOnly = m.lessonsDone - intro.done;
    var steps = [
      { k: 'intro', icon: '<img src="assets/sec-introduction.svg" alt="">', title: 'Start with the intro section',
        text: 'See how everything works around here.', done: intro.done >= intro.total,
        meta: intro.done + ' of ' + intro.total + ' lessons' },
      { k: 'diag', icon: ICON2.target, title: 'Take the diagnostic quiz',
        text: 'Find where you\'re strong and where you can grow.', done: diag != null,
        meta: diag != null ? 'Your score ' + diag + '%' : '40 questions' },
      { k: 'lessons', icon: '<img src="assets/ic-book.svg" alt="">', title: 'Learn a little each day',
        text: 'Lesson by lesson, with the short quizzes. No pressure, just steady progress.', done: m.lessonsDone >= m.lessonsTotal,
        meta: lessonsOnly + ' of ' + (m.lessonsTotal - intro.total) + ' lessons after the intro' },
      { k: 'final', icon: ICON2.flag, title: 'Finish with a final test',
        text: 'Score over 90% and you\'re more than ready for the real exam.', done: false,
        meta: m.testsTaken + ' of ' + m.testsTotal + ' tests taken, ' + m.testsPassed + ' at 90%+' }
    ];
    var cur = steps.findIndex(function (s) { return !s.done; });
    steps.forEach(function (s, i) { s.state = s.done ? 'done' : (i === cur ? 'now' : 'next'); });
    return steps;
  }

  function stepDetail(m, step) {
    var a = m.lessonsDone === 0 ? 'Start learning' : 'Continue learning';
    if (step.k === 'intro' || step.k === 'lessons') {
      var s = m.secs[m.here] || m.secs[0];
      var next = Math.min(s.done, s.total - 1);
      return '<div class="step-now"><p class="step-now-title">' + esc(s.lessons[next]) + '</p>' +
        '<p class="step-now-sub"><img src="assets/' + s.icon + '" alt="">' + esc(s.name) + '<span class="dot">·</span>Lesson ' + (next + 1) + ' of ' + s.total + '</p>' +
        '<a class="btn" href="#">' + a + ICON.arrow + '</a></div>';
    }
    if (step.k === 'diag') {
      return '<div class="step-now"><p class="step-now-title">DIAGNOSTIC A2 TEST</p><p class="step-now-sub">40 questions</p>' +
        '<a class="btn" href="#">Take this test' + ICON.arrow + '</a></div>';
    }
    var nextTest = C.practiceTests.filter(function (t) { return m.S.tests[t.name] == null; })[0];
    return '<div class="step-now"><p class="step-now-title">' + esc(nextTest.name) + '</p><p class="step-now-sub">Next practice test<span class="dot">·</span>' + nextTest.q + ' questions</p>' +
      '<a class="btn" href="#">Go to practice tests' + ICON.arrow + '</a></div>';
  }

  function planBoard(m) {
    var steps = planSteps(m);
    var hello = '<h1 class="hello">Hey there, ' + NAME + '! 👋</h1>';
    var last = m.S.lastStudied ? '<p class="last">Last studied ' + m.S.lastStudied + NEW + '</p>' : '';
    var items = steps.map(function (st, i) {
      var badge = st.state === 'done' ? '<span class="step-badge is-done">' + ICON.check + '</span>' : '<span class="step-badge">' + (i + 1) + '</span>';
      var label = st.state === 'done' ? 'Done' : (st.state === 'now' ? 'You are here' : '');
      return '<li class="step is-' + st.state + '"><div class="step-top">' + badge + '<span class="step-ico">' + st.icon + '</span>' + (label ? '<span class="step-label">' + label + '</span>' : '') + '</div>' +
        '<h2 class="step-title">' + st.title + '</h2><p class="step-text">' + st.text + '</p><p class="step-meta">' + st.meta + '</p>' +
        (st.state === 'now' ? stepDetail(m, st) : '') + '</li>';
    }).join('');
    return '<section class="sheet board"><div class="board-head">' + hello + last + '</div>' +
      '<p class="board-intro">Here\'s the game plan — simple and stress-free</p><ol class="steps">' + items + '</ol></section>';
  }

  function readiness(m) {
    var my = avg(m.S);
    var head = '<h2 class="h2">Exam readiness' + NEW + '</h2><p class="sub">Your average on the practice tests, against the 90% goal</p>';
    if (my == null) {
      return '<section class="sheet ready">' + head + '<p class="stats-empty">Your average shows up here after the diagnostic quiz, step 2 of the plan.</p></section>';
    }
    var gap = Math.max(0, Math.round((90 - my) * 10) / 10);
    return '<section class="sheet ready">' + head +
      '<div class="ready-num"><b>' + my + '%</b><span>' + (gap ? gap + ' points to the 90% goal' : 'Over the 90% goal') + '</span></div>' +
      '<div class="ready-bar" style="--w:' + my + '%;--avg:' + m.S.studentsAvg + '%"><i></i><em class="goal"></em><em class="crowd"></em></div>' +
      '<div class="ready-scale"><span>' + m.S.studentsAvg + '% students\' average</span><span>Goal 90%</span></div></section>';
  }

  function sectionsList(m) {
    var rows = m.secs.map(function (s) {
      var pct = Math.round(s.done / s.total * 100);
      var passed = s.tests.filter(function (t) { return isPassed(m.S, t); }).length;
      return '<li><img src="assets/' + s.icon + '" alt=""><span class="sl-name">' + esc(s.name) + '</span>' +
        '<span class="sl-bar"><i style="--w:' + pct + '%"></i></span><span class="sl-count' + (s.done >= s.total ? ' is-full' : '') + '">' + s.done + '/' + s.total + '</span>' +
        '<span class="sl-tests' + (passed ? ' is-on' : '') + '">' + (s.tests.length ? passed + ' / ' + s.tests.length : '—') + '</span></li>';
    }).join('');
    return '<section class="sheet slist"><h2 class="h2">Learning Progress</h2><p class="sub">Track your progress by subject</p>' +
      '<div class="sl-head"><span>Lessons Completed</span><span>Tests Passed</span></div><ul class="sl">' + rows + '</ul></section>';
  }

  function stats2(m) {
    if (!m.answered) return '';
    var S = m.S, perf = Math.round(S.correct / (S.correct + S.incorrect) * 1000) / 10;
    return '<section class="sheet stats"><h2 class="h2">Your Statistics</h2><p class="sub">Track your progress</p>' +
      stat('Progression', m.answered + '/' + m.questions + ' questions', m.answered / m.questions * 100) +
      '<div class="stat"><div class="stat-top">Performance<b>' + perf + '%</b></div><div class="bar"><i style="--w:' + perf + '%"></i></div>' +
      '<div class="stat-note"><span class="ok">' + S.correct + ' total correct</span><span class="no">' + S.incorrect + ' total incorrect</span></div></div></section>';
  }

  function page2(key, phone) {
    var m = model(key);
    var content = planBoard(m) +
      (phone ? readiness(m) + sectionsList(m) + stats2(m)
             : '<div class="row2 row2--plan">' + sectionsList(m) + '<div class="col">' + readiness(m) + stats2(m) + '</div></div>') +
      comments(m);
    return '<div class="app v2' + (phone ? ' is-phone' : '') + (state.side === 'closed' ? ' is-collapsed' : '') + '">' + (phone ? '' : sidebar(m)) +
      '<div class="main">' + topbar() + content + footer() + '</div></div>';
  }


  // ================= "As now": the current live dashboard content, for comparison =================
  // Copied from beta /a2/members (06.10.2026): same blocks, same texts, same "0 / 0" Tests Passed.
  function pageNow(key, phone) {
    var m = model(key);
    var started = m.lessonsDone > 0;
    var btn = '<a class="ln-btn" href="#">' + (started ? 'Continue learning' : 'Start learning') + '</a>';
    var hello = '<section class="sheet ln-hello"><span class="ln-x" aria-hidden="true">' + ICON.close + '</span>' +
      '<h1 class="ln-h1">Hey there, ' + NAME + ' ! 👋</h1>' +
      '<p class="ln-intro">Here\'s the game plan — simple and stress-free:</p><ul class="ln-plan">' +
      '<li>👉 Start with the <b>intro section</b> – it\'ll show you how everything works around here</li>' +
      '<li>🧠 Take a quick <b>diagnostic quiz</b> – to see where you\'re strong and where you can grow</li>' +
      '<li>📅 Learn a little each day – go lesson by lesson, take the short quizzes , and just keep moving (no pressure, no burnout — just steady progress)</li>' +
      '<li>🏁 Finish with a <b>final test</b> – score over 90%, and you\'re more than ready for the real exam!</li></ul>' +
      (m.lessonsDone < m.lessonsTotal ? btn : '') + '</section>';
    var rows = m.secs.map(function (s) {
      var pct = Math.round(s.done / s.total * 100);
      return '<li><span class="ln-bar"><i style="--w:' + pct + '%"></i><span>' + esc(s.name) + ' (' + s.done + '/' + s.total + ')</span><b>' + pct + '%</b></span><span class="ln-tp">0 / 0</span></li>';
    }).join('');
    var progress = '<section class="sheet ln-card"><h2 class="h2">Learning Progress</h2><p class="sub">Track your progress by subject</p>' +
      '<div class="ln-head"><span>Lessons Completed</span><span>Tests Passed</span></div><ul class="ln-rows">' + rows + '</ul>' +
      '<div class="ln-total"><span class="ln-check" aria-hidden="true">' + ICON.check + '</span><span>You\'ve completed ' + m.lessonsDone + ' out of 105 lessons so far — keep it up!</span><b>Total 0 / 0</b></div>' +
      '<div class="ln-foot">' + (m.lessonsDone < m.lessonsTotal ? btn : '') + '<a href="#">Go to practice tests</a></div></section>';
    var S = m.S, perf = m.answered ? Math.round(S.correct / (S.correct + S.incorrect) * 1000) / 10 : 0;
    var scores = Object.keys(S.tests).map(function (k) { return S.tests[k]; });
    var myAvg = scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length * 10) / 10 : 0;
    var crowd = m.answered ? S.studentsAvg : 0;
    var qPct = Math.round(m.answered / m.questions * 100);
    var stats = '<section class="sheet ln-card"><h2 class="h2">Your Statistics</h2><p class="sub">Track your progress</p>' +
      '<p class="ln-label">Progression</p><span class="ln-bar ln-bar--wide"><i style="--w:' + qPct + '%"></i><span>' + m.answered + '/660 questions completed</span><b>' + qPct + '%</b></span>' +
      '<p class="ln-label">Performance</p><span class="ln-bar ln-bar--wide ln-bar--mid"><i style="--w:' + perf + '%"></i><em>' + perf + '%</em></span>' +
      '<div class="ln-note"><span class="ok">' + (S.correct || 0) + ' total correct</span><span class="no">' + (S.incorrect || 0) + ' total incorrect</span></div>' +
      '<p class="ln-label">Comparative Performance</p><span class="ln-bar ln-bar--wide ln-bar--mid"><i style="--w:' + myAvg + '%"></i><em>' + myAvg + '% my average</em><u style="left:' + crowd + '%"></u></span>' +
      '<div class="ln-crowd" style="left:' + crowd + '%">' + crowd + '% students\' average</div></section>';
    var list = S.comments || [];
    var comm = '<section class="sheet comments"><h2 class="h2">Recent Comments</h2><p class="sub">Questions and responses from your instructors</p>' +
      '<p class="c-empty">Quiet for now! Comments from your instructors will appear here as you go through the course.</p>' +
      (list.length ? '<ul class="c-list ln-clist">' + list.map(function (c) {
        return '<li class="c-item">' + cHead(c) + '<p class="c-text">' + esc(c.text) + '</p><button class="c-reply">Reply</button>' +
          (c.reply ? '<div class="c-sub">' + cHead(c.reply) + '<p class="c-text">' + esc(c.reply.text) + '</p></div>' : '') + '</li>';
      }).join('') + '</ul>' : '<p class="ln-nocom">No comments found.</p>') + '</section>';
    var content = hello + (phone ? progress + stats : '<div class="ln-row">' + progress + stats + '</div>') + comm;
    return '<div class="app is-asnow' + (phone ? ' is-phone' : '') + (state.side === 'closed' ? ' is-collapsed' : '') + '">' + (phone ? '' : sidebar(m)) +
      '<div class="main">' + topbar() + content + footer() + '</div></div>';
  }
  function anyPage(key, phone, picked) {
    if (state.page === 'now') return pageNow(key, phone);
    if (window.A2V3 && window.A2V3[VERSION]) return window.A2V3[VERSION](H, key, phone);
    return VERSION === 'plan' ? page2(key, phone) : page(key, phone, picked);
  }

  // ---------- page ----------
  function page(key, phone, picked) {
    var m = model(key);
    var pick = picked == null ? m.here : picked;
    var hello = '<h1 class="hello">Hey there, ' + NAME + '! 👋</h1>';
    var content = phone
      ? '<div class="hello-wrap">' + hello + '<p class="hello-sub">' + m.lessonsDone + ' of 105 lessons · ' + m.testsPassed + ' of 15 tests passed</p></div>' + nowCard(m, pick, true) +
        '<section class="sheet route-sheet"><h2 class="h2">Learning Progress</h2><p class="sub">Track your progress by subject</p>' + route(m, pick) + '</section>' +
        stats(m) + plan(m) + comments(m)
      : '<section class="sheet route-sheet">' + hello + route(m, pick) + '</section>' +
        '<div class="row2">' + nowCard(m, pick) + stats(m) + '</div>' + plan(m) + comments(m);
    return '<div class="app' + (phone ? ' is-phone' : '') + (state.side === 'closed' ? ' is-collapsed' : '') + '">' + (phone ? '' : sidebar(m)) +
      '<div class="main">' + topbar() + content + footer() + '</div></div>';
  }

  // Shared helpers for the later variants (members-v3.js)
  var H = { C: C, NAME: NAME, ICON: ICON, ICON2: ICON2, NEW: NEW, STATES: STATES, state: state, PASS: PASS,
    model: model, sidebar: sidebar, topbar: topbar, footer: footer, comments: comments, cHead: cHead,
    esc: esc, isPassed: isPassed, avg: avg, rerender: function () { render(false); } };

  var stage = document.getElementById('stage');
  function render(animate) {
    if (state.screen === 'phone' && document.body.getAttribute('data-solo') === '1') {
      // Review capture: one phone page at the window width, no frame
      stage.innerHTML = anyPage(state.state, true, state.pick);
    } else if (state.screen === 'laptop') {
      stage.innerHTML = anyPage(state.state, false, state.pick);
    } else {
      stage.innerHTML = [390, 446].map(function (w) {
        return '<figure class="device"><div class="bezel"><div class="screen" style="width:' + w + 'px;height:705px"><div class="scroller">' +
          anyPage(state.state, true, state.pick) + '</div></div></div><figcaption>' + w + ' × 705</figcaption></figure>';
      }).join('');
    }
    if (animate) [].forEach.call(stage.querySelectorAll('.route'), function (r) { r.classList.add('is-drawn'); });
    document.querySelectorAll('.mock-seg').forEach(function (seg) {
      var k = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === state[k])); });
    });
  }

  document.querySelector('.mock-bar').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-value]'); if (!b) return;
    var k = b.parentNode.getAttribute('data-key');
    state[k] = b.getAttribute('data-value');
    if (k === 'state') state.pick = null;
    writeHash(); render(true);
  });
  stage.addEventListener('click', function (e) {
    if (window.A2V3 && window.A2V3.onClick && window.A2V3.onClick(e, H)) return;
    var s = e.target.closest('[data-stop]');
    if (s) { e.preventDefault(); state.pick = +s.getAttribute('data-stop'); var m = model(state.state); if (state.pick === m.here) state.pick = null; render(false);
      if (state.screen === 'phone') stage.querySelectorAll('.scroller').forEach(function (sc) { sc.scrollTo({ top: 0, behavior: 'smooth' }); });
      return; }
    var tg = e.target.closest('[data-side]');
    if (tg) { state.side = state.side === 'closed' ? 'open' : 'closed'; render(false); return; }
    var p = e.target.closest('[data-plan]');
    if (p) { state.planOpen[state.state] = p.getAttribute('data-plan') === 'open'; render(false); return; }
    var a = e.target.closest('a[href="#"]'); if (a) e.preventDefault();
  });

  function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    if (STATES[h.get('state')]) state.state = h.get('state');
    if (h.get('screen') === 'phone' || h.get('screen') === 'laptop') state.screen = h.get('screen');
    if (h.get('page') === 'now' || h.get('page') === 'new') state.page = h.get('page');
    document.body.setAttribute('data-solo', h.get('solo') === '1' ? '1' : '0');
  }
  function writeHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    h.set('state', state.state); h.set('screen', state.screen); h.set('page', state.page);
    history.replaceState(null, '', '#' + h.toString());
    document.body.setAttribute('data-screen', state.screen);
  }
  readHash(); document.body.setAttribute('data-screen', state.screen); render(true);
})();
