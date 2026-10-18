// YBG-1877, second round: four more layouts of the A2 dashboard content.
// Registered before members.js runs; members.js calls window.A2V3[version](helpers, stateKey, isPhone).
(function () {
  var V = window.A2V3 = {};
  var pickedSection = null; // "Study desk": a section opened from the rail
  var deskAll = null;       // "Study desk": the current section with every done lesson listed

  // ---------- shared ----------
  function info(H, m) {
    var allDone = m.lessonsDone === m.lessonsTotal;
    var sec = allDone ? null : m.secs[m.here];
    var idx = sec ? Math.min(sec.done, sec.total - 1) : null;
    return { allDone: allDone, started: m.lessonsDone > 0, sec: sec, idx: idx,
      title: sec ? sec.lessons[idx] : null, pos: sec ? 'Lesson ' + (idx + 1) + ' of ' + sec.total : '',
      action: m.lessonsDone === 0 ? 'Start learning' : 'Continue learning' };
  }
  // The lessons that come after the next one, across sections
  function upcoming(m, n) {
    var out = [], i = m.here, k = m.secs[i] ? m.secs[i].done + 1 : 0;
    while (i < m.secs.length && out.length < n) {
      var s = m.secs[i];
      if (k < s.total) { out.push({ name: s.lessons[k], sec: s }); k++; }
      else { i++; k = 0; }
    }
    return out;
  }
  function secTests(H, m, s) {
    var taken = s.tests.filter(function (t) { return m.S.tests[t.name] != null; });
    var best = taken.length ? Math.max.apply(null, taken.map(function (t) { return m.S.tests[t.name]; })) : null;
    var passed = s.tests.filter(function (t) { return H.isPassed(m.S, t); }).length;
    return { list: s.tests, taken: taken.length, best: best, passed: passed };
  }
  function practiceOnly(H) { return H.C.practiceTests.filter(function (t) { return t.subject; }); }
  function nextTest(H, m) {
    var open = practiceOnly(H).filter(function (t) { return m.S.tests[t.name] == null; });
    var here = m.secs[m.here] ? m.secs[m.here].id : null;
    return open.filter(function (t) { return t.subject === here; })[0] || open[0];
  }
  // The next practice test for a student who has done every lesson, the same in every layout:
  // the earliest subject that still has an open test, and inside it a test not taken before a retake
  function secIndex(m, t) { for (var k = 0; k < m.secs.length; k++) if (m.secs[k].id === t.subject) return k; return 99; }
  function openTests(H, m) {
    var open = practiceOnly(H).filter(function (t) { return !H.isPassed(m.S, t); });
    return open.sort(function (x, y) { return (secIndex(m, x) - secIndex(m, y)) || ((m.S.tests[x.name] != null) - (m.S.tests[y.name] != null)); });
  }
  function goalTest(H, m) { return openTests(H, m)[0] || null; }
  // The test's name goes into the button: a grey caption under it was read only after pressing
  function takeBtn(H, g) { return btn(H, 'Take ' + H.esc(tname(g.name))); }
  // A subject's tests by number, each with its own action: "Test 1 78% Retake · Take test 2".
  // One action per subject left the second open test (Math 88%) with nothing to press
  function testsShort(H, m, s) {
    return s.tests.map(function (x, k) {
      var sc = m.S.tests[x.name];
      if (sc == null) return '<a class="tst-go nw" href="#">Take test ' + (k + 1) + '</a>';
      return '<span class="nw">Test ' + (k + 1) + ' ' + score(H, sc) + (sc < H.PASS ? ' <a class="tst-go" href="#">Retake</a>' : '') + '</span>';
    }).join('<span class="tl-sep">·</span>');
  }
  var GOAL_LINE = 'All 105 lessons are done. Now the practice tests: score over 90%, and you\'re more than ready for the real exam!';
  function practiceCount(H, m) { var p = practiceOnly(H); return { total: p.length, taken: p.filter(function (t) { return m.S.tests[t.name] != null; }).length, passed: p.filter(function (t) { return H.isPassed(m.S, t); }).length }; }
  function score(H, sc) { return '<span class="v3-score' + (sc >= H.PASS ? ' is-pass' : '') + '">' + sc + '%</span>'; }
  // Test names without the "A2 " prefix (every test here is A2) and without the shouting caps of "DIAGNOSTIC A2 TEST"
  function tname(n) {
    n = n.replace(/^A2 /, '');
    return n === n.toUpperCase() ? n.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : n;
  }
  // Right end of a test row: take it, its score, or a score below 90% with a way to try again
  function testAct(H, m, x) {
    var sc = m.S.tests[x.name];
    if (sc == null) return '<a href="#">Take this test</a>';
    return sc < H.PASS ? '<span class="v3-again">' + score(H, sc) + '<a href="#">Take again</a></span>' : score(H, sc);
  }
  function ticks(s, cls) {
    var t = '';
    for (var i = 0; i < s.total; i++) t += '<i' + (i < s.done ? ' class="on"' : '') + '></i>';
    return '<span class="v3-ticks' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + t + '</span>';
  }
  function hello(H, cls) { return '<h1 class="v3-hello' + (cls ? ' ' + cls : '') + '">Hey there, ' + H.NAME + '! 👋</h1>'; }
  function btn(H, label, extra) { return '<a class="btn' + (extra ? ' ' + extra : '') + '" href="#">' + label + H.ICON.arrow + '</a>'; }

  function planSteps(H, m) {
    var intro = m.secs[0], diag = m.S.tests['DIAGNOSTIC A2 TEST'];
    return [
      { icon: '<img src="assets/sec-introduction.svg" alt="">', text: 'Start with the <a href="#">intro section</a> – it\'ll show you how everything works around here', done: intro.done >= intro.total },
      { icon: H.ICON2.target, text: 'Take a quick <a href="#">diagnostic quiz</a> – to see where you\'re strong and where you can grow', done: diag != null },
      { icon: '<img src="assets/ic-book.svg" alt="">', text: 'Learn a little each day – go lesson by lesson, take the short quizzes, and just keep moving', done: m.lessonsDone === m.lessonsTotal },
      { icon: H.ICON2.flag, text: 'Finish with a <a href="#">final test</a> – score over 90%, and you\'re more than ready for the real exam!', done: false }
    ];
  }
  function planList(H, m, cls) {
    return '<ol class="v3-plan' + (cls ? ' ' + cls : '') + '">' + planSteps(H, m).map(function (s) {
      return '<li class="' + (s.done ? 'is-done' : '') + '"><span class="v3-plan-ico">' + (s.done ? H.ICON.check : s.icon) + '</span><span>' + s.text + '</span></li>';
    }).join('') + '</ol>';
  }
  function planFold(H, m) {
    if (H.state.planOpen[m.key]) {
      return '<section class="sheet v3-planbox"><div class="v3-row-head"><h2 class="h2">The game plan</h2><button class="link-btn" data-plan="close">Hide</button></div>' +
        '<p class="sub">Simple and stress-free</p>' + planList(H, m, 'is-row') + '</section>';
    }
    return '<section class="sheet plan-show"><span>Here\'s the game plan — simple and <span class="nw">stress-free</span></span><button class="link-btn" data-plan="open">Show</button></section>';
  }
  function statBox(H, m, cls) {
    return m.answered ? '<section class="sheet v3-statbox' + (cls ? ' ' + cls : '') + '"><h2 class="h2">Your Statistics</h2>' + statsLine(H, m) + '</section>' : '';
  }
  function statsLine(H, m) {
    if (!m.answered) return '';
    var S = m.S, perf = Math.round(S.correct / (S.correct + S.incorrect) * 1000) / 10, my = H.avg(S);
    return '<dl class="v3-facts">' +
      '<div><dt>Questions answered</dt><dd>' + m.answered + '<small>of ' + m.questions + '</small></dd></div>' +
      '<div><dt>Answered correctly</dt><dd>' + perf + '%<small>' + S.correct + ' of ' + (S.correct + S.incorrect) + '</small></dd></div>' +
      '<div><dt>My average on tests</dt><dd>' + my + '%<small>students\' average ' + S.studentsAvg + '%</small></dd></div>' +
    '</dl>';
  }
  function shell(H, m, phone, content, cls) {
    return '<div class="app v3 ' + cls + (phone ? ' is-phone' : '') + (H.state.side === 'closed' ? ' is-collapsed' : '') + '">' + (phone ? '' : H.sidebar(m)) +
      '<div class="main">' + H.topbar() + content + H.footer() + '</div></div>';
  }

  // =============== 1. Up next ===============
  function courseBar(H, m, n) {
    var segs = '', icons = '';
    m.secs.forEach(function (s, i) {
      var pct = Math.round(s.done / s.total * 100);
      var cls = s.done >= s.total ? 'is-done' : (n.sec && i === m.here ? 'is-here' : '');
      segs += '<span class="cb-seg ' + cls + '" style="flex-grow:' + s.total + '" title="' + H.esc(s.name) + ': ' + s.done + ' of ' + s.total + '"><i style="--w:' + pct + '%"></i></span>';
      icons += '<span class="' + cls + '" style="flex-grow:' + s.total + '"><img src="assets/' + s.icon + '" alt=""></span>';
    });
    // A new student already reads "Introduction" twice above, so the bar names no section for them
    var label = !n.sec ? 'All nine sections done'
      : n.started ? '<img src="assets/' + n.sec.icon + '" alt="">' + H.esc(n.sec.name) + ' · ' + n.sec.done + ' of ' + n.sec.total + ' done' : '';
    var top = n.started
      ? '<span class="cb-total"><b>' + m.lessonsDone + '</b> of ' + m.lessonsTotal + ' lessons</span>' +
        '<span class="cb-left">' + (m.lessonsTotal - m.lessonsDone ? (m.lessonsTotal - m.lessonsDone) + ' to go' : 'Course complete') + '</span>'
      : '<span class="cb-total"><b>' + m.lessonsTotal + '</b> lessons in ' + m.secs.length + ' sections<span class="dot">·</span><b>' + practiceCount(H, m).total + '</b> practice tests</span>';
    return '<div class="cb"><div class="cb-top">' + top + '</div>' +
      '<div class="cb-bar">' + segs + '</div><div class="cb-icons" aria-hidden="true">' + icons + '</div>' + (label ? '<p class="cb-now">' + label + '</p>' : '') + '</div>';
  }
  function focusCard(H, m, phone) {
    var n = info(H, m), lead, side;
    if (n.allDone) {
      var t = goalTest(H, m);
      lead = hello(H, 'is-sm') + '<h2 class="f-title">' + (t ? H.esc(tname(t.name)) : 'Every practice test at 90%+') + '</h2>' +
        // The meta line says this is the next test to take, or the big title reads like the test page itself
        '<p class="f-meta"><img src="assets/ic-practice.svg" alt="">Your next practice test<span class="dot">·</span>' + practiceCount(H, m).taken + ' of ' + practiceCount(H, m).total + ' taken</p>' +
        '<p class="f-goal">' + GOAL_LINE + '</p>' +
        '<div class="f-act">' + btn(H, t ? 'Take the test' : 'Go to practice tests') + '</div>';
      // Everything still open, not only the scores below 90%: a test never taken is a debt too
      var rest = practiceOnly(H).filter(function (x) { return !H.isPassed(m.S, x) && x !== t; });
      side = rest.length
        ? '<h3 class="v3-mini">Other tests not taken or below 90%</h3><ul class="f-list">' + rest.map(function (x) {
            return '<li><span>' + H.esc(tname(x.name)) + '</span>' + testAct(H, m, x) + '</li>'; }).join('') + '</ul>'
        : '<h3 class="v3-mini">Practice tests</h3><p class="f-none">' + (t ? 'This is the last test still below 90%.' : 'Every practice test is at 90% or more.') + '</p>';
    } else {
      lead = hello(H, 'is-sm') + '<h2 class="f-title">' + H.esc(n.title) + '</h2>' +
        '<p class="f-meta"><img src="assets/' + n.sec.icon + '" alt="">' + H.esc(n.sec.name) + '<span class="dot">·</span>' + n.pos + '</p>' +
        '<div class="f-act">' + btn(H, n.action) + '</div>';
      side = n.started
        ? '<h3 class="v3-mini">After this</h3><ol class="f-list f-next">' + upcoming(m, 3).map(function (u) {
            return '<li><span>' + H.esc(u.name) + '</span>' + (u.sec !== n.sec ? '<small>' + H.esc(u.sec.name) + '</small>' : '') + '</li>'; }).join('') + '</ol>'
        : '<h3 class="v3-mini">Here\'s the game plan — simple and <span class="nw">stress-free</span></h3>' + planList(H, m, 'is-tight');
    }
    return '<section class="sheet f-card' + (n.started ? '' : ' is-new') + '"><div class="f-grid"><div class="f-lead">' + lead + '</div><div class="f-side">' + side + '</div></div>' + courseBar(H, m, n) + '</section>';
  }
  function sectionsSheet(H, m) {
    var rows = m.secs.map(function (s, i) {
      var full = s.done >= s.total, here = !full && i === m.here && m.lessonsDone < m.lessonsTotal;
      return '<li class="' + (full ? 'is-done' : '') + (here ? ' is-here' : '') + '"><img src="assets/' + s.icon + '" alt=""><span class="sx-name">' + H.esc(s.name) + '</span>' +
        '<span class="sx-count">' + (full ? '<span class="sx-check">' + H.ICON.check + '</span>' : '') + (s.done ? s.done + ' / ' + s.total : s.total + ' lessons') + '</span></li>';
    }).join('');
    return '<section class="sheet v3-sections"><h2 class="h2">Sections</h2><p class="rl-hint">Pick a section to see its lessons.</p><ul class="sx">' + rows + '</ul></section>';
  }
  function testsSheet(H, m) {
    var pc = practiceCount(H, m), diag = m.S.tests['DIAGNOSTIC A2 TEST'];
    var taken = practiceOnly(H).filter(function (t) { return m.S.tests[t.name] != null; });
    var body;
    if (!taken.length && diag == null) {
      // The sentence keeps the site's words; the quiz also gets an action of its own, a link inside a sentence was missed
      var dqT = m.secs[0].tests[0];
      body = '<p class="v3-empty">Your test results will show up here. A good first one is the <a href="#">diagnostic quiz</a> — it shows where you\'re strong and where you can grow.</p>' +
        (dqT ? '<p class="tr-next"><a href="#">Take the diagnostic quiz</a> · ' + dqT.q + ' questions</p>' : '');
    } else {
      var nt = nextTest(H, m), MAX = 6, allDone = m.lessonsDone === m.lessonsTotal;
      // With every lesson done the card above already lists the open tests, so this sheet keeps the passed ones;
      // a long list would outgrow the statistics beside it: the first five, the rest behind All tests
      var list = allDone ? taken.filter(function (t) { return H.isPassed(m.S, t); }) : taken;
      body = (allDone && list.length ? '<h3 class="v3-mini tr-head">At 90% or more</h3>' : '') +
        (list.length ? '<ul class="tr">' + list.slice(0, MAX).map(function (t) {
          return '<li><span>' + H.esc(tname(t.name)) + '</span>' + score(H, m.S.tests[t.name]) + '</li>'; }).join('') + '</ul>' : '') +
        (list.length > MAX ? '<p class="tr-more">' + (list.length - MAX) + ' more in <a href="#">All tests</a></p>' : '') +
        // The diagnostic quiz is not one of the practice tests the counts above talk about
        (diag != null ? '<p class="tr-diag">Diagnostic quiz ' + score(H, diag) + '<span class="tr-aside"> · not one of the ' + pc.total + '</span></p>' : '') +
        (nt && !allDone ? '<p class="tr-next">Next: <a href="#">' + H.esc(tname(nt.name)) + '</a> · ' + nt.q + ' questions</p>' : '');
    }
    var sub = pc.taken ? pc.taken + ' of ' + pc.total + ' practice tests taken · ' + pc.passed + ' at 90% or more' : (diag != null ? 'No practice tests taken yet · ' + pc.total + ' to go' : '');
    return '<section class="sheet v3-tests"><div class="v3-row-head"><h2 class="h2">Practice tests</h2><a class="link-btn" href="#">All tests</a></div>' +
      (sub ? '<p class="sub">' + sub + '</p>' : '') + body + '</section>';
  }
  V.focus = function (H, key, phone) {
    var m = H.model(key);
    // On a laptop the sidebar already lists the sections, so the sheet is phone-only
    var content = focusCard(H, m, phone) +
      (phone ? sectionsSheet(H, m) + testsSheet(H, m) + statBox(H, m) : '<div class="v3-row v3-row--focus">' + testsSheet(H, m) + statBox(H, m) + '</div>') +
      (m.lessonsDone ? planFold(H, m) : '') + H.comments(m);
    return shell(H, m, phone, content, 'v3-focus');
  };

  // =============== 2. Study desk ===============
  function deskSection(H, m, i) {
    var s = m.secs[i], n = info(H, m), here = i === m.here && !n.allDone;
    var next = here ? n.idx : -1;
    // Deep in a long section the next lesson must stay on the first screen: fold all but the last two done lessons
    var all = deskAll && deskAll.key === H.state.state && deskAll.i === i;
    var cut = here && next > 3 && !all ? next - 2 : 0;
    var rows = s.lessons.map(function (name, k) {
      var done = k < s.done;
      if (k < cut) {
        return k ? '' : '<li class="is-done dk-more"><span class="mark">' + H.ICON.check + '</span><span class="dk-name">' + cut + ' earlier lessons</span>' +
          '<button class="dk-all" data-v3all="' + i + '">Show all</button></li>';
      }
      // The diagnostic quiz lives inside the Introduction's "Diagnostic Test" lesson (the site's plan links there),
      // so it is named on that lesson's row instead of a second list that reads like another task
      var dq = i === 0 && /diagnostic/i.test(name) && s.tests[0] ? s.tests[0] : null;
      var dqSc = dq ? m.S.tests[dq.name] : null;
      if (k === next) {
        return '<li class="is-next"><span class="mark"></span><span class="dk-name"><b>' + H.esc(name) + '</b><small>Lesson ' + (k + 1) + ' of ' + s.total + (dq ? ' · diagnostic quiz, ' + dq.q + ' questions' : '') + '</small></span>' + btn(H, n.action) + '</li>';
      }
      return '<li class="' + (done ? 'is-done' : '') + '"><span class="mark">' + (done ? H.ICON.check : '') + '</span><span class="dk-name">' + H.esc(name) +
        (dq ? '<small>Diagnostic quiz · ' + dq.q + ' questions</small>' : '') + '</span>' +
        // The quiz keeps a visible action: a hover-only "Open" hid the one thing a new student is told to do first
        (dqSc != null ? score(H, dqSc) : dq ? '<a class="dk-go" href="#">Take the quiz</a>' : done ? '' : '<a class="dk-open" href="#">Open</a>') + '</li>';
    }).join('');
    var t = secTests(H, m, s);
    var tests = i === 0 ? ''
      : t.list.length ? '<h3 class="v3-mini">Practice tests for ' + H.esc(s.name) + '</h3><ul class="dk-tests">' + t.list.map(function (x) {
      return '<li><span>' + H.esc(tname(x.name)) + '<small>' + x.q + ' questions</small></span>' + testAct(H, m, x) + '</li>'; }).join('') + '</ul>'
      : '<p class="v3-empty">' + H.esc(s.name) + ' has no practice test. Its questions are inside the lessons.</p>';
    var back = here ? '' : '<button class="dk-back" data-v3pick="here">Back to where you are</button>';
    return '<div class="dk-head"><img src="assets/' + s.icon + '" alt=""><h2>' + H.esc(s.name) + '</h2><span>' + s.done + ' of ' + s.total + ' lessons</span></div>' +
      back + '<ol class="dk-lessons">' + rows + '</ol>' + tests;
  }
  function deskDone(H, m) {
    // Same order as the button's pick, so the recommended test is the first row, not the sixth
    var left = openTests(H, m);
    var g = goalTest(H, m);
    return '<div class="dk-head"><img src="assets/ic-practice.svg" alt=""><h2>Practice tests</h2><span>' + practiceCount(H, m).taken + ' of ' + practiceCount(H, m).total + ' taken · <a href="#">All tests</a></span></div>' +
      '<p class="f-goal">' + GOAL_LINE + '</p>' +
      '<div class="f-act ck-act">' + (g ? takeBtn(H, g) : btn(H, 'Go to practice tests')) + '</div>' +
      '<h3 class="v3-mini">Not taken or below 90%</h3><ul class="dk-tests">' + left.map(function (x) {
        return '<li><span>' + H.esc(tname(x.name)) + '<small>' + x.q + ' questions</small></span>' + testAct(H, m, x) + '</li>'; }).join('') + '</ul>';
  }
  function rail(H, m, shown) {
    var n = info(H, m);
    var rows = m.secs.map(function (s, i) {
      var t = secTests(H, m, s), full = s.done >= s.total;
      var test = i === 0 ? (t.best != null ? 'Diagnostic quiz ' + t.best + '%' : 'Diagnostic quiz') : (t.list.length ? (t.best != null ? 'Best test ' + t.best + '%' : t.list.length + ' tests, none yet') : 'No practice test');
      return '<li><button class="rl' + (i === shown ? ' is-shown' : '') + (full ? ' is-done' : '') + '" data-v3pick="' + i + '"' + (i === shown ? ' aria-current="true"' : '') + '>' +
        '<img src="assets/' + s.icon + '" alt=""><span class="rl-name">' + H.esc(s.name) + '</span><span class="rl-count">' + s.done + '/' + s.total + '</span>' +
        ticks(s) + '<span class="rl-test' + (t.best != null && t.best >= H.PASS ? ' is-pass' : '') + '">' + test + '</span></button></li>';
    }).join('');
    return '<aside class="sheet dk-rail"><h2 class="h2">Your course</h2><p class="sub">' + (m.lessonsDone ? m.lessonsDone + ' of ' + m.lessonsTotal + ' lessons · ' + practiceCount(H, m).passed + ' of ' + practiceCount(H, m).total + ' practice tests at 90%+' : m.lessonsTotal + ' lessons · ' + practiceCount(H, m).total + ' practice tests') + '</p>' +
      // Students could not tell the rows open anything, so the rail says it once
      '<p class="rl-hint">Pick a section to see its lessons.</p><ul class="rl-list">' + rows + '</ul>' + statsLine(H, m) + '</aside>';
  }
  V.split = function (H, key, phone) {
    var m = H.model(key), n = info(H, m);
    if (pickedSection != null && pickedSection.key !== key) pickedSection = null;
    var shown = pickedSection ? pickedSection.i : (n.allDone ? -1 : m.here);
    // In progress, the section head and the next row already say where you are; the phone has no rail beside it, so it gets the course total
    var pc = practiceCount(H, m);
    var intro = n.allDone ? 'You\'ve finished every lesson.'
      : !n.started ? 'Your first section is the Introduction. It shows how everything works.'
      // Two facts, one per line: a separator dot would hang at a line edge on a narrow screen
      : phone ? m.lessonsDone + ' of ' + m.lessonsTotal + ' lessons<br>' + pc.passed + ' of ' + pc.total + ' practice tests at 90%+' : '';
    var desk = '<section class="sheet dk-desk">' + hello(H) + (intro ? '<p class="dk-intro">' + intro + '</p>' : '') +
      (!n.started ? '<div class="dk-plan"><h3 class="v3-mini">Here\'s the game plan — simple and <span class="nw">stress-free</span></h3>' + planList(H, m, 'is-row is-compact') + '</div>' : '') +
      (shown === -1 ? deskDone(H, m) : deskSection(H, m, shown)) + '</section>';
    var content = phone
      ? desk + rail(H, m, shown) + H.comments(m)
      : '<div class="dk"><div class="dk-col">' + desk + H.comments(m) + '</div>' + rail(H, m, shown) + '</div>';
    return shell(H, m, phone, content, 'v3-split');
  };

  // =============== 3. Subjects ===============
  function tile(H, m, s, i, n) {
    var full = s.done >= s.total, here = !n.allDone && i === m.here, idle = !s.done && !here, t = secTests(H, m, s);
    // The blue ring marks the current subject; untouched subjects just name their first lesson, no zeros.
    // A finished subject says "all lessons done", not "Done": its tests may still be below 90%
    var status = !full && s.done && !here ? '<span class="tl-status">In progress</span>' : '';
    // Each test by number with its score, and the one action that moves the subject forward
    var testLine = idle ? ''
      : i === 0 ? (t.best != null ? 'Diagnostic quiz ' + score(H, t.best) : 'Diagnostic quiz <a href="#">Take it</a>')
      : (t.list.length ? '<span>' + testsShort(H, m, s) + '</span>' : '<span class="tl-none">No practice test</span>');
    var nextIdx = Math.min(s.done, s.total - 1);
    var body = here
      ? '<p class="tl-next-title">' + H.esc(s.lessons[nextIdx]) + '</p><p class="tl-pos">Lesson ' + (nextIdx + 1) + ' of ' + s.total + '</p>' + btn(H, n.action, 'tl-btn')
      : full ? '<p class="tl-review"><span class="tl-ok">' + H.ICON.check + 'All ' + s.total + ' lessons done</span> · <a href="#">Review lessons</a></p>'
      : '<p class="tl-peek"><span>' + (s.done ? 'Next:' : 'First lesson:') + '</span> <a href="#">' + H.esc(s.lessons[nextIdx]) + '</a></p>';
    return '<li class="tl' + (full ? ' is-done' : '') + (here ? ' is-here' : '') + (idle ? ' is-idle' : '') + '">' +
      '<div class="tl-head"><img src="assets/' + s.icon + '" alt=""><h3>' + H.esc(s.name) + '</h3><span class="tl-count">' + (s.done ? s.done + '/' + s.total : s.total + ' lessons') + '</span></div>' +
      ticks(s, 'is-tile') + (status ? '<div class="tl-mid">' + status + '</div>' : '') + body + (testLine ? '<p class="tl-test">' + testLine + '</p>' : '') + '</li>';
  }
  function tilesGoal(H, m) {
    var g = goalTest(H, m);
    return '<div class="tl-act">' + (g ? takeBtn(H, g) : btn(H, 'Go to practice tests')) + '<a class="link-btn" href="#">All practice tests</a></div>';
  }
  V.tiles = function (H, key, phone) {
    var m = H.model(key), n = info(H, m);
    var practice = practiceOnly(H), passed = practice.filter(function (t) { return H.isPassed(m.S, t); }).length;
    var top = '<section class="sheet tl-top">' + hello(H) + (m.lessonsDone ? '<p class="tl-sum"><span class="nw"><b>' + m.lessonsDone + '</b> of ' + m.lessonsTotal + ' lessons</span><span class="dot">·</span><span class="nw"><b>' + passed + '</b> of ' + practice.length + ' practice tests at 90%+</span></p>' : '<p class="tl-sum"><span class="nw"><b>' + m.lessonsTotal + '</b> lessons in 9 subjects</span><span class="dot">·</span><span class="nw"><b>' + practice.length + '</b> practice tests</span></p>') +
      (n.allDone ? tilesGoal(H, m) : '') + '</section>';
    var grid = '<ul class="tl-grid">' + m.secs.map(function (s, i) { return tile(H, m, s, i, n); }).join('') + '</ul>';
    // When all lessons are done the top sheet carries the one button, so the closing sheet would only repeat it.
    // "Final test" read as one more exam no one could find, so the sheet names the practice tests
    var finale = n.allDone ? '' : '<section class="sheet tl-final"><div><h2 class="h2">Finish with the practice tests</h2><p class="sub">Score over 90%, and you\'re more than ready for the real exam!</p></div>' +
      '<a class="link-btn" href="#">Go to practice tests</a></section>';
    var content = top + (m.lessonsDone ? '' : planFold(H, m)) + grid + finale + (m.lessonsDone ? planFold(H, m) : '') +
      statBox(H, m, phone ? '' : 'is-strip') + H.comments(m);
    return shell(H, m, phone, content, 'v3-tiles');
  };

  // =============== 4. Exam checklist ===============
  V.ready = function (H, key, phone) {
    var m = H.model(key), n = info(H, m);
    var practice = practiceOnly(H);
    var passed = practice.filter(function (t) { return H.isPassed(m.S, t); }).length;
    var leftLessons = m.lessonsTotal - m.lessonsDone, leftTests = practice.length - passed;
    // On day one "Left before the exam" read as a debt list, so a new student sees the size of the course instead
    var left = n.allDone
      ? 'Left before the exam: <span class="nw"><b>' + leftTests + '</b> practice tests</span> to get over 90%'
      : !n.started ? 'Your course: <span class="nw"><b>' + leftLessons + '</b> lessons</span><span class="dot">·</span><span class="nw"><b>' + leftTests + '</b> practice tests</span>'
      : 'Left before the exam: <span class="nw"><b>' + leftLessons + '</b> lessons</span><span class="dot">·</span><span class="nw"><b>' + leftTests + '</b> practice tests</span>';
    // All lessons done: the open line is the next practice test, the same one every layout offers
    var goal = n.allDone ? goalTest(H, m) : null, goalSec = goal ? secIndex(m, goal) : -1;
    var act = n.allDone
      ? (goal ? takeBtn(H, goal) : btn(H, 'Go to practice tests'))
      // The open "Next lesson" row right below names the lesson, so the button needs no caption of its own
      : btn(H, n.action);
    var rows = m.secs.map(function (s, i) {
      var t = secTests(H, m, s), full = s.done >= s.total, here = n.allDone ? i === goalSec : i === m.here;
      // Every test by number with its own score (a "best" hid the 78% a student wanted to retake), and a way to act on it;
      // the row that is Next up already carries its action in the open line below
      // A subject the student has not reached yet only says how many tests it has: a wall of "not taken" read as falling behind
      var reached = full || t.taken > 0 || here;
      var testCell = i === 0 ? (t.best != null ? 'Diagnostic quiz ' + score(H, t.best) : '<span class="ck-muted">Diagnostic quiz</span> <a class="ck-go" href="#">Take it</a>')
        : !t.list.length ? '<span class="ck-muted">No practice test</span>'
        : !reached ? '<span class="ck-muted">' + t.list.length + ' practice tests</span>'
        : '<span class="ck-ph">Practice tests: </span>' + testsShort(H, m, s);
      // Ready for the exam only when every test of the subject is at 90%+: one passed test next to one never taken is not ready
      var ready = full && (i === 0 || !t.list.length || t.passed === t.list.length);
      // "Ready" alone read as "ready to start"; the Introduction has no exam part, so it is just done
      var status = here ? '<span class="ck-stamp is-here">Next up</span>'
        // Without a practice test nothing shows exam readiness, so such a subject is just done
        : ready ? '<span class="ck-stamp is-ready">' + H.ICON.check + (i === 0 || !t.list.length ? 'Done' : 'Ready for exam') + '</span>'
        : full ? '<span class="ck-stamp is-test">' + (s.tests.some(function (x) { var sc = m.S.tests[x.name]; return sc != null && sc < H.PASS; }) ? 'Test below 90%' : 'Test not taken') + '</span>'
        : s.done ? '<span class="ck-stamp">In progress</span>' : '<span class="ck-stamp is-idle">Not started</span>';
      var detail = '';
      if (here && goal) {
        var gs = m.S.tests[goal.name];
        detail = '<tr class="ck-open"><td colspan="4"><div class="ck-open-in"><span class="ck-open-label">Next test</span><b>' + H.esc(tname(goal.name)) + '</b><span class="ck-muted">' + goal.q + ' questions' + (gs != null ? ' · best so far ' + gs + '%' : '') + '</span></div></td></tr>';
      } else if (here) {
        var nx = Math.min(s.done, s.total - 1);
        detail = '<tr class="ck-open"><td colspan="4"><div class="ck-open-in"><span class="ck-open-label">Next lesson</span><b>' + H.esc(s.lessons[nx]) + '</b><span class="ck-muted">Lesson ' + (nx + 1) + ' of ' + s.total + '</span>' +
          (s.tests.length && i ? '<span class="ck-then">Then: <a href="#">' + H.esc(tname(s.tests[0].name)) + '</a></span>' : '') + '</div></td></tr>';
      }
      return '<tr class="' + (ready ? 'is-ready' : '') + (here ? ' is-here' : '') + '"><th scope="row"><img src="assets/' + s.icon + '" alt="">' + H.esc(s.name) + '</th>' +
        '<td class="ck-lessons"><b>' + s.done + '</b> / ' + s.total + '<span class="ck-ph"> lessons</span>' + (full ? ' <a class="ck-go" href="#">Review</a>' : '') + '</td><td class="ck-test">' + testCell + '</td><td class="ck-status">' + status + '</td></tr>' + detail;
    }).join('');
    var table = '<table class="ck"><thead><tr><th scope="col">Subject</th><th scope="col">Lessons</th><th scope="col">Practice tests</th><th scope="col">Status ' + H.NEW + '</th></tr></thead><tbody>' + rows +
      '<tr class="ck-final"><th scope="row">' + H.ICON2.flag + '<a href="#">All practice tests</a></th><td colspan="2">Score over 90%, and you\'re more than ready for the real exam!</td><td class="ck-status"><span class="ck-stamp' + (n.allDone ? ' is-here' : ' is-idle') + '">' + (m.testsTaken ? passed + ' of ' + practice.length + ' at 90%+' : practice.length + ' practice tests') + '</span></td></tr></tbody></table>';
    var plan = m.lessonsDone ? '' : '<div class="ck-plan"><h3 class="v3-mini">Here\'s the game plan — simple and <span class="nw">stress-free</span></h3>' + planList(H, m, 'is-row is-compact') + '</div>';
    var sheet = '<section class="sheet ck-sheet"><div class="ck-head">' + hello(H) + '<p class="ck-left">' + left + '</p>' + plan + '<div class="ck-act">' + act + '</div></div>' + table + '</section>';
    var content = sheet + (m.lessonsDone ? planFold(H, m) : '') + statBox(H, m, phone ? '' : 'is-strip') + H.comments(m);
    return shell(H, m, phone, content, 'v3-ready');
  };

  // ---------- clicks ----------
  V.onClick = function (e, H) {
    var a = e.target.closest('[data-v3all]');
    if (a) {
      e.preventDefault();
      deskAll = { key: H.state.state, i: +a.getAttribute('data-v3all') };
      H.rerender();
      return true;
    }
    var p = e.target.closest('[data-v3pick]');
    if (!p) return false;
    e.preventDefault();
    var v = p.getAttribute('data-v3pick'), m = H.model(H.state.state);
    pickedSection = (v === 'here' || +v === m.here) ? null : { key: H.state.state, i: +v };
    H.rerender();
    return true;
  };
})();
