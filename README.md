# Your Best Grade mockups

Clickable mockups. The index lets you pick a set.

Live: https://mockups-seven-ashen.vercel.app

## A2 inside the admin panel

| Path | Variant |
|---|---|
| `/a2` | the variants |
| `/tree-edit` | 1+ - course tree of variant 1 behind an Edit mode switch (chosen by Patrick) |
| `/tree` | 1 - course tree, actions in a three-dot menu |
| `/edit-mode` | 1.1 - the same tree behind an Edit mode switch |
| `/hub` | 2 - hub page with the sections |
| `/dropdown` | 3 - A2 as a dropdown |
| `/tabs` | 4 - own section with a row of tabs |
| `/all` | variants 1-4 on one page |

## Affiliate program

| Path | Version |
|---|---|
| `/affiliate` | versions of the four mockups |
| `/affiliate/landing-1` | YBG-1836 landing page - version 1, For creators our SMM team brings in, with the rates block |
| `/affiliate/landing-1-google` | YBG-1836 landing page - version 1, For Google, without the rates block |
| `/affiliate/landing-2` | YBG-1836 landing page - version 2, For people who find the program on Google |
| `/affiliate/landing-3` | YBG-1836 landing page - version 3, For creators our SMM team brings in, second take |
| `/affiliate/landing-4` | YBG-1836 landing page - version 4, For people who find the program on Google, second take |
| `/affiliate/login-1` | YBG-1802 login and signup - version 1, Card with steps |
| `/affiliate/dashboard-1` | YBG-1803 affiliate dashboard - version 1, Commissions in Links |
| `/affiliate/dashboard-2` | YBG-1803 affiliate dashboard - version 2, Commissions as its own section |
| `/affiliate/admin-1` | YBG-1804 affiliates in the admin panel - version 1, Money view |

## A2 image labeling question

| Path | Version |
|---|---|
| `/image-question` | YBG-1763: three phone versions (the earlier `/1`, `/2`, `/3` redirect here) |
| `/image-question/current` | version 1, labels below the picture (as on the site) |
| `/image-question/tap` | version 2, tap the picture |
| `/image-question/hybrid` | version 3, both |

## Thank You page

| Path | Version |
|---|---|
| `/thank-you` | YBG-1870: two versions, A2 and HESI in each |
| `/thank-you/original-updated` | version 1, original, updated |
| `/thank-you/sections` | version 2, sections |
| `/thank-you/email`, `/thank-you/try-a-question` | previous round (04.10), not listed |

## A2 member area

| Path | Version |
|---|---|
| `/a2-members` | YBG-1877: three versions of the member area main page (round 3) |
| `/a2-members/my-exam` | version 1, my exam |
| `/a2-members/tutor` | version 2, tutor |
| `/a2-members/acceptance-letter` | version 3, acceptance letter |
| `/a2-members/study-desk`, `/exam-checklist`, `/subjects`, `/up-next` | round 2, not listed, kept for old links |

## Study Forum

| Path | Version |
|---|---|
| `/forum` | YBG-1492: three versions of the HESI Exit forum |
| `/forum/updated-original` | version 1, updated original |
| `/forum/conversation` | version 2, conversation |
| `/forum/answer-first` | version 3, answer first |

Static site, nothing to build on deploy. build-site.py writes the A2 pages, build-affiliate-site.js writes the index, /affiliate and the affiliate pages, build-image-question-site.js writes /image-question, build-thank-you-site.js writes /thank-you, build-a2-members-site.js writes /a2-members, build-forum-site.js writes /forum; all live outside this repo.
