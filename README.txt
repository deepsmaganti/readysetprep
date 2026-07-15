READYSETPREP — ISEE PRACTICE, ALL LEVELS
Host-ready static website based on the original Primary 2 interface.

FILES
- index.html   complete website and Primary 2 test
- privacy.html privacy notice

WHAT CHANGED
- Preserved the original three-option home navigation:
  Timed Full Test, Untimed Full Test, and Untimed by Section.
- Added selectable level cards for Primary 2, Primary 3, Primary 4,
  Lower, Middle, and Upper.
- Primary 2 includes two complete interactive tests: Practice Test #1 and Practice Test #2.
- The other levels show their section/timing blueprint and are ready
  for question banks to be added later.
- Added restrained color accents to the main page.
- Added a Home button throughout the active test, review, intro,
  and result screens.
- Kept audio replay, visible auditory passage, timer, saved progress,
  answer review, and estimated practice stanine.

DEPLOYMENT
Upload index.html and privacy.html together to GitHub Pages, Netlify,
or Vercel. The site requires no build step and no database.

CURRENT DATA MODEL
- Many students may use the same public URL.
- Each browser/device stores its own Primary 2 progress locally.
- There is no account system or central score database.
- Use initials, a nickname, or a teacher-assigned code rather than a
  child's full legal name.

ADDING MORE TEST CONTENT
The level selector and informational blueprints are already present.
New question banks will require adding the corresponding test data and
section logic for that level.


MULTIPLE PRIMARY 2 TESTS
- This version keeps the original single-file ReadySetPrep design.
- Practice Test #1 and Practice Test #2 are embedded directly in index.html.
- Students choose a test from the main Primary 2 page.
- Each test keeps separate saved answers, timer, flags, and progress.
- Existing saved progress for the original Practice Test #2 is preserved.
- No JavaScript folders, manifest, catalog, or data.js files are required.

GITHUB UPLOAD
Upload these extracted files together to the repository root:
- index.html
- privacy.html
- README.txt


ANSWER ELIMINATION UPDATE
- Removed the “Interactive browser test” wording.
- Removed the introductory paragraph beneath the selected test.
- Added an × control to the left of every answer choice.
- Eliminated choices are faded and crossed out.
- Selecting × again restores the choice.
- Selecting an eliminated choice restores it and records the answer.
- Eliminations are saved separately for Practice Test #1 and Practice Test #2.


PRIMARY 2 PRACTICE TESTS #3 AND #4
- Added two new complete, original Primary 2 practice tests.
- Each test contains:
  - 6 Auditory Comprehension questions (7 minutes)
  - 18 Reading questions across three passages (20 minutes)
  - 24 Mathematics questions (26 minutes)
- The new tests use the same broad concepts and question-type balance as
  the provided Primary 2 reference materials, while using new passages,
  scenarios, numbers, visuals, answer choices, and explanations.
- The website now offers Practice Tests #1, #2, #3, and #4.
- Every test has separate saved progress, timer, flags, eliminations,
  answers, review, and scoring.


PRIMARY 2 PRACTICE TESTS #5 AND #6
- Added two more complete Primary 2 / applying-to-Grade-2 practice tests.
- Each test contains 6 Auditory Comprehension, 18 Reading, and 24 Mathematics questions.
- The concepts and question-type balance match the broad Primary 2 patterns in the reference materials.
- All new passages, scenarios, numbers, visuals, answer choices, and explanations are original.
- The site now contains six full Primary 2 practice tests.
