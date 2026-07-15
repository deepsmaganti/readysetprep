/* =========================================================================
   READYSETPREP — ISEE Practice, All Levels
   -------------------------------------------------------------------------
   THIS FILE (data.js) IS THE ONLY FILE YOU SHOULD EVER NEED TO REPLACE.
   All app logic, styling, and screens live in app.js and index.html, which
   don't need to change when you add a new test. To add a test:
     1. Get an updated data.js from Claude (paste in a workbook, ask for it
        to be added).
     2. In your GitHub repo, open data.js, click the pencil (edit) icon.
     3. Select all, paste in the new content, commit.
     4. GitHub Pages redeploys automatically within a minute or two.
   index.html and app.js never need to be touched for this.
   -------------------------------------------------------------------------
   LEVELS defines the official ISEE section structure/timing for each of the
   four levels (this is the "pattern" every test should follow):

   Primary (applying to Grade 2-4):
     Auditory Comprehension (Grade 2 test only) — ~6 questions / 7 min
     Reading — 18-28 questions / 20-28 min
     Mathematics — 24-28 questions / 26-30 min

   Lower (applying to Grade 5-6):
     Verbal Reasoning — 34 questions / 20 min
     Quantitative Reasoning — 38 questions / 35 min
     Reading Comprehension — 25 questions (5 passages x5) / 25 min
     Mathematics Achievement — 30 questions / 30 min
     Essay — 1 prompt, unscored / 30 min

   Middle & Upper (applying to Grade 7-8 / 9-12) — identical structure/timing,
   only question difficulty differs:
     Verbal Reasoning — 40 questions / 20 min
     Quantitative Reasoning — 37 questions / 35 min
     Reading Comprehension — 36 questions (6 passages x6) / 35 min
     Mathematics Achievement — 47 questions / 40 min
     Essay — 1 prompt, unscored / 30 min

   -------------------------------------------------------------------------
   HOW A NEW TEST IS SHAPED (for reference — Claude handles this for you)
   1. Find TESTS below and open the object for the right level (e.g. TESTS.lower).
   2. Add a new entry keyed however you like (e.g. test1), shaped like this:

      test1: {
        label: "Full-Length Practice Test #1",
        sections: {
          verbal: { name:'Verbal Reasoning', shortName:'Verbal', icon:'🔤', defaultMinutes:20,
            instructions:[ '...' ],
            questions:[ { id:'v1', prompt:'...', choices:['...','...','...','...'], correct:0, explanation:'...' }, ... ]
          },
          quantitative: { name:'Quantitative Reasoning', shortName:'Quant', icon:'➗', defaultMinutes:35,
            instructions:[ '...' ], questions:[ ... ] },
          reading: { name:'Reading Comprehension', shortName:'Reading', icon:'📖', defaultMinutes:25,
            instructions:[ '...' ],
            passages:[ { id:'p1', title:'...', text:'...', questions:[ {id,prompt,choices,correct,explanation}, ... ] }, ... ]
          },
          mathAch: { name:'Mathematics Achievement', shortName:'Math', icon:'🧮', defaultMinutes:30,
            instructions:[ '...' ], questions:[ ... ] },
          essay: { name:'Essay', shortName:'Essay', icon:'✍️', defaultMinutes:30,
            instructions:[ 'Unscored — sent to schools as a writing sample.' ],
            prompt: 'Write about a time you...' }
        }
      }

   3. For Primary-level tests, use section keys `auditory`, `reading`, `math`
      instead (see TESTS.primary.test2 for a fully worked example, including
      figure types for math diagrams: table, grid, bars, baseten, conecyl,
      dotgroups, marbles, ruler, puzzlesquare, reflect-v, reflect-h).
   4. Section order and which section keys are expected for each level come
      from LEVELS[levelId].sectionOrder — keep new tests consistent with it.
   ========================================================================= */

const LEVELS = {
  primary: { id:'primary', label:'Primary', subtitle:'Applying to Grade 2\u20134', icon:'🌱',
    sectionOrder:['auditory','reading','math'] },
  lower: { id:'lower', label:'Lower', subtitle:'Applying to Grade 5\u20136', icon:'🥾',
    sectionOrder:['verbal','quantitative','reading','mathAch','essay'] },
  middle: { id:'middle', label:'Middle', subtitle:'Applying to Grade 7\u20138', icon:'⛰️',
    sectionOrder:['verbal','quantitative','reading','mathAch','essay'] },
  upper: { id:'upper', label:'Upper', subtitle:'Applying to Grade 9\u201312', icon:'🏔️',
    sectionOrder:['verbal','quantitative','reading','mathAch','essay'] },
};
const LEVEL_IDS = ['primary','lower','middle','upper'];

const TESTS = {
  primary: {
    test2: {
      label: "Full-Length Practice Test #2",
      sections: {
        auditory: {
          id:'auditory', name:'Auditory Comprehension', shortName:'Listening', icon:'🧭',
          defaultMinutes: 7,
          instructions: [
            "An adult will read one passage aloud, one time only.",
            "Listen carefully — you won't see the passage text, and it can only be read twice for practice.",
            "Then choose the best answer for each of the 6 questions."
          ],
          passages: [
            {
              id:'a1',
              title: 'The Class Garden',
              text: "On Friday afternoon, Mrs. Chen looked at the class garden and said, 'The school will be closed for the long weekend. These plants still need water every day. I need a dependable volunteer.' Maya's hand shot into the air. She loved the marigolds and bean plants, and she wanted to be in charge. Mrs. Chen smiled, but she did not choose Maya right away. 'Caring for the garden means coming back to school on Saturday and Sunday,' she explained. 'The plants cannot wait if you forget.' Maya nodded. That evening, she made a chart with one box for each day. She wrote down when she would water the plants and how much water each row needed. She asked her father whether he could drive her to school on Saturday. On Sunday, the family would walk there after breakfast. Maya even checked the weather report. Her friend Ben said rain might do the job, but Maya packed a rain jacket because she knew a forecast could change. The next morning, Maya showed the chart to Mrs. Chen. She also demonstrated how she would measure the water. Mrs. Chen studied the plan and said, 'You have thought about every day. I believe you are ready.' Maya followed her schedule all weekend. On Monday, the bean plants stood tall, and three new marigolds had opened. Mrs. Chen thanked her in front of the class. Maya's smile stretched from ear to ear. She had not only cared for the garden; she had shown that a careful plan could turn a promise into action.",
              questions: [
                { id:'a1', prompt:'What is the passage mostly about?', choices:['Maya learns how to grow marigolds from seeds.','Maya makes a careful plan so she can care for the class garden.','Mrs. Chen asks the class to build a new garden.','Ben and Maya disagree about whether it will rain.'], correct:1, explanation:'The whole passage focuses on Maya making and following a plan so she can care for the garden.' },
                { id:'a2', prompt:'Which is true about Maya?', choices:['She often forgets what she promises to do.','She wants Ben to do the work for her.','She plans ahead and is willing to work hard.','She is afraid to visit the school on Saturday.'], correct:2, explanation:'Maya checks the weather, arranges transportation, and makes a schedule. These details show planning and hard work.' },
                { id:'a3', prompt:"Why was Mrs. Chen unsure about choosing Maya at first?", choices:['Maya did not know the names of the flowers.','The garden was too far from Maya\u2019s house.','Mrs. Chen wanted Ben to do the job instead.','The plants needed dependable care every day.'], correct:3, explanation:'Mrs. Chen explains that the plants need water every day and cannot wait if Maya forgets.' },
                { id:'a4', prompt:'Why did Maya show Mrs. Chen her chart?', choices:['She wanted to prove that she had a responsible plan.','She wanted to teach the class how to draw a chart.','She wanted to count how many flowers were blooming.','She wanted permission to take the plants home.'], correct:0, explanation:'The chart shows exactly when and how Maya will care for the plants, proving that she has a responsible plan.' },
                { id:'a5', prompt:"Maya's smile 'stretched from ear to ear.' What does that mean?", choices:['She was trying not to laugh.','She was surprised by a loud sound.','She had a very big, happy smile.','She was tired from carrying water.'], correct:2, explanation:'A smile that stretches from ear to ear is a very large, happy smile.' },
                { id:'a6', prompt:'Based on the passage, which is true about Mrs. Chen?', choices:['She was willing to trust Maya after seeing her careful plan.','She did not want any student to help with the garden.','She thought the flowers needed too much water.','She planned to remove the garden after the weekend.'], correct:0, explanation:'Mrs. Chen chooses Maya after she sees that Maya has carefully planned the work.' },
              ]
            }
          ]
        },

        reading: {
          id:'reading', name:'Reading', shortName:'Reading', icon:'📖',
          defaultMinutes: 20,
          instructions: [
            "Read each passage on the screen — it stays visible while you answer.",
            "You may look back at the passage any time.",
            "Choose the best answer for each question."
          ],
          passages: [
            {
              id:'r1', title:'Sea Otters: Floating and Finding Food',
              text:"Sea otters spend much of their lives in the ocean. They can swim and dive, but they also rest on the water's surface. A group of resting sea otters is sometimes called a raft because the animals float close together, almost like a small raft made of boats. Some otters even hold paws so they do not drift apart while they sleep.\n\nUnlike seals and whales, sea otters do not have a thick layer of fat to keep them warm. Instead, they have extremely dense fur. Dense means that many hairs grow close together. Air gets trapped between the hairs and helps keep cold ocean water away from the otter's skin. Sea otters spend a lot of time cleaning and fluffing their fur so it continues to protect them.\n\nSea otters are also skillful hunters. Their sensitive whiskers help them feel tiny movements in dark or cloudy water. They eat animals such as clams, crabs, and sea urchins. Sometimes an otter carries a stone on its belly and uses it like a tool to crack open a hard shell.\n\nSea otters do more than look playful. By eating sea urchins, they help protect underwater forests of kelp. Too many sea urchins can eat large amounts of kelp. When otters keep the number of urchins under control, fish and other ocean animals have more places to live. Scientists continue to study the important part sea otters play in ocean habitats.",
              questions: [
                { id:'r1', prompt:'What is the main idea of the passage?', choices:['Sea otters sleep all day and hunt only at night.','Sea otters are the only ocean animals that use tools.','Sea otters have thick fat that keeps them warm in cold water.','Sea otters have special features and behaviors that help them live in the ocean and support their habitat.'], correct:3, explanation:"The passage describes sea otters' fur, whiskers, tools, group behavior, and role in the ocean habitat." },
                { id:'r2', prompt:"Why is a group of resting sea otters sometimes called a 'raft'?", choices:['The otters build a wooden raft to sleep on.','The otters float close together like a group of small boats.','The otters travel down rivers to reach the ocean.','The otters carry stones that look like tiny rafts.'], correct:1, explanation:'The otters float close together, which makes the group look like a raft made of small boats.' },
                { id:'r3', prompt:"According to the passage, what do an otter's whiskers help it do?", choices:['Feel small movements in the water.','Keep its body warm.','Crack open hard shells.','Hold another otter\u2019s paw.'], correct:0, explanation:'The passage says sensitive whiskers help otters feel tiny movements in dark or cloudy water.' },
                { id:'r4', prompt:"How does a sea otter's fur help it stay warm?", choices:['The fur makes the otter swim faster.','The fur changes color in cold water.','Air trapped in the thick fur helps keep water away from its skin.','The fur grows into a layer of fat during winter.'], correct:2, explanation:"Air trapped inside dense fur helps keep cold water away from the otter's skin." },
                { id:'r5', prompt:"In the passage, what does 'dense' most nearly mean?", choices:['Wet and shiny.','Thick and closely packed.','Soft and colorful.','Long and tangled.'], correct:1, explanation:'The passage explains that dense fur has many hairs growing close together.' },
                { id:'r6', prompt:'What is the purpose of the last paragraph?', choices:['To explain why sea otters are difficult to see.','To tell readers how to grow kelp at home.','To compare sea otters with seals and whales.','To explain how sea otters help other living things in the ocean.'], correct:3, explanation:'The last paragraph explains how otters protect kelp forests and help other ocean animals.' },
              ]
            },
            {
              id:'r2', title:'The Crooked Kite',
              text:"Darius wanted to build a kite for the spring festival. He found two thin sticks, bright blue paper, tape, and a long piece of string. He rushed through the work because he wanted to be the first person at the park. When he lifted the kite, one corner folded over and the kite fell to the ground.\n\nDarius felt disappointed, but his grandfather asked, 'What did the kite teach you?' Darius looked closely and noticed that the paper was too loose. He carefully stretched a new sheet across the sticks and taped each edge. This time the kite rose into the air, but it spun in fast circles and soon crashed again.\n\nAfter watching another kite, Darius realized that his own kite needed a longer tail. He tied several strips of cloth to the bottom. The tail helped the kite balance, but a strong wind bent one of the thin sticks. For his final try, Darius replaced the sticks with sturdier ones that would not bend so easily.\n\nAt the festival, the blue kite climbed higher than the trees. Darius did not win the prize for finishing first. Instead, he won a ribbon for the kite that stayed in the air the longest. As he held the ribbon, he understood his grandfather's question. Each mistake had been like a clue, pointing him toward a better design.",
              questions: [
                { id:'r7', prompt:'What is this passage mostly about?', choices:['Darius learns that careful changes after mistakes can help him improve his kite.','Darius\u2019s grandfather builds a kite that wins the spring festival.','The spring festival gives prizes only to the fastest kite builders.','A strong wind ruins every kite at the park.'], correct:0, explanation:'Darius learns from each failed attempt and uses what he learns to improve the kite.' },
                { id:'r8', prompt:'Which happened first?', choices:['Darius added a longer tail.','One corner of the first kite folded over.','Darius won a ribbon.','Darius replaced the thin sticks.'], correct:1, explanation:'The first problem described is a folded corner on the first kite.' },
                { id:'r9', prompt:'Why did the second kite spin in circles?', choices:['Its paper was too loose.','Its string was too short.','It needed a longer tail to help it balance.','It was made from paper that was too heavy.'], correct:2, explanation:'Darius notices that a longer tail is needed to help the kite balance.' },
                { id:'r10', prompt:"In the passage, what does 'sturdier' mean?", choices:['Stronger and less likely to bend.','Brighter and more colorful.','Longer and easier to carry.','Softer and easier to cut.'], correct:0, explanation:'Sturdier sticks are stronger and do not bend as easily.' },
                { id:'r11', prompt:"Why does the author say that each mistake was 'like a clue'?", choices:['The mistakes told Darius where the festival was held.','The mistakes showed Darius that kites should be blue.','Each mistake helped Darius understand what to fix next.','Each mistake helped Darius find his missing tools.'], correct:2, explanation:'Each mistake points to the next part of the kite that needs to be fixed.' },
                { id:'r12', prompt:'What is the most likely reason the author wrote this story?', choices:['To show that mistakes can help people learn and improve.','To teach the exact steps for making every kind of kite.','To prove that winning a ribbon is more important than having fun.','To warn children not to fly kites when it is windy.'], correct:0, explanation:"The story's lesson is that mistakes can provide useful information and lead to improvement." },
              ]
            },
            {
              id:'r3', title:'Practice Biography: Nia Santos',
              text:"Nia Santos loved making pictures from the time she was young. She collected scraps of wrapping paper, ticket stubs, and old maps. Instead of throwing them away, she cut the pieces into shapes and arranged them into animals, houses, and imaginary lands. The layers of paper gave her artwork a textured look that people could recognize right away.\n\nNia was born in a small town near the ocean. When she was twelve, her family moved to a busy city. At first, she missed the waves and quiet beaches. She began creating pictures of sea turtles, boats, and shells to remember her old home. Years later, she studied art and became a designer for a children's museum.\n\nOne day, a librarian saw a poster Nia had made for the museum. The librarian liked the bold shapes and tiny details. She asked Nia to illustrate a story about a child who explores an underwater city. Nia had never illustrated a book before, but she accepted the challenge. She spent weeks cutting, arranging, and gluing hundreds of paper pieces.\n\nThe book became popular with young readers. After that, Nia began writing and illustrating stories of her own. During her career, she created more than forty books. Children enjoyed searching her detailed pictures for hidden objects, and teachers often used her art to inspire classroom projects. Nia's recognizable paper style turned ordinary scraps into worlds full of adventure.",
              questions: [
                { id:'r13', prompt:'What is the main idea of the passage?', choices:['Nia preferred living in a small town near the ocean.','A librarian taught Nia how to cut and glue paper.','Nia became a children\u2019s author and illustrator known for her special paper artwork.','Children\u2019s museums are the best places for artists to work.'], correct:2, explanation:"The passage explains Nia's paper art style and how she became a successful children's book creator." },
                { id:'r14', prompt:'After Nia cut paper into shapes, what did she do next?', choices:['She painted the pieces blue.','She mailed the pieces to a library.','She threw away the pieces she did not use.','She arranged the shapes to create pictures.'], correct:3, explanation:'The first paragraph says she cut the paper and then arranged the shapes into pictures.' },
                { id:'r15', prompt:'Why did the librarian ask Nia to illustrate a book?', choices:['The librarian had known Nia since she was a child.','The librarian liked the style of a poster Nia had created.','The librarian needed someone who lived near the ocean.','The librarian wanted Nia to teach at the museum.'], correct:1, explanation:"The librarian noticed and liked the style of Nia's museum poster." },
                { id:'r16', prompt:'What is the purpose of the second paragraph?', choices:['To explain how to make art from old maps.','To describe every job Nia had at the museum.','To give background about Nia\u2019s childhood and early path as an artist.','To persuade readers to move from a small town to a city.'], correct:2, explanation:"The second paragraph gives childhood and early-career information that explains Nia's path as an artist." },
                { id:'r17', prompt:"In the passage, what does 'recognizable' most nearly mean?", choices:['Easy to identify or know.','Difficult to finish.','Made only for children.','Hidden from view.'], correct:0, explanation:'Recognizable means easy to identify because it has a familiar or special look.' },
                { id:'r18', prompt:'What is the most likely reason the author wrote this passage?', choices:['To explain why all book illustrations should be made from paper.','To compare life near the ocean with life in a city.','To teach readers how to become museum designers.','To explain how Nia developed her unusual art style and became a successful book creator.'], correct:3, explanation:"The passage explains both how Nia's style developed and how she became known for books." },
              ]
            }
          ]
        },

        math: {
          id:'math', name:'Mathematics', shortName:'Math', icon:'🧮',
          defaultMinutes: 26,
          instructions: [
            "Choose the best answer for each question.",
            "You may draw pictures or write number sentences on paper — a calculator is not needed.",
            "There's no penalty for guessing, so always pick your best answer!"
          ],
          questions: [
            { id:'m1', prompt:'The table shows the number of books read by a class on five days. Which two days combined have a total of 14 books?',
              figure:{type:'table', headers:['Monday','Tuesday','Wednesday','Thursday','Friday'], values:[5,8,11,6,9]},
              choices:['Monday and Tuesday','Tuesday and Thursday','Wednesday and Friday','Monday and Thursday'], correct:1,
              explanation:'Tuesday has 8 books and Thursday has 6 books. 8 + 6 = 14.' },
            { id:'m2', prompt:'Some numbers are put in a pattern in the grid. What number belongs in the box with the question mark?',
              figure:{type:'grid', rows:[[2,4,6],[8,10,12],[14,'?',18],[20,22,24]]},
              choices:['15','16','17','19'], correct:1,
              explanation:'The numbers increase by 2 going across: 14, 16, 18.' },
            { id:'m3', prompt:'A gray coin is worth 10. A white coin is worth 1. Which group of coins has a value of 43?',
              choices:['4 tens and 3 ones (10+10+10+10+1+1+1)','3 tens and 4 ones (10+10+10+1+1+1+1)','5 tens and 2 ones (10+10+10+10+10+1+1)','2 tens and 11 ones'], correct:0,
              explanation:'Four tens are 40, and three ones are 3. 40 + 3 = 43.' },
            { id:'m4', prompt:'Which number sentence has the same value as 8 + 7?', choices:['9 + 6','10 + 4','7 + 7','6 + 8'], correct:0,
              explanation:'8 + 7 = 15, and 9 + 6 also equals 15.' },
            { id:'m5', prompt:'A picture shows 12 children at a playground. One-third of the children go to the swings. The rest go to the slide. How many children go to the slide?', choices:['4','6','8','9'], correct:2,
              explanation:'One-third of 12 is 4. The rest is 12 - 4 = 8.' },
            { id:'m6', prompt:'Victor wants to measure how heavy his backpack is. Which tool should he use?', choices:['Ruler','Scale','Thermometer','Clock'], correct:1,
              explanation:'A scale measures weight.' },
            { id:'m7', prompt:'The graph shows how many stickers four students have. Which statement is true?',
              figure:{type:'bars', labels:['Ana','Brooke','Cara','Dani'], values:[5,8,3,6]},
              choices:['Ana has 7 stickers.','Brooke has an odd number of stickers.','Cara has the fewest stickers.','Dani has the most stickers.'], correct:2,
              explanation:"Cara's bar is at 3, the smallest number on the graph." },
            { id:'m8', prompt:'The picture shows a cone and a cylinder. How are these two shapes alike?',
              figure:{type:'conecyl'},
              choices:['They both have a corner.','They both have only one face.','They both have a circle for a base.','They both have a triangle-shaped face.'], correct:2,
              explanation:'A cone and a cylinder both have at least one circular base.' },
            { id:'m9', prompt:'Three friends want to share the cherries in a group equally, with everyone getting the same whole number of cherries. Which group can be shared equally among 3 friends?',
              figure:{type:'dotgroups', groups:[{label:'A',count:6},{label:'B',count:7},{label:'C',count:8},{label:'D',count:10}]},
              choices:['Group A','Group B','Group C','Group D'], correct:0,
              explanation:'Group A has 6 cherries. 6 can be shared equally among 3 friends, with 2 each.',
              approximated:true },
            { id:'m10', prompt:'How many legs do a horse, a duck, and a fish have altogether?', choices:['4','5','6','8'], correct:2,
              explanation:'A horse has 4 legs, a duck has 2, and a fish has 0. 4 + 2 + 0 = 6.' },
            { id:'m11', prompt:"Jamal made an ABBA pattern using numbers. Which could be Jamal's pattern?", choices:['2, 5, 2, 5, 2, 5, 2, 5','3, 7, 7, 3, 3, 7, 7, 3','1, 2, 3, 4, 1, 2, 3, 4','8, 6, 4, 8, 6, 4, 8, 6'], correct:1,
              explanation:'ABBA repeats first number, second number, second number, first number: 3, 7, 7, 3.' },
            { id:'m12', prompt:'Four friends counted how many baskets they made. How many more baskets did Chloe make than Ben?',
              figure:{type:'bars', labels:['Ava','Ben','Chloe','Diego'], values:[7,3,9,6]},
              choices:['3','4','5','6'], correct:3,
              explanation:'Chloe made 9 baskets and Ben made 3. 9 - 3 = 6.' },
            { id:'m13', prompt:'Rachel wants to measure how much water can fit in her bottle. Which tool is best to use?', choices:['Scale','Thermometer','Measuring cup','Measuring tape'], correct:2,
              explanation:'A measuring cup measures how much liquid a container can hold.' },
            { id:'m14', prompt:'Four bags hold different numbers of markers. Nora wants to keep two bags that contain exactly 14 markers altogether. Which two bags should she keep?',
              figure:{type:'table', headers:['White bag','Green bag','Pink bag','Blue bag'], values:[5,7,9,4]},
              choices:['Green and blue','White and pink','White and green','Green and pink'], correct:1,
              explanation:'The white bag has 5 and the pink bag has 9. 5 + 9 = 14.' },
            { id:'m15', prompt:'What number is shown by the base-ten blocks?',
              figure:{type:'baseten', hundreds:3, tens:2, ones:6},
              choices:['326','236','306','362'], correct:0,
              explanation:'There are 3 hundreds, 2 tens, and 6 ones: 300 + 20 + 6 = 326.' },
            { id:'m16', prompt:'Three triangle pieces are already inside the square. Which piece is missing to complete the square?',
              figure:{type:'puzzlesquare'},
              choiceRender:'triangle', choices:['down','up','right','left'], correct:3,
              explanation:'The open space is the right-pointing triangle in the original — recreated here so the base sits on the right edge, pointing left toward the center.',
              approximated:true },
            { id:'m17', prompt:'Maya has 24 beads. She gives 7 beads to her brother. Then her friend gives her 5 beads. How many beads does Maya have now?', choices:['12','17','22','36'], correct:2,
              explanation:'Start with 24, subtract 7, then add 5: 24 - 7 + 5 = 22.' },
            { id:'m18', prompt:'The shape on the left is flipped across the dashed vertical line. Which option shows the correct reflection?',
              figure:{type:'reflect-v'},
              choiceRender:'triangle', choices:['right','left','up','down'], correct:1,
              explanation:'A reflection across a vertical line reverses left and right but does not turn the shape upside down.',
              approximated:true },
            { id:'m19', prompt:'The top half of a design is shown above the dashed line. Which option shows the bottom half after the design is flipped over the line?',
              figure:{type:'reflect-h'},
              choiceRender:'triangle', choices:['down','up','left','right'], correct:0,
              explanation:'A flip over a horizontal line moves the shape directly below its original position and reverses its up-down direction.',
              approximated:true },
            { id:'m20', prompt:'Lila arranged 9 buttons in a square. Omar arranged 12 buttons in a rectangle. Omar gives away 4 buttons. Which number sentence shows how many buttons they have left altogether?', choices:['9 + 12 = 21','12 - 9 - 4 = -1','9 + 12 - 4 = 17','9 + 12 + 4 = 25'], correct:2,
              explanation:'Together they begin with 9 + 12 buttons, then Omar gives away 4: 9 + 12 - 4 = 17.' },
            { id:'m21', prompt:'A blue gem (B) is worth $4. A pink gem (P) is worth $2. Which group is worth the most?', choices:['2 blue + 1 pink (B B P)','3 blue (B B B)','1 blue + 3 pink (B P P P)','5 pink (P P P P P)'], correct:1,
              explanation:'Three blue gems are worth 3 x $4 = $12. Each other group is worth $10.' },
            { id:'m22', prompt:'Four books have different numbers of pages. Blue: 74 pages. Orange: 59 pages. Black: 86 pages. Green: 68 pages. Which list orders the books from fewest pages to most pages?', choices:['Black, blue, green, orange','Green, orange, blue, black','Orange, blue, green, black','Orange, green, blue, black'], correct:3,
              explanation:'The page numbers in order are 59, 68, 74, 86: orange, green, blue, black.' },
            { id:'m23', prompt:'A bag contains 3 green marbles and 7 red marbles. If Henry closes his eyes and pulls out one marble, which statement is true?',
              figure:{type:'marbles', green:3, red:7},
              choices:['It is certain that Henry will pull a green marble.','It is impossible for Henry to pull a red marble.','It is possible for Henry to pull a yellow marble.','It is more likely that Henry will pull a red marble than a green marble.'], correct:3,
              explanation:'There are more red marbles than green marbles, so red is more likely.' },
            { id:'m24', prompt:'The pencil begins at 2 inches and ends at 8 inches on the ruler. How long is the pencil?',
              figure:{type:'ruler', start:2, end:8, max:10},
              choices:['5 inches','6 inches','8 inches','10 inches'], correct:1,
              explanation:'The pencil begins at 2 and ends at 8. Its length is 8 - 2 = 6 inches.' },
          ]
        }
      }
    }
  },

  /* No tests loaded yet for these three levels — send over a workbook in the
     same pattern as Primary Test #2 (or the section templates documented
     above) and it'll be added here, following the official section sizes
     noted at the top of this file. */
  lower: {},
  middle: {},
  upper: {}
};
