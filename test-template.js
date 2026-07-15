/*
Duplicate this file, rename it, fill in the content, and add the new filename to tests/manifest.js.
Every question uses four choices. A choice may use "text" or safe display "html".
Supported section types:
  auditory  — one visible/replayable passage plus questions
  reading   — passages, each containing questions
  questions — standalone questions (math, verbal, quantitative, etc.)
  essay     — an unscored writing prompt
*/
ReadySetPrep.registerTest({
  id: 'primary3-test1',              // unique across the whole website
  levelId: 'primary3',               // primary2, primary3, primary4, lower, middle, upper
  label: 'Practice Test #1',
  title: 'ISEE Primary 3 Practice Test #1',
  description: 'Reading and mathematics practice',
  order: 1,
  sections: [
    {
      id: 'reading',
      label: 'Reading',
      shortLabel: 'Reading',
      type: 'reading',
      minutes: 28,
      passages: [
        {
          title: 'Passage title',
          text: 'Passage text goes here.',
          questions: [
            {
              num: 1,
              prompt: 'What is the passage mostly about?',
              choices: [
                {label:'A',text:'Choice A'},
                {label:'B',text:'Choice B'},
                {label:'C',text:'Choice C'},
                {label:'D',text:'Choice D'}
              ],
              answer: 'A',
              explanation: 'Explain why A is correct.',
              visual: null
            }
          ]
        }
      ]
    },
    {
      id: 'math',
      label: 'Mathematics',
      shortLabel: 'Mathematics',
      type: 'questions',
      minutes: 26,
      questions: [
        {
          num: 1,
          prompt: 'Which number comes next: 3, 6, 9, ___?',
          choices: [
            {label:'A',text:'10'}, {label:'B',text:'11'},
            {label:'C',text:'12'}, {label:'D',text:'13'}
          ],
          answer: 'C',
          explanation: 'The pattern adds 3 each time.',
          visual: null
        }
      ]
    }
  ]
});
