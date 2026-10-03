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
| `/affiliate/landing-1` | YBG-1836 landing page - version 1, For creators our SMM team brings in |
| `/affiliate/landing-2` | YBG-1836 landing page - version 2, For people who find the program on Google |
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
| `/thank-you/email` | version 1, the email |
| `/thank-you/checklist` | version 2, checklist |

Static site, nothing to build on deploy. build-site.py writes the A2 pages, build-affiliate-site.js writes the index, /affiliate and the affiliate pages, build-image-question-site.js writes /image-question, build-thank-you-site.js writes /thank-you; all live outside this repo.
