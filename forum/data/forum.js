// Real topics and posts from the beta forum /hesi/forums/1 (pulled 18.10.2026).
// Usernames are the beta's anonymised ones. Students' first names inside post texts
// (greetings and sign-offs) are removed because the mockup site is public; Patrick and
// Claire keep theirs. Test topics of the beta (ASCA, ABRAKADABRA, ...) are left out, and
// the list is topped up with the first five topics of page 2.
window.FORUM = {
  name: 'Hesi Exam Study Insider',
  topics: 1072,
  posts: 3843,
  pages: 43,
  team: ['Patrick', 'Claire Corter'],

  // Topic list, page 1. posts = all posts including the first one; last = last post.
  // read = the beta admin's read state; 2059 is set to unread to show that state for a student.
  list: [
    { id: 25, pinned: true, read: true, posts: 599, views: 68636, lastAgo: '7 months ago', lastBy: 'nancy.walker.133617', title: 'PASSED THE HESI? Post here!' },
    { id: 2051, pinned: true, read: false, posts: 1, views: 101, lastAgo: '8 months ago', lastBy: 'Patrick', title: 'NCLEX-RN & PN 2026 Test Plan Update (What\'s Changing and What It Means for You)' },
    { id: 774, pinned: true, read: true, posts: 76, views: 29175, lastAgo: '', lastBy: 'ryan.williams.131182', title: 'YBG Practice Scores VS Real HESI Test Score' },
    { id: 159, pinned: true, read: true, posts: 86, views: 36769, lastAgo: '', lastBy: 'brandon.martinez.90062', title: 'HOW I PASSED! Share advice here!' },
    { id: 93, pinned: true, read: false, posts: 29, views: 10218, lastAgo: '', lastBy: 'george.morgan.100434', title: 'V 2026 - Suggestions & Comments, please share here!' },
    { id: 2059, read: false, posts: 3, views: 26, lastAgo: '7 months ago', lastBy: 'justin.baker.137946', title: 'HESI EXIT RETAKE' },
    { id: 178, read: true, posts: 3, views: 71, lastAgo: '7 months ago', lastBy: 'ronald.moore.138250', title: 'cardiovascular/operation' },
    { id: 2038, read: true, posts: 9, views: 289, lastAgo: '7 months ago', lastBy: 'elizabeth.alvarez.138011', title: 'Please help!' },
    { id: 2058, read: true, posts: 1, views: 15, lastAgo: '7 months ago', lastBy: 'thomas.king.133564', title: 'I passed my EXIT HESI!!!' },
    { id: 2057, read: true, posts: 2, views: 24, lastAgo: '7 months ago', lastBy: 'joshua.hughes.134902', title: 'Hesi Med Surge' },
    { id: 2054, read: true, posts: 1, views: 22, lastAgo: '7 months ago', lastBy: 'donna.smith.134123', title: 'Pn Hesi exit' },
    { id: 2055, read: true, posts: 2, views: 72, lastAgo: '7 months ago', lastBy: 'emma.garcia.134709', title: 'I passed my exit HESI!! Thank you YBG' },
    { id: 2049, read: true, posts: 3, views: 124, lastAgo: '7 months ago', lastBy: 'david.kelly.133490', title: 'How do you access your HESI scores on YBG (Your Best Grade)?' },
    { id: 2053, read: true, posts: 2, views: 51, lastAgo: '7 months ago', lastBy: 'matthew.nguyen.136596', title: 'Exit HESI 1/3 next monday!!!' },
    { id: 2020, read: true, posts: 3, views: 190, lastAgo: '8 months ago', lastBy: 'Patrick', title: 'Passed My hesi LPN-RN entrance exam' },
    { id: 2048, read: true, posts: 1, views: 56, lastAgo: '9 months ago', lastBy: 'eric.kelly.133514', title: 'Passed First Hesi Exit' },
    { id: 2041, read: true, posts: 2, views: 80, lastAgo: '11 months ago', lastBy: 'amy.gutierrez.129819', title: 'Health assessment' },
    { id: 2039, read: true, posts: 2, views: 195, lastAgo: '12 months ago', lastBy: 'stephen.davis.122830', title: 'HELP HESI EXIT..... STRUGGLINGGGG' },
    { id: 2026, read: true, posts: 2, views: 145, lastAgo: 'about 1 year ago', lastBy: 'katherine.lee.89999', title: 'What are the most heavily tested maternity topics?' },
    { id: 2031, read: true, posts: 2, views: 321, lastAgo: 'over 1 year ago', lastBy: 'Patrick', title: 'Nursing school HESI exit exams' },
    { id: 2030, read: true, posts: 2, views: 195, lastAgo: 'over 1 year ago', lastBy: 'Patrick', title: 'Failed all my HESIS. Tips on how to study.' },
    { id: 1890, read: true, posts: 12, views: 870, lastAgo: 'over 1 year ago', lastBy: 'scott.gomez.118604', title: 'Health Assessment HESI' },
    { id: 2028, read: true, posts: 2, views: 169, lastAgo: 'over 1 year ago', lastBy: 'alexander.morales.120910', title: 'Hesi fundamentals LPN-RN' },
    { id: 2022, read: true, posts: 5, views: 496, lastAgo: 'over 1 year ago', lastBy: 'kevin.clark.117918', title: 'Med Surg hesi' },
    { id: 2018, read: true, posts: 5, views: 231, lastAgo: 'over 1 year ago', lastBy: 'ashley.james.111649', title: 'help' }
  ],

  // Threads, page 1. hideDate: the topic hides post dates on the live site (old pinned threads).
  // The pinned threads 25, 159, 774 and 93 live in forum-long.js with their full first pages.
  threads: {
    2038: { hideDate: false, total: 9, posts: [
      { by: 'cynthia.king.113761', ago: '12 months ago', n: 1, text: `Hello Guys,
i will be taking my hesi exit #1 wed, i am not ready. what do you guys recomend to prepare myself ? i need a 900 and i barely scored a 689 on the exit test on here, we 3 changes. our school isn't giving us enough time to prepare.` },
      { by: 'katherine.castillo.128799', ago: '12 months ago', n: 2, text: `I have taken about 8 or 10 tests on this platform and have been using study mode since I signed up a little over a week ago. I was feeling confident and felt like I've learned a lot and I would pass my exit. But looking at my overall performance of all the tests I'm still only scoring about half way on everything. My PN exit HESI is in like a week and I'm panicking.
I took one of the two available CAT assessments, the score was like 56% but also said "pass" on it. Currently I cant tell if ill pass my exit or not and don't want to get burnt out studying because then nothing will stick.
Others are telling me that my current half way scores are more than enough to pass my exit but that's not the vibe I'm getting looking at these 50% and 60% scores on the tests I've been taking.
I'm just curious about others using this platform and question bank. Anyone used this qbank and taken the exit and passed? Does anyone feel confident like me but still have midway scores.` },
      { by: 'scott.cooper.128704', ago: '12 months ago', n: 1, text: `hello im feeling the same way!! definitely agree, i take my exit hesi i literally have 9 days to take the test.` },
      { by: 'michael.hughes.129174', ago: '10 months ago', n: 1, text: `I am on HCC and the last semester on fall I fell the class because I'm not pass the Hesi, I buy it and I'm been practice a questions. Hope this new semester I can pass with a good score. Since I have to repeat the semester. What you guys recommended for study on this YBG how many questions for days. Please IM on the 4th semester ready. Thanks` },
      { by: 'anna.cruz.132967', ago: '10 months ago', n: 1, text: `YBG was recommended by another school mate that just passed her RN NCLEX June of 2025. She told me that this defineltly helped her in the last semester, and also prepared her for the NCLEX. I start my last semester in January, and our first day back at school we have our first Pharm HESI. I just took the study mode questions and got a 915. I think I will do a section each day till school start to get my mind in sports mode. Im also preparing to do the Evolve practice questions in the morning on the up coming topics as well to be prepared for the upcoming semesters. I will keep everyone posted.` },
      { by: 'brenda.kelly.126551', ago: '10 months ago', n: 1, text: `Hi take my first HESI and pass use this site practicing create test can help.` },
      { by: 'janet.nguyen.126447', ago: '9 months ago', n: 1, text: `I need to have an idea how to use this platform, I have to take the following legacy hesi exams fundamental with 55 questions, and must get a 700 to pass, Pharmacology, and Mental health, and now Maternity/pediatrics. how do I study the content the school we went did not teach they had us read chapters of the entire book in 6 weeks nothing was retained we had 8 hour class 1 day a week, then the chapter exam,` },
      { by: 'Patrick', ago: '8 months ago', n: 440, text: `Hi everyone,
I just came across this thread and wanted to add a quick note that may help.
First, it's completely normal to feel unsure when looking at practice scores. Many students who pass the HESI Exit are scoring somewhere in the 60–70% range on practice questions while they're studying. What matters more than the raw score is that you're doing enough questions and reviewing the rationales carefully.
The students who usually see the biggest improvement are the ones completing several hundred questions over time and focusing on understanding why answers are correct or incorrect.
A simple approach that works well for many students is:
• Use the Test Creator
• Select Unused questions
• Do 30–60 questions at a time
• Review the rationales, even for questions you answered correctly
Try not to panic if your scores aren't perfect while studying. The goal is to build familiarity with HESI question patterns and clinical judgment.
Keep practicing consistently and you should see improvement.

Happy Studies!
Patrick, Your Best Grade Support` },
      { by: 'elizabeth.alvarez.138011', ago: '7 months ago', n: 1, text: `Hi, I took the first practice exam to see where I would be if I were to take the exit exam, and I have to admit I am panicking, although I have some time to study and get better. Despite having some time to study and improve, I still feel anxious about my lack of preparation; it's almost like I don't know where to start with the practice exam. I feel like I have so much ground to cover.` }
    ] },

    2059: { hideDate: false, total: 3, posts: [
      { by: 'michelle.reed.138281', ago: '7 months ago', n: 1, text: `hello everyone, I retake my RN HESI EXIT on april 10th for the second time. The first time I score a 728 on March 27th. , any tips ? I just bought YBG.` },
      { by: 'brian.phillips.120776', ago: '7 months ago', n: 1, text: `I think we go to the same school. I scored a 760 on my BSN315 HESI today and I am retaking it on the 10th as well. I used YBG and was doing well on this website. I used this website as a base for my previous 3 HESI's and did extremely well. I have no idea how it didn't work for pharmacology. It did help with NGN questions - I performed well on those for my pharmacology II HESI; I used test creator and specifically clicked my subject of choice and on all 3 NGN style questions, and I believe that helped me prepare. But, again, I failed version 1. We have a second chance, but I'm unsure about using this platform again. This site has extremely good rationals and it essential to review those.` },
      { by: 'justin.baker.137946', ago: '7 months ago', n: 7, text: `Hi!
I dont have any tips for u
but u have very nice result` }
    ] },




    2051: { hideDate: false, total: 1, posts: [
      { by: 'Patrick', ago: '8 months ago', n: 440, text: `The short version:
Nothing major is changing.
The NCLEX format is the same.
Clinical judgment is still central.
Partial credit scoring is still used.
The overall content categories remain stable.
This update mostly reflects newer data about what entry level nurses are doing, not a brand new exam.
If you are preparing using a clinical judgment–focused approach (like Your Best Grade), you are already on track.

Why the test plan was updated
NCSBN updates the NCLEX test plan regularly using a large survey of newly licensed nurses (called a practice analysis).
The 2026 test plan is based on the 2024 practice analysis.
This means the exam language and examples are updated to reflect current entry-level nursing practice, but the structure of the exam remains the same.

What is NOT changing
- Computerized Adaptive Testing (CAT)
- 85–150 items
- Up to 5 hours (including breaks)
- 3 clinical judgment case studies (18 total items) in the minimum-length exam
- Stand-alone clinical judgment items (~10% depending on length)
- Partial credit scoring (plus/minus, zero/one, rationale scoring)
- Content category percentages remain stable (variation ±3% due to CAT)

Bottom Line
If you are preparing using a clinical judgment–focused approach, you are already most of the way ready for the 2026 NCLEX.
Stay consistent.
Keep practicing case-based reasoning.
Focus on safety and decision-making.
You are preparing correctly. :)` }
    ] },


    178: { hideDate: false, total: 3, posts: [
      { by: 'donald.price.1370', ago: 'over 15 years ago', n: 2, text: `how do you position a client with sudden cardiac death` },
      { by: 'Claire Corter', ago: 'over 15 years ago', n: 161, text: `Supine or lying on the back in order to begin cardiac compressions.

Claire` },
      { by: 'ronald.moore.138250', ago: '7 months ago', n: 1, text: `supine with board underneath them and begin CPR` }
    ] },

    2058: { hideDate: false, total: 1, posts: [
      { by: 'thomas.king.133564', ago: '7 months ago', n: 1, text: `Thank you YBG for helping me pass my EXIT HESI!! This was my second time taking it and I was super nervous but I stuck with the program and trusted God!!` }
    ] },

    2057: { hideDate: false, total: 2, posts: [
      { by: 'james.lee.138000', ago: '7 months ago', n: 1, text: `Hello,
I am taking my HESI Med Surge soon, and I am only interested in that section and not the Exit HESI or anything else. Can you please guide me what resources I should use?` },
      { by: 'joshua.hughes.134902', ago: '7 months ago', n: 1, text: `you signed up to pass a HESI Specialty Subject exam (such as Med Surg) and do not care about our HESI Exit practice tests, then skip the steps above and practice Med Surg using the Test Creator. You'll have access to more questions, as you can directly access all Med Surg questions in our question database. (You'll get the Med Surg questions from the 2 Med Surg specialty tests, in addition to all Med Surg focused questions from our general HESI Exit practice tests).` }
    ] },

    2054: { hideDate: false, total: 1, posts: [
      { by: 'donna.smith.134123', ago: '7 months ago', n: 1, text: `I just took my PN exit Hesi, I scored a 813. I did all the New generation practice test and was getting low 50's. So if your getting 50's you are not ready for Hesi exit exam.` }
    ] },

    2055: { hideDate: false, total: 2, posts: [
      { by: 'emma.harris.104809', ago: '7 months ago', n: 1, text: `First of all, I'm not usually do reviews. I tend to share my thoughts only when something goes wrong. However, I feel compelled to say something about YBG because it might make a difference for someone else.
I started using YBG almost 18 months ago, around my second quarter of nursing school. I didn't just answer questions or memorize information; I aimed to understand the rationale behind the concepts. I took notes and utilized the 50-page module/blueprint, which is a great resource. As you can imagine, my first HESI score before I started using YBG was really low, in the 700s. After using YBG, my first HESI (med-surg), my score was 990, and since then, I haven't scored less than 1000—most of my scores have been above 1100. My college requires us to take two HESI exams, and I scored over 1200 on both (HESI A and B). I took EXIT B three days ago.
What do I do? I use my school resource, which is Elsevier/Evolve and YBG. I might watch some YouTube videos here and there, but my main resources have been Elsevier and YBG. I used Evolve to learn the specific terms they commonly used; once you grasp the nuances of these terms, it's hard to miss the questions.
In conclusion, take your time, answer the questions, read the rationales, and take notes. YBG is an excellent source for explanations and understanding pathophysiology, even better than Elsevier/Evolve. YBG is also up-to-date with evidence-based practices and policy/practice changes (ACLS, CDC, WHO).` },
      { by: 'emma.garcia.134709', ago: '7 months ago', n: 1, text: `What can i do to improve my scores im having a hard time` }
    ] },

    2049: { hideDate: false, total: 3, posts: [
      { by: 'david.kelly.133490', ago: '9 months ago', n: 2, text: `I haven't seen this question on the forum (my apologies if someone has already posted something similar to this); however, I was wondering how we see/get access to our HESI "scores" on the Your Best Grade site?
I usually see the "simulated" HESI scores after I take a practice exit right away, yet when I go to the "Performance" tab, I only see my percentage but not the actual generated score, like I do not see 815 or 417, etc. I only see things like 78.45% 54.3% etc.
Is there a way we can see our HESI scores? I know that by looking at the percentages, I can tell if I improved, but I also like seeing the HESI scores as well, and I haven't been able to find that.

Thank you in advance!` },
      { by: 'Patrick', ago: '8 months ago', n: 440, text: `Hi,
Officially you can't, as we change the HESI-style scoring algorithm from time to time and wouldn't want your previous scores to change over night.
That said, you can still access them. When you open the exam report from your Performance area, just change the ending of URL from /report to /finish
Happy Studies!
Patrick, Your Best Grade Support` },
      { by: 'david.kelly.133490', ago: '7 months ago', n: 2, text: `Thank you SO much Patrick!! My apologies for answering one month later….
Thank you again, I'll try that out!!` }
    ] },

    2053: { hideDate: false, total: 2, posts: [
      { by: 'linda.castillo.110553', ago: '7 months ago', n: 1, text: `Hi guys!!
I take my first exit HESI this coming Monday and I am beyond nervous. I was wondering if any of you guys could give me some pointers for the upcoming tests; I do struggle with testing anxiety.
I have been using YBG for about 4 months now, but I still feel like I am not ready enough.
I wish everyone luck on their next exit HESI/ATI exams!!!` },
      { by: 'matthew.nguyen.136596', ago: '7 months ago', n: 1, text: `Hello! I have my first Exit Hesi tomorrow! You and I both will kill it for sure!` }
    ] },

    2020: { hideDate: false, total: 3, posts: [
      { by: 'scott.morgan.110804', ago: 'over 1 year ago', n: 1, text: `Passed my Hesi lpn to RN entrance exam with a 925. This was my third time taking the exam. First glory to God for empowering me to pass this exam. I signed up for yourbestgrade early January and did questions on and off until two weeks before my exam. My exam was 2/21/25 the last two weeks I did more questions. I ended up completing 1246 test questions. thank you yourbestgrade` },
      { by: 'gary.gray.135498', ago: '8 months ago', n: 1, text: `how did u do it` },
      { by: 'Patrick', ago: '8 months ago', n: 440, text: `The biggest difference for most students is simply volume and consistency. In this case the first post mentions completing over 1,200 practice questions, which is exactly where many people start seeing big improvements.
A good approach is to use the Test Creator, do 40–60 questions at a time, select Unused, and review the rationales carefully. Over time you start recognizing the patterns HESI uses.
Keep practicing and you should see your scores improve. :)` }
    ] },

    2048: { hideDate: false, total: 1, posts: [
      { by: 'eric.kelly.133514', ago: '9 months ago', n: 2, text: `I passed my First Hesi Exit exam yesterday and could not be happier. I purchased your best grade because of recommendations that I saw from other students that also used it and pass. Although I only used it for about 3 weeks before my exam. it definitely helped.` }
    ] },

    2041: { hideDate: false, total: 2, posts: [
      { by: 'justin.watson.130246', ago: '11 months ago', n: 1, text: `Aside from the two practice tests of 50 questions in specialty is there more to practice questions?` },
      { by: 'amy.gutierrez.129819', ago: '11 months ago', n: 1, text: `yes use the test creator` }
    ] },

    2039: { hideDate: false, total: 2, posts: [
      { by: 'stephanie.ramirez.129571', ago: '12 months ago', n: 1, text: `Struggling with how to start studying for HESI EXIT. i feel as if i already went over my fundamentals and struggle when i get questions about condiitions or medications i dont know about. I got a 444 on my last hesi and it is the lowest i have ever scored… i have my exit in a month… any tips? i keep scoring around 600-700 on these practice hesi exit exams.` },
      { by: 'stephen.davis.122830', ago: '12 months ago', n: 1, text: `From my understanding scoring lower on the YBG questions is good.. because these questions are a lot harder. Deep breaths. It's not forever and you're going to be okay. <3 Godspeed.` }
    ] },

    2026: { hideDate: false, total: 2, posts: [
      { by: 'pamela.watson.117925', ago: 'over 1 year ago', n: 1, text: `Maternity is my weak point and I was wondering if anyone knows/has data from their YBG performance on the amount of questions tested for antepartum vs. intrapartum vs. postpartum. I'm only 500 questions in but would like to know ahead of time to focus my limited time studying.` },
      { by: 'katherine.lee.89999', ago: 'about 1 year ago', n: 1, text: `KNOW YOUR KEY TERMS!
50% OF HESI IS TERMS AND THOSE BLUE BOXES IE: ( 12, BOX 5 )` }
    ] },

    2031: { hideDate: false, total: 2, posts: [
      { by: 'christopher.cox.121880', ago: 'over 1 year ago', n: 1, text: `Hiii, I am a current student graduating this semester and I believe Elsevier is making our HESI. Ive been doing all the NEXT GEN studies in your best grade but not the legacy. Should I focus on legacy ???` },
      { by: 'Patrick', ago: 'over 1 year ago', n: 440, text: `Hi,

I highly recommend reading our Exam Review PDF in the Exam Review section, which covers this exact question.

In a nutshell, if you will need to take a Next Gen exam, we highly recommend doing both NGN and Legacy questions, as both will be on your exam!

Happy Studies!

Patrick, Your Best Grade Support` }
    ] },

    2030: { hideDate: false, total: 2, posts: [
      { by: 'deborah.gomez.115913', ago: 'over 1 year ago', n: 1, text: `I need help. How do I utilize this resource to pass my next Hesis because I bombed all the ones for this term after using YOUR BEST GRADE.` },
      { by: 'Patrick', ago: 'over 1 year ago', n: 440, text: `Hi,

We recommend simply doing a lot more practice!

We noticed you only took 1 or 2 practice exams for each topic. As mentioned in the Orientation tab, if you are preparing for HESI Specialty Subject exam, such as Pharm, Med Surg, etc, we highly recommend using our Test Creator so you can access a lot more questions!

Step 1: Use the Test Creator
Head to the Test Creator tab inside your account.
Under Subject Area, check (for example) Pharmacology.
You can choose your preferred number of questions—start with 25–30 if you're in Study Mode, or try 50–75 in Exam Mode for more challenge.
Step 2: Focus on Rationales
Whether you get a question right or wrong, read the rationale thoroughly.
If something confuses you, jot it down and review it again later that day—this is how real retention happens.
Step 3: Track Your Weak Spots
Pay attention to what types of questions you miss—are they med calculations, side effects, contraindications?
Use this info to guide what you review the next day.
Step 4: Repeat + Review
Try doing 1–2 Pharmacology (for example) quizzes each day.
You can also mix in other subjects to avoid burnout.
With consistent practice, your scores and confidence will follow 🚀
To your success!

Patrick` }
    ] },

    1890: { hideDate: false, total: 12, posts: [
      { by: 'mark.lee.83012', ago: 'almost 4 years ago', n: 2, text: `Studied all of the health assessment questions (412) and passed my HESI with a 866!! I struggled in the class a lot and the HESI was extremely difficult, but I did it! Spend a lot of time doing practice questions and you will do fine.` },
      { by: 'samantha.white.98341', ago: 'over 2 years ago', n: 1, text: `which one you studied?` },
      { by: 'shirley.stewart.58493', ago: 'over 2 years ago', n: 7, text: `Hi, yes I passed my HESI with 936` },
      { by: 'anna.anderson.101167', ago: 'over 2 years ago', n: 2, text: `did you only study the questions on this website? TIA` },
      { by: 'jeffrey.ortiz.99324', ago: 'over 2 years ago', n: 1, text: `Yes, I also want to know if you only studied these questions for your best grade! I have a HESI specialty exam that includes Health Assessment, Pharm, and Fundamentals all together. I'd like to know please :)` },
      { by: 'mark.lee.83012', ago: 'over 2 years ago', n: 2, text: `Yes I (only) used the (412) Health Assessment questions from this website and passed. Make sure to read as many of the rationales as you can. I had questions on similar subjects and the rationales were life savers. It was difficult but you can do it! Good luck!` },
      { by: 'mary.rodriguez.100879', ago: 'over 2 years ago', n: 2, text: `hello pls where can i get the health assessment questuions on this website,thank you.` },
      { by: 'shirley.stewart.58493', ago: 'over 2 years ago', n: 7, text: `Hi, go to speciality exams you will find health assessment questions` },
      { by: 'karen.rivera.101401', ago: 'over 2 years ago', n: 1, text: `i am trying to study for nutrition and i don't know where to begin
any help ?
where do i find practice questions for nutrition?` },
      { by: 'kevin.jones.114118', ago: 'over 1 year ago', n: 1, text: `I am new on here and how can i get practice question on health assessment for RN thanks` },
      { by: 'justin.foster.122446', ago: 'over 1 year ago', n: 1, text: `I don't see where I can access 412 questions for Health assessment I only see 50 questions on the practice? Where on the website can I find those at?` },
      { by: 'scott.gomez.118604', ago: 'over 1 year ago', n: 1, text: `What is the best strategy to prepare to take two Pharmacology and MedSurg Hesi's in the first week of July?` }
    ] },

    2028: { hideDate: false, total: 2, posts: [
      { by: 'heather.martinez.121321', ago: 'over 1 year ago', n: 2, text: `Hi! I needed a 850 to pass, I scored a 1010. I have been an LPN for four years. I was nervous about taking the HESI funds exam, as I only had one chance and needed a score of 850 to pass. I work full-time and am finishing my pre-reqs, so it was not an option to study around the clock. I studied for four weeks, usually after work. I would study for an hour before bed. My goal was to do 30 questions per day. The week leading up to the exam, I studied for 1 hour and 2-3 hours on the weekend leading up to my test date. Reviewed only the day before, NO practice questions. Here are my recommendations: know basic terminology. ADPIE, review Maslow, and understand the scope of practice between nurses vs UAP. Know the normal range of the electrolytes, but focus on the hypo/hyper sxs for each. Some of the questions on YBG were actually on the exam. Utilize your funds book from the LPN program (if you still have it). ybg questions were harder than the exam, but without it, I do not think I would have passed.` },
      { by: 'alexander.morales.120910', ago: 'over 1 year ago', n: 1, text: `I need practice test in mental health` }
    ] },

    2022: { hideDate: false, total: 5, posts: [
      { by: 'samantha.chavez.114441', ago: 'over 1 year ago', n: 2, text: `Hello everyone,
I am about to take my med surg hesi in 2 weeks and starting to feel very discouraged. I bought this program after failing 2 hesis last semester that almost made me not pass. I did horrible on them. Like worse than 600. But so far i've been doing about 50-100 practice questions a day on here. But i've been scoring 40-60% on them. I did hear these questions are much harder than the hesi but hopefully this will help. Anyone who has taken the med surg hesi 2025, how was it?` },
      { by: 'emily.hernandez.117765', ago: 'over 1 year ago', n: 2, text: `I've taken 2 hesi exams this semester, mine was a lot of delegation, what should the nurse do first, priority patients.
I just read the orientation guide on this site, the tips they give will help you. Ive learned you have to figure out what the questions is ACTUALLY asking and figure out how to answer the questions even if you don't know the info, watch out for distractors.` },
      { by: 'jonathan.wilson.114872', ago: 'over 1 year ago', n: 1, text: `Med Surg 1, 2 or 3?` },
      { by: 'samantha.chavez.114441', ago: 'over 1 year ago', n: 2, text: `2` },
      { by: 'kevin.clark.117918', ago: 'over 1 year ago', n: 1, text: `Hello! I passed my Mental Health HESI attempt #1 I got an 891. I have another attempt remaining.` }
    ] },

    2018: { hideDate: false, total: 5, posts: [
      { by: 'jennifer.ramos.110895', ago: 'almost 2 years ago', n: 1, text: `hi! i have been prepping for a fundamentals HESI. i am able to go into my performance tab and see my weak spots. i am wondering what to do with this information and how to improve in those areas? what do you recommend – more practice tests, reading, etc?

also, how do "your best grade" scores typically compare to HESI scores… i haven't been doing the best but i understand these are harder questions!` },
      { by: 'dorothy.clark.97029', ago: 'almost 2 years ago', n: 1, text: `Hi I scored 875 on my Fundamentals Hesi I wrote the question answers & rationals when I got them wrong. I also did a 1 hour review from the Comprehensive Review book here on the app
Keep me posted on` },
      { by: 'debra.campbell.111473', ago: 'over 1 year ago', n: 1, text: `Hello new to this site. I just started my MSN and we are required to take HESI exams 3 times during the curriculm. Is there a way to create custom exams that only contain the content topics based on where we are in our curriculum?` },
      { by: 'helen.reed.111515', ago: 'over 1 year ago', n: 1, text: `Yes prettysimilar` },
      { by: 'ashley.james.111649', ago: 'over 1 year ago', n: 1, text: `Hello I am new here, are there any newly test takers who just did their HESI? what was the experience?` }
    ] }
  }
};
