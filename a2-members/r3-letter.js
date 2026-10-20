// Variant «Acceptance letter» (YBG-1877, round 3): the road into the student's nursing school.
// Frame = what the school asks for (subjects, score, exam date); every subject is shown against it. No AI.
(function () {
  var I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5L12 5l9 4.5-9 4.5z"/><path d="M7 11.5V16c1.4 1.3 3.1 2 5 2s3.6-.7 5-2v-4.5M21 9.5v5"/></svg>'
  };
  var NEW = '<span class="lt-new">New</span>';

  function top(R, phone) {
    var view = R.state.view;
    var items = [['Home', ' data-view="home"', view === 'home'], ['Lessons', ' data-view="lessons"', view === 'lessons'],
      ['Practice tests', R.go('The Practice tests page (/a2/practice_tests)'), false], ['Forum', R.go('The Forum (/a2/forums)'), false]];
    var nav = items.map(function (t) {
      return '<a href="#"' + t[1] + (t[2] ? ' class="is-on" aria-current="page"' : '') + '>' + t[0] + '</a>';
    }).join('');
    var pop = R.state.pop;
    var me = '<div class="lt-me-w"><button type="button" class="lt-me" data-pop="profile" aria-expanded="' + (pop === 'profile') + '"><img src="assets/avatar.png" alt="">' +
      (phone ? '' : '<span>' + R.NAME + '</span>' + I.chev) + '</button>' + (pop === 'profile' ? R.profileMenu() : '') + '</div>';
    // Phone: the burger opens the same menu as the desktop header, plus profile and log out
    var menu = phone && pop === 'menu' ? '<nav class="r3-menu lt-menu" aria-label="Member area">' + nav +
      '<a href="#"' + R.go('My Profile (/a2/my-account)') + '>My Profile</a><a href="#"' + R.go('Log out') + '>Log out</a></nav>' : '';
    return '<header class="lt-top"><div class="lt-top-in"><a href="#" class="lt-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>' +
      (phone ? me + '<button type="button" class="lt-burger" data-pop="menu" aria-label="Menu" aria-expanded="' + (pop === 'menu') + '">' + I.burger + '</button>'
             : '<nav class="lt-nav" aria-label="Member area">' + nav + '</nav>' + me) +
      '</div>' + menu + '</header>';
  }

  function next(m) {
    if (m.next && m.S.done !== 'all') {
      return { title: m.next.title, meta: m.next.sec.name + ' · Lesson ' + (m.next.idx + 1) + ' of ' + m.next.sec.total, btn: m.done === 0 ? 'Start learning' : 'Continue learning',
        where: 'The lesson page: ' + m.next.title };
    }
    if (m.nextTest) return { title: m.nextTest.name, meta: 'All lessons in your subjects are done · ' + m.nextTest.q + ' questions', btn: 'Take the test',
      where: 'The practice test: ' + m.nextTest.name };
    return { title: 'Every practice test is at 90% or more', meta: 'You\'re more than ready for the real exam', btn: 'Review practice tests',
      where: 'The Practice tests page (/a2/practice_tests)' };
  }

  function hero(m, R, phone) {
    var plan = m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      return '<li class="lt-step is-' + st.state + '"><span class="lt-dot" aria-hidden="true">' + (st.state === 'done' ? I.check : n + 1) + '</span>' +
        '<span class="lt-step-t">' + p.title + (st.isNew ? NEW : '') + '</span></li>';
    }).join('');
    var cur = m.cur > -1 ? R.PLAN[m.steps[m.cur].k] : null;
    var n = next(m);
    // Pace sits with the main button: "will I make it" is answered where the student starts
    var p = R.pace(m);
    var paceLine = p ? '<p class="lt-pace-s' + (p.warn ? ' is-warn' : '') + '">' + p.text + ' ' + NEW + '</p>' : '';
    return '<section class="lt-hero"><div class="lt-hero-in"><div class="lt-hello">' +
      '<h1>Hey there, ' + R.NAME + '! <span aria-hidden="true">👋</span></h1>' +
      '<p class="lt-lead">Here\'s the game plan, simple and stress-free:</p>' +
      '<ol class="lt-plan">' + plan + '</ol>' +
      (cur ? '<p class="lt-cur"><b>' + cur.title + '.</b> ' + cur.text + '</p>' : '') +
      '<img class="lt-sign" src="assets/claire-signature.png" alt="Claire Corter">' +
      '<div class="lt-next"><div class="lt-next-t"><h2>' + n.title + '</h2><p>' + n.meta + '</p></div>' +
      '<a href="#" class="lt-btn"' + R.go(n.where) + '>' + n.btn + I.arrow + '</a>' + paceLine + R.replyNotice(m) + '</div>' +
      '</div>' + (phone ? '' : '<img class="lt-nurse" src="assets/nurse-hesi.webp" alt="">') + '</div></section>';
  }

  function chips(m) {
    return m.secs.filter(function (s) { return !s.intro; }).map(function (s) {
      if (s.required) return '<span class="lt-chip is-req">' + I.check + s.name + '</span>';
      return '<button type="button" class="lt-chip is-opt' + (s.picked ? ' is-on' : '') + '" data-subject="' + s.id + '" aria-pressed="' + s.picked + '">' +
        '<span class="lt-box" aria-hidden="true">' + (s.picked ? I.check : '') + '</span>' + s.name + '</button>';
    }).join('');
  }

  function asks(m) {
    var S = m.S;
    var R = window.R3;
    var editing = !S.exam || R.state.edit === 'exam';
    var date = S.exam
      ? '<p class="lt-req-v">' + S.exam.long + '</p><p class="lt-req-s">in ' + window.R3.days(S.exam.days) + ' · <a href="#" class="lt-link" data-edit="exam">Change</a></p>'
      : '';
    var score = S.target
      ? '<p class="lt-req-v">' + S.target + '%</p><p class="lt-req-s">cumulative score · <a href="#" class="lt-link" data-edit="exam">Change</a></p>'
      : '<p class="lt-req-s">Ask your school, then <a href="#" class="lt-link" data-edit="exam">add it</a></p>';
    var cells = editing
      ? '<div class="lt-req lt-req-edit"><h3>' + (S.exam ? 'Change what your school asks for' : 'When is your exam, and what score does your school need?') + '</h3>' + R.examForm(m, { school: true }) + '</div>'
      : '<div class="lt-req"><h3>Exam date</h3>' + date + '</div>' +
        '<div class="lt-req"><h3>Score they need' + R.tip(R.TIPS.score) + '</h3>' + score + '</div>';
    return '<div class="lt-head"><div><h2>What your school asks for ' + NEW + '</h2>' +
      '<p class="lt-school">' + I.school + '<span>' + (S.school ? R.esc(S.school) : 'Your nursing school') + '</span>' +
      (editing ? '' : '<a href="#" class="lt-link" data-edit="exam">' + (S.school ? 'Change' : 'Add its name') + '</a>') + '</p></div></div>' +
      '<div class="lt-reqs' + (editing ? ' is-editing' : '') + '">' + cells +
        '<div class="lt-req lt-req-subj"><h3>Subjects on your exam</h3><div class="lt-chips">' + chips(m) + '</div>' +
        '<p class="lt-hint">Math and the three English tests are on nearly every exam. Your school decides on Biology, Chemistry, Anatomy and Physiology, and Critical Thinking' +
        (S.chosen ? '.' : ', so keep them on until you know.') + '</p></div>' +
      '</div>';
  }

  function anyScore(m) {
    return m.mine.some(function (s) { return s.diag != null || s.tests.some(function (t) { return t.score != null; }); });
  }

  function scale(s, m) {
    var target = m.S.target;
    var taken = s.tests.filter(function (t) { return t.score != null; });
    var best = taken.length ? Math.max.apply(null, taken.map(function (t) { return t.score; })) : null;
    var diag = s.diag != null ? s.diag * 20 : null;
    var marks = '';
    if (target) marks += '<i class="lt-target" style="left:' + target + '%" title="Your school needs ' + target + '%"></i>';
    if (diag != null) marks += '<i class="lt-diag" style="left:' + diag + '%" title="Diagnostic quiz ' + s.diag + ' of 5"></i>';
    if (best != null) marks += '<i class="lt-best' + (target && best < target ? ' is-low' : '') + '" style="left:' + best + '%" title="Best practice test ' + best + '%"></i>';
    // Each test by number, so a lower first try is not hidden behind the best one
    var label = taken.length ? s.tests.map(function (t, i) { return t.score != null ? 'Test ' + (i + 1) + ' <b>' + t.score + '%</b>' : ''; }).filter(Boolean).join(' · ')
      : (s.tests.length ? 'No practice test yet' : 'No practice tests');
    var html = anyScore(m) ? '<span class="lt-scale">' + (best != null ? '<span class="lt-fill" style="width:' + best + '%"></span>' : '') + marks + '</span>' : '';
    return { html: html, label: label, best: best, diag: diag };
  }

  function status(s, sc, m) {
    var t = m.S.target;
    if (s.done === 0 && sc.best == null) return '<span class="lt-st is-none">Not started</span>';
    if (sc.best == null) return '<span class="lt-st is-none">' + (s.done >= s.total ? 'Ready for a test' : 'In progress') + '</span>';
    if (!t) return '<span class="lt-st">Tested</span>';
    return sc.best >= t ? '<span class="lt-st is-ok">' + I.check + 'Above ' + t + '%</span>' : '<span class="lt-st is-low">Below ' + t + '%</span>';
  }

  // Once a subject's lessons are done, every test has its own step: "Take test N" if not taken, "Retake test N" under Claire's 90%
  function testAction(s, m) {
    if (s.done < s.total || !s.tests.length) return '';
    var R = window.R3;
    // One style for both: the only orange button on the page stays the main one
    var acts = s.tests.map(function (t, i) {
      var go = R.go('The practice test: ' + t.name);
      if (t.score == null) return '<a href="#" class="lt-tact"' + go + '>Take test ' + (i + 1) + I.arrow + '</a>';
      return t.score < m.PASS ? '<a href="#" class="lt-tact"' + go + '>Retake test ' + (i + 1) + I.arrow + '</a>' : '';
    }).join('');
    return acts ? '<div class="lt-tacts">' + acts + '</div>' : '';
  }

  // The intro section gets its own row: it is where the diagnostic quiz lives
  function introRow(s, R) {
    var st = s.done >= s.total ? '<span class="lt-st is-ok">' + I.check + 'Done</span>'
      : '<span class="lt-st is-none">' + (s.done ? 'In progress' : 'Not started') + '</span>';
    return '<li class="lt-row' + (s.done >= s.total ? ' is-done' : '') + '"><div class="lt-row-name"><span class="lt-sname">' + s.name + '</span></div>' +
      '<div class="lt-row-les"><span class="lt-bar"><i style="width:' + (s.done / s.total * 100).toFixed(1) + '%"></i></span><span class="lt-small">' +
      (s.done >= s.total ? 'All ' + s.total + ' lessons' : (s.done ? s.done + ' of ' + s.total + ' lessons' : s.total + ' lessons')) + '</span></div>' +
      '<div class="lt-row-score"><a href="#" class="lt-dlink"' + R.go('The lesson page: Diagnostic Test') + '>Diagnostic quiz · lesson 4, 40 questions</a></div>' +
      '<div class="lt-row-st">' + st + '</div></li>';
  }

  function stand(m, phone) {
    var rows = m.mine.map(function (s) {
      if (s.intro) return introRow(s, window.R3);
      var sc = scale(s, m);
      var weak = window.R3.needsFocus(s, m);
      var isNext = m.next && m.next.sec.id === s.id && m.S.done !== 'all';
      var les = s.done >= s.total ? 'All ' + s.total + ' lessons' : (s.done === 0 ? s.total + ' lessons' : s.done + ' of ' + s.total + ' lessons');
      return '<li class="lt-row' + (isNext ? ' is-here' : '') + (s.done >= s.total ? ' is-done' : '') + '">' +
        '<div class="lt-row-name"><span class="lt-sname">' + s.name + '</span>' + (isNext ? '<span class="lt-here">You\'re here</span>' : '') + '</div>' +
        '<div class="lt-row-les"><span class="lt-bar"><i style="width:' + (s.done / s.total * 100).toFixed(1) + '%"></i></span><span class="lt-small">' + les + '</span></div>' +
        '<div class="lt-row-score">' + sc.html + '<span class="lt-small">' + sc.label + (sc.diag != null ? ' · diagnostic ' + s.diag + ' of 5 right' : '') +
          (weak ? '<span class="lt-weak">Needs practice</span>' : '') + '</span></div>' +
        '<div class="lt-row-st">' + status(s, sc, m) + testAction(s, m) + '</div></li>';
    }).join('');
    // Before the diagnostic quiz there is nothing to put on the scales: one line says when they fill, instead of empty tracks
    var legend = !anyScore(m) ? '' : '<p class="lt-legend"><span><i class="lt-best"></i>Best practice test</span><span><i class="lt-diag"></i>Diagnostic quiz ' + NEW + window.R3.tip(window.R3.TIPS.diag) + '</span>' +
      (m.S.target ? '<span><i class="lt-target"></i>Your school needs ' + m.S.target + '%</span>' : '') + '</p>';
    var off = m.skipped.length ? '<div class="lt-off"><span>Not on your exam:</span>' + m.skipped.map(function (s) {
      return '<button type="button" class="lt-off-chip" data-subject="' + s.id + '">' + I.plus + s.name + '</button>';
    }).join('') + '</div>' : '';
    // Same entry to the full lesson list as "All lessons" in My exam
    return '<div class="lt-stand"><div class="lt-stand-h"><h2>Where you stand</h2>' + legend +
      '<a href="#" class="lt-link lt-all" data-view="lessons">All lessons</a></div>' + window.R3.courseBar(m) +
      (anyScore(m) ? '' : '<p class="lt-empty-scores">Scores show up here after the diagnostic quiz in lesson 4 of the intro section.</p>') +
      (phone ? '' : '<div class="lt-cols"><span>Subject</span><span>Lessons</span><span>' + (anyScore(m) ? 'Score, out of 100%' + window.R3.tip(window.R3.TIPS.scale) : 'Score') + '</span><span></span></div>') +
      '<ol class="lt-rows">' + rows + '</ol>' + off + '</div>';
  }

  function comments(m, R) {
    var list = m.S.comments;
    var body = list.length ? '<ul class="lt-clist">' + list.map(function (c) {
      // Two dates, each with its own word: when the student asked and when Claire replied
      return '<li><p class="lt-c-where">On <a href="#"' + R.go('The lesson page: ' + c.lesson) + '>' + c.lesson + '</a> · asked ' + c.time + '</p><p class="lt-c-q">' + R.esc(c.text) + '</p>' +
        (c.reply ? '<p class="lt-c-a"><b>' + c.reply.name + ' replied ' + c.reply.time + ':</b> ' + R.esc(c.reply.text) + '</p>' : '') + '</li>';
    }).join('') + '</ul>' : '<p class="lt-empty">When you ask a question under a lesson, it shows up here with Claire\'s reply.</p>';
    return '<section class="lt-qs" aria-label="Your questions" data-qs><h2>Your questions</h2>' + body + '</section>';
  }

  window.R3V = {
    render: function (m, phone) {
      var R = window.R3;
      if (R.state.view === 'lessons') return '<div class="lt' + (phone ? ' is-phone' : '') + '">' + top(R, phone) + '<div class="lt-lv">' + R.lessonsView(m) + '</div></div>';
      return '<div class="lt' + (phone ? ' is-phone' : '') + '">' + top(R, phone) + hero(m, R, phone) +
        '<div class="lt-body"><article class="lt-letter" aria-label="Your road to nursing school">' + asks(m) + stand(m, phone) + '</article>' + comments(m, R) + '</div></div>';
    }
  };
})();
