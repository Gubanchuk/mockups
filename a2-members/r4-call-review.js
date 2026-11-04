// Interactive examples for the YBG-1877 mockup review. All scores and threads are demo data.
(function () {
  var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  var discussion = {};
  var quizCounts = { progress: { answered: 142, right: 105 }, done: { answered: 634, right: 545 } };
  var endocrine = {
    id: 'endocrine', asked: 6, activity: 4, lesson: 'Endocrine System (Hormones)', who: 'Maya R.',
    time: '6 days ago', text: 'Is ADH the same hormone as vasopressin?',
    reply: { name: 'Claire Corter', time: '4 days ago', text: 'Yes. They are two names for the same hormone.' }
  };

  function practiceNext(m) {
    var untaken = m.myTests.filter(function (t) { return t.score == null; });
    var weak = untaken.find(function (t) { return t.sec.diag != null && t.sec.diag <= 2; });
    var next = weak || untaken.find(function (t) {
      return t.sec.tests.every(function (test) { return test.score == null; });
    }) || untaken[0];
    if (!next) return null;
    var reason = weak ? 'Diagnostic quiz: ' + weak.sec.diag + ' of 5 correct. ' : '';
    return Object.assign({ reason: reason + 'Practice test not taken yet.' }, next);
  }

  function lowestPracticeResult(m) {
    return m.taken.reduce(function (lowest, test) {
      return !lowest || test.score < lowest.score ? test : lowest;
    }, null);
  }

  function finalAction(m) {
    return '<a href="#" class="r4-btn-2" data-view="final">' +
      (m.S.finalScore == null ? 'Open final test' : 'See final test result') + '</a>';
  }

  function finalCourseLink(m, R) {
    if (!m.nf) return '';
    return '<section class="review-final-entry"><div><h2>Final test' + R.tag() + '</h2><p>' +
      (!m.allLessonsDone ? 'Available after you complete your lessons.' : m.S.finalScore == null
        ? 'Check your readiness for the exam.' : 'Your final test score is ' + m.S.finalScore + '%.') +
      '</p></div>' + (m.allLessonsDone ? finalAction(m) : '') + '</section>';
  }

  function finalScoreDetails(score, target, sample) {
    return '<dl><div><dt>' + (sample ? 'Sample score' : 'Your score') + '</dt><dd>' + score + '%</dd></div>' +
      (target ? '<div><dt>Your school needs</dt><dd>' + target + '%</dd></div>' : '') + '</dl>' +
      (target ? '<p>' + (score >= target ? 'This result meets the score your school needs.' :
        'This result is ' + (target - score) + ' percentage points below the score your school needs.') + '</p>' :
        '<p><a href="#" data-view="settings">Add the score your school needs</a></p>');
  }

  function finalResult(m, R, showAction) {
    if (!m.nf) return '';
    return '<section class="review-metric review-final"><h2>Final test' + R.tag() + '</h2>' +
      (m.S.finalScore != null ? finalScoreDetails(m.S.finalScore, m.S.target)
        : '<p class="review-metric-label">No final test result yet</p><p>The school score comparison appears here after you have a final test result.</p>') +
      (showAction && m.allLessonsDone ? '<div class="review-final-action">' + finalAction(m) + '</div>' : '') + '</section>';
  }

  function progressSummary(m, R, includeLessons) {
    var stats = quizCounts[m.key];
    var quiz = stats ? Math.round(stats.right / stats.answered * 100) : null;
    var diag = m.diagScore;
    var lessons = includeLessons === false ? '' : '<div class="review-metric"><h2>Lessons completed</h2><p class="review-metric-label">' +
      m.done + ' of ' + m.total + '</p><p>' + (m.chosen ? 'Lessons in your selected subjects, including the intro.' : 'Lessons in the full course.') + '</p></div>';
    return '<section class="review-progress" aria-label="What each result measures">' + lessons +
      '<div class="review-metric"><h2>Lesson quizzes</h2><p class="review-metric-label">' + (quiz == null ? 'No answers yet' : quiz + '% correct') + '</p><p>' +
      (stats ? stats.right + ' correct out of ' + stats.answered + ' lesson questions answered.' : 'Your score is based on the lesson questions you answer.') + '</p></div>' +
      '<div class="review-metric"><h2>Diagnostic quiz</h2><p class="review-metric-label">' + (diag == null ? 'Not taken' : diag + '% correct') + '</p><p>' +
      (diag == null ? 'The quiz at the end of the intro has 40 questions.' : Math.round(diag / 100 * 40) + ' correct out of 40 diagnostic questions.') + '</p></div>' +
      '<div class="review-metric"><h2>Practice tests</h2><p class="review-metric-label">' + m.taken.length + ' of ' + m.myTests.length + ' taken</p><p>See the result for each test below.</p></div>' +
      finalResult(m, R, includeLessons !== false) + '</section>';
  }

  function aiAction(id, label, R) {
    if (R.state.ai !== 'on') return '';
    return '<button type="button" class="review-ai-action" data-ai-context="' + id + '">' + R.aiSpark + R.esc(label) + '</button>';
  }

  function sampleThreads(m) {
    var list = m.S.comments.map(function (c, i) {
      var thread = Object.assign({ id: 'thread-' + i, who: 'You', asked: i + 3, activity: i === 0 ? 2 : i === 1 ? 1 : 14 }, c);
      if (m.key === 'progress' && i === 2) {
        thread.asked = 14;
        thread.reply = Object.assign({}, c.reply, { name: 'Sam T.', role: 'Student' });
      }
      return thread;
    });
    return m.key === 'progress' ? list.concat(endocrine) : list;
  }

  function commentState(key) {
    if (!discussion[key]) discussion[key] = { sort: 'activity', topic: '', query: '', open: null, replies: {} };
    return discussion[key];
  }

  function message(name, time, text, R, role, isReply, fresh) {
    var initials = name.split(/\s+/).map(function (part) { return part.charAt(0); }).join('').slice(0, 2);
    var avatar = name === 'You' ? '<img class="r4-av" src="assets/avatar.png" alt="">' :
      '<span class="r4-av ' + (role === 'Admin' ? 'is-claire' : 'is-other') + '" aria-hidden="true">' + R.esc(initials) + '</span>';
    return '<div class="r4-msg ' + (isReply ? 'is-claire' : 'is-me') + '">' +
      avatar + '<div class="r4-msg-b"><p class="r4-msg-h"><b>' + R.esc(name) + '</b>' +
      (role ? '<span class="r4-role">' + R.esc(role) + '</span>' : '') + '<span>' + R.esc(time) + '</span>' +
      (fresh ? '<span class="r4-unread">Unread</span>' : '') + '</p><p class="r4-msg-t">' +
      R.esc(text) + '</p></div></div>';
  }

  function thread(c, m, R, actions) {
    var cs = commentState(m.key);
    var mine = cs.replies[c.id] || [];
    var compose = actions && cs.open === c.id;
    var response = c.reply ? message(c.reply.name, c.reply.time, c.reply.text, R, c.reply.role || 'Admin', true, m.unread && c.reply.unread)
      : '<p class="r4-msg-wait">No replies yet.</p>';
    var controls = actions ? '<div class="review-thread-controls"><button class="review-text-btn" type="button" data-review-reply="' +
      c.id + '" aria-expanded="' + compose + '">' + (compose ? 'Cancel reply' : 'Reply') + '</button>' +
      (compose ? '<form class="review-reply" data-review-reply-form="' + c.id + '">' +
        '<label>Your reply<textarea name="reply" rows="3" maxlength="1000" required></textarea></label>' +
        '<button type="submit" class="r4-btn">Post reply</button></form>' : '') + '</div>' : '';
    return '<li class="r4-th review-thread"><a href="#" class="r4-th-l"' + R.go('The lesson page: ' + c.lesson) +
      '>' + R.esc(c.lesson) + '</a><div class="r4-th-msgs">' + message(c.who, c.time, c.text, R) + response +
      mine.map(function (reply) { return message('You', 'Just now', reply, R, '', true); }).join('') + '</div>' + controls + '</li>';
  }

  function orderedThreads(m, sort) {
    var cs = commentState(m.key);
    function value(c) { return sort === 'asked' ? c.asked : cs.replies[c.id] ? 0 : c.activity; }
    return sampleThreads(m).sort(function (a, b) { return value(a) - value(b); });
  }

  function recentComments(m, R) {
    var list = orderedThreads(m, 'activity');
    if (!list.length) return '';
    var open = R.state.qaOpen[m.key] === true;
    var more = Math.min(list.length - 1, 2), fresh = m.unread;
    var all = '<a class="review-text-btn review-comments-all" href="#" data-view="questions">See all comments (' + list.length + ')' + ARROW + '</a>';
    var toggle = more ? '<button type="button" class="review-text-btn" data-review-more aria-expanded="' + open + '">' +
      (open ? 'Show fewer' : 'Show ' + more + ' more') + CHEVRON + '</button>' : '';
    var wasRead = m.nf && R.state.read[m.key] && list.some(function (c) { return c.reply && c.reply.unread; });
    var read = fresh || wasRead ? '<button type="button" class="review-text-btn" data-read' +
      (wasRead ? ' aria-disabled="true" aria-label="All comments marked as read"' : '') + '>Mark all as read</button>' : '';
    var visible = list.slice(0, open ? 1 + more : 1);
    return '<section class="review-comments" aria-label="Recent comments"><header class="review-comments-head"><h2>Recent comments</h2>' +
      (fresh ? '<span class="review-new-replies">' + R.plural(fresh, 'new reply', 'new replies') + '</span>' : '') + '</header>' +
      '<ul class="r4-qa-list is-chat" role="list">' + visible.map(function (c) { return thread(c, m, R, false); }).join('') + '</ul>' +
      '<footer class="review-comments-foot">' + (toggle || read ? '<div class="review-comments-actions">' + toggle + read + '</div>' : '') +
      all + '</footer></section>';
  }

  function commentsView(m, R) {
    var cs = commentState(m.key), list = orderedThreads(m, cs.sort);
    var query = cs.query.toLowerCase();
    var shown = list.filter(function (c) {
      var reply = c.reply ? c.reply.name + ' ' + c.reply.text : '';
      var text = [c.lesson, c.who, c.text, reply].concat(cs.replies[c.id] || []).join(' ').toLowerCase();
      return (!cs.topic || R.commentTopic(c.lesson) === cs.topic) && (!query || text.includes(query));
    });
    var topics = [...new Set(list.map(function (c) { return R.commentTopic(c.lesson); }))];
    var filters = m.nf && list.length > 1 ? '<form class="review-comment-filters" data-review-search>' +
      '<label>Search comments<input name="query" type="search" placeholder="Lesson or keyword" value="' + R.esc(cs.query) + '"></label>' +
      '<button type="submit" class="r4-btn-2">Search</button>' +
      '<label>Subject<select name="topic"><option value="">All subjects</option>' + topics.map(function (id) {
        var subject = R.secById(m.secs, id);
        return '<option value="' + id + '"' + (cs.topic === id ? ' selected' : '') + '>' + R.esc(subject.name) + '</option>';
      }).join('') + '</select></label><label>Sort by<select name="sort"><option value="activity"' +
      (cs.sort === 'activity' ? ' selected' : '') + '>Latest reply or comment</option><option value="asked"' +
      (cs.sort === 'asked' ? ' selected' : '') + '>Newest comment</option></select></label></form>' : '';
    var content = shown.length ? '<ul class="r4-qa-list is-chat review-comment-list">' +
      shown.map(function (c) { return thread(c, m, R, m.nf); }).join('') + '</ul>'
      : '<p class="r4-qa-empty">' + (list.length ? 'No matching comments. Try another search or subject.' : 'Comments you join under a lesson appear here.') + '</p>';
    var study = window.R4V.root === 'pr';
    var cardHeading = m.unread ? R.plural(m.unread, 'new reply', 'new replies') : 'Conversations';
    var card = '<section class="review-comment-card" aria-label="Lesson conversations">' +
      '<div class="review-comments-notice"><h2 data-comments-heading tabindex="-1">' + cardHeading + '</h2>' +
      (m.unread ? '<button type="button" class="r4-btn-2" data-read>Mark all as read</button>' : '') + '</div>' +
      (list.length ? '<p class="review-results" role="status">' + R.plural(shown.length, 'conversation') + '</p>' : '') +
      content + '</section>';
    return '<section class="' + (study ? 'pr-wrap' : 'r4-page') + ' review-comments-page" aria-label="Comments"><h1 class="' +
      (study ? 'pr-h1' : 'r4-page-title') + '">Comments</h1>' +
      '<p class="r4-page-lead">' + (m.nf ? 'Find your lesson conversations and reply here.' + R.tag() : 'Find your conversations and open the lesson to reply.') + '</p>' +
      filters + card + '</section>';
  }

  function lessonComments(m, title, R) {
    var list = sampleThreads(m).filter(function (c) { return c.lesson === title; });
    if (title === endocrine.lesson && !list.length) list = [endocrine];
    return list.map(function (c) { return thread(c, m, R, true); }).join('');
  }

  function lessonPreview(m, title, R) {
    var section = R.secById(m.secs, R.commentTopic(title));
    return '<section class="r4-page"><button type="button" class="r3-lv-back" data-view="home">' + (window.R4V.backLabel || 'Back to Home') +
      '</button><h1 class="r4-page-title">' + R.esc(title) + '</h1><p class="r4-page-lead">' + R.esc(section.name) +
      ' · Lesson preview</p>' +
      '<p class="r4-qa-empty">The video and questions are available in the course.</p>' +
      '<section class="review-lesson-comments"><h2>Comments</h2><ul class="r4-qa-list is-chat">' + lessonComments(m, title, R) + '</ul></section></section>';
  }

  function practiceView(m, R) {
    var section = m.secs.find(function (s) { return s.tests.some(function (t) { return t.name === R.state.testTitle; }); });
    var test = section && section.tests.find(function (t) { return t.name === R.state.testTitle; });
    if (test) return '<section class="r4-page"><button type="button" class="r3-lv-back" data-view="practice">Back to Practice tests</button>' +
      '<h1 class="r4-page-title">' + R.esc(test.name) + '</h1><p class="r4-page-lead">' + R.esc(section.name) +
      ' · ' + R.plural(test.q, 'question') + '</p><p class="r4-qa-empty">' +
      (test.score == null ? 'Not taken yet.' : 'Best practice score: ' + test.score + '%.') + ' This is a preview of the practice test destination.</p></section>';
    var subjects = m.mine.filter(function (s) { return s.tests.length; });
    return '<section class="r4-page"><button type="button" class="r3-lv-back" data-view="home">' + (window.R4V.backLabel || 'Back to Home') +
      '</button><h1 class="r4-page-title">Practice tests</h1><p class="r4-page-lead">' + m.taken.length + ' of ' + m.myTests.length + ' taken in your plan.</p>' +
      subjects.map(function (s) {
        return '<section class="review-practice-subject"><h2>' + R.esc(s.name) + '</h2><ul>' + s.tests.map(function (t, i) {
          return '<li><a href="#"' + R.go('The practice test: ' + t.name) + '><span>Test ' + (i + 1) + '</span><span>' +
            (t.score == null ? 'Not taken' : t.score + '%') + '</span>' + ARROW + '</a></li>';
        }).join('') + '</ul></section>';
      }).join('') + '</section>';
  }

  function finalView(m, sample) {
    var score = sample ? m.S.sampleFinalScore : m.S.finalScore;
    var scored = m.allLessonsDone && score != null;
    var heading = '<section class="r4-page review-final-page"><button type="button" class="r3-lv-back" data-view="home">' +
      (window.R4V.backLabel || 'Back to Home') + '</button><h1 class="r4-page-title" tabindex="-1">' +
      (scored ? 'Final test result' : 'Final test') + '</h1>';
    if (!m.allLessonsDone) return heading + '<p class="r4-page-lead">Available after you complete your lessons.</p></section>';
    if (scored) return heading + '<p class="r4-page-lead">Sample result</p><div class="review-metric review-final review-final-report">' +
      finalScoreDetails(score, m.S.target, sample) + '</div></section>';
    return heading + '<p class="r4-page-lead">See how a final test score appears alongside your school’s requirement.</p>' +
      '<form class="review-final-action" data-demo-final><button type="submit" class="r4-btn">View sample result</button></form></section>';
  }

  function renderAndFocus(R, from, selector) {
    var phoneIndex = [...document.querySelectorAll('.scroller')].indexOf(from.closest('.scroller'));
    R.rerender();
    var root = phoneIndex < 0 ? document : document.querySelectorAll('.scroller')[phoneIndex];
    var next = root.querySelector(selector);
    if (next) next.focus({ preventScroll: true });
    return next;
  }

  function onClick(e, R) {
    var plan = e.target.closest('[data-plan]');
    if (plan) {
      var o = R.state.open[R.state.state];
      o.plan = !o.plan;
      renderAndFocus(R, plan, '[data-plan]');
      return true;
    }
    var more = e.target.closest('[data-review-more]');
    if (more) {
      R.state.qaOpen[R.state.state] = more.getAttribute('aria-expanded') !== 'true';
      var toggle = renderAndFocus(R, more, '[data-review-more]');
      if (toggle && e.detail === 0) toggle.scrollIntoView({ block: 'nearest' });
      return true;
    }
    var read = e.target.closest('.review-comments [data-read], .review-comment-card [data-read]');
    if (read) {
      if (read.getAttribute('aria-disabled') === 'true') return true;
      R.state.read[R.state.state] = true;
      renderAndFocus(R, read, read.closest('.review-comments') ? '.review-comments [data-read]' : '[data-comments-heading]');
      return true;
    }
    var reply = e.target.closest('[data-review-reply]');
    if (!reply) return false;
    var id = reply.getAttribute('data-review-reply'), cs = commentState(R.state.state);
    cs.open = cs.open === id ? null : id;
    renderAndFocus(R, reply, cs.open ? '[data-review-reply-form="' + id + '"] textarea' : '[data-review-reply="' + id + '"]');
    return true;
  }

  function onSubmit(e, R) {
    var form = e.target;
    if (form.hasAttribute('data-demo-final')) {
      e.preventDefault();
      var model = R.model(R.state.state);
      if (model.nf && model.allLessonsDone) {
        R.showSampleFinalResult();
        renderAndFocus(R, form, '.review-final-page h1');
      }
      return true;
    }
    var cs = commentState(R.state.state);
    if (form.hasAttribute('data-review-search')) {
      e.preventDefault();
      cs.query = form.elements.query.value.trim();
      renderAndFocus(R, form, '[data-review-search] input');
      return true;
    }
    var id = form.getAttribute('data-review-reply-form');
    if (!id) return false;
    e.preventDefault();
    var value = form.elements.reply.value.trim();
    if (!value) { form.elements.reply.focus(); return true; }
    (cs.replies[id] || (cs.replies[id] = [])).push(value);
    cs.open = null;
    renderAndFocus(R, form, '[data-review-reply="' + id + '"]');
    return true;
  }

  function onChange(e, R) {
    var target = e.target;
    if (!target.matches('[data-review-search] select')) return false;
    var cs = commentState(R.state.state);
    cs[target.name] = target.value;
    renderAndFocus(R, target, '[data-review-search] select[name="' + target.name + '"]');
    return true;
  }

  window.R4Review = {
    practiceNext: practiceNext, lowestPracticeResult: lowestPracticeResult,
    finalView: finalView, finalCourseLink: finalCourseLink, progressSummary: progressSummary, recentComments: recentComments, commentsView: commentsView,
    lessonPreview: lessonPreview, lessonComments: lessonComments, practiceView: practiceView, aiAction: aiAction,
    onClick: onClick, onSubmit: onSubmit, onChange: onChange
  };
})();
