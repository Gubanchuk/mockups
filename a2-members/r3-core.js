// Round 3 (YBG-1877): shared student model and mockup frame for exam.html, contents.html, tutor.html.
// Each variant registers window.R3V = { render(m, phone), onClick(e, api) } before this file loads.
(function () {
  var C = window.A2_COURSE;
  var NAME = 'Jordan';
  var PASS = 90;

  // Exam subjects, from the Orientation lesson of the course: science tests and Critical Thinking are chosen by the school,
  // Math and the three English tests are taken by nearly everyone.
  var REQUIRED = ['math', 'reading', 'vocabulary', 'grammar'];
  var OPTIONAL = ['biology', 'chemistry', 'anatomy', 'critical'];
  var DIAG_ORDER = ['anatomy', 'biology', 'chemistry', 'critical', 'grammar', 'math', 'reading', 'vocabulary'];

  // Sample students. "new" has not picked subjects yet, so every subject counts until they do.
  var STATES = {
    new: {
      chosen: false, picks: REQUIRED.concat(OPTIONAL), exam: null, target: null,
      diag: null, done: {}, tests: {}, lastStudied: null, comments: []
    },
    progress: {
      chosen: true, picks: REQUIRED.concat(['biology', 'anatomy']),
      exam: { date: 'Nov 28', long: 'November 28', days: 39 }, target: 80,
      diag: { anatomy: 2, biology: 4, chemistry: 3, critical: 3, grammar: 2, math: 4, reading: 4, vocabulary: 4 },
      done: { introduction: 4, biology: 13, anatomy: 6 },
      tests: { 'DIAGNOSTIC A2 TEST': 65, 'A2 Biology Practice Test': 92 },
      lastStudied: 'yesterday',
      comments: [
        { name: NAME, time: '3 days ago', lesson: 'Musculoskeletal II: Muscle', text: 'Is smooth muscle the same as cardiac muscle? Both are involuntary.',
          reply: { name: 'Claire Corter', admin: true, time: '2 days ago', unread: true, text: 'Good catch, both are involuntary, but only cardiac muscle is striated. The Cardiovascular lessons come back to it.' } }
      ]
    },
    done: {
      chosen: true, picks: REQUIRED.concat(['biology', 'chemistry', 'anatomy']),
      exam: { date: 'Nov 6', long: 'November 6', days: 17 }, target: 75,
      diag: { anatomy: 3, biology: 3, chemistry: 2, critical: 3, grammar: 3, math: 3, reading: 4, vocabulary: 3 },
      done: 'all',
      tests: { 'DIAGNOSTIC A2 TEST': 60,
        'A2 Vocabulary and General Knowledge Practice Test': 91, 'A2 Vocabulary and General Knowledge Practice Test 2': 93,
        'A2 Math Practice Test': 78, 'A2 Math Practice Test 2': 88,
        'A2 Anatomy and Physiology Practice Test': 91, 'A2 Anatomy and Physiology Practice Test 2': 94,
        'A2 Grammar Practice Test': 85,
        'A2 Biology Practice Test': 92, 'A2 Biology Practice Test 2': 95,
        'A2 Chemistry Practice Test': 77 },
      lastStudied: 'yesterday',
      comments: [
        { name: NAME, time: '3 weeks ago', lesson: 'Ratios and Proportions', text: 'For dosage questions, should I always set it up as a proportion?',
          reply: { name: 'Claire Corter', admin: true, time: '3 weeks ago', text: 'Yes, it is the safest way under time pressure. Write what you know on the left and what you need on the right.' } }
      ]
    }
  };

  var state = { state: 'progress', screen: 'laptop', picks: {}, ticks: {}, view: 'home', edit: null, pop: null, examSet: {}, lvOpen: {} };
  Object.keys(STATES).forEach(function (k) { state.picks[k] = STATES[k].picks.slice(); state.ticks[k] = {}; state.examSet[k] = {}; state.lvOpen[k] = {}; });

  // Mockup "today" is October 20, 2026; exam dates the student enters are counted from it
  var TODAY = new Date(2026, 9, 20);
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function examFromInput(v) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); if (!p) return null;
    var d = new Date(+p[1], +p[2] - 1, +p[3]);
    var days = Math.round((d - TODAY) / 86400000); if (days < 1) return null;
    return { date: MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(), long: MONTHS[d.getMonth()] + ' ' + d.getDate(), days: days, iso: v };
  }
  function isoOf(exam) {
    if (!exam) return '';
    if (exam.iso) return exam.iso;
    var d = new Date(TODAY); d.setDate(d.getDate() + exam.days);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function model(key) {
    var S = Object.assign({}, STATES[key], state.examSet[key]);
    var picks = state.picks[key];
    var secs = C.sections.map(function (s, i) {
      var total = s.lessons.length;
      var done = S.done === 'all' ? (s.id === 'introduction' || picks.indexOf(s.id) > -1 ? total : 0) : (S.done[s.id] || 0);
      var tests = C.practiceTests.filter(function (t) { return t.subject === s.id; }).map(function (t) {
        return { name: t.name, q: t.q, score: S.tests[t.name] != null ? S.tests[t.name] : null };
      });
      return {
        id: s.id, name: s.name, icon: s.icon, lessons: s.lessons, total: total, done: done, no: i + 1,
        intro: s.id === 'introduction', required: REQUIRED.indexOf(s.id) > -1, optional: OPTIONAL.indexOf(s.id) > -1,
        picked: s.id === 'introduction' || picks.indexOf(s.id) > -1, tests: tests,
        diag: S.diag ? S.diag[s.id] : null
      };
    });
    var mine = secs.filter(function (s) { return s.picked; });
    var skipped = secs.filter(function (s) { return !s.picked; });
    var total = mine.reduce(function (a, s) { return a + s.total; }, 0);
    var done = mine.reduce(function (a, s) { return a + Math.min(s.done, s.total); }, 0);

    // Next lesson: the site continues after the last marked lesson, so a subject already started comes first
    // (adding a subject must not pull the student out of it); otherwise the first unfinished one in course order
    var nextSec = mine.filter(function (s) { return s.done > 0 && s.done < s.total; })[0] ||
      mine.filter(function (s) { return s.done < s.total; })[0];
    var next = nextSec ? { sec: nextSec, idx: nextSec.done, title: nextSec.lessons[nextSec.done] } : null;
    var myTests = [];
    mine.forEach(function (s) { s.tests.forEach(function (t) { myTests.push(Object.assign({ sec: s }, t)); }); });
    var passed = myTests.filter(function (t) { return t.score != null && t.score >= PASS; });
    // Next practice test: first a subject with all lessons done and no test score yet, then any test not taken
    // in course order, otherwise the lowest one below 90%
    var nextTest = myTests.filter(function (t) {
        return t.score == null && t.sec.done >= t.sec.total && !t.sec.tests.some(function (x) { return x.score != null; });
      })[0] ||
      myTests.filter(function (t) { return t.score == null; })[0] ||
      myTests.filter(function (t) { return t.score < PASS; }).sort(function (a, b) { return a.score - b.score; })[0] || null;

    var diagScore = S.tests['DIAGNOSTIC A2 TEST'];
    var weak = S.diag ? DIAG_ORDER.filter(function (id) { return S.diag[id] <= 2; }).map(function (id) { return secById(secs, id); }) : [];
    var weakMine = weak.filter(function (s) { return s.picked; });

    var intro = secs[0];
    var steps = [
      { k: 'intro', done: intro.done >= 3 },
      { k: 'subjects', done: S.chosen, isNew: true },
      { k: 'diagnostic', done: diagScore != null },
      { k: 'lessons', done: done >= total },
      { k: 'final', done: myTests.length > 0 && passed.length === myTests.length }
    ];
    var cur = -1;
    for (var j = 0; j < steps.length; j++) { if (!steps[j].done) { cur = j; break; } }
    steps.forEach(function (st, n) { st.state = st.done ? 'done' : (n === cur ? 'now' : 'next'); });

    // The bar a score is measured against: the student's school when they entered it, Claire's 90% otherwise.
    // Claire's 90% stays the goal for retakes either way.
    var bar = S.target || PASS;
    var taken = myTests.filter(function (t) { return t.score != null; });
    return {
      key: key, S: S, name: NAME, secs: secs, mine: mine, skipped: skipped, total: total, done: done, left: total - done,
      next: next, myTests: myTests, passed: passed, nextTest: nextTest, diagScore: diagScore, weak: weak, weakMine: weakMine,
      steps: steps, cur: cur, allLessonsDone: done >= total, PASS: PASS,
      bar: bar, barLabel: S.target ? "your school's " + S.target + '%' : "Claire's 90% goal",
      taken: taken, untaken: myTests.length - taken.length, aboveBar: taken.filter(function (t) { return t.score >= bar; }).length
    };
  }

  function secById(secs, id) { for (var i = 0; i < secs.length; i++) if (secs[i].id === id) return secs[i]; return null; }

  // Claire's game plan from the live page, dashes replaced; step 2 is new (subject choice from the Orientation lesson).
  var PLAN = {
    intro: { title: 'Start with the intro section', text: "It'll show you how everything works around here." },
    subjects: { title: 'Pick the subjects on your exam', text: 'Ask your school which tests they require and what score they need.' },
    diagnostic: { title: 'Take a quick diagnostic quiz', text: "See where you're strong and where you can grow." },
    lessons: { title: 'Learn a little each day', text: 'Go lesson by lesson, take the short quizzes, and just keep moving. No pressure, no burnout, just steady progress.' },
    final: { title: 'Finish with a final test', text: "Score over 90%, and you're more than ready for the real exam!" }
  };

  // Hint icon with a tooltip (hover on desktop, tap on phone). align: 'start' | 'end' keeps the bubble inside the screen near an edge.
  var TIP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/></svg>';
  function tip(text, align) {
    return '<span class="r3-tip" tabindex="0" role="button" aria-label="What is this?"' + (align ? ' data-align="' + align + '"' : '') + '>' + TIP_ICON +
      '<span class="r3-tip-b" role="tooltip">' + text + '</span></span>';
  }
  var TIPS = {
    diag: 'The diagnostic quiz from the intro section: 40 questions, 5 per subject. Here you see how many of the 5 you got right. 2 or fewer right means the subject needs more practice.',
    tests: "Two practice tests per subject (Critical Thinking has none). Green means at or above the score your school needs. Claire's own goal is 90%, so anything under it has a Retake.",
    subjects: 'Math and the three English tests are on nearly every exam. Biology, Chemistry, Anatomy and Physiology, and Critical Thinking are only on yours if your school requires them.',
    left: 'Counts the intro section and the subjects on your exam. Subjects you took off are not counted.',
    scale: "Blue dot: your best practice test. Ring: the diagnostic quiz, only 5 questions, so it's a rough guess. Orange line: the score your school needs. Retake shows on tests under Claire's 90% goal.",
    score: "The cumulative score your nursing school asks for. Schools set their own, so ask yours if you don't know it.",
    today: 'Made from your subjects, the diagnostic quiz and your exam date. Lesson videos are 6 to 9 minutes.'
  };

  // A control that leads to a page the site already has: in the mockup it says where it goes instead of doing nothing
  function go(where) { return ' data-goto="' + esc(where) + '"'; }

  function days(n) { return n + (n === 1 ? ' day' : ' days'); }

  function addDays(n) { var d = new Date(TODAY); d.setDate(d.getDate() + n); return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); }

  // Pace (new): plain arithmetic from the lessons left and the days to the exam.
  // A lesson is a 6 to 9 minute video plus a quiz; past six a day the plan stops being real.
  function pace(m) {
    var S = m.S;
    if (!S.exam) return m.left ? { text: 'Add your exam date to see how many lessons a day you need.' } : null;
    if (m.left === 0) {
      return { text: (m.untaken ? m.untaken + ' practice test' + (m.untaken > 1 ? 's' : '') + ' left · ' : '') + days(S.exam.days) + ' to your exam' };
    }
    var perDay = Math.max(1, Math.ceil(m.left / S.exam.days));
    var need = Math.ceil(m.left / perDay), spare = S.exam.days - need;
    if (perDay > 6) return { warn: true, perDay: perDay, text: m.left + " lessons won't fit in " + days(S.exam.days) + '. Start with the subjects where the diagnostic was low.' };
    var head = perDay + ' lesson' + (perDay > 1 ? 's' : '') + ' a day finishes by ' + addDays(need);
    return { warn: spare < 4, perDay: perDay, text: head + (spare <= 0 ? ', right on exam day. Add one more a day.'
      : spare < 4 ? ', only ' + days(spare) + ' before your exam. Add one more a day.' : ', ' + days(spare) + ' before your exam.') };
  }

  // A new reply from Claire is announced at the top of the page; on the live site it sits at the very bottom
  function replyNotice(m) {
    var c = m.S.comments.filter(function (x) { return x.reply && x.reply.unread; })[0];
    if (!c) return '';
    return '<a href="#" class="r3-reply" data-toreply><span class="r3-reply-dot" aria-hidden="true"></span>' +
      '<span class="r3-reply-t"><b>Claire replied</b> to your question under ' + c.lesson + ' · ' + c.reply.time + '</span><span class="r3-reply-go">See reply</span></a>';
  }

  // A subject still needs attention when the diagnostic was low, unless its lessons are done and a test cleared the bar
  function needsFocus(s, m) {
    if (s.diag == null || s.diag > 2 || s.intro) return false;
    var best = s.tests.reduce(function (a, t) { return t.score != null && t.score > a ? t.score : a; }, -1);
    return !(s.done >= s.total && best >= m.bar);
  }

  // Exam details editor (new): date, the score the school needs, optional school name
  function examForm(m, opts) {
    opts = opts || {};
    return '<form class="r3-form" data-form="exam">' +
      '<label class="r3-f"><span>Exam date</span><input type="date" name="date" min="2026-10-21" value="' + isoOf(m.S.exam) + '" required></label>' +
      '<label class="r3-f r3-f-sm"><span>Score your school needs</span><span class="r3-pct"><input type="number" name="target" min="50" max="100" step="1" value="' + (m.S.target || '') + '"><i>%</i></span></label>' +
      (opts.school ? '<label class="r3-f"><span>Your nursing school (optional)</span><input type="text" name="school" maxlength="60" placeholder="School name" value="' + esc(m.S.school || '') + '"></label>' : '') +
      // A student without a date has nothing to go back to, so there is no Cancel
      '<div class="r3-f-act"><button type="submit" class="r3-f-save">Save</button>' +
      (m.S.exam ? '<button type="button" class="r3-f-cancel" data-cancel>Cancel</button>' : '') + '</div></form>';
  }

  function profileMenu() {
    return '<div class="r3-pop" role="menu"><a href="#" role="menuitem"' + go('My Profile (/a2/my-account)') + '>My Profile</a>' +
      '<a href="#" role="menuitem"' + go('Log out') + '>Log out</a></div>';
  }

  // Lessons page: on the live site lessons are only listed in the left menu; the new layouts have no such menu, so this page replaces it
  function lessonsView(m) {
    var open = state.lvOpen[m.key];
    var cur = m.next && m.S.done !== 'all' ? m.next.sec.id : null;
    function section(s) {
      var isOpen = open[s.id] != null ? open[s.id] : s.id === cur;
      var head = '<button type="button" class="r3-lv-h" data-lv="' + s.id + '" aria-expanded="' + isOpen + '"><span class="r3-lv-name">' + s.name + '</span>' +
        (!s.picked ? '<span class="r3-lv-off">Not on your exam</span>' : '') +
        '<span class="r3-lv-n">' + (s.done >= s.total ? 'All ' + s.total + ' done' : s.done + ' of ' + s.total) + '</span><span class="r3-lv-chev" aria-hidden="true"></span></button>';
      if (!isOpen) return '<li class="r3-lv-s' + (s.done >= s.total ? ' is-done' : '') + '">' + head + '</li>';
      var nextIdx = s.id === cur ? m.next.idx : -1;
      var rows = s.lessons.map(function (l, i) {
        var st = i < s.done ? 'is-done' : (i === nextIdx ? 'is-next' : '');
        return '<li class="r3-lv-l ' + st + '"><span class="r3-lv-i">' + (i + 1) + '</span><a href="#"' + go('The lesson page: ' + l) + '>' + l + '</a>' +
          '<span class="r3-lv-st">' + (i < s.done ? 'Done' : (i === nextIdx ? 'Next' : '')) + '</span></li>';
      }).join('');
      var tests = s.tests.map(function (t) {
        return '<li class="r3-lv-l is-test"><span class="r3-lv-i">Test</span><a href="#"' + go('The practice test: ' + t.name) + '>' + t.name + '</a>' +
          '<span class="r3-lv-st">' + (t.score == null ? 'Not taken' : t.score + '%') + '</span></li>';
      }).join('');
      return '<li class="r3-lv-s is-open' + (s.done >= s.total ? ' is-done' : '') + '">' + head + '<ol class="r3-lv-list">' + rows + tests + '</ol></li>';
    }
    var mine = m.secs.filter(function (s) { return s.picked; }).map(section).join('');
    var off = m.secs.filter(function (s) { return !s.picked; }).map(section).join('');
    return '<section class="r3-lv" aria-label="Lessons"><button type="button" class="r3-lv-back" data-view="home">Back to Home</button>' +
      '<h1 class="r3-lv-title">Lessons</h1><p class="r3-lv-sum">' + m.done + ' of ' + m.total + ' lessons in your plan. Open a subject to see its lessons and practice tests.</p>' +
      '<ol class="r3-lv-secs">' + mine + '</ol>' +
      (off ? '<h2 class="r3-lv-h2">Not on your exam</h2><p class="r3-lv-sum">Still here if your school asks for them later.</p><ol class="r3-lv-secs">' + off + '</ol>' : '') + '</section>';
  }

  function courseBar(m) {
    var cur = m.next && m.S.done !== 'all' ? m.next.sec.id : null;
    var segs = m.mine.map(function (s) {
      var pct = Math.min(100, s.done / s.total * 100);
      return '<span class="r3-cb-seg' + (s.done >= s.total ? ' is-done' : '') + (s.id === cur ? ' is-cur' : '') + '" style="flex:' + s.total + '" title="' + s.name + ': ' + s.done + ' of ' + s.total + '">' +
        '<i style="width:' + pct.toFixed(1) + '%"></i></span>';
    }).join('');
    // "Your plan" is the intro section plus the subjects on the student's exam, the same lessons the bar shows
    return '<div class="r3-cb"><div class="r3-cb-top"><span><b>' + m.done + '</b> of ' + m.total + ' lessons in your plan' + tip(TIPS.left) + '</span>' +
      (m.left ? '<span>' + m.left + ' to go</span>' : '<span>All done</span>') + '</div>' +
      '<div class="r3-cb-track" role="img" aria-label="' + m.done + ' of ' + m.total + ' lessons done in your plan">' + segs + '</div></div>';
  }

  var api = {
    C: C, NAME: NAME, PASS: PASS, REQUIRED: REQUIRED, OPTIONAL: OPTIONAL, STATES: STATES, PLAN: PLAN,
    state: state, model: model, esc: esc, secById: secById, tip: tip, TIPS: TIPS, go: go, days: days, pace: pace, needsFocus: needsFocus, replyNotice: replyNotice, examForm: examForm, profileMenu: profileMenu, lessonsView: lessonsView, courseBar: courseBar,
    rerender: function () { render(); }
  };
  window.R3 = api;

  var V = window.R3V;
  var stage = document.getElementById('stage');
  var scrolls = [];

  function render() {
    // Keep phone scroll positions across re-renders (toggling a subject should not jump to the top)
    scrolls = [].map.call(stage.querySelectorAll('.scroller'), function (s) { return s.scrollTop; });
    var m = model(state.state);
    if (state.screen === 'phone' && document.body.getAttribute('data-solo') === '1') {
      stage.innerHTML = V.render(m, true);
    } else if (state.screen === 'laptop') {
      stage.innerHTML = V.render(m, false);
    } else {
      stage.innerHTML = [390, 446].map(function (w) {
        return '<figure class="device"><div class="bezel"><div class="screen" style="width:' + w + 'px;height:705px"><div class="scroller">' +
          V.render(m, true) + '</div></div></div><figcaption>' + w + ' × 705</figcaption></figure>';
      }).join('');
      [].forEach.call(stage.querySelectorAll('.scroller'), function (s, i) { if (scrolls[i]) s.scrollTop = scrolls[i]; });
    }
    document.querySelectorAll('.mock-seg').forEach(function (seg) {
      var k = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === state[k])); });
    });
    if (V.after) V.after(stage, m, api);
    if (window.R3_RU) window.R3_RU.apply(stage);
    alignTips();
  }

  // A hint near the edge of its screen opens towards the middle, so the bubble is never cut off on a phone
  function alignTip(t) {
    var box = (t.closest('.screen') || document.documentElement).getBoundingClientRect();
    var r = t.getBoundingClientRect(), c = r.left + r.width / 2, pad = 8, b = t.querySelector('.r3-tip-b');
    if (!r.width || !b) return;
    // Centred on the icon, then pushed inside the screen; the arrow keeps pointing at the icon
    var W = Math.min(264, box.width - pad * 2);
    var left = Math.min(Math.max(c - W / 2, box.left + pad), box.right - pad - W);
    t.setAttribute('data-align', 'px');
    b.style.width = W + 'px';
    b.style.left = (left - r.left) + 'px';
    b.style.setProperty('--ax', (c - left) + 'px');
  }
  function alignTips() { [].forEach.call(stage.querySelectorAll('.r3-tip'), alignTip); }
  // Positions move once web fonts arrive, and phone frames scroll, so measure again when a hint opens
  function alignOnOpen(e) { var t = e.target.closest && e.target.closest('.r3-tip'); if (t) alignTip(t); }
  stage.addEventListener('mouseover', alignOnOpen);
  stage.addEventListener('focusin', alignOnOpen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignTips);
  addEventListener('load', alignTips);

  document.querySelector('.mock-bar').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-value]'); if (!b) return;
    var k = b.parentNode.getAttribute('data-key');
    state[k] = b.getAttribute('data-value');
    state.edit = null; state.pop = null;
    stage.querySelectorAll('.scroller').forEach(function (s) { s.scrollTop = 0; });
    writeHash(); render();
  });

  var toastTimer;
  function toast(text) {
    var t = document.querySelector('.r3-toast');
    if (!t) { t = document.createElement('div'); t.className = 'r3-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    // Log out is an action, not a page
    var out = text === 'Log out';
    var head = out ? 'Log out' : 'Goes to', tail = out ? 'Works as on the site now.' : 'This page is on the site already and stays as it is.';
    if (window.R3_RU) { head = window.R3_RU.tr(head); tail = window.R3_RU.tr(tail); text = window.R3_RU.tr(text); }
    t.innerHTML = '<b>' + head + (out ? '' : ':') + '</b>' + (out ? '' : ' ' + esc(text)) + '<span>' + tail + '</span>';
    t.classList.add('is-on'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 3800);
  }

  stage.addEventListener('submit', function (e) {
    if (V.onSubmit && V.onSubmit(e, api)) return;
    var f = e.target.closest('[data-form="exam"]'); if (!f) return;
    e.preventDefault();
    var set = state.examSet[state.state];
    var ex = examFromInput(f.elements.date.value);
    if (ex) set.exam = ex;
    var tg = parseInt(f.elements.target.value, 10);
    if (tg >= 50 && tg <= 100) set.target = tg;
    if (f.elements.school) set.school = f.elements.school.value.trim();
    state.edit = null; render();
  });

  stage.addEventListener('click', function (e) {
    var pop = e.target.closest('[data-pop]');
    if (!pop && state.pop && !e.target.closest('.r3-pop, .r3-menu')) { state.pop = null; render(); }
    if (V.onClick && V.onClick(e, api)) return;
    var g = e.target.closest('[data-goto]');
    if (g) {
      e.preventDefault();
      // An item picked from an open menu closes the menu, as a real link would
      if (state.pop && g.closest('.r3-pop, .lt-menu')) { state.pop = null; render(); }
      toast(g.getAttribute('data-goto')); return;
    }
    if (pop) { e.preventDefault(); var pv = pop.getAttribute('data-pop'); state.pop = state.pop === pv ? null : pv; render(); return; }
    var tr = e.target.closest('[data-toreply]');
    if (tr) {
      e.preventDefault();
      // Same frame after a re-render: phones are two frames side by side
      var frame = tr.closest('.scroller'), idx = frame ? [].indexOf.call(stage.querySelectorAll('.scroller'), frame) : -1;
      if (V.openReplies) V.openReplies(api);
      var root = idx > -1 ? stage.querySelectorAll('.scroller')[idx] : stage;
      var qs = root.querySelector('[data-qs]');
      if (qs) qs.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var vw = e.target.closest('[data-view]');
    if (vw) {
      e.preventDefault(); state.view = vw.getAttribute('data-view'); state.pop = null; render();
      window.scrollTo(0, 0); stage.querySelectorAll('.scroller').forEach(function (sc) { sc.scrollTop = 0; });
      return;
    }
    var lv = e.target.closest('[data-lv]');
    if (lv) {
      var id = lv.getAttribute('data-lv'), o = state.lvOpen[state.state];
      o[id] = lv.getAttribute('aria-expanded') !== 'true'; render(); return;
    }
    var ed = e.target.closest('[data-edit]');
    if (ed) { e.preventDefault(); state.edit = ed.getAttribute('data-edit'); render(); return; }
    if (e.target.closest('[data-cancel]')) { state.edit = null; render(); return; }
    var t = e.target.closest('[data-subject]');
    if (t) {
      e.preventDefault();
      var id = t.getAttribute('data-subject');
      if (OPTIONAL.indexOf(id) < 0) return;
      var p = state.picks[state.state], i = p.indexOf(id);
      if (i > -1) p.splice(i, 1); else p.push(id);
      render(); return;
    }
    var a = e.target.closest('a[href="#"]'); if (a) e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.pop) { state.pop = null; render(); }
  });

  function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    if (STATES[h.get('state')]) state.state = h.get('state');
    if (h.get('screen') === 'phone' || h.get('screen') === 'laptop') state.screen = h.get('screen');
    document.body.setAttribute('data-solo', h.get('solo') === '1' ? '1' : '0');
  }
  function writeHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    h.set('state', state.state); h.set('screen', state.screen);
    history.replaceState(null, '', '#' + h.toString());
    document.body.setAttribute('data-screen', state.screen);
  }
  readHash(); document.body.setAttribute('data-screen', state.screen); render();

  var bar = document.querySelector('.mock-bar');
  function barHeight() { document.documentElement.style.setProperty('--mock-h', (bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0) + 'px'); }
  barHeight(); addEventListener('resize', barHeight);
})();
