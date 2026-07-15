READYSETPREP — GITHUB FLAT-UPLOAD VERSION

This package contains NO folders. Every file belongs in the root of the
GitHub repository, so you can upload all files together in the GitHub website.

FILES TO UPLOAD
- index.html
- styles.css
- app.js
- catalog.js
- manifest.js
- primary2-test2.js
- test-template.js
- privacy.html

UPLOAD USING GITHUB.COM
1. Download and unzip ReadySetPrep_GitHub_Flat_Upload.zip.
2. Open the unzipped folder on your computer.
3. Open your GitHub repository in Chrome.
4. Select Add file > Upload files.
5. Select all eight website files at once, or drag all eight files into the
   GitHub upload page.
6. Enter a commit message such as "Upload ReadySetPrep website".
7. Select Commit changes.

Do not upload the ZIP itself. GitHub Pages needs the extracted index.html and
the other files.

ENABLE GITHUB PAGES
1. In the repository, open Settings.
2. Select Pages.
3. Under Build and deployment, choose Deploy from a branch.
4. Select branch main and folder / (root).
5. Select Save.

ADDING A NEW TEST
1. Duplicate test-template.js locally.
2. Rename it, for example primary3-test1.js.
3. Add the question content.
4. Add the filename to manifest.js, for example:

window.READYSETPREP_TEST_FILES = [
  'primary2-test2.js',
  'primary3-test1.js'
];

5. Upload only the new test file and the updated manifest.js to GitHub.

COMPLETED TEST LOG
Completed tests are logged in the browser being used. The log is not shared
between different devices or students yet.
