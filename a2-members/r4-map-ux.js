// Version «Course map» (YBG-1877): Khan Academy's course page made into Home. Every lesson is a square in the row of its subject,
// so the whole course, where the student is and what comes next are one picture. The rows replace the left menu of the live page
// (full subject names with counts); the practice tests close each row, the diagnostic quiz is the last square of the intro.
// UX-fixes copy of r4-map.js (ux-review, 24.10.2026): Home in the menu, the plan in one line, a shorter legend, two doors on new answers.
(function () {
  var I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 2.5L5 13.6h6.2l-1 7.9 8.8-11.3h-6.3z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    // Menu on the left: one icon per place
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.2L12 4l8 6.2V19a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19z"/></svg>',
    tests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 9.5l1.8 1.8 3.7-3.8M9 15.5h6"/></svg>',
    questions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 16h-6l-4 3.5V16a2.5 2.5 0 0 1-2.5-2.5z"/></svg>',
    forum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5v-1a4.5 4.5 0 0 1 4.5-4.5h2a4.5 4.5 0 0 1 4.5 4.5v1"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.2a4.5 4.5 0 0 1 3 4.3v1"/></svg>'
  };

  function sic(id, cls) { return '<span class="' + cls + '" style="--ic:url(assets/sec-' + id + '.svg)" aria-hidden="true"></span>'; }

  function header(m, phone, R) {
    var v = R.state.view, pop = R.state.pop;
    var count = m.unread ? '<span class="mp-count" aria-label="' + R.plural(m.unread, 'new reply', 'new replies') + '">' + m.unread + '</span>' : '';
    var links = [['Practice tests', R.go('The Practice tests page (/a2/practice_tests)'), v === 'practice'], ['Comments', ' data-view="questions"', v === 'questions', count],
      ['Forum', R.go('The Forum (/a2/forums)'), false]];
    var me = '<div class="mp-me-w"><button type="button" class="mp-me" data-pop="profile" aria-expanded="' + (pop === 'profile') + '" aria-label="Your account"><img src="assets/avatar.png" alt="">' +
      (phone ? '' : '<span>' + R.NAME + '</span>') + I.chev + '</button>' + (pop === 'profile' ? R.profileMenu() : '') + '</div>';
    var logo = '<a href="#" class="mp-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>';
    if (phone) {
      var all = [['Home', ' data-view="home"', v === 'home'], ['Lessons', ' data-view="lessons"', v === 'lessons' || v === 'lesson']].concat(links);
      var menu = pop === 'menu' ? '<div class="r3-pop mp-menu" role="menu">' + all.map(function (l) {
        return '<a href="#" role="menuitem"' + l[1] + (l[2] ? ' aria-current="page"' : '') + '>' + l[0] + (l[3] || '') + '</a>';
      }).join('') + '</div>' : '';
      return '<header class="mp-top">' + logo + '<div class="mp-tools">' + R.aiButton(true) + '<div class="mp-menu-w"><button type="button" class="mp-burger" data-pop="menu" aria-expanded="' + (pop === 'menu') + '" aria-label="Menu">' +
        I.menu + (m.unread ? '<span class="mp-dot" aria-hidden="true"></span>' : '') + '</button>' + menu + '</div>' + me + '</div></header>';
    }
    // Home is a place of its own in the menu, so the student always sees where they are
    var desk = [['Home', ' data-view="home"', v === 'home' || v === 'lessons' || v === 'lesson']].concat(links);
    return '<header class="mp-top">' + logo + '<nav class="mp-nav" aria-label="Member area">' + desk.map(function (l) {
      return '<a href="#" class="mp-nav-a' + (l[2] ? ' is-on' : '') + '"' + l[1] + (l[2] ? ' aria-current="page"' : '') + '>' + l[0] + (l[3] || '') + '</a>';
    }).join('') + '</nav>' + R.aiButton(false) + me + '</header>';
  }

  // Lessons the pace asks for today, in the order the site serves them: the started subject first, then course order
  function todayList(m, R) {
    var p = m.nf ? R.pace(m) : null;
    if (!p || !p.perDay || !m.next) return {};
    var out = {}, n = p.perDay, order = [m.next.sec].concat(m.mine.filter(function (s) { return s !== m.next.sec && s.done < s.total; }));
    for (var i = 0; i < order.length && n > 0; i++) {
      for (var j = order[i].done; j < order[i].total && n > 0; j++, n--) out[order[i].id + ':' + j] = true;
    }
    return out;
  }

  // Claire's plan in one line: the current step by name; her four steps, in her words, a click away
  function hello(m, R) {
    var open = R.state.open[m.key].plan === true;
    var step = m.cur > -1 ? 'Claire\'s plan, step ' + (m.cur + 1) + ' of 4: <b>' + R.PLAN[m.steps[m.cur].k].title + '</b>'
      : 'You\'ve done all four steps of Claire\'s plan.';
    var steps = open ? '<div class="mp-plan"><p class="mp-plan-lead">Here\'s the game plan, simple and stress-free:</p><ol>' + m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      return '<li class="is-' + st.state + '"><span class="mp-pn">' + (st.state === 'done' ? I.check : n + 1) + '</span><div><h3>' + p.title + '</h3><p>' + p.text + '</p></div></li>';
    }).join('') + '</ol></div>' : '';
    return '<section class="mp-hello"><h1>Hey there, ' + R.NAME + '!</h1><div class="mp-step-row"><p class="mp-lead">' + step + '</p>' +
      '<button type="button" class="mp-plan-tg" data-plan aria-expanded="' + open + '">' + (open ? 'Hide the plan' : 'See the plan') + I.chev + '</button></div>' + steps + '</section>';
  }

  // Exam goal (new): one line of facts under the greeting; Change opens Exam settings
  function goal(m, R) {
    if (!m.nf) return '';
    var S = m.S, p = R.pace(m);
    if (!S.exam) return '<p class="mp-goal is-empty"><a href="#" data-view="settings">Add your exam date</a> and the map marks the lessons to do each day.' + R.tag() + '</p>';
    var st = m.left === 0 ? 'Lessons done' : p && p.warn ? 'Behind' : 'On track';
    return '<p class="mp-goal"><span class="mp-goal-d"><b>' + S.exam.days + '</b> days to your exam</span><span class="mp-sep" aria-hidden="true"></span>' +
      '<span>' + S.exam.long + '</span>' +
      '<span class="mp-state' + (p && p.warn ? ' is-warn' : '') + '">' + st + '</span><a href="#" class="mp-edit" data-view="settings">Change</a>' + R.tag() + '</p>';
  }

  function upNext(m, R) {
    var S = m.S, o = {}, review = window.R4Review;
    var nextTest = m.nf && review.practiceNext(m);
    var lowest = m.nf && m.allLessonsDone && !nextTest && review.lowestPracticeResult(m);
    if (m.next && S.done !== 'all') {
      var s = m.next.sec, diag = s.intro && m.next.idx === 3;
      o.id = s.id; o.title = diag ? 'Diagnostic quiz' : m.next.title;
      o.meta = 'Up next in ' + (s.intro ? 'the intro section' : s.name) + ' · lesson ' + (m.next.idx + 1) + ' of ' + s.total + (diag ? ' · 40 questions' : ' · video 6–9 min');
      o.btn = m.done === 0 ? 'Start here' : diag ? 'Take the diagnostic quiz' : 'Continue lesson'; o.where = 'The lesson page: ' + m.next.title;
      if (m.nf && s.diag != null && s.diag <= 2) o.why = 'Diagnostic quiz: ' + s.diag + ' of 5 correct in ' + s.name;
      var p = m.nf ? R.pace(m) : null;
      if (p && p.perDay) o.today = 'Today: ' + R.plural(p.perDay, 'lesson') + ', marked on the map';
    } else if (nextTest) {
      var t = nextTest; o.id = t.sec.id; o.title = t.name; o.test = true;
      o.meta = 'Lessons complete · Up next in ' + t.sec.name + ' · ' + t.q + ' questions';
      o.why = t.reason;
      o.btn = 'Start ' + t.sec.name + ' practice'; o.where = 'The practice test: ' + t.name;
    } else if (lowest) {
      o.id = lowest.sec.id; o.title = 'Review ' + lowest.sec.name; o.test = true;
      o.meta = 'All practice tests taken · Lowest practice score: ' + lowest.score + '%';
      o.btn = 'Review lessons'; o.subject = lowest.sec.id;
    } else {
      o.id = 'introduction'; o.title = 'Time for the practice tests'; o.test = true;
      o.meta = 'All lessons are done. Review your practice results to see what needs more work.';
      o.btn = 'Go to practice tests'; o.where = 'The Practice tests page (/a2/practice_tests)';
    }
    return '<section class="mp-next" aria-label="Your next step"><span class="mp-next-ic">' + (o.test ? I.star : sic(o.id, 'mp-next-sic')) + '</span>' +
      '<div class="mp-next-t"><h2>' + o.title + '</h2><p class="mp-meta">' + o.meta + '</p>' +
      (o.why ? '<p class="mp-why">' + o.why + R.tag() + '</p>' : '') + (o.today ? '<p class="mp-today">' + o.today + (o.why ? '' : R.tag()) + '</p>' : '') + '</div>' +
      '<a href="#" class="mp-go"' + (o.subject ? ' data-subj="' + o.subject + '"' : R.go(o.where)) + '>' + o.btn + I.arrow + '</a></section>';
  }

  function row(s, m, R, today, nextTest) {
    var cur = m.next && m.S.done !== 'all' && m.next.sec === s ? m.next.idx : -1;
    var sqs = s.lessons.map(function (l, i) {
      var quiz = s.intro && i === 3, cls = i < s.done ? 'is-done' : i === cur ? 'is-next' : today[s.id + ':' + i] ? 'is-today' : '';
      var label = (quiz ? 'Diagnostic quiz' : 'Lesson ' + (i + 1) + ': ' + l) + (i < s.done ? ', done' : i === cur ? ', up next' : today[s.id + ':' + i] ? ', for today' : '');
      return '<a href="#" class="mp-sq ' + cls + (quiz ? ' is-quiz' : '') + '" title="' + R.esc(label) + '" aria-label="' + R.esc(label) + '"' + R.go('The lesson page: ' + l) + '>' + (quiz ? I.bolt : '') + '</a>';
    }).join('');
    var tests = s.tests.map(function (t, i) {
      var title = 'Practice test' + (s.tests.length > 1 ? ' ' + (i + 1) : '');
      var cls = t.score == null ? 'is-none' : 'is-taken';
      var label = s.name + ', ' + title + ': ' + (t.score == null ? 'not taken' : t.score + '%');
      return '<a href="#" class="mp-t ' + cls + (nextTest && nextTest.name === t.name ? ' is-next' : '') +
        '" title="' + R.esc(label) + '" aria-label="' + R.esc(label) + '"' + R.go('The practice test: ' + t.name) + '>' + I.star +
        (t.score == null ? '' : '<span>' + t.score + '%</span>') + '</a>';
    }).join('');
    if (s.intro && m.diagScore != null) tests = '<span class="mp-t is-diag" role="img" aria-label="Diagnostic quiz: ' + m.diagScore +
      '%">' + I.bolt + '<span>' + m.diagScore + '%</span></span>';
    var weak = m.nf && s.picked && s.diag != null && s.diag <= 2;
    return '<li class="mp-row' + (cur > -1 ? ' is-cur' : '') + (s.done >= s.total ? ' is-done' : '') + '">' +
      // The subject name opens its lessons by name; the arrow says so on a phone too, where squares show no names
      '<a href="#" class="mp-name" data-subj="' + s.id + '" aria-label="' + R.esc(s.name + ', see its lessons') + '">' + sic(s.id, 'mp-sic') + '<span class="mp-name-t"><b>' + s.name + '</b><small>' + s.done + ' of ' + s.total + ' lessons complete</small></span><span class="mp-name-go">' + I.right + '</span></a>' +
      '<div class="mp-cells"><span class="mp-sqs">' + sqs + '</span>' + (tests ? '<span class="mp-tests">' + tests + '</span>' : '') + '</div>' +
      (weak ? '<p class="mp-flag">Diagnostic quiz: ' + s.diag + ' of 5 correct' + R.tag() + '</p>' : '') + '</li>';
  }

  // Only the signs a student cannot read without help: an empty square is plainly "not started", and test scores carry their own words
  function legend(m, R, today) {
    var items = [['is-done', 'Lesson complete'], ['is-next', 'Up next']];
    if (Object.keys(today).length) items.push(['is-today', 'Today']);
    return '<ul class="mp-legend">' + items.map(function (k) { return '<li><i class="mp-sq ' + k[0] + '"></i>' + k[1] + '</li>'; }).join('') +
      '<li><i class="mp-sq is-quiz">' + I.bolt + '</i>Diagnostic quiz</li><li><i class="mp-t is-none">' + I.star + '</i>Practice test</li></ul>';
  }

  function map(m, R) {
    var today = todayList(m, R);
    var review = window.R4Review;
    var mine = m.secs.filter(function (s) { return s.picked; }), off = m.secs.filter(function (s) { return !s.picked; });
    var focus = m.nf && m.key === 'progress' ? review.aiAction('weak', 'Show my weak spots', R) : '';
    var nextTest = m.nf && m.allLessonsDone ? review.practiceNext(m) : null;
    var details = '<details class="review-map-progress" data-map-progress' + (R.state.open[m.key].progress ? ' open' : '') +
      '><summary><span class="review-map-show">Show progress details</span><span class="review-map-hide">Hide progress details</span>' +
      I.chev + '</summary>' + review.progressSummary(m, R, false) + '</details>';
    return '<section class="mp-map" aria-label="Your course"><div class="mp-map-h"><h2>Your course</h2><p>' +
      (m.left === 0 ? 'All ' + m.total + ' lessons complete' : m.done + ' of ' + m.total + ' lessons complete') + (m.chosen ? ' in your plan' : '') + '</p></div>' +
      details + (focus ? '<div class="review-map-actions">' + focus + '</div>' : '') +
      legend(m, R, today) + '<ol class="mp-rows">' + mine.map(function (s) { return row(s, m, R, today, nextTest); }).join('') + '</ol>' + review.finalCourseLink(m, R) +
      (off.length ? '<h3 class="mp-off-h">Not on your exam</h3><p class="mp-off-p">Still here if your school asks for them later. <a href="#" data-view="settings">Change your subjects</a></p>' +
        '<ol class="mp-rows is-off">' + off.map(function (s) { return row(s, m, R, {}); }).join('') + '</ol>' : '') + '</section>';
  }

  function page(m, phone, R, inner) {
    if (!phone && R.state.nav === 'left') {
      var v = R.state.view;
      return R.sideNav('mp', [{ label: 'Home', icon: I.home, attrs: ' data-view="home"', on: v === 'home' || v === 'lessons' || v === 'lesson' },
        { label: 'Practice tests', icon: I.tests, attrs: R.go('The Practice tests page (/a2/practice_tests)'), on: v === 'practice' },
        { label: 'Comments', icon: I.questions, attrs: ' data-view="questions"', on: v === 'questions', count: m.unread },
        { label: 'Forum', icon: I.forum, attrs: R.go('The Forum (/a2/forums)') }], inner);
    }
    return '<div class="mp' + (phone ? ' is-phone' : '') + '">' + header(m, phone, R) + '<main class="mp-main">' + inner + '</main></div>';
  }

  window.R4V = {
    callReview: true,
    // Every lesson link opens the sample lesson page (see LESSON in r4-core-ux.js)
    lessonPage: true,
    // Claire AI takes this version's colours
    root: 'mp',
    // Questions show as comment threads with avatars (see chatItem in r4-core.js)
    chatQA: true,
    render: function (m, phone) {
      var R = window.R4, v = R.state.view;
      if (v === 'setup') return '<div class="mp is-setup' + (phone ? ' is-phone' : '') + '"><header class="mp-top"><span class="mp-logo"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></span></header>' + R.setupView(m, true) + '</div>';
      if (v === 'settings') return page(m, phone, R, R.settingsView(m));
      if (v === 'lessons') return page(m, phone, R, R.lessonsView(m));
      if (v === 'lesson') return page(m, phone, R, R.lessonView(m));
      var review = window.R4Review;
      if (v === 'questions') return page(m, phone, R, review.commentsView(m, R));
      if (v === 'practice') return page(m, phone, R, review.practiceView(m, R));
      if (v === 'final' || v === 'final-sample') return page(m, phone, R, review.finalView(m, v === 'final-sample'));
      var ans = review.recentComments(m, R);
      // With no exam date yet the reminder waits under the next step instead of standing before it
      var g = goal(m, R), later = m.nf && !m.S.exam;
      return page(m, phone, R, '<div class="mp-wrap">' + hello(m, R) + (later ? '' : g) + upNext(m, R) + (later ? g : '') + map(m, R) +
        ans + '</div>');
    },
    onClick: function (e, R) {
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
