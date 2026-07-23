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
- Primary 2 now includes 20 concept modules and 151 original practice
  questions. The other five levels retain five concept modules with five
  questions each, for 276 original concept-practice questions altogether.
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


TEST ASSESSMENT REPORTS
- Every completed full test or section practice automatically creates one
  saved assessment report.
- Assessment reports are available separately for Primary 2 and Lower Level.
- Each assessment captures:
  - section scores, percentages, estimated practice stanines, and unanswered counts
  - concept-level performance
  - strongest concepts
  - focus areas
  - recommended next steps
  - test name, student identifier, date, and practice mode
- Lower Level reports also include an essay writing snapshot based on word count
  and paragraph count. It does not grade writing quality.
- An Assessment History button appears on each test-level home page.
- Saved reports can be viewed, printed, deleted individually, or cleared.
- Up to 40 recent assessments per level are stored locally in the browser.
- Retaking or clearing a test does not erase assessment history.
- Reports are unofficial practice feedback and are not official ISEE scores,
  percentiles, diagnoses, admissions predictions, or educational evaluations.


EXACT SHARED UI ACROSS TEST LEVELS
- Primary 2 and Lower Level now use the same test-page component structure.
- The same shared CSS block is embedded in both full-test files.
- Identical layout is used for:
  - ReadySetPrep branding
  - test tabs
  - selected-test state
  - test title
  - four mode cards
  - section selector
  - student-name input
  - Start, Resume, Clear, Assessment History, and Home controls
  - footer, top navigation, timer, cards, choices, results, and assessment styling
- The same four-column desktop, two-column tablet, and one-column mobile
  responsive pattern is used for all levels.
- Only test-specific content changes: level name, number of tests, section names,
  question counts, and section descriptions.
- Home always returns to index.html; it does not link directly to another level.


ANSWER CONFIDENCE MARKERS
- Every scored question now has a separate “Mark not sure” control.
- The marker is independent from the selected answer and from Flag for Review.
- Marking a question not sure never changes the answer or score.
- Question palettes and section-review screens show a ? badge.
- Assessment reports include:
  - total questions marked not sure
  - not-sure counts by section and concept
  - correct answers that were marked not sure
  - incorrect answers that were not marked not sure
  - confidence-focused next-step recommendations
- Older saved tests automatically receive empty confidence-marker storage.

READING COMPREHENSION HIGHLIGHTER
- Primary 2 and Lower Level Reading passages support persistent highlighting.
- Students select words or sentences and choose Highlight selection.
- Multiple selections can be highlighted in each passage.
- Clicking highlighted text removes that highlight.
- Clear highlights removes every highlight from the current passage.
- Highlights persist while navigating questions and after reopening a saved test.
- Highlights are private browser annotations and do not affect scoring.


CONFIDENCE MARKER TEXT CLEANUP
- Removed the explanatory “Not confident?” message below the answer choices.
- The Mark not sure button and all confidence tracking remain unchanged.


READING HIGHLIGHT CONTROLS UPDATE
- Removed the instructional sentence from the reading highlight toolbar.
- Renamed Clear highlights to Clear all highlights.
- Clear all highlights removes every saved reading highlight in the current
  test attempt, across all reading passages.
- Selecting the same highlighted text and pressing Highlight selection removes
  that highlighted section.
- Selecting text fully inside an existing highlighted section also removes that
  highlighted section.
- Clicking highlighted text continues to remove that individual highlight.


FLAG-ONLY REVIEW WORKFLOW
- Removed the Mark not sure control from Primary 2 and Lower Level.
- Flag for Review remains the only per-question review marker.
- Assessment reports display:
  - total flagged questions
  - flagged count by section
  - question numbers that were flagged
- Flags are reference-only metadata.
- Flags are not used to calculate scores, strengths, focus areas, concept
  performance, or recommended next steps.
- Answer review displays a ★ Flagged for review tag on questions that the
  student flagged.
- Older saved confidence-marker data is ignored.


COMPACT TEST-MODE CARDS
- Reduced the height and padding of the four test-mode buttons.
- Reduced badge, heading, and description text sizes slightly.
- Reduced spacing between cards.
- The exact same dimensions are used for Primary 2 and Lower Level.
- All four modes and their behavior remain unchanged.


COMPLETE ASSESSMENT HISTORY
- Assessment History now includes attempts from every practice test within the
  selected ISEE level, not only the currently selected test.
- Every history card and detailed report clearly shows:
  - practice test
  - exact mode: Timed Full, Untimed Full, Timed by Section, or Untimed by Section
  - section scope: All sections or the specific section practiced
  - student and completion date
- Assessment history includes filters for:
  - practice test
  - timed or untimed
  - full test or individual section
- The screen shows how many records match the active filters.
- Older assessment records remain compatible; missing timing metadata is
  inferred from their saved mode and section scope.
- Primary 2 and Lower Level histories remain separate, but each history covers
  all tests within that level.


PRIMARY 2 TEST 2 — ERB-STYLE AUDITORY PRESENTATION
- Practice Test #2 now follows ERB's described online Auditory Comprehension
  presentation pattern:
  - the student listens to the passage without seeing the passage text
  - during the question phase, the question and answer choices remain visible
  - each auditory question and its choices are read aloud automatically
- The passage is not displayed on the listening screen or beside the questions.
- The passage replay button is not shown while answering Test #2 auditory
  questions.
- The passage transcript remains available after completion for answer review.
- This presentation change applies only to Primary 2 Practice Test #2.
- Other Primary 2 practice tests retain their existing auditory presentation.


PRIMARY 2 AUDITORY — ERB-STYLE PRESENTATION FOR ALL TESTS
- Corrected the previous scope: the ERB-style Auditory Comprehension
  presentation now applies to the entire Primary 2 level, not only Practice
  Test #2.
- All six Primary 2 practice tests now:
  - hide the auditory passage text during the listening phase
  - hide the auditory passage text while answering questions
  - keep the question and answer choices visible
  - automatically read each auditory question and its answer choices aloud
  - omit the passage replay control while the student is answering questions
- The passage transcript remains available only after completion for review.


NEW LANDING PAGE AND LOGIN
- index.html is now a concise ReadySetPrep product landing page.
- The previous all-level selector and concept-practice hub is preserved as
  practice.html.
- The landing page includes:
  - clear product positioning
  - Primary 2, Lower Level, and Concept Practice entry points
  - a three-step explanation of the practice workflow
  - local assessment counts and the most recent completed practice
  - direct links to each level's complete assessment history
- login.html provides Log in and Create profile screens.
- The current login is a static-site browser-profile demonstration:
  - display name and email are stored locally
  - passwords are never stored
  - no real user account or server authentication is created
- A secure backend identity provider is still required for production.
- primary-tests.html?view=history and lower-tests.html?view=history now open
  their assessment history screens directly.


CLEAN LANDING PAGE REDESIGN
- Simplified the landing page with:
  - one clear headline
  - one-sentence product explanation
  - three direct practice choices
  - a concise three-step workflow
  - browser-based assessment summary
- Reduced visual clutter and removed unnecessary marketing copy.
- Redesigned the login page to match the landing-page visual system.
- Login remains a local browser-profile demonstration; no password is stored.


GENERIC LANDING PAGE
- Repositioned ReadySetPrep as a broader learning platform rather than an
  ISEE-only website.
- The landing page now centers on:
  - test preparation
  - skill practice
  - progress and reports
- Current ISEE content is shown under a clearly labeled “Available now”
  section, while the main brand language remains generic.
- Updated the login page language from practice-only to broader learning.


BRAND HEADER UPDATE
- Removed the standalone “R” icon shown before the ReadySetPrep name.
- The wordmark now displays as ReadySetPrep only on the landing and login pages.


READYSETPREP WORDMARK FONT
- Updated the ReadySetPrep wordmark to use an Arvo-style slab-serif font,
  similar to the supplied visual reference.
- Added strong local fallbacks: Rockwell, Roboto Slab, Georgia, and serif.
- Applied consistently to:
  - landing page
  - login page
  - practice library
  - Primary 2 test pages
  - Lower Level test pages
  - active test top bars
- Removed remaining standalone R marks from the practice and test home screens.


WORDMARK REVERT
- Switched the ReadySetPrep wordmark back to the previous sans-serif styling.
- Removed the Arvo slab-serif font and related overrides.
- Kept the standalone R icon removed, as previously requested.


SIMPLIFIED LANDING PAGE
- Reduced the landing page to:
  - one short headline
  - one sentence explaining ReadySetPrep
  - three simple options: Test Preparation, Skill Practice, and Progress
  - one compact Available now section
  - minimal footer
- Removed the detailed learning snapshot, multi-step explanation, statistics,
  and other secondary content from the landing page.


LANDING PAGE CLEANUP
- Removed the entire Available now section from the landing page.
- The landing page now ends after the three primary options:
  Test Preparation, Skill Practice, and Progress.


PROGRESS BUTTON UPDATE
- Changed the Progress card action from the white secondary style to the blue primary style.
- All three landing-page options now have equal visual emphasis.


PAYMENT AND SUBSCRIPTION PAGE
- Added payment.html.
- Plan:
  - 3-day free trial
  - $9.99 per month after the trial
  - monthly renewal until canceled
- Landing-page Get Started and hero buttons now open the payment page.
- Creating or logging into a browser profile now continues to payment.html.
- Payment page includes:
  - name and email
  - card number, expiration, CVC, and ZIP fields
  - trial and renewal disclosure
  - billing-start date
  - trial confirmation screen
- Static-site safety:
  - card information is never stored
  - no real charge is processed
  - only local trial/subscription status is saved
- Real production billing still requires a secure payment provider, webhooks,
  server-side subscription validation, cancellation management, and account
  entitlements.


LANDING PAGE PAYMENT COPY UPDATE
- Removed all free-trial and monthly-price details from the landing page.
- Replaced trial-focused calls to action with the neutral label “Get started.”
- Trial and pricing details remain only on payment.html.


MANUAL VENMO PAYMENT WORKFLOW
- Removed the card-entry form.
- Added a manual Venmo monthly-payment workflow:
  - 3 days of initial access
  - $9.99 monthly payment through Venmo
  - no automatic charging or renewal
  - Venmo username, link, amount, and payment note displayed
  - customer records a Venmo confirmation reference
  - payment status changes to “payment pending”
- The static site does not automatically verify payments or activate monthly
  access after payment.
- Update the Venmo username and URL in payment.html before deployment.
- See VENMO_SETUP.txt.


PRIMARY 2 READING COMPREHENSION EXPANSION
- Added 6 new original Grade-2 reading passages and 30 new questions.
- New Primary 2 Reading modules:
  - Story Comprehension
  - Informational Comprehension
  - Inference & Sequence Passages
- Each new module includes two longer passages with five questions per passage.
- New question types include:
  - main idea
  - supporting details
  - character inference
  - cause and effect
  - sequence
  - vocabulary in context
- Passage sets stay grouped so students answer the five questions for one
  passage before moving to the next passage.
- Passage titles and paragraph breaks are now displayed in concept practice.
- All new passages, questions, choices, and explanations are original.


PRIMARY 2 FULL PASSAGES
- Added a dedicated “Full Passages” section inside Primary 2 Practice Exercises.
- Added 4 new original full-length passages:
  - The Blue Ribbon Box
  - A Library for Seeds
  - The Rainy-Day Map
  - Why Some Birds Fly in a V
- Each full passage has exactly 6 questions, matching the current Primary 2
  reading-test pattern of 6 questions per passage.
- Full Passage practice uses a test-style layout:
  - full passage stays visible on the left
  - one question is shown on the right
  - four answer choices
  - Previous / Next navigation
  - immediate explanation after answering
  - score and full answer review at completion
- Full Passage scores/attempts are saved separately in localStorage.
- All passages, questions, answer choices, and explanations are original.


COMPLIMENTARY ACCESS CODES
- Added private-beta access-code support on payment.html.
- Complimentary codes:
  - RSP-FAMILY -> Family access
  - RSP-TEACHER -> Teacher access
- A valid code:
  - bypasses Venmo payment
  - sets status to complimentary
  - grants full access to Practice, Primary 2 tests, and Lower Level tests
  - has no expiration in this beta build
- Access codes can be entered:
  - before starting the trial
  - during an active trial
  - when monthly Venmo payment is due
  - while a Venmo payment is pending
- Practice/test pages now perform a local access check and redirect users without
  an active trial, active subscription, or complimentary access to payment.html.
- Returning users with valid local access skip payment after login.

SECURITY NOTE
- This is still a static-browser beta implementation.
- The access codes and entitlement logic can be discovered or bypassed by a
  technically skilled user.
- Before a public launch, move access-code verification and paid-access
  enforcement to a server/backend.


ACCESS-CODE EMAIL APPROVAL WORKFLOW
- RSP-FAMILY and RSP-TEACHER no longer grant immediate access.
- A valid access code now creates an approval-pending request.
- Full Practice / Primary 2 / Lower Level access remains locked until approval.
- The pending page shows:
  - access type
  - unique request ID
  - Email approval request button
  - administrator approval-code field
- The Email approval request button opens the user's email application with a
  prefilled message containing request ID, access type, code used, name, and email.
- The administrator reviews the request and replies with the private approval code.
- Entering the correct admin approval code changes the local entitlement to:
  status=complimentary, accessLevel=full, approved=true.
- Configure ACCESS_APPROVAL_EMAIL in payment.html before deployment.
- Change ADMIN_APPROVAL_CODE before deployment.

IMPORTANT
- A static website cannot securely perform true email-based approval.
- The mailto link opens an email draft; the website does not send email automatically.
- The admin approval code is present in client-side JavaScript and can be discovered
  by a technically skilled user.
- For a public launch, use a backend/Cloudflare Function to send approval emails and
  store/approve requests server-side.


APPROVAL EMAIL CONFIGURATION
- Access-code approval requests are addressed to: readysetprepai@gmail.com


CONTACT PAGE
- Added contact.html.
- Contact form supports:
  - name
  - email
  - topic
  - message
- Every contact message is addressed to readysetprepai@gmail.com.
- Added Contact links from the landing page, login page, payment/access page,
  and privacy page.
- Access-code approval requests also continue to use readysetprepai@gmail.com.
- Because this is a static site, the contact form opens the user's email app
  with a prefilled email; it does not send mail directly from the website.


DIRECT EMAIL DELIVERY
- Contact form no longer displays the ReadySetPrep email address.
- Contact form no longer uses mailto or opens the user's email application.
- Contact messages POST to /api/contact and are sent server-side.
- Access-code approval requests POST to /api/access-approval and are also sent
  server-side.
- Added Cloudflare Pages advanced-mode backend: _worker.js
- The destination mailbox is configured server-side through CONTACT_TO_EMAIL.
- Configure CONTACT_TO_EMAIL as readysetprepai@gmail.com in Cloudflare.
- Requires RESEND_API_KEY and CONTACT_FROM_EMAIL.
- See DIRECT_EMAIL_SETUP.txt.


PRIMARY 2 MATH PRACTICE EXPANSION
- Added 12 new focused Mathematics concept modules with 8 questions each
  (96 new original math questions).
- New math modules:
  - Counting & Number Recognition
  - Place Value & Number Lines
  - Compare, Order, Odd & Even
  - Addition & Subtraction
  - Equations, Missing Numbers & Fact Families
  - Equal Groups & Multi-Step Problems
  - Number & Shape Patterns
  - 2D & 3D Shapes
  - Halves, Symmetry & Spatial Reasoning
  - Measurement, Time & Calendar
  - Coins & Money
  - Graphs, Data & Probability
- These were designed around the Primary 2 concept reference supplied for this
  project, using entirely original questions, choices, explanations, and
  text-based visuals.
- Added simple visual practice displays for number lines, place-value models,
  patterns, pictographs, and bar graphs.
- Primary 2 Practice now displays separate Reading Practice and
  Math Practice by Concept sections.


PRIMARY 2 SUBJECT PICKER
- Primary 2 Practice now opens with two clear subject choices:
  - Reading
  - Math
- Reading opens only Reading concepts and the Full Passages section.
- Math opens only Mathematics concepts.
- Each subject has its own mixed-practice button:
  - Mixed Reading
  - Mixed Math
- A Subjects button returns users to the Reading/Math chooser.
- Changing levels resets the subject selection.


GITHUB-UPLOAD SIMPLIFICATION
- Removed the nested /functions folder.
- Direct Contact email and access approval are now handled by one root file:
  _worker.js
- This uses Cloudflare Pages advanced mode.
- All website files can now be uploaded at the repository root through the
  GitHub web interface.
