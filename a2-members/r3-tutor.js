// Variant «Tutor» (YBG-1877, round 3): the page says what to do today; Ask Claire sits beside the plan. All AI parts are new.
(function () {
  // Hand-drawn icon set: round caps, slightly uneven lines
  var D = {
    today: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.2 8.6c3.1-.1 5.4 2.4 5.3 5.5-.1 3-2.5 5.3-5.5 5.2-3-.1-5.2-2.6-5.1-5.5.1-2.9 2.4-5.1 5.3-5.2z"/><path d="M14 3.2v2.1M14.1 22.7v2.2M3.3 14.1h2.1M22.6 13.9h2.2M6.4 6.5l1.5 1.4M20.1 20.2l1.6 1.5M6.5 21.6l1.4-1.5M20.2 7.9l1.5-1.5"/></svg>',
    lessons: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.3 6.4c3.3-.9 6.8-.6 9.7 1.3v14.6c-2.9-1.8-6.4-2.2-9.6-1.4z"/><path d="M23.7 6.3c-3.3-.8-6.8-.5-9.7 1.4v14.6c2.9-1.9 6.3-2.3 9.6-1.5z"/></svg>',
    tests: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.6 5.2H6.7c-1 0-1.6.7-1.6 1.7l.2 15.3c0 1 .7 1.6 1.7 1.6h14.2c1 0 1.6-.7 1.6-1.7l-.1-15.3c0-.9-.7-1.6-1.6-1.6h-1.9"/><path d="M10.2 3.9h7.5l.3 3.1h-8z"/><path d="M9.6 13.6l2 2 3.7-4.1M9.8 19.6h8.3"/></svg>',
    forum: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.6 6.8c0-1.3 1-2.2 2.3-2.2h9.6c1.3 0 2.2 1 2.2 2.3l-.1 5.8c0 1.2-1 2.2-2.3 2.2H10l-3.8 3.1.2-3.1h-.7c-.6 0-1.2-.6-1.2-1.3z"/><path d="M21.5 10.4h.6c1.2 0 2.1 1 2.1 2.2l-.1 5.4c0 1.2-.9 2.1-2.1 2.1h-.6l.2 2.9-3.6-2.9h-5.3c-1.1 0-2-.7-2.3-1.7"/></svg>',
    ask: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.3 4.6c5.3-.1 9.4 3.4 9.3 7.9-.1 4.4-4.3 7.8-9.5 7.7-1.2 0-2.3-.2-3.3-.5l-4.6 2.6.9-4.4c-1.6-1.4-2.6-3.3-2.5-5.4.1-4.5 4.4-7.9 9.7-7.9z"/><path d="M13.9 9.1l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.2 12.1h13.4M13.1 6.2l5.9 5.9-6 5.9"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19.2V5.3M6.2 10.9l5.8-5.8 5.9 5.8"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.3 12.6l4.4 4.3 9-9.6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.6 6.2c0-.8.9-1.3 1.6-.9l8.1 5.1c.7.4.7 1.4 0 1.8l-8.1 5.2c-.7.4-1.6-.1-1.6-.9z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5.2v13.6M5.2 12h13.6"/></svg>'
  };
  var NEW = '<span class="tu-new">New</span>';
  var planOpen = {}, repliesOpen = {};

  function rail(R, phone) {
    var view = R.state.view;
    var items = [['today', 'Today', ' data-view="home"', view === 'home'], ['lessons', 'Lessons', ' data-view="lessons"', view === 'lessons'],
      ['tests', 'Tests', R.go('The Practice tests page (/a2/practice_tests)'), false], ['forum', 'Forum', R.go('The Forum (/a2/forums)'), false],
      ['ask', 'Ask Claire', ' data-askfocus', false]];
    var links = items.map(function (it) {
      return '<a href="#" class="tu-ri' + (it[3] ? ' is-on' : '') + (it[0] === 'ask' ? ' is-ask' : '') + '"' + it[2] + (it[3] ? ' aria-current="page"' : '') + '><span class="tu-ri-ic">' + D[it[0]] + '</span><span>' + it[1] + '</span></a>';
    }).join('');
    if (phone) return '<nav class="tu-tabbar" aria-label="Member area">' + links + '</nav>';
    return '<nav class="tu-rail" aria-label="Member area">' + links + '<div class="tu-ri-me-w"><button type="button" class="tu-ri tu-ri-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '">' +
      '<img src="assets/avatar.png" alt=""><span>' + R.NAME + '</span></button>' + (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div></nav>';
  }

  function topbar(m, R, phone) {
    var S = m.S;
    // The capsule says it can be changed. A phone has room only for the days; the date and the school's score get their own line under the plan
    var exam = S.exam
      ? (phone || !S.target ? '' : '<span class="tu-target">Your school needs ' + S.target + '%</span>') + '<a href="#" class="tu-exam" data-edit="exam"><b>' + R.days(S.exam.days) + '</b>' +
        (phone ? '' : '<span>to your exam, ' + S.exam.date + '</span>') + '<em>Change</em></a>'
      : '<a href="#" class="tu-exam is-empty" data-edit="exam">' + D.plus + '<span>Add your exam date</span></a>';
    var me = phone ? '<div class="tu-me-w"><button type="button" class="tu-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '"><img src="assets/avatar.png" alt=""></button>' +
      (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div>' : '';
    var editor = R.state.edit === 'exam' ? '<div class="tu-edit"><h2>' + (S.exam ? 'Change your exam details' : 'When is your exam?') + '</h2>' + R.examForm(m) + '</div>' : '';
    return '<header class="tu-top"><a href="#" class="tu-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>' +
      exam + me + '</header>' + editor;
  }

  function tasks(m, R) {
    var S = m.S;
    if (m.key === 'new') {
      var chips = m.secs.filter(function (s) { return s.optional; }).map(function (s) {
        return '<button type="button" class="tu-schip' + (s.picked ? ' is-on' : '') + '" data-subject="' + s.id + '" aria-pressed="' + s.picked + '">' + (s.picked ? D.check : D.plus) + s.name + '</button>';
      }).join('');
      return { time: 'about 50 min', items: [
        { kind: 'Lesson', title: 'Introduction', why: 'Start here. Claire shows you how everything works around here.', meta: 'Introduction · lesson 1 of 4', where: 'The lesson page: Introduction', start: 'Start with the Introduction' },
        { kind: 'Set up', title: 'Pick the subjects on your exam', why: 'Math and the three English tests are on nearly every exam. Your school decides on these, so ask them:', extra: '<div class="tu-schips">' + chips + '</div>',
          meta: 'Tap a subject to take it off' },
        { kind: 'Quiz', title: 'Diagnostic quiz', why: '40 questions, about 40 minutes. Your plan for the next days builds on the results.', meta: 'Introduction · lesson 4 of 4', where: 'The lesson page: Diagnostic Test', start: 'Take the diagnostic quiz' }
      ] };
    }
    if (S.done !== 'all' && m.next) {
      var s = m.next.sec;
      var weakNow = s.diag != null && s.diag <= 2;
      // "Weakest" only when no other subject on the exam scored as low on the diagnostic
      var tie = weakNow && m.mine.some(function (x) { return x.id !== s.id && !x.intro && x.diag != null && x.diag <= s.diag; });
      var second = s.lessons[m.next.idx + 1];
      var gram = R.secById(m.secs, 'grammar');
      // Two lessons keep the pace; the Grammar one is marked as extra, so the list and "2 a day" agree
      return { time: 'about 30 min', items: [
        { kind: 'Lesson', title: m.next.title, why: 'Next in ' + s.name + (weakNow ? (tie ? ', one of your weakest subjects' : ', your weakest subject') + ' on the diagnostic (' + s.diag + ' of 5 right).' : '.'),
          meta: 'Video 6 to 9 min, then a short quiz', where: 'The lesson page: ' + m.next.title },
        // The pace itself is under the start button; repeating the numbers here read as a second, different count
        { kind: 'Lesson', title: second, why: 'Your second lesson today keeps you on pace.',
          meta: s.name + ' · lesson ' + (m.next.idx + 2) + ' of ' + s.total, where: 'The lesson page: ' + second },
        { kind: 'Extra', title: gram.lessons[0], why: 'Only if you have time. Grammar was ' + gram.diag + ' of 5 right on the diagnostic and has ' + gram.total + ' lessons, so an early start helps.',
          meta: 'Grammar · lesson 1 of ' + gram.total, where: 'The lesson page: ' + gram.lessons[0] }
      ] };
    }
    var low = m.myTests.filter(function (t) { return t.score != null && t.score < m.PASS; }).sort(function (a, b) { return a.score - b.score; });
    var items = [];
    if (m.nextTest && m.nextTest.score == null) {
      var nt = m.nextTest, untaken = m.myTests.filter(function (t) { return t.score == null; }).length;
      var fresh = !nt.sec.tests.some(function (t) { return t.score != null; });
      items.push({ kind: 'Test', title: nt.name, meta: nt.q + ' questions', where: 'The practice test: ' + nt.name,
        why: untaken === 1 ? 'The one practice test in your subjects you haven\'t taken yet.'
          : (fresh ? 'No practice test score in ' + nt.sec.name + ' yet.' : 'You haven\'t taken this one yet.') + ' ' + untaken + ' tests in your subjects are still to take.' });
    }
    // Retakes name both bars: the school's score decides "above or below", Claire's 90% is the goal.
    // One retake a day keeps today realistic; the rest wait in Your subjects with their own Retake links
    low.slice(0, items.length ? 1 : 2).forEach(function (t) {
      items.push({ kind: 'Retake', title: t.name + ' · ' + t.score + '%', q: t.q,
        why: (t.score >= m.bar ? 'Above ' + m.barLabel + '. ' : 'Below ' + m.barLabel + '. ') + (m.PASS - t.score) + " points short of Claire's 90% goal.",
        meta: 'Go through the answers and rationales first', where: 'The practice test: ' + t.name });
    });
    if (items[0] && items[0].kind === 'Test') items[0].q = m.nextTest.q;
    // About a minute a question, as the diagnostic quiz (40 questions, about 40 minutes)
    var mins = items.reduce(function (a, x) { return a + (x.q || 0); }, 0);
    var halfHours = Math.max(1, Math.round(mins / 30));
    var time = halfHours <= 2 ? 'about ' + (halfHours === 1 ? '30 min' : '1 hour') : 'about ' + Math.floor(halfHours / 2) + (halfHours % 2 ? '½' : '') + ' hours';
    return { time: time, items: items };
  }

  function today(m, R) {
    var t = tasks(m, R);
    // Ticks belong to the task, not to its place in the list: changing subjects reshuffles the list
    var ticks = R.state.ticks[m.key];
    var doneN = t.items.filter(function (x) { return ticks[x.title]; }).length;
    var list = t.items.map(function (x) {
      var on = !!ticks[x.title];
      // The task title opens its page; the circle is only the student's own checklist
      return '<li class="tu-task' + (on ? ' is-ticked' : '') + '"><button type="button" class="tu-tick" data-tick="' + R.esc(x.title) + '" aria-pressed="' + on + '" aria-label="Mark ' + R.esc(x.title) + ' as done">' + (on ? D.check : '') + '</button>' +
        '<div class="tu-task-b"><h3>' + (x.where ? '<a href="#"' + R.go(x.where) + '>' + x.title + '</a>' : x.title) + '</h3><p class="tu-why">' + x.why + '</p>' + (x.extra || '') +
        '<p class="tu-meta">' + x.kind + (x.meta ? ' · ' + x.meta : '') + '</p></div></li>';
    }).join('');
    var head = doneN === 0 ? t.time : (doneN === t.items.length ? 'All done for today' : doneN + ' of ' + t.items.length + ' done');
    // The button leads to the first task not ticked yet that has a page; with everything ticked it goes away
    var first = t.items.filter(function (x) { return x.where && !ticks[x.title]; })[0];
    var cta = first ? '<a href="#" class="tu-cta"' + R.go(first.where) + '><span class="tu-cta-l">' + (first.start || 'Start with ' + first.title.replace(/ · \d+%$/, '')) + '</span>' +
      '<span class="tu-cta-s">Start today\'s plan</span><i>' + D.arrow + '</i></a>' : '';
    // Pace with its finish date sits right under the start button, as in the other variants
    var p = R.pace(m);
    var pace = p ? '<p class="tu-pace' + (p.warn ? ' is-warn' : '') + '">' + p.text + '</p>' : '';
    return '<section class="tu-today" aria-label="Today"><div class="tu-today-h"><h2>Today</h2><span class="tu-pill">' + head + '</span>' + NEW + R.tip(R.TIPS.today) + '</div>' +
      '<ol class="tu-tasks">' + list + '</ol>' +
      '<p class="tu-note">The circles only mark things for you. A lesson or test counts when you finish it on its own page.</p>' +
      '<div class="tu-go">' + cta + '<a href="#" class="tu-whole" data-view="lessons">See all lessons</a>' + pace + '</div></section>';
  }

  function planStrip(m, R, phone) {
    // Open for a new student on a computer; on a phone it would push today's plan off the first screen
    var open = planOpen[m.key] != null ? planOpen[m.key] : m.key === 'new' && !phone;
    var dots = m.steps.map(function (st, n) {
      return '<span class="tu-pd is-' + st.state + '">' + (st.state === 'done' ? D.check : n + 1) + '</span>';
    }).join('<i aria-hidden="true"></i>');
    var cs = m.cur > -1 ? m.steps[m.cur] : null, cp = cs ? R.PLAN[cs.k] : null;
    var list = open ? '<ol class="tu-plan-list">' + m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      return '<li class="is-' + st.state + '"><span class="tu-pd is-' + st.state + '">' + (st.state === 'done' ? D.check : n + 1) + '</span>' +
        '<div><h3>' + p.title + (st.isNew ? NEW : '') + '</h3><p>' + p.text + '</p></div></li>';
    }).join('') + '</ol>' : '';
    return '<section class="tu-plan' + (open ? ' is-open' : '') + '" aria-label="Game plan"><div class="tu-plan-row">' +
      '<div class="tu-pdots" role="img" aria-label="Step ' + (m.cur + 1) + ' of 5">' + dots + '</div>' +
      (cp && !open ? '<p class="tu-plan-now"><b>' + cp.title + '</b>' + (cs.isNew ? NEW : '') + '</p>' : '') +
      '<button type="button" class="tu-plan-tg" data-tplan aria-expanded="' + open + '">' + (open ? 'Hide the plan' : 'Show the plan') + '</button></div>' + list + '</section>';
  }

  var ASK = {
    new: { sug: ['How long should I study each day?', 'What happens after the diagnostic?'],
      q: 'Do I need Chemistry?', a: 'Only if your school tests it. On the A2, Biology, Chemistry, Anatomy and Physiology, and Critical Thinking are up to your school, so ask which ones they require. If they skip Chemistry, you can skip it too.',
      src: 'Introduction · Orientation',
      more: [
        { a: 'Videos are 6 to 9 minutes, so even a short break fits one. Plan the course into your calendar and take it slow, so it sinks in.', src: 'Introduction · Introduction' },
        { a: 'Look at your score for each subject. Where you missed questions, plan extra time. If your school does not test a subject, you can skip it.', src: 'Introduction · Diagnostic Test' }
      ] },
    progress: { sug: ['Hormones vs. enzymes?', 'Explain negative feedback simply'],
      q: 'What does the thyroid actually do?', a: 'It sets your metabolic rate, how fast your cells use energy, by releasing the hormones T3 and T4.',
      src: 'Anatomy and Physiology · Endocrine System (Hormones)',
      more: [
        { a: 'Hormones are chemical messengers that travel in the blood to other organs. Enzymes speed up chemical reactions right where they are.', src: 'Anatomy and Physiology · Endocrine System (Hormones)' },
        { a: 'When a level gets too high, the body switches off whatever raised it, like a thermostat. Blood sugar and insulin work this way.', src: 'Anatomy and Physiology · Endocrine System (Hormones)' }
      ] },
    done: { sug: ['Quiz me on chemical bonds', 'Why is my ratio answer wrong?'],
      q: 'Why "neither the nurses nor the doctor is"?', a: 'With neither…nor, the verb agrees with the noun closest to it. Here that\'s "the doctor", which is singular, so it\'s "is".',
      src: 'Grammar · Subject-Verb Agreement I',
      more: [
        { a: 'Here is one: in which bond do two atoms share electrons, ionic, covalent or hydrogen? Answer: covalent.', src: 'Chemistry · Chemical Bonding' },
        { a: 'Check that both sides of your proportion use the same units in the same order, then cross-multiply. Most ratio mistakes are a flipped unit.', src: 'Math · Ratios and Proportions' }
      ] }
  };

  var askSel = {}, askText = {};
  function srcLesson(src) { var i = src.lastIndexOf(' · '); return i > -1 ? src.slice(i + 3) : src; }
  function ask(m) {
    var a = ASK[m.key], R = window.R3;
    var sel = askSel[m.key], q = a.q, ans = a.a, src = a.src, own = false;
    if (typeof sel === 'number') { q = a.sug[sel]; ans = a.more[sel].a; src = a.more[sel].src; }
    if (sel === 'own') { q = R.esc(askText[m.key]); own = true; }
    // Says outright that an AI answers: students mixed it up with Claire's own replies under lessons
    return '<section class="tu-ask" aria-label="Ask Claire"><div class="tu-ask-h"><span class="tu-ask-ic">' + D.ask + '</span><h2>Ask Claire</h2><span class="tu-ai">AI</span>' + NEW + '</div>' +
      '<p class="tu-ask-lead">Stuck on something? Ask about any lesson. An AI helper answers from Claire\'s lessons and shows you which video to watch.</p>' +
      '<div class="tu-chat" aria-label="Example conversation"><p class="tu-eg">Example</p><p class="tu-bub is-me">' + q + '</p>' +
      (own
        ? '<div class="tu-bub is-claire"><p>Here the AI helper answers from Claire\'s lessons and links the lesson that explains it. The mockup shows ready-made examples only.</p></div>'
        : '<div class="tu-bub is-claire"><p>' + ans + '</p><a href="#" class="tu-src"' + R.go('The lesson page: ' + srcLesson(src)) + '>' + D.play + '<span>' + src + '</span></a></div>') + '</div>' +
      '<form class="tu-input" data-askform><input type="text" name="q" placeholder="Type your question" aria-label="Type your question" autocomplete="off">' +
      '<button type="submit" class="tu-send" aria-label="Send">' + D.send + '</button></form>' +
      '<div class="tu-sugs">' + a.sug.map(function (s, i) { return '<button type="button" class="tu-sug' + (sel === i ? ' is-on' : '') + '" data-sug="' + i + '">' + s + '</button>'; }).join('') + '</div></section>';
  }

  function subjects(m) {
    var R = window.R3;
    var rows = m.mine.map(function (s) {
      var pct = s.done / s.total * 100;
      var weak = R.needsFocus(s, m) && s.done < s.total;
      var done = s.done >= s.total;
      // Test scores by number, each a link; shown once a subject has a score or its lessons are done
      var tests = s.tests.length && (done || s.tests.some(function (t) { return t.score != null; }))
        ? '<span class="tu-tests">' + s.tests.map(function (t, i) {
            // Under Claire's 90% the link says Retake, so the weak tests stand out without counting
            var low = t.score != null && t.score < m.PASS;
            return '<a href="#"' + R.go('The practice test: ' + t.name) + (low ? ' class="is-low"' : '') + '>' +
              (t.score == null ? 'Take test ' + (i + 1) : (low ? 'Retake test ' + (i + 1) + ' · ' : 'Test ' + (i + 1) + ' · ') + t.score + '%') + '</a>';
          }).join('') + '</span>' : '';
      return '<li class="tu-subj' + (done ? ' is-done' : '') + '"><div class="tu-subj-top"><span class="tu-subj-n">' + s.name + '</span>' +
        '<span class="tu-subj-c">' + (done ? D.check + 'Done' : s.done + ' / ' + s.total) + '</span></div>' +
        '<span class="tu-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span>' +
        (weak ? '<span class="tu-weak">Diagnostic: ' + s.diag + ' of 5 right · needs practice</span>' : '') + tests + '</li>';
    }).join('');
    // Subjects the school decides on can be added and taken off here at any time; a new student picks them in Today, so one place only
    var opt = m.secs.filter(function (s) { return s.optional; });
    var off = !m.S.chosen ? '' : '<div class="tu-off"><span>Up to your school, tap to change:</span>' + opt.map(function (s) {
      return '<button type="button" class="tu-schip ' + (s.picked ? 'is-picked' : 'is-off') + '" data-subject="' + s.id + '" aria-pressed="' + s.picked + '">' + (s.picked ? D.check : D.plus) + s.name + '</button>';
    }).join('') + '</div><p class="tu-off-note">Taking one off hides it from your plan. Your progress in it stays.</p>';
    var sum = m.S.chosen ? m.done + ' of ' + m.total + ' lessons in your plan' : m.total + ' lessons. Pick your subjects in Today to drop the ones you don\'t need.';
    return '<section class="tu-subjects" aria-label="Your subjects"><div class="tu-sec-h"><h2>Your subjects' + window.R3.tip(window.R3.TIPS.diag) + '</h2><p>' + sum + '</p></div>' +
      '<ul class="tu-subj-list">' + rows + '</ul>' + off + '</section>';
  }

  function comments(m, R) {
    var list = m.S.comments;
    if (!list.length) return '';
    // A new reply is already announced at the top with "See reply"; a second folded line here only repeated it
    if (!repliesOpen[m.key] && list.some(function (c) { return c.reply && c.reply.unread; })) return '';
    if (!repliesOpen[m.key]) {
      var c0 = list[0];
      return '<section class="tu-qs is-short" aria-label="Replies to your questions" data-qs><p class="tu-qs-line"><span class="tu-qs-ic">' + D.forum + '</span>' +
        '<span><b>' + (list.length > 1 ? list.length + ' replies' : 'Claire replied') + '</b> ' + (list.length > 1 ? 'to your questions' : 'to your question under') + ' ' +
        (list.length > 1 ? '' : '<a href="#"' + R.go('The lesson page: ' + c0.lesson) + '>' + c0.lesson + '</a> · ' + c0.reply.time) + '</span>' +
        '<button type="button" class="tu-qs-tg" data-replies>Show</button></p></section>';
    }
    return '<section class="tu-qs" aria-label="Replies to your questions" data-qs><div class="tu-sec-h"><h2>Replies to your questions</h2><button type="button" class="tu-qs-tg" data-replies>Hide</button></div><ul>' + list.map(function (c) {
      // Two dates, each with its own word: when the student asked and when Claire replied
      return '<li><p class="tu-q-where">Under <a href="#"' + R.go('The lesson page: ' + c.lesson) + '>' + c.lesson + '</a> · asked ' + c.time + '</p><p class="tu-q">' + R.esc(c.text) + '</p>' +
        (c.reply ? '<p class="tu-a"><b>' + c.reply.name + ' replied ' + c.reply.time + ':</b> ' + R.esc(c.reply.text) + '</p>' : '') + '</li>';
    }).join('') + '</ul></section>';
  }

  window.R3V = {
    render: function (m, phone) {
      var R = window.R3;
      if (R.state.view === 'lessons') return '<div class="tu' + (phone ? ' is-phone' : '') + '">' + (phone ? '' : rail(R, false)) +
        '<div class="tu-main">' + topbar(m, R, phone) + '<div class="tu-lv">' + R.lessonsView(m) + '</div></div>' + (phone ? rail(R, true) : '') + '</div>';
      return '<div class="tu' + (phone ? ' is-phone' : '') + '">' + (phone ? '' : rail(R, false)) +
        '<div class="tu-main">' + topbar(m, R, phone) +
        '<div class="tu-hello"><h1>Hey there, ' + R.NAME + '! <span aria-hidden="true">👋</span></h1><p>Here\'s the game plan, simple and stress-free:</p></div>' + planStrip(m, R, phone) +
        (phone && m.S.exam ? '<p class="tu-target-m">Exam on ' + m.S.exam.date + (m.S.target ? ' · Your school needs ' + m.S.target + '%' : '') + '</p>' : '') + R.replyNotice(m) +
        '<div class="tu-grid">' + today(m, R) + ask(m) + '</div>' + subjects(m) + comments(m, R) + '</div>' +
        (phone ? rail(R, true) : '') + '</div>';
    },
    onClick: function (e, R) {
      var t = e.target.closest('[data-tick]');
      if (t) { var k = R.state.state, i = t.getAttribute('data-tick'); R.state.ticks[k][i] = !R.state.ticks[k][i]; R.rerender(); return true; }
      var tp = e.target.closest('[data-tplan]');
      if (tp) { planOpen[R.state.state] = tp.getAttribute('aria-expanded') !== 'true'; R.rerender(); return true; }
      var rp = e.target.closest('[data-replies]');
      if (rp) { repliesOpen[R.state.state] = !repliesOpen[R.state.state]; R.rerender(); return true; }
      var sg = e.target.closest('[data-sug]');
      if (sg) { askSel[R.state.state] = +sg.getAttribute('data-sug'); R.rerender(); return true; }
      var af = e.target.closest('[data-askfocus]');
      if (af) {
        e.preventDefault();
        if (R.state.view !== 'home') { R.state.view = 'home'; R.rerender(); }
        var root = af.closest('.tu') || document;
        var panel = root.querySelector('.tu-ask') || document.querySelector('.tu-ask');
        if (panel) { panel.scrollIntoView({ behavior: 'smooth', block: 'center' }); var inp = panel.querySelector('input'); if (inp) inp.focus({ preventScroll: true }); }
        return true;
      }
      return false;
    },
    // "See reply" at the top opens the replies before the page scrolls to them
    openReplies: function (R) { repliesOpen[R.state.state] = true; R.rerender(); },
    // Sending a typed question shows how the answer would appear
    onSubmit: function (e, R) {
      var f = e.target.closest('[data-askform]'); if (!f) return false;
      e.preventDefault();
      var v = f.elements.q.value.trim(); if (!v) return true;
      askSel[R.state.state] = 'own'; askText[R.state.state] = v; R.rerender(); return true;
    }
  };
})();
