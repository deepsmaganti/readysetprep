READYSETPREP — ISEE PRACTICE, ALL LEVELS
Host-ready static website (no server, no build step, no database)

FILES
- index.html   the app shell — page structure and styling, rarely changes
- app.js       all app logic — screens, timer, scoring, storage; rarely changes
- data.js      all test content (passages, questions, answers) — this is the
               ONLY file you should need to replace when adding a new test
- privacy.html a plain-language privacy notice, linked from the home screen

DEPLOYMENT — GITHUB PAGES (recommended, already set up)
1. Create a public GitHub repository.
2. Upload index.html, app.js, data.js, and privacy.html to the repo root.
3. In the repo's Settings > Pages, set Source to "Deploy from a branch",
   branch "main", folder "/ (root)", then Save.
4. GitHub publishes a URL like https://yourusername.github.io/reponame/
   within about a minute. Share that URL.

DEPLOYMENT — ALTERNATIVES
Netlify Drop or Vercel: drag all four files (or a zip of them) into their
drag-and-drop deploy page for an instant HTTPS URL. No account required
for a one-off Netlify Drop.

ADDING A NEW TEST
Only data.js changes. Upload the workbook PDF to Claude and ask for it to
be added; Claude will return an updated data.js. In your repo, open
data.js, click the pencil (edit) icon, select all, paste the new content,
and commit. index.html and app.js never need to be touched for this.

CURRENT DATA MODEL
- Any number of students/visitors can use the same public URL at the same
  time — there's no login and no server-side state.
- Each browser/device stores its own progress locally (via localStorage).
  There is no teacher dashboard, no account system, and no central score
  database.
- On a shared device/browser, one student's saved session (name, history)
  can be overwritten by the next student's session.
- Encourage students to use the "Print results" button on the results
  screen to save a record before clearing browser data or handing the
  device to someone else.

RECOMMENDED STUDENT IDENTIFIER
Use a nickname, initials, or a teacher-assigned code in the "Explorer's
name" field rather than a child's full legal name — see privacy.html.

PRACTICE STANINE
- A completed FULL test (all sections for that level) shows an Estimated
  Practice Stanine from 1–9, plus the underlying percentage.
- It intentionally does NOT appear after single-section practice — a
  partial session isn't a large enough sample for even a rough estimate,
  so only percentage/raw score is shown there.
- It's a transparent, raw-accuracy practice band (bands are shown in full
  on the results screen via "Show practice stanine bands"), not an
  official ISEE stanine. Official ISEE stanines are norm-referenced by
  grade and calculated from scaled scores using ERB's national
  test-taking population — this site has no access to that data.

POSSIBLE FUTURE ADDITIONS (not built — just ideas)
- Teacher/parent and student sign-in
- Class codes and assignments
- Central score storage across devices
- Full attempt history export (CSV)
- Teacher dashboard
