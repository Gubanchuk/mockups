// Version «Study & Progress» (YBG-1877): laid out like exam-prep apps (Pocket Prep), which split doing from tracking.
// Study is Home: the next lesson with its video and three ways to practise. Progress holds what the live page shows today
// under Learning Progress and Your Statistics, with the exam goal on top. Questions is the inbox for Claire's answers.
// UX-fixes copy of r4-prep.js (ux-review, 24.10.2026): all lessons open from the progress line, Practice holds only practice, Back to Study.
(function () {
  var I = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7z" fill="currentColor"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 3L5.5 13.5h6L10.5 21l8-10.5h-6z"/></svg>',
    tests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 9.5l1.8 1.8 3.7-3.8M9 15.5h6"/></svg>',
    lessons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 6.5H20M9.5 12H20M9.5 17.5H20"/><path d="M4 6.5h1.5M4 12h1.5M4 17.5h1.5"/></svg>',
    study: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5C6.8 4.6 9.6 4.9 12 6.6v13C9.6 18 6.8 17.6 4 18.5z"/><path d="M20 5.5c-2.8-.9-5.6-.6-8 1.1v13c2.4-1.6 5.2-2 8-1.1z"/></svg>',
    progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5.5 20v-7M12 20V5M18.5 20v-10"/></svg>',
    questions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 16h-6l-4 3.5V16a2.5 2.5 0 0 1-2.5-2.5z"/></svg>',
    forum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5v-1a4.5 4.5 0 0 1 4.5-4.5h2a4.5 4.5 0 0 1 4.5 4.5v1"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.2a4.5 4.5 0 0 1 3 4.3v1"/></svg>'
  };

  // Sample numbers for the "Your Statistics" block of the live page: questions done out of 660, share answered right, students' average
  var STATS = { new: null, progress: { done: 142, total: 660, correct: 74, avg: 68 }, done: { done: 634, total: 660, correct: 86, avg: 71 } };

  function maskIcon(id, cls) {
    return '<span class="' + cls + '" style="--ic:url(assets/sec-' + id + '.svg)" aria-hidden="true"></span>';
  }

  function header(m, phone, R) {
    var v = R.state.view;
    // All lessons are a place of their own in the menu, as on the live site, not only a link from Study
    var tabs = [['study', 'Study', 'home', v === 'home'], ['lessons', 'Lessons', 'lessons', v === 'lessons' || v === 'lesson'], ['progress', 'Progress', 'progress', v === 'progress'],
      ['questions', 'Questions', 'questions', v === 'questions']];
    var count = m.unread ? '<span class="pr-count" aria-label="' + R.plural(m.unread, 'new answer') + '">' + m.unread + '</span>' : '';
    var links = tabs.map(function (t) {
      return '<a href="#" class="pr-tab' + (t[3] ? ' is-on' : '') + '" data-view="' + t[2] + '"' + (t[3] ? ' aria-current="page"' : '') + '>' +
        (phone ? I[t[0]] : '') + '<span>' + t[1] + '</span>' + (t[0] === 'questions' ? count : '') + '</a>';
    }).join('') + '<a href="#" class="pr-tab"' + R.go('The Forum (/a2/forums)') + '>' + (phone ? I.forum : '') + '<span>Forum</span></a>';
    var me = '<div class="pr-me-w"><button type="button" class="pr-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '" aria-label="Your account">' +
      '<img src="assets/avatar.png" alt="">' + (phone ? '' : '<span>' + R.NAME + '</span>') + I.chev + '</button>' + (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div>';
    var logo = '<a href="#" class="pr-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>';
    // On a phone the sections sit in a bar at the bottom of the screen
    // Claire AI (mockup switch) sits beside the account
    var ai = R.aiButton(phone);
    if (ai) me = '<div class="r4-ai-end">' + ai + me + '</div>';
    if (phone) return { top: '<header class="pr-top">' + logo + me + '</header>', nav: '<nav class="pr-tabs is-bottom" aria-label="Member area">' + links + '</nav>' };
    return { top: '<header class="pr-top">' + logo + '<nav class="pr-tabs" aria-label="Member area">' + links + '</nav>' + me + '</header>', nav: '' };
  }

  // Greeting with Claire's game plan, as on the live page: one line for the current step, the four steps a click away
  function greet(m, R) {
    var open = R.state.open[m.key].plan === true;
    var step = m.cur > -1 ? 'Claire\'s plan, step ' + (m.cur + 1) + ' of 4: <b>' + R.PLAN[m.steps[m.cur].k].title + '</b>' : 'You have done all four steps of Claire\'s plan.';
    var steps = open ? '<div class="pr-plan"><p class="pr-plan-lead">Here\'s the game plan, simple and stress-free:</p><ol>' + m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      return '<li class="is-' + st.state + '"><span class="pr-pn">' + (st.state === 'done' ? I.check : n + 1) + '</span><div><h3>' + p.title + '</h3><p>' + p.text + '</p></div></li>';
    }).join('') + '</ol></div>' : '';
    return '<div class="pr-hello"><h1>Hey there, ' + R.NAME + '!</h1><div class="pr-step-row"><p class="pr-step">' + step + '</p>' +
      '<button type="button" class="pr-plan-tg" data-plan aria-expanded="' + open + '">' + (open ? 'Hide the plan' : 'See the plan') + I.chev + '</button></div>' + steps + '</div>';
  }

  // The next step: a lesson with its video, the diagnostic quiz when it is next, or a practice test once the lessons are done
  function upNext(m, R) {
    var S = m.S, o = { video: true };
    if (m.next && S.done !== 'all') {
      var s = m.next.sec, diag = s.intro && m.next.idx === 3;
      o.id = s.id; o.title = diag ? 'Diagnostic quiz' : m.next.title; o.video = !diag;
      o.meta = (s.intro ? 'Intro section' : s.name) + ' · lesson ' + (m.next.idx + 1) + ' of ' + s.total;
      o.chip = diag ? '40 questions' : '6–9 min';
      o.btn = m.done === 0 ? 'Start here' : diag ? 'Take the quiz' : 'Continue lesson';
      o.where = 'The lesson page: ' + m.next.title;
      if (diag) o.note = 'Shows where you\'re strong and where you can grow.';
      if (m.nf && s.diag != null && s.diag <= 2) o.why = 'A weak spot on your diagnostic quiz';
      var p = m.nf ? R.pace(m) : null;
      if (p && p.perDay) o.today = 'Today: ' + R.plural(p.perDay, 'lesson') + (p.warn ? ' to catch up' : ' to stay on track');
    } else if (m.nf && m.nextTest) {
      var t = m.nextTest; o.id = t.sec.id; o.title = t.name; o.video = false; o.chip = t.q + ' questions';
      o.meta = t.score != null ? 'Your best so far: ' + t.score + '%' : 'Not taken yet';
      o.btn = t.score != null ? 'Retake the test' : 'Start the test'; o.where = 'The practice test: ' + t.name;
      var pc = R.pace(m); if (pc) o.today = pc.text;
    } else {
      o.id = 'introduction'; o.title = 'Time for the practice tests'; o.video = false; o.chip = 'Practice tests';
      o.meta = 'All lessons are done.'; o.note = 'Score over 90%, and you\'re more than ready for the real exam!';
      o.btn = 'Go to practice tests'; o.where = 'The Practice tests page (/a2/practice_tests)';
    }
    var pct = m.total ? m.done / m.total * 100 : 0;
    // The progress line is the way to every lesson by name, so the count is said once on Home
    var all = '<a href="#" class="pr-prog-a" data-view="lessons">See all lessons' + I.right + '</a>';
    var prog = m.left === 0 ? '<p class="pr-prog-t is-done"><span>' + I.check + 'All ' + m.total + ' lessons done</span>' + all + '</p>'
      : '<div class="pr-prog"><p class="pr-prog-t"><span><b>' + m.done + '</b> of ' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + '</span>' + all + '</p><span class="pr-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span></div>';
    var frame = '<a href="#" class="pr-frame' + (o.video ? '' : ' is-quiz') + '"' + R.go(o.where) + ' aria-label="' + R.esc(o.btn + ': ' + o.title) + '">' +
      maskIcon(o.id, 'pr-frame-ic') + (o.video ? '<span class="pr-play">' + I.play + '</span>' : '<span class="pr-play is-q">' + I.tests + '</span>') +
      '<span class="pr-chip">' + o.chip + '</span></a>';
    return '<section class="pr-next" aria-label="Your next step">' + frame + '<div class="pr-next-t">' +
      '<h2>' + o.title + '</h2><p class="pr-meta">' + o.meta + '</p>' +
      (o.note ? '<p class="pr-note">' + o.note + '</p>' : '') +
      (o.why ? '<p class="pr-why">' + o.why + R.tag() + '</p>' : '') +
      (o.today ? '<p class="pr-today">' + o.today + (o.why ? '' : R.tag()) + '</p>' : '') +
      prog + '<a href="#" class="pr-go"' + R.go(o.where) + '>' + o.btn + I.arrow + '</a></div></section>';
  }

  // Two ways to practise, as the quiz modes of an exam-prep app; each row says what is there and opens it.
  // The weak subjects are named on Progress; here the row only counts them, the lesson card already says why it comes next
  function modes(m, R) {
    var rows = [];
    if (m.diagScore == null) {
      rows.push(['quiz', 'Diagnostic quiz', '40 questions at the end of the intro section, about 40 minutes', R.go('The lesson page: Diagnostic Test'), 'Take it']);
    } else {
      var weak = m.nf ? m.weak.filter(function (s) { return s && s.picked; }) : [];
      rows.push(['quiz', 'Diagnostic quiz', 'You scored ' + m.diagScore + '%' + (weak.length ? '. ' + (weak.length > 1 ? weak.length + ' subjects need' : weak[0].name + ' needs') + ' more work' : ''),
        m.nf ? ' data-view="progress"' : R.go('The Score Report of your diagnostic quiz'), 'See results']);
    }
    var n = m.myTests.length, taken = m.taken.length;
    rows.push(['tests', 'Practice tests', taken ? taken + ' of ' + n + ' taken' + (m.nf ? ', ' + m.aboveBar + ' at ' + m.bar + '% or more' : '') : n + ' tests, one or two for each subject',
      R.go('The Practice tests page (/a2/practice_tests)'), 'Open']);
    return '<section class="pr-modes" aria-label="Practice"><h2>Practice</h2><ul>' + rows.map(function (r) {
      return '<li><a href="#" class="pr-mode"' + r[3] + '><span class="pr-mode-ic">' + I[r[0]] + '</span><span class="pr-mode-t"><b>' + r[1] + '</b><span>' + r[2] + '</span></span>' +
        '<span class="pr-mode-go">' + r[4] + I.right + '</span></a></li>';
    }).join('') + '</ul></section>';
  }

  // Progress: the exam goal (new), the lesson quizzes against the students' average, and each subject in one row
  function goal(m, R) {
    if (!m.nf) return '';
    var S = m.S, p = R.pace(m);
    if (!S.exam) {
      return '<a href="#" class="pr-goal is-empty" data-view="settings"><span>Add your exam date and the score your school needs. Your plan counts the days for you.</span>' + R.tag() + I.right + '</a>';
    }
    var state = m.left === 0 ? 'Lessons done' : p && p.warn ? 'Behind' : 'On track';
    return '<div class="pr-goal"><div class="pr-goal-n"><b>' + S.exam.days + '</b><span>days to your exam</span></div>' +
      '<div class="pr-goal-t"><p>Exam on <b>' + S.exam.long + '</b>' + (S.target ? ' · your school needs <b>' + S.target + '%</b>' : '') + '</p>' +
      (p ? '<p class="pr-goal-p">' + p.text + '</p>' : '') + '</div>' +
      '<span class="pr-state' + (p && p.warn ? ' is-warn' : '') + '">' + state + '</span>' +
      '<a href="#" class="pr-edit" data-view="settings">Change</a>' + R.tag() + '</div>';
  }

  function scale(m, R) {
    var st = STATS[m.key];
    if (!st || m.done === 0) {
      return '<section class="pr-card pr-score"><h2>Lesson quizzes</h2><p class="pr-empty">Each lesson ends with a few short questions. Answer them, and you\'ll see here how many you got right and how that compares with other students.</p></section>';
    }
    // You and the students' average are two bars on one 0–100 scale; the school's score is a target line across both,
    // labelled above the bars, so marks never sit on each other however close the numbers are. One sentence says it in words.
    var goal = m.nf && m.S.target ? m.S.target : null;
    var d = st.correct - st.avg;
    var say = (d > 0 ? d + ' points above' : d < 0 ? -d + ' points below' : 'The same as') + ' the students\' average' +
      (goal ? (goal > st.correct ? ' · ' + (goal - st.correct) + ' more to reach your school\'s ' + goal + '%' : ' · already at what your school needs') : '');
    say = say.charAt(0).toUpperCase() + say.slice(1);
    function bar(cls, name, v) {
      return '<span class="pr-cmp-l ' + cls + '">' + name + '</span><span class="pr-cmp-t ' + cls + '"><i style="width:' + v + '%"></i></span><b class="pr-cmp-v">' + v + '%</b>';
    }
    var line = goal ? '<span class="pr-cmp-goal" style="--x:' + goal + '%"><span class="pr-cmp-gl' + (goal > 72 ? ' is-end' : goal < 28 ? ' is-start' : '') + '"><i aria-hidden="true"></i>Your school needs ' + goal + '%</span></span>' : '';
    return '<section class="pr-card pr-score"><div class="pr-score-h"><h2>Lesson quizzes</h2><p>' + st.done + ' of ' + st.total + ' questions answered</p></div>' +
      '<p class="pr-big"><b>' + st.correct + '%</b> answered right</p><p class="pr-cmp-say">' + say + '</p>' +
      '<div class="pr-cmp' + (goal ? ' has-goal' : '') + '" role="img" aria-label="You: ' + st.correct + '% right. Students\' average: ' + st.avg + '%' + (goal ? '. Your school needs ' + goal + '%' : '') + '.">' +
      line + bar('is-you', 'You', st.correct) + bar('is-avg', 'Students\' average', st.avg) +
      '<span class="pr-cmp-ax"><span>0%</span><span>50%</span><span>100%</span></span></div></section>';
  }

  function subjects(m, R) {
    function row(s) {
      var best = s.tests.reduce(function (a, t) { return t.score != null && t.score > a ? t.score : a; }, -1);
      var tests = !s.tests.length ? '<span class="pr-muted">No test</span>'
        : best < 0 ? '<span class="pr-muted">Not taken</span>'
        : '<span class="pr-score-n ' + (best >= m.PASS ? 'is-ok' : 'is-low') + '">' + best + '%</span><span class="pr-muted">best of ' + R.plural(s.tests.filter(function (t) { return t.score != null; }).length, 'try', 'tries') + '</span>';
      var diag = m.nf ? '<span class="pr-c pr-c-d">' + (s.intro || s.diag == null ? '' : '<span class="pr-dg' + (s.diag <= 2 ? ' is-weak' : '') + '">' + s.diag + ' of 5' + (s.diag <= 2 ? ' · needs work' : '') + '</span>') + '</span>' : '';
      var pct = s.total ? s.done / s.total * 100 : 0;
      return '<li class="pr-r' + (s.done >= s.total ? ' is-done' : '') + '"><a href="#" class="pr-c pr-c-n" data-subj="' + s.id + '">' + maskIcon(s.id, 'pr-sic') + '<span>' + s.name + '</span></a>' +
        '<span class="pr-c pr-c-l"><span class="pr-l-n">' + (s.done >= s.total ? 'All ' + s.total : s.done + ' of ' + s.total) + '</span><span class="pr-bar is-mini"><i style="width:' + pct.toFixed(1) + '%"></i></span></span>' +
        '<span class="pr-c pr-c-t">' + tests + '</span>' + diag + '</li>';
    }
    var head = '<li class="pr-r is-head" aria-hidden="true"><span class="pr-c">Subject</span><span class="pr-c">Lessons</span><span class="pr-c">Practice tests</span>' + (m.nf ? '<span class="pr-c">Diagnostic' + R.tag() + '</span>' : '') + '</li>';
    var mine = m.secs.filter(function (s) { return s.picked; }), off = m.secs.filter(function (s) { return !s.picked; });
    return '<section class="pr-card pr-subj' + (m.nf ? ' has-diag' : '') + '"><h2>By subject</h2><ul class="pr-tbl">' + head + mine.map(row).join('') + '</ul>' +
      (off.length ? '<h3 class="pr-off-h">Not on your exam</h3><p class="pr-off-p">Still in Lessons if your school asks for them later.</p><ul class="pr-tbl is-off">' + off.map(row).join('') + '</ul>' : '') + '</section>';
  }

  function progressView(m, R) {
    return '<div class="pr-wrap"><h1 class="pr-h1">Your progress</h1>' + goal(m, R) + scale(m, R) + subjects(m, R) + '</div>';
  }

  // Questions: the inbox. New answers from Claire come first and are read where they are announced, then the rest
  function questionsView(m, R) {
    var list = m.S.comments, fresh = m.unread ? list.filter(function (c) { return c.reply && c.reply.unread; }) : [];
    var rest = list.filter(function (c) { return fresh.indexOf(c) < 0; });
    var lead = '<p class="r4-page-lead">You ask in the comments under a lesson. Claire answers there, and every question and answer is collected here.</p>';
    if (!list.length) return '<div class="pr-wrap"><h1 class="pr-h1">Your questions</h1>' + lead + '<p class="r4-qa-empty">' + R.Q_EMPTY + '</p></div>';
    var news = fresh.length ? '<section class="pr-card pr-fresh"><div class="pr-fresh-h"><h2>' + (fresh.length > 1 ? 'Claire answered ' + fresh.length + ' of your questions' : 'Claire answered your question') + R.tag() + '</h2>' +
      '<button type="button" class="r4-btn-2" data-read>Mark as read</button></div><ul class="r4-qa-list is-chat">' + fresh.map(R.qaItem).join('') + '</ul></section>' : '';
    return '<div class="pr-wrap"><h1 class="pr-h1">Your questions</h1>' + lead + news +
      (rest.length ? (fresh.length ? '<h2 class="pr-h2">Earlier</h2>' : '') + '<section class="pr-card pr-thread"><ul class="r4-qa-list is-chat">' + rest.map(R.qaItem).join('') + '</ul></section>' : '') + '</div>';
  }

  function page(m, phone, R, inner) {
    if (!phone && R.state.nav === 'left') {
      var v = R.state.view;
      return R.sideNav('pr', [{ label: 'Study', icon: I.study, attrs: ' data-view="home"', on: v === 'home' },
        { label: 'Lessons', icon: I.lessons, attrs: ' data-view="lessons"', on: v === 'lessons' || v === 'lesson' },
        { label: 'Progress', icon: I.progress, attrs: ' data-view="progress"', on: v === 'progress' },
        { label: 'Questions', icon: I.questions, attrs: ' data-view="questions"', on: v === 'questions', count: m.unread },
        { label: 'Forum', icon: I.forum, attrs: R.go('The Forum (/a2/forums)') }], inner);
    }
    var h = header(m, phone, R);
    return '<div class="pr' + (phone ? ' is-phone' : '') + '">' + h.top + '<main class="pr-main">' + inner + '</main>' + h.nav + '</div>';
  }

  window.R4V = {
    // Questions show as comment threads with avatars (see chatItem in r4-core-ux.js)
    chatQA: true,
    // Home is called Study in this version's menu
    backLabel: 'Back to Study',
    // Lessons has its own place in this version's menu, so its page has no "Back" link
    lessonsInMenu: true,
    // Claire AI takes this version's colours
    root: 'pr',
    homeName: 'Study',
    // Every lesson link opens the sample lesson page (see LESSON in r4-core-ux.js)
    lessonPage: true,
    render: function (m, phone) {
      var R = window.R4, v = R.state.view;
      // Skip sits in the header too: on a phone the form is two screens long, and a student without answers should not scroll it to leave
      if (v === 'setup') {
        return '<div class="pr is-setup' + (phone ? ' is-phone' : '') + '"><header class="pr-top"><span class="pr-logo"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></span>' +
          '<button type="button" class="r4-btn-q r4-skip-top" data-skip>Skip for now</button></header>' + R.setupView(m) + '</div>';
      }
      if (v === 'settings') return page(m, phone, R, R.settingsView(m));
      if (v === 'lessons') return page(m, phone, R, R.lessonsView(m));
      if (v === 'lesson') return page(m, phone, R, R.lessonView(m));
      if (v === 'progress') return page(m, phone, R, progressView(m, R));
      if (v === 'questions') return page(m, phone, R, questionsView(m, R));
      // A student who skipped the first questions is reminded on Study, not only on Progress
      var remind = m.nf && !m.S.exam && m.left > 0 ? '<p class="pr-remind"><a href="#" data-view="settings">Add your exam date</a>, and your plan shows how many lessons to do each day.' + R.tag() + '</p>' : '';
      return page(m, phone, R, '<div class="pr-wrap">' + greet(m, R) + upNext(m, R) + remind + modes(m, R) + '</div>');
    },
    onClick: function (e, R) {
      if (e.target.closest('[data-plan]')) { var o = R.state.open[R.state.state]; o.plan = !o.plan; R.rerender(); return true; }
      var sj = e.target.closest('[data-subj]');
      if (sj) {
        e.preventDefault(); var id = sj.getAttribute('data-subj'), lv = R.state.lvOpen[R.state.state];
        R.C.sections.forEach(function (x) { lv[x.id] = x.id === id; });
        R.state.view = 'lessons'; R.state.pop = null; window.scrollTo(0, 0); R.rerender(); return true;
      }
      return false;
    }
  };
})();
