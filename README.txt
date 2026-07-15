READYSETPREP — MODULAR MULTI-TEST WEBSITE

This version keeps the current ReadySetPrep design but separates the website engine from the test content. You can add many tests without editing the main application.

FOLDER STRUCTURE
- index.html                 small app shell
- styles.css                all styling
- js/catalog.js             test registry and level definitions
- js/app.js                 navigation, timer, audio, scoring, results
- tests/manifest.js          list of test files that should be loaded
- tests/primary2-test2.js    the current complete Primary 2 test
- tests/test-template.js     copy this to create a new test
- privacy.html              privacy notice

ADD A NEW TEST
1. Duplicate tests/test-template.js.
2. Rename it, for example tests/primary3-test1.js.
3. Fill in the test metadata, sections, passages, questions, answers, and explanations.
4. Add its path to tests/manifest.js:

   window.READYSETPREP_TEST_FILES = [
     'tests/primary2-test2.js',
     'tests/primary3-test1.js'
   ];

5. Upload the new/changed files. The test automatically appears under its level in the Practice test dropdown.

IMPORTANT IDS
- Every test.id must be unique across the website.
- Every section.id must be unique within its test.
- Question num values must be unique within each section.

SUPPORTED SECTION TYPES
- auditory: a visible/replayable passage and questions
- reading: one or more passages, each with questions
- questions: standalone questions for math, verbal, quantitative, etc.
- essay: an unscored writing prompt

STUDENT DATA
Each test saves independently in the browser using its unique test id. Adding a new test will not overwrite progress from another test.

DEPLOYMENT
Upload the entire folder structure to GitHub Pages, Netlify, or Vercel. Do not flatten the folders because index.html expects js/ and tests/ paths.


COMPLETED-TEST LOG
- Every completed full test and completed section-practice attempt is logged.
- The home page shows student, ISEE level, test, mode, completion date,
  overall score, practice stanine (for full tests), and section details.
- The log combines attempts from every published test and every level.
- Results can be exported as a CSV file.
- The log is stored in localStorage, so it is shared only by users of the
  same browser profile on the same device.
- A central all-student log requires a database/back-end and is not part
  of this static version.
