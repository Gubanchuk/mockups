# A2 admin mockup

Clickable mockup of the A2 course inside the Your Best Grade admin panel: five variants, one page each.

Live: https://ybg-admin-mockup.vercel.app

## Pages

| Path | Variant |
|---|---|
| `/` | the five variants |
| `/tree` | 1 - course tree, actions in a three-dot menu |
| `/edit-mode` | 1.1 - the same tree behind an Edit mode switch |
| `/hub` | 2 - hub page with the sections |
| `/dropdown` | 3 - A2 as a dropdown |
| `/tabs` | 4 - own section with a row of tabs |
| `/all` | all five on one page |

Static site, nothing to build on deploy. The generator that writes these files lives outside this repo.

## Affiliate program

| Path | Mockup |
|---|---|
| `/affiliate` | the three affiliate mockups with direct links to every variant |
| `/affiliate/login` | YBG-1802 - login and signup |
| `/affiliate/dashboard` | YBG-1803 - affiliate dashboard |
| `/affiliate/admin` | YBG-1804 - affiliates in the admin panel |

The affiliate pages are copied from `mockups/affiliate` by `build-affiliate-site.js`.
