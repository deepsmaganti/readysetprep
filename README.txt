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


FULL-SIMULATION REVISION FOR TESTS #3-#6
- Redesigned Tests #3 through #6 to match the depth and structure of Tests #1 and #2.
- Lengthened auditory and reading passages to full-test practice length.
- Standardized the three-passage reading pattern:
  science/nature informational passage, problem-solving narrative, and practice biography.
- Standardized reading question types: main idea, details, sequence, inference,
  vocabulary in context, paragraph purpose, and author purpose.
- Standardized mathematics to the 24-concept full-test sequence used by the strongest tests.
- Balanced answer positions across all revised sections.
- Each revised mathematics test has exactly six A, six B, six C, and six D correct answers.
- Navigation, timers, elimination buttons, saved progress, review, scoring, and stanine remain unchanged.


ENHANCEMENTS
- Added estimated practice stanines for Auditory, Reading, and Mathematics.
- Added Timed by Section alongside Timed Full, Untimed Full, and Untimed by Section.
- Removed the mathematics question-number palette from the live question screen.
  Question numbers remain available on the section-review screen.
- Added a two-tone sound and visible notice when one minute remains in a timed section.
- Added Play / Resume, Pause, Restart, and Stop controls for the auditory passage,
  including while students answer auditory questions.
- Added an explicit difficulty progression:
  Test #1 Foundation, #2 Standard, #3 Standard+, #4 Challenging,
  #5 Advanced, and #6 Most challenging.
- Revised Tests #3-#6 with progressively more inference, comparison, missing-value
  equations, multi-step data interpretation, elapsed time, remainders, and
  non-routine reasoning. The later tests no longer repeat the same question
  template as often as the earlier tests.
- All stanines remain unofficial practice estimates.


GRADE-ALIGNMENT AND AUDITORY READ-ALOUD UPDATE
- Removed the overall full-test stanine.
- Results retain section stanines for Auditory, Reading, and Mathematics.
- The total raw score and percentage remain visible.
- Every auditory question and all four answer choices are read aloud automatically.
- Students can replay the current question or the complete auditory passage.
- Reviewed all six tests for Grade 2 alignment.
- Tests #5 and #6 were adjusted to remove unnecessarily complex multi-step,
  remainder-sharing, and cross-hour elapsed-time demands.
- Difficulty still increases gradually, but every test remains within the
  Primary 2 / applying-to-Grade-2 concept range.


COMPACT TEST SELECTOR UPDATE
- Removed the difficulty level from each practice-test selector.
- Removed the descriptive line beneath each practice-test selector.
- Practice tests now appear as compact Test 1, Test 2, Test 3, and similar tabs.
- The tabs wrap automatically, making it easier to add more tests without
  using a large amount of vertical space.


PRACTICE EXERCISES
- Added a separate Practice Exercises section.
- Concept exercises are available for:
  - Primary 2
  - Primary 3
  - Primary 4
  - Lower
  - Middle
  - Upper
- Every level currently includes five concept modules with five original
  questions each: 25 exercises per level and 150 exercises altogether.
- Primary concepts cover reading comprehension, vocabulary, number sense,
  operations, fractions, data, geometry, and measurement.
- Lower, Middle, and Upper concepts cover verbal reasoning, reading
  comprehension, quantitative reasoning, mathematics achievement, algebra,
  geometry, data, and probability.
- Students receive immediate feedback and an explanation after every answer.
- Best score and number of attempts are stored locally by level and concept.
- Mixed Practice selects one question from every concept in the chosen level.
- Concept-practice progress is separate from full-test progress.


LOWER LEVEL FULL PRACTICE TESTS
- Added two complete, original Lower Level ISEE practice tests.
- Each test contains:
  - Verbal Reasoning: 34 questions / 20 minutes
    - 17 synonyms
    - 11 single-word sentence completions
    - 6 phrase sentence completions
  - Quantitative Reasoning: 38 questions / 35 minutes
  - Reading Comprehension: 25 questions / 25 minutes
    - five original 300-600 word passages
    - five questions per passage
  - Mathematics Achievement: 30 questions / 30 minutes
  - Essay: one unscored prompt / 30 minutes
- Added Timed Full, Untimed Full, Timed by Section, and Untimed by Section modes.
- Included answer elimination, flags, section review, one-minute alerts, local progress, explanations, and section practice-stanine estimates.
- The essay editor saves locally and displays a word count.
- All new passages, questions, answer choices, data, diagrams, and essay prompts are original.
- lower-tests.html is linked from the Lower Level page in index.html.


UNIFIED PRIMARY 2 / LOWER LEVEL UI
- Lower Level now uses the same compact Test 1 / Test 2 tab pattern as Primary 2.
- The Lower Level landing page now follows the same hierarchy:
  brand, test tabs, selected test title, four practice modes, section chooser,
  student name, and start/resume controls.
- Mode cards, section cards, buttons, top bar, timers, question cards, and review
  indicators use the same spacing, corner radius, and interaction pattern.
- The Lower Level keeps its own teal level accent while matching the Primary 2
  interface structure.
- The main level-selection page also displays Lower Test 1 and Test 2 as compact
  test tabs rather than large launch buttons.


SEPARATE TEST PAGES
- Primary 2 full tests now live in primary-tests.html.
- Lower Level full tests remain in lower-tests.html.
- index.html is the main level and Practice Exercises hub.
- Primary 2 and Lower Level both use compact Test tabs on the main hub.
- Direct links are supported:
  - primary-tests.html?test=1 through primary-tests.html?test=6
  - lower-tests.html?test=1 and lower-tests.html?test=2
- Primary 2 retains all four modes:
  Timed Full, Untimed Full, Timed by Section, and Untimed by Section.
- Lower Level retains all four modes without any functional or content changes.


HOME-ONLY LEVEL NAVIGATION
- Removed links from one test level to another test level.
- The main index page remains the only place to switch ISEE levels.
- primary-tests.html contains only Primary 2 test tabs.
- lower-tests.html contains only Lower Level test tabs.
- Each separate test page has a Home button linking to index.html.
- Removed the footer button that linked to Primary 2 while another level
  was selected.
- Fixed the saved-level bug that could make primary-tests.html display a
  Lower Level "coming soon" screen.
- Timed Full, Untimed Full, Timed by Section, and Untimed by Section remain
  unchanged for both Primary 2 and Lower Level.


LOWER LEVEL FOOTER CLEANUP
- Removed the availability message below the Lower Level test tabs.
- The compact Test 1 and Test 2 tabs remain unchanged.


PRIMARY 2 FOOTER CLEANUP
- Removed the availability message below the Primary 2 test tabs.
- The compact Test 1 through Test 6 tabs remain unchanged.
- Lower Level availability footer remains removed.
