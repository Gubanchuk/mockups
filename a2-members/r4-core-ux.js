// Round 4 (YBG-1877): shared student model and mockup frame for v4-exam.html, v4-tutor.html, v4-goal.html.
// Each version registers window.R4V = { render(m, phone), onClick(e, api), after(stage, m, api) } before this file loads.
// Two views of every version: "Redesign only" shows what the site already knows; "With new features" adds the first-visit setup,
// Settings, the subjects of the student's own exam and the rest, each marked New.
(function () {
  var C = window.A2_COURSE;
  var NAME = 'Jordan';
  var PASS = 90;

  // Exam subjects, from the Orientation lesson of the course: science tests and Critical Thinking are chosen by the school,
  // Math and the three English tests are taken by nearly everyone.
  var REQUIRED = ['math', 'reading', 'vocabulary', 'grammar'];
  var OPTIONAL = ['biology', 'chemistry', 'anatomy', 'critical'];
  var ALL = REQUIRED.concat(OPTIONAL);
  var DIAG_ORDER = ['anatomy', 'biology', 'chemistry', 'critical', 'grammar', 'math', 'reading', 'vocabulary'];

  // Sample students. The new one has just bought the course: with new features the first visit is the setup page.
  var STATES = {
    new: {
      picks: ALL.slice(), exam: null, target: null,
      diag: null, done: {}, tests: {}, lastStudied: null, comments: []
    },
    progress: {
      picks: REQUIRED.concat(['biology', 'anatomy']),
      exam: { date: 'Nov 28', long: 'November 28', days: 39 }, target: 80,
      diag: { anatomy: 2, biology: 4, chemistry: 3, critical: 3, grammar: 2, math: 4, reading: 4, vocabulary: 4 },
      done: { introduction: 4, biology: 13, anatomy: 6 },
      tests: { 'DIAGNOSTIC A2 TEST': 65, 'A2 Biology Practice Test': 92 },
      lastStudied: 'yesterday',
      comments: [
        { time: '3 days ago', lesson: 'Musculoskeletal II: Muscle', text: 'Is smooth muscle the same as cardiac muscle? Both are involuntary.',
          reply: { name: 'Claire Corter', time: '2 days ago', unread: true, text: 'Good catch, both are involuntary, but only cardiac muscle is striated. The Cardiovascular lessons come back to it.' } },
        { time: '4 days ago', lesson: 'Histology and Skin', text: 'Which layer of the skin has blood vessels, the epidermis or the dermis?',
          reply: { name: 'Claire Corter', time: 'yesterday', unread: true, text: 'The dermis. The epidermis has no blood vessels of its own; it gets what it needs from the dermis below it.' } },
        { time: '2 weeks ago', lesson: 'The Cell', text: 'Do I need to know every organelle for the exam or just the main ones?',
          reply: { name: 'Claire Corter', time: '2 weeks ago', text: 'The ones in the lesson are the ones that come up. Learn what each one does, not only its name.' } }
      ]
    },
    done: {
      picks: REQUIRED.concat(['biology', 'chemistry', 'anatomy']),
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
        { time: '3 weeks ago', lesson: 'Ratios and Proportions', text: 'For dosage questions, should I always set it up as a proportion?',
          reply: { name: 'Claire Corter', time: '3 weeks ago', text: 'Yes, it is the safest way under time pressure. Write what you know on the left and what you need on the right.' } }
      ]
    }
  };

  var state = { state: 'progress', screen: 'laptop', feat: 'base', badges: 'on', view: 'home', pop: null, nav: 'top', navMini: null, ai: 'off', aiState: 'ok', aiWait: false, aiOpen: false, aiEnter: false, aiQ: {}, aiPick: {}, aiFree: {},
    picks: {}, examSet: {}, setup: {}, read: {}, lvOpen: {}, open: {}, qaOpen: {} };
  Object.keys(STATES).forEach(function (k) {
    state.picks[k] = STATES[k].picks.slice(); state.examSet[k] = {}; state.lvOpen[k] = {}; state.open[k] = {};
    // Students under way did the setup long ago; the new one has not seen it yet
    state.setup[k] = k === 'new' ? null : 'done';
  });

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
  function isNew() { return state.feat === 'new'; }

  function model(key) {
    var nf = isNew();
    var S = Object.assign({}, STATES[key], nf ? state.examSet[key] : {});
    // Without the new features the site knows nothing about the exam: every subject counts, as on the live page
    if (!nf) { S.exam = null; S.target = null; }
    var chosen = nf && state.setup[key] === 'done';
    var picks = chosen ? state.picks[key] : ALL;
    var secs = C.sections.map(function (s, i) {
      var total = s.lessons.length;
      var on = s.id === 'introduction' || picks.indexOf(s.id) > -1;
      var done = S.done === 'all' ? (on ? total : 0) : (S.done[s.id] || 0);
      var tests = C.practiceTests.filter(function (t) { return t.subject === s.id; }).map(function (t) {
        return { name: t.name, q: t.q, score: S.tests[t.name] != null ? S.tests[t.name] : null };
      });
      return {
        id: s.id, name: s.name, icon: s.icon, lessons: s.lessons, total: total, done: done, no: i + 1,
        intro: s.id === 'introduction', required: REQUIRED.indexOf(s.id) > -1, optional: OPTIONAL.indexOf(s.id) > -1,
        picked: on, tests: tests, diag: nf && S.diag ? S.diag[s.id] : null
      };
    });
    var mine = secs.filter(function (s) { return s.picked; });
    var skipped = secs.filter(function (s) { return !s.picked; });
    var total = mine.reduce(function (a, s) { return a + s.total; }, 0);
    var done = mine.reduce(function (a, s) { return a + Math.min(s.done, s.total); }, 0);

    // Next lesson: the site continues after the last marked lesson, so a subject already started comes first;
    // otherwise the first unfinished one in course order
    var nextSec = mine.filter(function (s) { return s.done > 0 && s.done < s.total; })[0] ||
      mine.filter(function (s) { return s.done < s.total; })[0];
    var next = nextSec ? { sec: nextSec, idx: nextSec.done, title: nextSec.lessons[nextSec.done] } : null;
    var myTests = [];
    mine.forEach(function (s) { s.tests.forEach(function (t) { myTests.push(Object.assign({ sec: s }, t)); }); });
    var passed = myTests.filter(function (t) { return t.score != null && t.score >= PASS; });
    // Next practice test: first a subject with all lessons done and no score yet, then any test not taken, then the lowest under 90%
    var nextTest = myTests.filter(function (t) {
        return t.score == null && t.sec.done >= t.sec.total && !t.sec.tests.some(function (x) { return x.score != null; });
      })[0] ||
      myTests.filter(function (t) { return t.score == null; })[0] ||
      myTests.filter(function (t) { return t.score < PASS; }).sort(function (a, b) { return a.score - b.score; })[0] || null;

    var diagScore = S.tests['DIAGNOSTIC A2 TEST'];
    var weak = nf && S.diag ? DIAG_ORDER.filter(function (id) { return S.diag[id] <= 2; }).map(function (id) { return secById(secs, id); }) : [];

    // Claire's game plan from the live page: four steps, the current one follows from what the student has done
    var intro = secs[0];
    var steps = [
      { k: 'intro', done: intro.done >= 3 },
      { k: 'diagnostic', done: diagScore != null },
      { k: 'lessons', done: done >= total },
      { k: 'final', done: myTests.length > 0 && passed.length === myTests.length }
    ];
    var cur = -1;
    for (var j = 0; j < steps.length; j++) { if (!steps[j].done) { cur = j; break; } }
    steps.forEach(function (st, n) { st.state = st.done ? 'done' : (n === cur ? 'now' : 'next'); });

    var bar = S.target || PASS;
    var taken = myTests.filter(function (t) { return t.score != null; });
    var unread = nf && state.read[key] !== true ? S.comments.filter(function (c) { return c.reply && c.reply.unread; }).length : 0;
    return {
      key: key, S: S, name: NAME, nf: nf, chosen: chosen, setup: state.setup[key], secs: secs, mine: mine, skipped: skipped,
      total: total, done: done, left: total - done, next: next, myTests: myTests, passed: passed, nextTest: nextTest,
      diagScore: diagScore, weak: weak, steps: steps, cur: cur, allLessonsDone: done >= total, PASS: PASS,
      bar: bar, barLabel: S.target ? "your school's " + S.target + '%' : "Claire's 90%",
      taken: taken, untaken: myTests.length - taken.length, aboveBar: taken.filter(function (t) { return t.score >= bar; }).length,
      unread: unread
    };
  }

  function secById(secs, id) { for (var i = 0; i < secs.length; i++) if (secs[i].id === id) return secs[i]; return null; }

  // Claire's game plan, word for word from the live page with the dashes taken out
  var PLAN = {
    intro: { title: 'Start with the intro section', text: "It'll show you how everything works around here." },
    diagnostic: { title: 'Take a quick diagnostic quiz', text: "See where you're strong and where you can grow." },
    lessons: { title: 'Learn a little each day', text: 'Go lesson by lesson, take the short quizzes, and just keep moving. No pressure, no burnout, just steady progress.' },
    final: { title: 'Finish with a final test', text: "Score over 90%, and you're more than ready for the real exam!" }
  };

  // "New" marks what the site cannot do yet. Shown only with the new features on, and the toolbar can hide them
  // to see the page as a student would.
  function tag(extra) {
    if (!isNew() || state.badges === 'off') return '';
    return '<span class="r4-new' + (extra ? ' ' + extra : '') + '">New</span>';
  }

  // Hint icon with a tooltip (hover on desktop, tap on phone)
  var TIP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/></svg>';
  function tip(text) {
    return '<span class="r3-tip" tabindex="0" role="button" aria-label="What is this?">' + TIP_ICON +
      '<span class="r3-tip-b" role="tooltip">' + text + '</span></span>';
  }

  // A control that leads to a page the site already has: in the mockup it says where it goes instead of doing nothing
  function go(where) { return ' data-goto="' + esc(where) + '"'; }
  function days(n) { return n + (n === 1 ? ' day' : ' days'); }
  function addDays(n) { var d = new Date(TODAY); d.setDate(d.getDate() + n); return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  // Pace: plain arithmetic from the lessons left and the days to the exam. A lesson is a 6 to 9 minute video plus a quiz;
  // past six a day the plan stops being real.
  function pace(m) {
    var S = m.S;
    if (!S.exam) return null;
    if (m.left === 0) {
      var todo = m.untaken + m.taken.filter(function (t) { return t.score < PASS; }).length;
      if (!todo) return null;
      var every = Math.floor(S.exam.days / todo);
      return { perDay: 0, text: plural(todo, 'practice test') + ' to take or retake in ' + days(S.exam.days) + (every >= 2 ? ': about one every ' + every + ' days.' : every === 1 ? ': about one a day.' : ': more than one a day.') };
    }
    var perDay = Math.max(1, Math.ceil(m.left / S.exam.days));
    var need = Math.ceil(m.left / perDay), spare = S.exam.days - need;
    if (perDay > 6) return { warn: true, perDay: perDay, text: m.left + " lessons won't fit in " + days(S.exam.days) + '. Start with the subjects where the diagnostic was low.' };
    var head = perDay + ' lesson' + (perDay > 1 ? 's' : '') + ' a day gets you through by ' + addDays(need);
    return { warn: spare < 4, perDay: perDay, text: head + (spare <= 0 ? ', right on exam day. One more a day gives you room.'
      : spare < 4 ? ', only ' + days(spare) + ' before your exam. One more a day gives you room.' : ', ' + days(spare) + ' before your exam.') };
  }

  // A subject still needs attention when the diagnostic was low, unless its lessons are done and a test cleared the bar
  function needsFocus(s, m) {
    if (s.diag == null || s.diag > 2 || s.intro) return false;
    var best = s.tests.reduce(function (a, t) { return t.score != null && t.score > a ? t.score : a; }, -1);
    return !(s.done >= s.total && best >= m.bar);
  }

  function profileMenu() {
    return '<div class="r3-pop" role="menu">' + (isNew() ? '<a href="#" role="menuitem" data-view="settings">Exam settings ' + tag() + '</a>' : '') +
      '<a href="#" role="menuitem"' + go('My Profile (/a2/my-account): name, email, password, photo') + '>My Profile</a>' +
      '<a href="#" role="menuitem"' + go('Log out') + '>Log out</a></div>';
  }

  // Questions to Claire. Students ask in the comments under a lesson; Claire answers there. Every question and answer is
  // labelled in words ("You asked", "Claire answered"), never left to a dot or an icon to explain.
  var X_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  // The two newest versions show each question as a comment thread, as the comments of the live page do: avatar, name, role,
  // time; Claire's answer hangs under the question in her colour, with her initials (the site has no photo of her)
  function chatOn() { return !!(window.R4V && window.R4V.chatQA); }
  // The back link names the place it returns to, as the version's own menu calls it (Study & Progress has no "Home")
  function backLabel() { return (window.R4V && window.R4V.backLabel) || 'Back to Home'; }
  function homeName() { return (window.R4V && window.R4V.homeName) || 'Home'; }
  function lessonSecId(title) {
    for (var i = 0; i < C.sections.length; i++) if (C.sections[i].lessons.indexOf(title) > -1) return C.sections[i].id;
    return 'introduction';
  }
  var CLAIRE_AV = '<span class="r4-av is-claire" aria-hidden="true">CC</span>';
  function chatItem(c) {
    var fresh = c.reply && c.reply.unread && isNew() && state.read[state.state] !== true;
    var me = '<div class="r4-msg is-me"><img class="r4-av" src="assets/avatar.png" alt=""><div class="r4-msg-b"><p class="r4-msg-h"><b>You</b><span>' + c.time + '</span></p>' +
      '<p class="r4-msg-t">' + esc(c.text) + '</p></div></div>';
    var her = c.reply ? '<div class="r4-msg is-claire' + (fresh ? ' is-fresh' : '') + '">' + CLAIRE_AV + '<div class="r4-msg-b"><p class="r4-msg-h"><b>' + c.reply.name + '</b><span class="r4-role">Instructor</span><span>' +
      c.reply.time + '</span>' + (fresh ? '<span class="r4-unread">Unread</span>' : '') + '</p><p class="r4-msg-t">' + esc(c.reply.text) + '</p></div></div>'
      : '<p class="r4-msg-wait">No answer yet. Her answer will show up here and under the lesson.</p>';
    return '<li class="r4-th"><a href="#" class="r4-th-l"' + go('The lesson page: ' + c.lesson + ', comments under the lesson') + '><span class="r4-th-ic" style="--ic:url(assets/sec-' + lessonSecId(c.lesson) + '.svg)" aria-hidden="true"></span>' +
      '<span>' + c.lesson + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a>' +
      '<div class="r4-th-msgs">' + me + her + '</div></li>';
  }
  function qaItem(c) {
    if (chatOn()) return chatItem(c);
    return '<li class="r4-qa"><p class="r4-qa-where">Under the lesson <a href="#"' + go('The lesson page: ' + c.lesson) + '>' + c.lesson + '</a></p>' +
      '<div class="r4-qa-q"><p class="r4-qa-who">You asked · ' + c.time + '</p><p class="r4-qa-t">' + esc(c.text) + '</p></div>' +
      (c.reply ? '<div class="r4-qa-a"><p class="r4-qa-who">Claire answered · ' + c.reply.time + '</p><p class="r4-qa-t">' + esc(c.reply.text) + '</p></div>'
        : '<p class="r4-qa-wait">No answer yet.</p>') + '</li>';
  }
  var Q_EMPTY = 'Stuck on something in a lesson? Ask in the comments under it. Claire answers, and her answer shows up here.';
  // On Home the block folds: folded it is the heading and one line of the latest answer, so many questions never stretch the page.
  // Open, it shows up to three in full; the rest are on the Questions page. New answers (new feature: the site does not track
  // "read") open the block's heading with a count and close with "Mark as read".
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var SHOW_MAX = 3;
  function preview(c) {
    var t = c.reply ? c.reply.text : c.text, cut = t.length > 90 ? t.slice(0, 88).replace(/\s+\S*$/, '') + '…' : t;
    if (chatOn()) {
      return '<div class="r4-ans-pre is-chat">' + (c.reply ? CLAIRE_AV : '<img class="r4-av" src="assets/avatar.png" alt="">') +
        '<p><span class="r4-ans-pre-l">' + (c.reply ? '<b>' + c.reply.name + '</b> answered under ' : '<b>You</b> asked under ') + c.lesson + '</span>' +
        '<span class="r4-ans-pre-t">' + esc(cut) + '</span></p></div>';
    }
    return '<p class="r4-ans-pre"><span class="r4-ans-pre-l">' + c.lesson + '</span>' +
      '<span class="r4-ans-pre-t"><b>' + (c.reply ? 'Claire:' : 'You:') + '</b> ' + esc(cut) + '</span></p>';
  }
  function answers(m) {
    var list = m.S.comments, n = list.length, items, title;
    if (m.nf) {
      items = m.unread ? list.filter(function (c) { return c.reply && c.reply.unread; }) : [];
      if (!items.length) return '';
      title = items.length > 1 ? 'Claire answered ' + items.length + ' of your questions' : 'Claire answered your question';
    } else {
      if (!n) return '<section class="r4-ans" aria-label="Your questions to Claire"><div class="r4-ans-h"><h2>Your questions to Claire</h2></div><p class="r4-qa-empty">' + Q_EMPTY + '</p></section>';
      items = list; title = 'Your questions to Claire';
    }
    var open = state.qaOpen[m.key] === true;
    var label = open ? 'Hide' : (m.nf ? (items.length > 1 ? 'Show answers' : 'Show answer') : 'Show');
    var head = '<div class="r4-ans-h"><h2>' + title + '</h2>' + (m.nf ? tag() : '') +
      '<button type="button" class="r4-ans-tg" data-qa aria-expanded="' + open + '">' + label + CHEV + '</button></div>';
    var more = items.length > SHOW_MAX || (!m.nf && n > 1) || (m.nf && n > items.length)
      ? '<a href="#" class="r4-ans-all" data-view="questions">See all your questions (' + n + ')</a>' : '';
    var body = open
      ? '<ul class="r4-qa-list' + (chatOn() ? ' is-chat' : '') + '">' + items.slice(0, SHOW_MAX).map(qaItem).join('') + '</ul>'
      : preview(items[0]) + (items.length > 1 ? '<p class="r4-ans-more">and ' + (items.length - 1) + ' more</p>' : '');
    // New answers keep two doors: read them here, then mark them read. The full list is the Questions item of the menu, with its counter
    var act = m.nf
      ? '<div class="r4-ans-act"><button type="button" class="r4-btn-2" data-read>Mark as read</button>' +
        (open && items.length === 1 ? '<a href="#" class="r4-ans-all"' + go('The lesson page: ' + items[0].lesson + ', comments under the lesson') + '>Reply under the lesson</a>' : '') + '</div>'
      : (more ? '<div class="r4-ans-act">' + more + '</div>' : '');
    return '<section class="r4-ans' + (m.nf ? ' is-new' : '') + (open ? ' is-open' : '') + '" aria-label="' + title + '">' + head + body + act + '</section>';
  }
  function questionsView(m) {
    var list = m.S.comments;
    return '<section class="r4-page" aria-label="Your questions"><button type="button" class="r3-lv-back" data-view="home">' + backLabel() + '</button>' +
      '<h1 class="r4-page-title">Your questions</h1><p class="r4-page-lead">You ask in the comments under a lesson. Claire answers there, and every question and answer is collected here.</p>' +
      (list.length ? '<ul class="r4-qa-list is-page' + (chatOn() ? ' is-chat' : '') + '">' + list.map(qaItem).join('') + '</ul>' : '<p class="r4-qa-empty">' + Q_EMPTY + '</p>') + '</section>';
  }

  // Diagnostic quiz: a real place on Home, because students did not know where it went.
  // The quiz, its score and the Score Report are on the site already; naming the weak subjects on Home is new.
  function diagnostic(m) {
    if (m.allLessonsDone) return '';
    var lesson = go('The lesson page: Diagnostic Test'), report = go('The Score Report of your diagnostic quiz');
    if (m.diagScore == null) {
      return '<section class="r4-dg" aria-label="Diagnostic quiz"><div class="r4-dg-t"><h2>Diagnostic quiz</h2>' +
        '<p>A 40-question quiz at the end of the intro section, about 40 minutes. It shows which subjects need more of your time.</p></div>' +
        '<a href="#" class="r4-btn-2"' + lesson + '>Take the diagnostic quiz</a></section>';
    }
    var weak = m.nf ? m.weak.filter(function (s) { return s && s.picked; }) : [];
    var weakLine = weak.length ? '<p class="r4-dg-weak">Needs more work: <b>' + weak.map(function (s) { return s.name; }).join('</b> and <b>') + '</b>. You got 2 or fewer of the 5 questions right in ' + (weak.length > 1 ? 'each' : 'it') + '. ' + tag() + '</p>' : '';
    return '<section class="r4-dg is-taken" aria-label="Diagnostic quiz"><div class="r4-dg-t"><h2>Diagnostic quiz</h2>' +
      '<p>You scored <b>' + m.diagScore + '%</b>.' + (m.nf ? '' : ' The Score Report shows how you did in each subject.') + '</p>' + weakLine + '</div>' +
      '<a href="#" class="r4-btn-2"' + report + '>See results by subject</a></section>';
  }

  // Practice tests of a subject (new on Home): each test is a line with its score and, when there is something to do, a real button.
  // One bar on Home: Claire's 90%. Under it the score is amber and the button says Retake.
  // One line that says what the colours mean, shown once above the subjects
  function testsLegend(m) {
    if (!m.nf || !m.taken.length) return '';
    return '<p class="r4-legend"><span class="r4-lg is-ok">90% or more</span> Claire\'s goal reached <span class="r4-lg is-low">Under 90%</span> worth a retake' +
      (m.S.target ? ' <span class="r4-lg-s">Your school needs ' + m.S.target + '%.</span>' : '') + '</p>';
  }

  function testsList(s, m) {
    if (!s.tests.length) return '';
    var open = s.done >= s.total || s.tests.some(function (t) { return t.score != null; });
    if (!open) return '';
    return '<ul class="r4-tests">' + s.tests.map(function (t, i) {
      var link = go('The practice test: ' + t.name), name = '<span class="r4-t-n">Practice test ' + (i + 1) + '</span>';
      if (t.score == null) return '<li>' + name + '<span class="r4-t-s is-none">Not taken</span><a href="#" class="r4-t-b"' + link + '>Take it</a></li>';
      var low = t.score < PASS;
      return '<li>' + name + '<span class="r4-t-s ' + (low ? 'is-low' : 'is-ok') + '">' + t.score + '%</span>' +
        (low ? '<a href="#" class="r4-t-b"' + link + '>Retake</a>' : '<span></span>') + '</li>';
    }).join('') + '</ul>';
  }

  // First visit after buying the course (new): three questions on one page, every answer can wait.
  // Settings (new) holds the same answers later.
  var LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9.5" rx="2.2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>';
  function subjectFields(m, picks) {
    // Subjects every student has are not checkboxes: a lock says they stay on, so nobody tries to untick Math
    var req = REQUIRED.map(function (id) {
      var s = secById(m.secs, id);
      return '<li><span class="r4-fixed"><span class="r4-fixed-ic">' + LOCK + '</span><span>' + s.name + '</span></span></li>';
    }).join('');
    var opt = OPTIONAL.map(function (id) {
      var s = secById(m.secs, id), on = picks.indexOf(id) > -1;
      return '<li><label class="r4-sw"><input type="checkbox" name="sub" value="' + id + '"' + (on ? ' checked' : '') + '><span class="r4-sw-box" aria-hidden="true"></span><span>' + s.name + '</span></label></li>';
    }).join('');
    return '<div class="r4-subj"><div class="r4-subj-g"><p class="r4-subj-h">Always in your plan</p><ul class="r4-subj-l">' + req + '</ul></div>' +
      '<div class="r4-subj-g"><p class="r4-subj-h">Only if your school tests them</p><ul class="r4-subj-l">' + opt + '</ul></div></div>';
  }
  // Exam date: an own calendar instead of the browser's, which speaks the computer's language and looks different in every browser.
  // Days up to today cannot be picked, so the date cannot be wrong; the field says how many days are left.
  var WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  var CH_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var CH_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  function pad2(n) { return ('0' + n).slice(-2); }
  function dpLabel(iso) {
    var ex = examFromInput(iso);
    if (!ex) return '<span class="r4-dp-ph">Pick a date</span>';
    return '<span>' + ex.long + ', ' + iso.slice(0, 4) + '</span><small>' + plural(ex.days, 'day') + ' to go</small>';
  }
  function dateField(S) {
    var off = !S.exam && S.examUnknown, iso = isoOf(S.exam);
    return '<div class="r4-fld-row"><div class="r4-dp"><button type="button" class="r4-in r4-dp-btn" data-dp aria-haspopup="dialog" aria-expanded="false" aria-label="Exam date"' + (off ? ' disabled' : '') + '>' +
      CAL + '<span class="r4-dp-val">' + dpLabel(iso) + '</span></button><input type="hidden" name="date" value="' + iso + '"></div>' +
      '<label class="r4-ck"><input type="checkbox" name="nodate"' + (off ? ' checked' : '') + '><span class="r4-ck-box" aria-hidden="true"></span>I don\'t know yet</label></div>';
  }
  function dpPanel(y, mo, sel) {
    var first = new Date(y, mo, 1).getDay(), n = new Date(y, mo + 1, 0).getDate(), cells = '';
    var canPrev = y > TODAY.getFullYear() || (y === TODAY.getFullYear() && mo > TODAY.getMonth());
    for (var i = 0; i < first; i++) cells += '<span aria-hidden="true"></span>';
    for (var d = 1; d <= n; d++) {
      var day = new Date(y, mo, d), iso = y + '-' + pad2(mo + 1) + '-' + pad2(d), on = iso === sel, today = day.getTime() === TODAY.getTime();
      cells += '<button type="button" class="r4-dp-d' + (today ? ' is-today' : '') + (on ? ' is-sel' : '') + '" data-dp-day="' + iso + '" aria-label="' + MONTHS[mo] + ' ' + d + (today ? ', today' : '') + '"' +
        (on ? ' aria-pressed="true"' : '') + (day <= TODAY ? ' disabled' : '') + '>' + d + '</button>';
    }
    return '<div class="r4-dp-pop" role="dialog" aria-label="Choose your exam date" data-y="' + y + '" data-m="' + mo + '">' +
      '<div class="r4-dp-h"><button type="button" class="r4-dp-nav" data-dp-nav="-1" aria-label="Previous month"' + (canPrev ? '' : ' disabled') + '>' + CH_L + '</button>' +
      '<b>' + MONTHS[mo] + ' ' + y + '</b><button type="button" class="r4-dp-nav" data-dp-nav="1" aria-label="Next month">' + CH_R + '</button></div>' +
      '<div class="r4-dp-w" aria-hidden="true">' + WD.map(function (w) { return '<span>' + w + '</span>'; }).join('') + '</div><div class="r4-dp-g">' + cells + '</div>' +
      '<div class="r4-dp-f"><span>Today is ' + MONTHS[TODAY.getMonth()] + ' ' + TODAY.getDate() + '</span>' + (sel ? '<button type="button" class="r4-dp-clear" data-dp-clear>Clear</button>' : '') + '</div></div>';
  }
  function dpClose() {
    [].forEach.call(document.querySelectorAll('.r4-dp-pop'), function (p) {
      var b = p.parentNode.querySelector('[data-dp]'); if (b) b.setAttribute('aria-expanded', 'false'); p.remove();
    });
  }
  function dpOpen(w, y, mo) {
    var old = w.querySelector('.r4-dp-pop'); if (old) old.remove();
    var sel = w.querySelector('input[name="date"]').value;
    if (y == null) { y = sel ? +sel.slice(0, 4) : TODAY.getFullYear(); mo = sel ? +sel.slice(5, 7) - 1 : TODAY.getMonth(); }
    if (mo < 0) { mo = 11; y--; } else if (mo > 11) { mo = 0; y++; }
    w.insertAdjacentHTML('beforeend', dpPanel(y, mo, sel));
    w.querySelector('[data-dp]').setAttribute('aria-expanded', 'true');
  }
  function dpSet(w, iso) {
    w.querySelector('input[name="date"]').value = iso;
    w.querySelector('.r4-dp-val').innerHTML = dpLabel(iso);
  }
  // The two scores the course names (Orientation lesson: LPN/LVN from 70%, RN from 75%) are one tap; any other is typed
  var SCORES = [70, 75];
  function scoreField(S) {
    var none = !S.target, off = none && S.targetUnknown;
    var chips = SCORES.map(function (v) {
      return '<button type="button" class="r4-chip' + (S.target === v ? ' is-on' : '') + '" data-score="' + v + '" aria-pressed="' + (S.target === v) + '"' + (off ? ' disabled' : '') + '>' + v + '%</button>';
    }).join('');
    return '<div class="r4-fld-row"><span class="r4-pick" role="group" aria-label="Score your school needs">' + chips +
      '<span class="r4-pct"><input class="r4-in" type="number" name="target" min="50" max="100" step="1" placeholder="Other" aria-label="Score your school needs, in percent" value="' + (S.target || '') + '"' + (off ? ' disabled' : '') + '><i>%</i></span></span>' +
      '<label class="r4-ck"><input type="checkbox" name="noscore"' + (off ? ' checked' : '') + '><span class="r4-ck-box" aria-hidden="true"></span>I don\'t know yet</label></div>';
  }
  function setupView(m) {
    var S = m.S, picks = state.picks[m.key];
    return '<section class="r4-su" aria-label="Set up your plan"><div class="r4-su-in">' +
      '<h1 class="r4-su-title">Hey ' + NAME + ', let\'s set up your plan ' + tag() + '</h1>' +
      '<p class="r4-su-lead">Three quick questions, so your plan counts only what is on your exam. Not sure about something? Skip it and change it later in Exam settings, in the menu under your name.</p>' +
      '<form class="r4-su-form" data-form="setup" novalidate>' +
        '<fieldset class="r4-q"><legend><span class="r4-q-n">1</span>When is your exam?</legend>' + dateField(S) +
          '<p class="r4-hint">Booked it already? We count the days for you. No date yet is fine.</p></fieldset>' +
        '<fieldset class="r4-q"><legend><span class="r4-q-n">2</span>What score does your school need?</legend>' + scoreField(S) +
          '<p class="r4-hint">Your school decides. As a rough guide, many programs ask for 70% to 75%.</p></fieldset>' +
        '<fieldset class="r4-q"><legend><span class="r4-q-n">3</span>Which subjects are on your exam?</legend>' + subjectFields(m, picks) +
          '<p class="r4-hint">Math and the three English tests are on nearly every exam. Not sure about the rest? Leave them on and ask your school.</p></fieldset>' +
        '<div class="r4-su-act"><button type="submit" class="r4-btn">Save and start</button><button type="button" class="r4-btn-q" data-skip>Skip for now</button></div>' +
      '</form></div></section>';
  }
  function settingsView(m) {
    var S = m.S, picks = state.picks[m.key];
    return '<section class="r4-set" aria-label="Exam settings"><button type="button" class="r3-lv-back" data-view="home">' + backLabel() + '</button>' +
      '<h1 class="r4-set-title">Exam settings ' + tag() + '</h1>' +
      '<p class="r4-set-lead">Your exam. ' + homeName() + ' counts your plan, the lessons left and the pace from these answers.</p>' +
      '<form class="r4-set-form" data-form="settings" novalidate>' +
        '<div class="r4-set-row"><div class="r4-set-l"><h2>Exam date</h2><p>Days left and the pace come from it.</p></div><div class="r4-set-c">' + dateField(S) + '</div></div>' +
        '<div class="r4-set-row"><div class="r4-set-l"><h2>Score your school needs</h2><p>Practice test scores are measured against it. Without it, against Claire\'s 90%.</p></div><div class="r4-set-c">' + scoreField(S) + '</div></div>' +
        '<div class="r4-set-row"><div class="r4-set-l"><h2>Subjects on your exam</h2><p>A subject you take off stays in Lessons, with your progress.</p></div><div class="r4-set-c">' + subjectFields(m, picks) + '</div></div>' +
        '<div class="r4-set-act"><button type="submit" class="r4-btn">Save changes</button><button type="button" class="r4-btn-q" data-view="home">Cancel</button></div>' +
      '</form>' +
      '<p class="r4-set-more">Name, email, password and photo are in <a href="#"' + go('My Profile (/a2/my-account)') + '>My Profile</a>.</p></section>';
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
    // A version with Lessons in its menu has no way "back" from it: Lessons is a place of its own, not a page under Home
    var back = window.R4V && window.R4V.lessonsInMenu ? '' : '<button type="button" class="r3-lv-back" data-view="home">' + backLabel() + '</button>';
    return '<section class="r3-lv' + (back ? '' : ' is-top') + '" aria-label="Lessons">' + back +
      '<h1 class="r3-lv-title">Lessons</h1><p class="r3-lv-sum">' + m.done + ' of ' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + '. Open a subject to see its lessons and practice tests.</p>' +
      '<ol class="r3-lv-secs">' + mine + '</ol>' +
      (off ? '<h2 class="r3-lv-h2">Not on your exam</h2><p class="r3-lv-sum">Still here if your school asks for them later.</p><ol class="r3-lv-secs">' + off + '</ol>' : '') + '</section>';
  }

  // The menu on the left, as in most dashboards (mockup switch Menu: Left, computer only): logo, the version's places with icons,
  // account at the foot. It folds into a rail of icons; a hovered icon names its place.
  var SIDE_I = {
    fold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M9 3v18M16 15l-3-3 3-3"/></svg>',
    unfold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M9 3v18M14 9l3 3-3 3"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>'
  };
  // Folded by default in a window narrower than 1024, so the menu does not squeeze the page; the student's own choice wins after a click
  function sideMini() { return state.navMini == null ? innerWidth < 1024 : state.navMini; }
  function sideNav(cls, items, inner) {
    var mini = sideMini(), pop = state.pop === 'profile';
    var nav = items.map(function (l) {
      return '<a href="#" class="r4-side-a' + (l.on ? ' is-on' : '') + '"' + l.attrs + (l.on ? ' aria-current="page"' : '') + ' data-label="' + esc(l.label) + '">' + l.icon +
        '<span class="r4-side-t">' + l.label + '</span>' + (l.count ? '<span class="r4-side-n" aria-label="' + plural(l.count, 'new answer') + '">' + l.count + '</span>' : '') + '</a>';
    }).join('');
    var foldLabel = mini ? 'Expand menu' : 'Collapse menu';
    return '<div class="' + cls + ' r4-sided' + (mini ? ' is-mini' : '') + '"><aside class="r4-side">' +
      '<a href="#" class="r4-side-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>' +
      '<nav class="r4-side-nav" aria-label="Member area">' + nav + '</nav>' +
      '<div class="r4-side-foot">' + (state.ai === 'on' ? '<button type="button" class="r4-side-a r4-side-ai' + (state.aiOpen ? ' is-on' : '') + '" data-ai-open aria-expanded="' + state.aiOpen + '" data-label="Claire AI">' +
        AI_I.spark + '<span class="r4-side-t">Claire AI</span></button>' : '') +
      '<button type="button" class="r4-side-fold" data-nav-fold aria-expanded="' + !mini + '" aria-label="' + foldLabel + '" data-label="' + foldLabel + '">' +
      (mini ? SIDE_I.unfold : SIDE_I.fold) + '<span class="r4-side-t">' + foldLabel + '</span></button>' +
      '<div class="r4-side-me-w"><button type="button" class="r4-side-me" data-pop="profile" aria-expanded="' + pop + '" aria-label="Your account"><img src="assets/avatar.png" alt="">' +
      '<span class="r4-side-t">' + NAME + '</span>' + SIDE_I.chev + '</button>' + (pop ? profileMenu() : '') + '</div></div></aside>' +
      '<main class="' + cls + '-main">' + inner + '</main></div>';
  }

  // Claire AI (mockup switch Claire AI: On). It is not in the A2 release, so it lives only in a button in the header (at the foot
  // of the left menu) and a panel on the right: switched off, nothing on the page moves, and nothing floats over the page. Answers are ready-made samples built from the sample student's data,
  // and the panel says who answers, because students took AI answers for Claire's own replies under lessons.
  var AI_I = {
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.6c4.7 0 8.5 3.5 8.5 7.9s-3.8 7.9-8.5 7.9c-1.3 0-2.5-.3-3.6-.7L4 20.3l1.2-3.9a7.6 7.6 0 0 1-1.7-4.9c0-4.4 3.8-7.9 8.5-7.9z"/><path d="M12 7.7l.95 2.4 2.4.95-2.4.95L12 14.4l-.95-2.4-2.4-.95 2.4-.95z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7z" fill="currentColor"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };
  // Plain explanations and practice questions the samples use; a lesson without one gets a placeholder that says what would be there
  var AI_EXPLAIN = {
    'Endocrine System (Hormones)': ["Think of it as your body's messaging service. Glands such as the thyroid, the adrenal glands and the pancreas release hormones into the blood, and each hormone tells certain organs what to do.",
      'Insulin from the pancreas lowers blood sugar. Thyroid hormones set how fast your body uses energy.']
  };
  var AI_QUIZ = {
    'Senses (Vision and Hearing)': { q: 'Which part of the ear turns sound vibrations into signals for the brain?', opts: ['Eardrum', 'Cochlea', 'Ear canal'], ok: 1, okText: 'the cochlea',
      why: 'Hair cells inside the cochlea, in the inner ear, turn the vibrations into nerve signals, and the auditory nerve carries them to the brain.' },
    chemistry: { q: 'What is the pH of pure water at room temperature?', opts: ['1', '7', '14'], ok: 1, okText: '7',
      why: 'Pure water is neutral, so its pH is 7. Below 7 is acidic, above 7 is basic.' }
  };
  function aiLesson(title, at) {
    return { label: 'Watch: ' + title + (at ? ' · from ' + at : ''), attrs: go('The lesson page: ' + title + (at ? ', the video from ' + at : '')), play: true };
  }
  // Three questions to try, picked for where the student is
  function aiPrompts(m) {
    var S = m.S, out = [];
    var weak = m.mine.filter(function (s) { return S.diag && S.diag[s.id] != null && S.diag[s.id] <= 2; });
    if (m.key === 'new') {
      var intro = m.secs[0];
      return [
        { id: 'start', q: 'Where do I start?', link: aiLesson(intro.lessons[0]),
          a: ['Start with the intro section: four short lessons. In Orientation Claire explains what is on the exam, and in Design Your Study Plan you set your study time.',
            'Then take the diagnostic quiz, 40 questions, 5 from each subject. It shows which subjects need more work.'] },
        { id: 'subjects', q: 'Which subjects will be on my exam?', link: aiLesson(intro.lessons[1]),
          a: ['That depends on your school. Math, Reading Comprehension, Vocabulary and Grammar are on almost every A2 exam. Biology, Chemistry, Anatomy and Physiology and Critical Thinking are up to the school.',
            'Ask your school which tests you take and what score you need.'] },
        { id: 'human', q: 'How do I ask Claire a question?', link: { label: 'Your questions', attrs: ' data-view="questions"' },
          a: ['Write it in the comments under the lesson you are on. Claire answers there, and her replies show up in Questions.', 'I am Claire AI: I answer right away, from her lessons.'] }
      ];
    }
    if (m.key === 'progress') {
      var next = m.next, last = next && next.idx > 0 ? next.sec.lessons[next.idx - 1] : null;
      if (next) out.push({ id: 'explain', q: 'Explain ' + next.title + ' in simple words', link: aiLesson(next.title, AI_EXPLAIN[next.title] ? '2:40' : ''),
        a: AI_EXPLAIN[next.title] || ['Here Claire AI explains the lesson in a few plain sentences and points to the part of the video that covers it.'] });
      var longest = Math.max.apply(null, m.mine.map(function (s) { return s.total; }));
      out.push({ id: 'weak', q: 'What should I work on most?', link: weak.length ? { label: 'Open Lessons', attrs: ' data-view="lessons"' } : null,
        a: weak.length ? weak.map(function (s) {
          return '<b>' + s.name + '</b>: ' + S.diag[s.id] + ' of 5 right in the diagnostic quiz. ' + (s.done === 0
            ? 'You have not started it yet' + (s.total === longest ? ', and with ' + s.total + ' lessons it is your longest subject.' : '.')
            : s.done >= s.total ? 'All its lessons are done, so its practice test comes next.' : 'You have done ' + s.done + ' of ' + s.total + ' lessons.');
        }) : ['No subject in your diagnostic quiz is under 3 of 5. Keep going lesson by lesson.'] });
      if (last && AI_QUIZ[last]) out.push({ id: 'quiz', q: 'Quiz me on my last lesson', quiz: AI_QUIZ[last], from: last });
      return out;
    }
    var t = m.nextTest;
    if (t) out.push({ id: 'test', q: 'Which practice test should I take next?', link: { label: 'Open Practice tests', attrs: go('The Practice tests page (/a2/practice_tests)') },
      a: [t.score == null
        ? 'Take <b>' + t.name + '</b>. ' + (t.sec.tests.every(function (x) { return x.score == null; }) ? 'You have not taken a ' + t.sec.name + ' test yet.' : 'You have not taken it yet.') +
          (m.untaken === 2 ? ' After it, one more test is still to take.' : m.untaken > 2 ? ' After it, ' + (m.untaken - 1) + ' more tests are still to take.' : '')
        : 'Retake <b>' + t.name + '</b>. Your ' + t.score + '% is your lowest practice test score.'] });
    out.push({ id: 'ready', q: 'Am I ready for the exam?',
      a: ['I can\'t promise a result, but here is where you stand. All ' + m.total + ' lessons are done. You have taken ' + m.taken.length + ' of ' + m.myTests.length +
        ' practice tests, and ' + m.aboveBar + ' of them are at ' + m.barLabel + ' or higher.' + (m.untaken ? ' Take the other ' + m.untaken + ' before you decide.' : '') +
        (S.exam ? ' Your exam is in ' + days(S.exam.days) + '.' : '')] });
    var wk = weak.sort(function (a, b) { return S.diag[a.id] - S.diag[b.id]; })[0];
    if (wk && AI_QUIZ[wk.id]) out.push({ id: 'quiz', q: 'Quiz me on ' + wk.name, quiz: AI_QUIZ[wk.id], from: wk.name });
    return out;
  }
  function aiNew() { return state.badges === 'off' ? '' : '<span class="r4-new">New</span>'; }
  function aiLink(l) {
    return l ? '<a href="#" class="r4-ai-link"' + l.attrs + '>' + (l.play ? AI_I.play : '') + '<span>' + l.label + '</span>' + (l.play ? '' : AI_I.right) + '</a>' : '';
  }
  function aiTry(ps, cur) {
    var off = state.aiState === 'limit' ? ' disabled' : '';
    return ps.filter(function (p) { return p !== cur; }).map(function (p) {
      return '<button type="button" class="r4-ai-p" data-ai-q="' + p.id + '"' + off + '><span>' + esc(p.q) + '</span>' + AI_I.right + '</button>';
    }).join('');
  }
  // A reply takes a moment: the newest one shows as "writing" first (mockup switch AI state: Error and Limit reached show the rest)
  var aiTimer;
  function aiReply() {
    state.aiWait = true; clearTimeout(aiTimer);
    aiTimer = setTimeout(function () { state.aiWait = false; render(); }, 1300);
  }
  function aiBody(m) {
    var k = m.key, ps = aiPrompts(m), free = state.aiFree[k], cur = ps.filter(function (p) { return p.id === state.aiQ[k]; })[0];
    var sample = state.badges === 'off' ? '' : '<p class="r4-ai-sample">Sample answer</p>';
    if (!free && !cur) {
      return '<p class="r4-ai-lead">Ask about a lesson, a practice question or what to study next.</p><h3 class="r4-ai-try-h">Try asking</h3><div class="r4-ai-try">' + aiTry(ps) + '</div>';
    }
    var msgs = [];
    if (free) {
      msgs.push({ me: esc(free) }, { bot: '<p>In this mockup Claire AI answers only the questions below. On the site it would answer anything about the course.</p>' });
    } else if (cur.quiz) {
      var z = cur.quiz, pick = state.aiPick[k];
      msgs.push({ me: esc(cur.q) }, { bot: '<p>From <b>' + esc(cur.from) + '</b>: ' + z.q + '</p><div class="r4-ai-opts">' + z.opts.map(function (o, n) {
        return '<button type="button" class="r4-ai-opt" data-ai-pick="' + n + '"' + (pick != null ? ' disabled' : '') + (pick === n ? ' aria-pressed="true"' : '') + '>' + o + '</button>';
      }).join('') + '</div>' });
      if (pick != null) msgs.push({ me: z.opts[pick] }, { bot: '<p><b>' + (pick === z.ok ? 'Right.' : 'Not quite: it&#39;s ' + z.okText + '.') + '</b> ' + z.why + '</p>' + sample });
    } else {
      msgs.push({ me: esc(cur.q) }, { bot: cur.a.map(function (p) { return '<p>' + p + '</p>'; }).join('') + aiLink(cur.link) + sample });
    }
    // The newest reply is still being written, or Claire AI could not give it
    var last = msgs.pop();
    var html = msgs.map(function (x) { return x.me != null ? '<p class="r4-ai-me">' + x.me + '</p>' : '<div class="r4-ai-bot">' + x.bot + '</div>'; }).join('');
    if (state.aiWait) {
      return html + '<div class="r4-ai-bot is-typing" role="status"><span class="r4-ai-dots" aria-hidden="true"><i></i><i></i><i></i></span>Looking through Claire&#39;s lessons</div>';
    }
    html += state.aiState === 'error'
      ? '<div class="r4-ai-bot is-error" role="alert"><p><b>Claire AI can&#39;t answer right now.</b> Try again in a minute. For help with a lesson right now, ask Claire in the comments under it.</p>' +
        '<button type="button" class="r4-ai-retry" data-ai-retry>Try again</button></div>'
      : '<div class="r4-ai-bot">' + last.bot + '</div>';
    return html + '<h3 class="r4-ai-try-h">Ask something else</h3><div class="r4-ai-try">' + aiTry(ps, free ? null : cur) + '</div>';
  }
  // The way in: a button next to the account in the header, an icon with "AI" on a phone; it opens and closes the panel
  function aiButton(phone) {
    if (state.ai !== 'on' || state.view === 'setup') return '';
    var chip = '<span class="r4-ai-chip" aria-hidden="true">AI</span>';
    return '<button type="button" class="r4-ai-btn' + (phone ? ' is-icon' : '') + (state.aiOpen ? ' is-on' : '') + '" data-ai-open aria-expanded="' + state.aiOpen + '" aria-label="Claire AI">' +
      AI_I.spark + (phone ? chip : '<span class="r4-ai-t" aria-hidden="true">Claire AI</span>' + chip.replace('r4-ai-chip', 'r4-ai-chip r4-ai-short')) + '</button>';
  }
  function aiLayer(m, at) {
    if (state.ai !== 'on' || state.view === 'setup' || !state.aiOpen) return '';
    var panel = '<section class="r4-ai' + (state.aiEnter ? ' is-enter' : '') + '" aria-label="Claire AI">' +
      '<header class="r4-ai-h"><span class="r4-ai-ic">' + AI_I.spark + '</span><div><h2>Claire AI' + aiNew() + '</h2>' +
      '<p>Answers from Claire&#39;s lessons. Claire herself answers your questions under the lessons.</p></div>' +
      '<button type="button" class="r4-ai-x" data-ai-close aria-label="Close">' + X_ICON + '</button></header>' +
      '<div class="r4-ai-body">' + aiBody(m) + '</div>' +
      (state.aiState === 'limit'
        ? '<div class="r4-ai-limit" role="status"><p><b>You have used today&#39;s questions.</b> Claire AI answers again tomorrow. Claire herself answers questions under the lessons any day.</p></div>'
        : '<form class="r4-ai-form" data-ai-form><input class="r4-ai-in" name="q" type="text" autocomplete="off" placeholder="Ask about any lesson" aria-label="Your question">' +
          '<button type="submit" class="r4-ai-send" aria-label="Send"' + (state.aiWait ? ' disabled' : '') + '>' + AI_I.send + '</button></form>') +
      '<p class="r4-ai-note">Claire AI can make mistakes, so check the lesson it links. <a href="#" data-view="questions">Your questions to Claire</a></p></section>';
    return '<div class="' + (V.root || '') + ' r4-ai-layer" data-at="' + at + '">' + panel + '</div>';
  }


  var api = {
    sideNav: sideNav, aiButton: aiButton,
    C: C, NAME: NAME, PASS: PASS, REQUIRED: REQUIRED, OPTIONAL: OPTIONAL, STATES: STATES, PLAN: PLAN,
    state: state, model: model, esc: esc, secById: secById, tip: tip, tag: tag, go: go, days: days, plural: plural, pace: pace,
    needsFocus: needsFocus, profileMenu: profileMenu, answers: answers, qaItem: qaItem, Q_EMPTY: Q_EMPTY, questionsView: questionsView, diagnostic: diagnostic, testsList: testsList,
    setupView: setupView, settingsView: settingsView,
    lessonsView: lessonsView, X_ICON: X_ICON, testsLegend: testsLegend,
    rerender: function () { render(); }
  };
  window.R4 = api;

  var V = window.R4V;
  var stage = document.getElementById('stage');
  var scrolls = [];

  function render() {
    // Keep phone scroll positions across re-renders
    scrolls = [].map.call(stage.querySelectorAll('.scroller'), function (s) { return s.scrollTop; });
    var m = model(state.state);
    if (state.screen === 'phone' && document.body.getAttribute('data-solo') === '1') {
      stage.innerHTML = V.render(m, true) + aiLayer(m, 'solo');
    } else if (state.screen === 'laptop') {
      stage.innerHTML = V.render(m, false) + aiLayer(m, 'laptop');
    } else {
      stage.innerHTML = [390, 446].map(function (w) {
        return '<figure class="device"><div class="bezel"><div class="screen" style="width:' + w + 'px;height:705px"><div class="scroller">' +
          V.render(m, true) + '</div>' + aiLayer(m, 'phone') + '</div></div><figcaption>' + w + ' × 705</figcaption></figure>';
      }).join('');
      [].forEach.call(stage.querySelectorAll('.scroller'), function (s, i) { if (scrolls[i]) s.scrollTop = scrolls[i]; });
    }
    syncBar();
    if (V.after) V.after(stage, m, api);
    alignTips();
    // The panel slides in only when it opens; after a question it scrolls to the student's latest message, so the answer reads from its start
    state.aiEnter = false;
    [].forEach.call(stage.querySelectorAll('.r4-ai-body'), function (b) {
      var me = b.querySelectorAll('.r4-ai-me'); me = me[me.length - 1];
      if (me) b.scrollTop += me.getBoundingClientRect().top - b.getBoundingClientRect().top - 16;
    });
  }

  // Toolbar: the New labels switch and the setup and settings pages only exist with the new features on
  function syncBar() {
    document.querySelectorAll('.mock-seg').forEach(function (seg) {
      var k = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === state[k]));
        if (b.hasAttribute('data-only-new')) b.hidden = !isNew();
      });
    });
    document.querySelectorAll('.mock-group[data-only-new]').forEach(function (g) { g.hidden = !isNew(); });
    // On a phone the menu stays as it is in each version, so the Menu switch is only for the computer
    document.querySelectorAll('.mock-group[data-only-laptop]').forEach(function (g) { g.hidden = state.screen === 'phone'; });
    document.querySelectorAll('.mock-group[data-only-ai]').forEach(function (g) { g.hidden = state.ai !== 'on'; });
    // A narrow header that also holds the Claire AI button gives it room (see r4-ux-extra.css)
    document.body.setAttribute('data-ai-hdr', state.ai === 'on' && state.view !== 'setup' && state.nav !== 'left' ? '1' : '0');
    document.body.setAttribute('data-feat', state.feat);
  }

  function alignTip(t) {
    var box = (t.closest('.screen') || document.documentElement).getBoundingClientRect();
    var r = t.getBoundingClientRect(), c = r.left + r.width / 2, pad = 8, b = t.querySelector('.r3-tip-b');
    if (!r.width || !b) return;
    var W = Math.min(264, box.width - pad * 2);
    var left = Math.min(Math.max(c - W / 2, box.left + pad), box.right - pad - W);
    t.setAttribute('data-align', 'px');
    b.style.width = W + 'px';
    b.style.left = (left - r.left) + 'px';
    b.style.setProperty('--ax', (c - left) + 'px');
  }
  function alignTips() { [].forEach.call(stage.querySelectorAll('.r3-tip'), alignTip); }
  function alignOnOpen(e) { var t = e.target.closest && e.target.closest('.r3-tip'); if (t) alignTip(t); }
  stage.addEventListener('mouseover', alignOnOpen);
  stage.addEventListener('focusin', alignOnOpen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignTips);
  addEventListener('load', alignTips);

  function toTop() { window.scrollTo(0, 0); stage.querySelectorAll('.scroller').forEach(function (sc) { sc.scrollTop = 0; }); }

  // The first visit of a student who has not done the setup yet is the setup page
  function landing() {
    if (isNew() && state.setup[state.state] == null) return 'setup';
    return 'home';
  }

  document.querySelector('.mock-bar').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-value]'); if (!b) return;
    var k = b.parentNode.getAttribute('data-key');
    state[k] = b.getAttribute('data-value');
    state.pop = null;
    if (k === 'state' || k === 'feat') state.view = landing();
    if (!isNew() && (state.view === 'setup' || state.view === 'settings')) state.view = 'home';
    toTop(); writeHash(); render();
  });

  var toastTimer;
  function toast(text) {
    var t = document.querySelector('.r3-toast');
    if (!t) { t = document.createElement('div'); t.className = 'r3-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    var out = text === 'Log out';
    var head = out ? 'Log out' : 'Goes to', tail = out ? 'Works as on the site now.' : 'This page is on the site already and stays as it is.';
    t.innerHTML = '<b>' + head + (out ? '' : ':') + '</b>' + (out ? '' : ' ' + esc(text)) + '<span>' + tail + '</span>';
    t.classList.add('is-on'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 3800);
  }

  function readForm(f) {
    var set = state.examSet[state.state];
    var nodate = f.elements.nodate && f.elements.nodate.checked;
    var ex = nodate ? null : examFromInput(f.elements.date.value);
    if (nodate) { set.exam = null; set.examUnknown = true; } else if (ex) { set.exam = ex; set.examUnknown = false; }
    var noscore = f.elements.noscore && f.elements.noscore.checked;
    var tg = parseInt(f.elements.target.value, 10);
    if (noscore) { set.target = null; set.targetUnknown = true; } else if (tg >= 50 && tg <= 100) { set.target = tg; set.targetUnknown = false; }
    var picks = REQUIRED.slice();
    [].forEach.call(f.querySelectorAll('input[name="sub"]'), function (i) { if (i.checked) picks.push(i.value); });
    state.picks[state.state] = picks;
  }

  // A wrong value is named under its field in plain words, and the form stays where it is
  function clearErr(row) {
    if (!row) return;
    var p = row.nextElementSibling; if (p && p.classList.contains('r4-err')) p.remove();
    var inp = row.querySelector('.r4-in'); if (inp) { inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); }
  }
  function valid(f) {
    var first = null;
    [['date', 'Pick a date from today on, or tick "I don\'t know yet".'], ['target', 'Enter a score from 50 to 100, or tick "I don\'t know yet".']].forEach(function (c) {
      var inp = f.elements[c[0]]; if (!inp) return;
      var row = inp.closest('.r4-fld-row'); clearErr(row);
      if (inp.disabled || !inp.value || inp.checkValidity()) return;
      var p = document.createElement('p'); p.className = 'r4-err'; p.id = 'err-' + c[0]; p.textContent = c[1];
      row.insertAdjacentElement('afterend', p);
      inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', p.id);
      if (!first) first = inp;
    });
    if (first) first.focus();
    return !first;
  }
  // After a change in Exam settings the student is told it is saved and what the plan now counts from
  function notice(set) {
    var t = document.querySelector('.r3-toast');
    if (!t) { t = document.createElement('div'); t.className = 'r3-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    var line = set.exam ? 'Exam on ' + set.exam.long + (set.target ? ', your school needs ' + set.target + '%' : '') : 'No exam date yet' + (set.target ? ', your school needs ' + set.target + '%' : '');
    t.innerHTML = '<b>Saved</b><span>' + esc(line) + '</span>';
    t.classList.add('is-on'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 3800);
  }

  stage.addEventListener('submit', function (e) {
    var aif = e.target.closest('[data-ai-form]');
    if (aif) {
      e.preventDefault(); var txt = aif.elements.q.value.trim(); if (!txt) return;
      state.aiFree[state.state] = txt; state.aiQ[state.state] = null; aiReply(); render(); return;
    }
    if (V.onSubmit && V.onSubmit(e, api)) return;
    var f = e.target.closest('[data-form]'); if (!f) return;
    e.preventDefault();
    if (!valid(f)) return;
    var kind = f.getAttribute('data-form');
    readForm(f);
    state.setup[state.state] = 'done';
    state.view = 'home'; state.pop = null;
    toTop(); writeHash(); render();
    if (kind === 'settings') notice(state.examSet[state.state]);
  });

  // "I don't know yet" switches its field off, so the page never holds a date and "don't know" at once
  stage.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name !== 'nodate' && t.name !== 'noscore') return;
    var row = t.closest('.r4-fld-row'), inp = row && row.querySelector('.r4-in');
    if (inp) { inp.disabled = t.checked; if (t.checked) inp.value = ''; }
    var dpw = row && row.querySelector('.r4-dp');
    if (dpw && t.checked) { dpSet(dpw, ''); dpClose(); }
    if (row) [].forEach.call(row.querySelectorAll('[data-score]'), function (b) { b.disabled = t.checked; if (t.checked) { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); } });
    clearErr(row);
  });

  // Typing a score lights the matching chip; any edit clears the field's error
  stage.addEventListener('input', function (e) {
    var t = e.target; if (!t.classList || !t.classList.contains('r4-in')) return;
    var row = t.closest('.r4-fld-row'); clearErr(row);
    if (t.name === 'target') [].forEach.call(row.querySelectorAll('[data-score]'), function (b) {
      var on = b.getAttribute('data-score') === t.value; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on));
    });
  });

  stage.addEventListener('click', function (e) {
    var pop = e.target.closest('[data-pop]');
    if (!pop && state.pop && !e.target.closest('.r3-pop, .r4-sheet')) { state.pop = null; render(); }
    // The exam-date calendar: open and close, months, a day, Clear; a click anywhere else closes it
    var dpb = e.target.closest('[data-dp]'), dpNav = e.target.closest('[data-dp-nav]'), dpDay = e.target.closest('[data-dp-day]');
    if (dpb) { var dw = dpb.closest('.r4-dp'), wasOpen = !!dw.querySelector('.r4-dp-pop'); dpClose(); if (!wasOpen) dpOpen(dw); return; }
    if (dpNav) { var np = dpNav.closest('.r4-dp-pop'); dpOpen(np.parentNode, +np.getAttribute('data-y'), +np.getAttribute('data-m') + +dpNav.getAttribute('data-dp-nav')); return; }
    if (dpDay) { var yw = dpDay.closest('.r4-dp'); dpSet(yw, dpDay.getAttribute('data-dp-day')); dpClose(); clearErr(yw.closest('.r4-fld-row')); yw.querySelector('[data-dp]').focus(); return; }
    if (e.target.closest('[data-dp-clear]')) { var cw = e.target.closest('.r4-dp'); dpSet(cw, ''); dpClose(); cw.querySelector('[data-dp]').focus(); return; }
    if (!e.target.closest('.r4-dp-pop')) dpClose();
    var ai = e.target.closest('[data-ai-open], [data-ai-close], [data-ai-q], [data-ai-pick], [data-ai-retry]');
    if (ai) {
      var ak = state.state, opening = ai.hasAttribute('data-ai-open'), closing = ai.hasAttribute('data-ai-close');
      if (opening) { state.aiOpen = !state.aiOpen; state.aiEnter = state.aiOpen; state.pop = null; }
      else if (closing) state.aiOpen = false;
      else if (ai.hasAttribute('data-ai-q')) { state.aiQ[ak] = ai.getAttribute('data-ai-q'); state.aiPick[ak] = null; state.aiFree[ak] = null; aiReply(); }
      else if (ai.hasAttribute('data-ai-pick')) { state.aiPick[ak] = +ai.getAttribute('data-ai-pick'); aiReply(); }
      else aiReply();
      render();
      var af = (opening || closing) && stage.querySelector(state.aiOpen ? '.r4-ai-x' : '[data-ai-open]'); if (af) af.focus({ preventScroll: true });
      return;
    }
    // On a phone the panel covers the page, so a link out of it closes it
    if (state.screen === 'phone' && e.target.closest('.r4-ai [data-view]')) state.aiOpen = false;
    if (e.target.closest('[data-nav-fold]')) {
      state.navMini = !sideMini(); state.pop = null; render();
      var fb = stage.querySelector('[data-nav-fold]'); if (fb) fb.focus({ preventScroll: true }); return;
    }
    if (V.onClick && V.onClick(e, api)) return;
    var sc = e.target.closest('[data-score]');
    if (sc) {
      var srow = sc.closest('.r4-fld-row'), sin = srow.querySelector('.r4-in');
      sin.value = sc.getAttribute('data-score'); clearErr(srow);
      [].forEach.call(srow.querySelectorAll('[data-score]'), function (b) { b.classList.toggle('is-on', b === sc); b.setAttribute('aria-pressed', String(b === sc)); });
      return;
    }
    var g = e.target.closest('[data-goto]');
    if (g) {
      e.preventDefault();
      if (state.pop && g.closest('.r3-pop')) { state.pop = null; render(); }
      toast(g.getAttribute('data-goto')); return;
    }
    if (pop) {
      e.preventDefault(); var pv = pop.getAttribute('data-pop');
      state.pop = state.pop === pv ? null : pv;
      render(); return;
    }
    var qa = e.target.closest('[data-qa]');
    if (qa) { state.qaOpen[state.state] = qa.getAttribute('aria-expanded') !== 'true'; render(); return; }
    // "Mark as read" on new answers: they do not come back on Home
    if (e.target.closest('[data-read]')) { state.read[state.state] = true; render(); return; }
    if (e.target.closest('[data-skip]')) {
      e.preventDefault(); state.setup[state.state] = 'skipped'; state.view = 'home'; toTop(); writeHash(); render(); return;
    }
    var vw = e.target.closest('[data-view]');
    if (vw) {
      e.preventDefault(); state.view = vw.getAttribute('data-view'); state.pop = null; toTop(); writeHash(); render();
      return;
    }
    var lv = e.target.closest('[data-lv]');
    if (lv) {
      var id = lv.getAttribute('data-lv'), o = state.lvOpen[state.state];
      o[id] = lv.getAttribute('aria-expanded') !== 'true'; render(); return;
    }
    var a = e.target.closest('a[href="#"]'); if (a) e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.querySelector('.r4-dp-pop')) { var ob = document.querySelector('.r4-dp-pop').parentNode.querySelector('[data-dp]'); dpClose(); if (ob) ob.focus(); return; }
    if (e.key === 'Escape' && state.pop) { state.pop = null; render(); return; }
    if (e.key === 'Escape' && state.aiOpen) { state.aiOpen = false; render(); var aib = stage.querySelector('[data-ai-open]'); if (aib) aib.focus({ preventScroll: true }); }
  });

  function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    if (STATES[h.get('state')]) state.state = h.get('state');
    if (h.get('screen') === 'phone' || h.get('screen') === 'laptop') state.screen = h.get('screen');
    if (h.get('feat') === 'new' || h.get('feat') === 'base') state.feat = h.get('feat');
    if (h.get('badges') === 'off') state.badges = 'off';
    if (h.get('nav') === 'left') state.nav = 'left';
    if (h.get('ai') === 'on') state.ai = 'on';
    if (h.get('aist') === 'error' || h.get('aist') === 'limit') state.aiState = h.get('aist');
    var v = h.get('view');
    state.view = ['home', 'lessons', 'questions', 'setup', 'settings', 'progress'].indexOf(v) > -1 ? v : landing();
    if (!isNew() && (state.view === 'setup' || state.view === 'settings')) state.view = 'home';
    document.body.setAttribute('data-solo', h.get('solo') === '1' ? '1' : '0');
  }
  function writeHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    h.set('feat', state.feat); h.set('state', state.state); h.set('screen', state.screen); h.set('view', state.view);
    if (state.badges === 'off') h.set('badges', 'off'); else h.delete('badges');
    if (state.nav === 'left') h.set('nav', 'left'); else h.delete('nav');
    if (state.ai === 'on') h.set('ai', 'on'); else h.delete('ai');
    if (state.aiState !== 'ok') h.set('aist', state.aiState); else h.delete('aist');
    history.replaceState(null, '', '#' + h.toString());
    document.body.setAttribute('data-screen', state.screen);
  }
  readHash(); document.body.setAttribute('data-screen', state.screen); render();

  var bar = document.querySelector('.mock-bar');
  function barHeight() { document.documentElement.style.setProperty('--mock-h', (bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0) + 'px'); }
  barHeight(); addEventListener('resize', barHeight);
  // The bar changes height when a switch adds or hides a group (Claire AI adds AI state), so the page follows it, not only the window
  if (bar && window.ResizeObserver) new ResizeObserver(barHeight).observe(bar);
  // The left menu folds and unfolds by itself when the window crosses 1024, until the student folds or unfolds it
  var autoMini = sideMini();
  addEventListener('resize', function () {
    var now = sideMini(); if (now === autoMini) return; autoMini = now;
    if (state.nav === 'left' && state.screen === 'laptop') render();
  });
})();
