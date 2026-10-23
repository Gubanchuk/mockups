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

  var state = { state: 'progress', screen: 'laptop', feat: 'base', badges: 'on', view: 'home', pop: null,
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
  function qaItem(c) {
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
      ? '<ul class="r4-qa-list">' + items.slice(0, SHOW_MAX).map(qaItem).join('') + '</ul>'
      : preview(items[0]) + (items.length > 1 ? '<p class="r4-ans-more">and ' + (items.length - 1) + ' more</p>' : '');
    var act = m.nf
      ? '<div class="r4-ans-act"><button type="button" class="r4-btn-2" data-read>Mark as read</button>' +
        (open && items.length === 1 ? '<a href="#" class="r4-ans-all"' + go('The lesson page: ' + items[0].lesson + ', comments under the lesson') + '>Reply under the lesson</a>' : '') +
        more + '<span class="r4-ans-note">Answers stay in <a href="#" data-view="questions">Questions</a>.</span></div>'
      : (more ? '<div class="r4-ans-act">' + more + '</div>' : '');
    return '<section class="r4-ans' + (m.nf ? ' is-new' : '') + (open ? ' is-open' : '') + '" aria-label="' + title + '">' + head + body + act + '</section>';
  }
  function questionsView(m) {
    var list = m.S.comments;
    return '<section class="r4-page" aria-label="Your questions"><button type="button" class="r3-lv-back" data-view="home">Back to Home</button>' +
      '<h1 class="r4-page-title">Your questions</h1><p class="r4-page-lead">You ask in the comments under a lesson. Claire answers there, and every question and answer is collected here.</p>' +
      (list.length ? '<ul class="r4-qa-list is-page">' + list.map(qaItem).join('') + '</ul>' : '<p class="r4-qa-empty">' + Q_EMPTY + '</p>') + '</section>';
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
  function subjectFields(m, picks) {
    var req = REQUIRED.map(function (id) {
      var s = secById(m.secs, id);
      return '<li><label class="r4-sw is-fixed"><input type="checkbox" checked disabled><span class="r4-sw-box" aria-hidden="true"></span><span>' + s.name + '</span></label></li>';
    }).join('');
    var opt = OPTIONAL.map(function (id) {
      var s = secById(m.secs, id), on = picks.indexOf(id) > -1;
      return '<li><label class="r4-sw"><input type="checkbox" name="sub" value="' + id + '"' + (on ? ' checked' : '') + '><span class="r4-sw-box" aria-hidden="true"></span><span>' + s.name + '</span></label></li>';
    }).join('');
    return '<div class="r4-subj"><div class="r4-subj-g"><p class="r4-subj-h">Always in your plan</p><ul class="r4-subj-l">' + req + '</ul></div>' +
      '<div class="r4-subj-g"><p class="r4-subj-h">Only if your school tests them</p><ul class="r4-subj-l">' + opt + '</ul></div></div>';
  }
  function dateField(S) {
    var none = !S.exam;
    return '<div class="r4-fld-row"><input class="r4-in" type="date" name="date" min="2026-10-21" aria-label="Exam date" value="' + isoOf(S.exam) + '"' + (none && S.examUnknown ? ' disabled' : '') + '>' +
      '<label class="r4-ck"><input type="checkbox" name="nodate"' + (none && S.examUnknown ? ' checked' : '') + '><span class="r4-ck-box" aria-hidden="true"></span>I don\'t know yet</label></div>';
  }
  function scoreField(S) {
    var none = !S.target;
    return '<div class="r4-fld-row"><span class="r4-pct"><input class="r4-in" type="number" name="target" min="50" max="100" step="1" aria-label="Score your school needs, in percent" value="' + (S.target || '') + '"' + (none && S.targetUnknown ? ' disabled' : '') + '><i>%</i></span>' +
      '<label class="r4-ck"><input type="checkbox" name="noscore"' + (none && S.targetUnknown ? ' checked' : '') + '><span class="r4-ck-box" aria-hidden="true"></span>I don\'t know yet</label></div>';
  }
  function setupView(m) {
    var S = m.S, picks = state.picks[m.key];
    return '<section class="r4-su" aria-label="Set up your plan"><div class="r4-su-in">' +
      '<h1 class="r4-su-title">Hey ' + NAME + ', let\'s set up your plan ' + tag() + '</h1>' +
      '<p class="r4-su-lead">Three quick questions, so your plan counts only what is on your exam. Not sure about something? Skip it and change it later in Exam settings, in the menu under your name.</p>' +
      '<form class="r4-su-form" data-form="setup">' +
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
    return '<section class="r4-set" aria-label="Exam settings"><button type="button" class="r3-lv-back" data-view="home">Back to Home</button>' +
      '<h1 class="r4-set-title">Exam settings ' + tag() + '</h1>' +
      '<p class="r4-set-lead">Your exam. Home counts your plan, the lessons left and the pace from these answers.</p>' +
      '<form class="r4-set-form" data-form="settings">' +
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
    return '<section class="r3-lv" aria-label="Lessons"><button type="button" class="r3-lv-back" data-view="home">Back to Home</button>' +
      '<h1 class="r3-lv-title">Lessons</h1><p class="r3-lv-sum">' + m.done + ' of ' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + '. Open a subject to see its lessons and practice tests.</p>' +
      '<ol class="r3-lv-secs">' + mine + '</ol>' +
      (off ? '<h2 class="r3-lv-h2">Not on your exam</h2><p class="r3-lv-sum">Still here if your school asks for them later.</p><ol class="r3-lv-secs">' + off + '</ol>' : '') + '</section>';
  }

  var api = {
    C: C, NAME: NAME, PASS: PASS, REQUIRED: REQUIRED, OPTIONAL: OPTIONAL, STATES: STATES, PLAN: PLAN,
    state: state, model: model, esc: esc, secById: secById, tip: tip, tag: tag, go: go, days: days, plural: plural, pace: pace,
    needsFocus: needsFocus, profileMenu: profileMenu, answers: answers, questionsView: questionsView, diagnostic: diagnostic, testsList: testsList,
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
    syncBar();
    if (V.after) V.after(stage, m, api);
    alignTips();
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

  stage.addEventListener('submit', function (e) {
    if (V.onSubmit && V.onSubmit(e, api)) return;
    var f = e.target.closest('[data-form]'); if (!f) return;
    e.preventDefault();
    readForm(f);
    state.setup[state.state] = 'done';
    state.view = 'home'; state.pop = null;
    toTop(); writeHash(); render();
  });

  // "I don't know yet" switches its field off, so the page never holds a date and "don't know" at once
  stage.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name !== 'nodate' && t.name !== 'noscore') return;
    var row = t.closest('.r4-fld-row'), inp = row && row.querySelector('.r4-in');
    if (inp) { inp.disabled = t.checked; if (t.checked) inp.value = ''; }
  });

  stage.addEventListener('click', function (e) {
    var pop = e.target.closest('[data-pop]');
    if (!pop && state.pop && !e.target.closest('.r3-pop')) { state.pop = null; render(); }
    if (V.onClick && V.onClick(e, api)) return;
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
    if (e.key === 'Escape' && state.pop) { state.pop = null; render(); }
  });

  function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    if (STATES[h.get('state')]) state.state = h.get('state');
    if (h.get('screen') === 'phone' || h.get('screen') === 'laptop') state.screen = h.get('screen');
    if (h.get('feat') === 'new' || h.get('feat') === 'base') state.feat = h.get('feat');
    if (h.get('badges') === 'off') state.badges = 'off';
    var v = h.get('view');
    state.view = ['home', 'lessons', 'questions', 'setup', 'settings'].indexOf(v) > -1 ? v : landing();
    if (!isNew() && (state.view === 'setup' || state.view === 'settings')) state.view = 'home';
    document.body.setAttribute('data-solo', h.get('solo') === '1' ? '1' : '0');
  }
  function writeHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    h.set('feat', state.feat); h.set('state', state.state); h.set('screen', state.screen); h.set('view', state.view);
    if (state.badges === 'off') h.set('badges', 'off'); else h.delete('badges');
    history.replaceState(null, '', '#' + h.toString());
    document.body.setAttribute('data-screen', state.screen);
  }
  readHash(); document.body.setAttribute('data-screen', state.screen); render();

  var bar = document.querySelector('.mock-bar');
  function barHeight() { document.documentElement.style.setProperty('--mock-h', (bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0) + 'px'); }
  barHeight(); addEventListener('resize', barHeight);
})();
