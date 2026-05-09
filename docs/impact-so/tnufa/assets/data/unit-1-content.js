/**
 * ImpactOS Tnufa English — Unit 1: My World
 *
 * Theme: Family, Friends, Routines
 * CEFR target: A2 (with A1 support tier and B1 stretch tier)
 *
 * Content bank for the daily session in Unit 1.
 * Includes: 12 lexical chunks, 3 reading texts, 1 listening, 1 writing task,
 * 1 grammar focus (Present Simple in routines context).
 */

const UNIT_1 = {
  id: 'unit-1',
  title: 'My World',
  themeHe: 'המשפחה, החברים והשגרה שלי',
  cefrTarget: 'A2',

  // ===== Lexical chunks (12) =====
  // Following Lexical Approach: chunks > isolated words.
  // Each chunk has: form (English), gloss (Hebrew), example sentence, theme tag.
  chunks: [
    {
      id: 'c1',
      chunk: 'I live with',
      gloss: 'אני גר/ה עם',
      example: 'I live with my parents and my sister.',
      theme: 'family',
    },
    {
      id: 'c2',
      chunk: 'get along with',
      gloss: 'מסתדר/ת עם',
      example: 'I get along with my brother most of the time.',
      theme: 'family',
    },
    {
      id: 'c3',
      chunk: 'spend time with',
      gloss: 'מבלה זמן עם',
      example: 'On weekends I spend time with my friends.',
      theme: 'friends',
    },
    {
      id: 'c4',
      chunk: 'have a lot in common',
      gloss: 'יש לנו הרבה במשותף',
      example: 'My best friend and I have a lot in common.',
      theme: 'friends',
    },
    {
      id: 'c5',
      chunk: 'go for a walk',
      gloss: 'יוצאים לטיול רגלי',
      example: 'After school we go for a walk in the park.',
      theme: 'routine',
    },
    {
      id: 'c6',
      chunk: 'wake up early',
      gloss: 'מתעורר/ת מוקדם',
      example: 'I wake up early on school days.',
      theme: 'routine',
    },
    {
      id: 'c7',
      chunk: 'have breakfast',
      gloss: 'אוכל/ת ארוחת בוקר',
      example: 'I have breakfast with my family every morning.',
      theme: 'routine',
    },
    {
      id: 'c8',
      chunk: 'take a shower',
      gloss: 'מתקלח/ת',
      example: 'I take a shower before bed.',
      theme: 'routine',
    },
    {
      id: 'c9',
      chunk: 'do my homework',
      gloss: 'עושה שיעורי בית',
      example: 'I do my homework right after school.',
      theme: 'school',
    },
    {
      id: 'c10',
      chunk: 'hang out',
      gloss: 'מבלים ביחד',
      example: 'We hang out at the mall on Saturdays.',
      theme: 'friends',
    },
    {
      id: 'c11',
      chunk: 'in my free time',
      gloss: 'בזמן הפנוי שלי',
      example: 'In my free time I play basketball.',
      theme: 'routine',
    },
    {
      id: 'c12',
      chunk: 'help out at home',
      gloss: 'עוזר/ת בבית',
      example: 'I help out at home with the dishes.',
      theme: 'family',
    },
  ],

  // ===== Reading texts (3) =====
  // Different functional text families per pedagogy.
  // Each text: 60-90 words, A2 vocabulary, 2-3 chunks embedded naturally.
  readings: [
    {
      id: 'r1',
      title: 'Meet My Family',
      type: 'personal-narrative',
      cefr: 'A2',
      wordCount: 72,
      text: `Hi! My name is Maya and I am 14 years old. I live with my parents, my older brother Tom, and our cat Luna. Tom is 17 and we get along most of the time, but sometimes we argue about small things. My mom is a nurse and my dad teaches math at a high school. On Friday evenings we have dinner together. It is my favourite part of the week because everyone tells stories about their day.`,
      questions: [
        {
          q: 'How old is Maya?',
          options: ['14', '17', '15', '13'],
          correct: 0,
          type: 'literal',
        },
        {
          q: 'What does Maya say about her brother Tom?',
          options: [
            'They never argue.',
            'They get along most of the time.',
            'He is younger than her.',
            'He does not live with her.',
          ],
          correct: 1,
          type: 'literal',
        },
        {
          q: 'Why is Friday dinner Maya\'s favourite part of the week?',
          options: [
            'The food is better.',
            'She does not have school.',
            'Everyone shares stories from their day.',
            'Her brother is not there.',
          ],
          correct: 2,
          type: 'inferential',
        },
      ],
    },
    {
      id: 'r2',
      title: 'My Best Friend',
      type: 'descriptive',
      cefr: 'A2',
      wordCount: 68,
      text: `My best friend is Noa. We have been friends since first grade. We have a lot in common: we both love music, and we both play in the school band. After school we usually hang out at her house or go for a walk near our neighbourhood. Noa is always honest with me, even when it is hard to hear. That is why I trust her more than anyone else.`,
      questions: [
        {
          q: 'How long have they been friends?',
          options: [
            'Since high school',
            'Since last year',
            'Since first grade',
            'Since they were babies',
          ],
          correct: 2,
          type: 'literal',
        },
        {
          q: 'What do they have in common?',
          options: [
            'They both love sports.',
            'They both love music and play in the band.',
            'They live in the same house.',
            'They have the same family.',
          ],
          correct: 1,
          type: 'literal',
        },
        {
          q: 'Why does the writer trust Noa?',
          options: [
            'Because Noa is older.',
            'Because Noa is always honest, even when it is hard.',
            'Because Noa lives nearby.',
            'Because Noa plays music.',
          ],
          correct: 1,
          type: 'inferential',
        },
      ],
    },
    {
      id: 'r3',
      title: 'A Typical Tuesday',
      type: 'procedural',
      cefr: 'A2',
      wordCount: 78,
      text: `On Tuesdays I wake up early, at 6:30 in the morning. First, I take a shower and have breakfast with my mom. Then I walk to school with my friend Adam. We have six lessons every Tuesday. After school I do my homework right away because I have basketball practice at five. In the evening I help out at home and then watch TV with my sister. I usually go to bed around eleven.`,
      questions: [
        {
          q: 'What time does the writer wake up on Tuesdays?',
          options: ['5:30', '6:30', '7:00', '8:00'],
          correct: 1,
          type: 'literal',
        },
        {
          q: 'Why does the writer do homework right after school?',
          options: [
            'Because the teacher said so.',
            'Because there is basketball practice later.',
            'Because mom is waiting.',
            'Because he has no friends.',
          ],
          correct: 1,
          type: 'inferential',
        },
        {
          q: 'How many lessons are there on Tuesdays?',
          options: ['Four', 'Five', 'Six', 'Seven'],
          correct: 2,
          type: 'literal',
        },
      ],
    },
  ],

  // ===== Listening (1) =====
  // Uses Web Speech API (TTS) — script + comprehension questions.
  listening: {
    id: 'l1',
    title: 'A Voice Message from a Friend',
    cefr: 'A2',
    speakingRate: 0.9,
    voicePref: 'en-US',
    transcript: `Hey! It's me, Sam. I just got home from school. Today was crazy — we had a math test and I think it went OK. Anyway, do you want to hang out tomorrow? My sister is going to a friend's house, so we can watch a movie at my place. Call me back when you can. Bye!`,
    transcriptHe: 'הודעה קולית מחבר — Sam מספר על המבחן שלו ומציע להיפגש מחר.',
    questions: [
      {
        q: 'Who is the message from?',
        options: ['Maya', 'Sam', 'Noa', 'Adam'],
        correct: 1,
        type: 'literal',
      },
      {
        q: 'What did Sam do at school today?',
        options: [
          'He had a math test.',
          'He played basketball.',
          'He saw a movie.',
          'He met his sister.',
        ],
        correct: 0,
        type: 'literal',
      },
      {
        q: 'Why is Sam free tomorrow?',
        options: [
          'School is closed.',
          'His parents are at work.',
          'His sister is going to a friend\'s house.',
          'He finished all his homework.',
        ],
        correct: 2,
        type: 'inferential',
      },
    ],
  },

  // ===== Grammar (1) — Present Simple in routines =====
  // Text-based grammar (not PPP). Notice → Analyze → Apply.
  grammar: {
    id: 'g1',
    focus: 'Present Simple — daily routines',
    focusHe: 'הווה פשוט — תיאור שגרה יומיומית',
    cefr: 'A2',
    // Stage 1: Notice — short text with target form highlighted.
    noticeText: `Every day Maya {{wakes}} up at seven. She {{has}} breakfast with her family and {{walks}} to school. After school she {{does}} her homework and then {{plays}} basketball with her friends.`,
    noticeRule: 'בהווה פשוט, אחרי he/she/it מוסיפים -s לפועל.',
    // Stage 2: Apply — fill-in.
    applyTasks: [
      {
        sentence: 'My brother ___ (wake up) at six every morning.',
        answer: 'wakes up',
        accept: ['wakes up'],
      },
      {
        sentence: 'Noa ___ (have) breakfast with her family.',
        answer: 'has',
        accept: ['has'],
      },
      {
        sentence: 'Adam ___ (do) his homework after school.',
        answer: 'does',
        accept: ['does'],
      },
      {
        sentence: 'My friend ___ (play) basketball on Tuesdays.',
        answer: 'plays',
        accept: ['plays'],
      },
    ],
  },

  // ===== Writing task (1) =====
  // 6-stage scaffolded writing per pedagogy.
  writing: {
    id: 'w1',
    title: 'Write about your week',
    titleHe: 'תיאור השבוע שלי',
    cefr: 'A2',
    targetWords: { min: 50, max: 80 },
    prompt:
      'Write a short paragraph (50-80 words) about your typical week. Mention: who you live with, one thing you do every day, and one thing you do with friends.',
    promptHe:
      'כתבו פסקה קצרה (50-80 מילים) על שבוע טיפוסי שלכם. ציינו: עם מי אתם גרים, דבר אחד שאתם עושים כל יום, ודבר אחד שאתם עושים עם חברים.',
    chunkBank: ['I live with', 'wake up early', 'go for a walk', 'hang out', 'in my free time', 'spend time with'],
    scaffold: {
      sentenceStarters: [
        'I live with ___.',
        'Every day I ___.',
        'In my free time, I ___ with ___.',
      ],
    },
    rubric: {
      content: 'Did you cover all 3 points?',
      vocabulary: 'Did you use at least 2 chunks from the unit?',
      grammar: 'Is the Present Simple correct?',
      length: 'Is the text 50-80 words?',
    },
  },

  // ===== Session sequence =====
  // Default order of activities for a "Today's session" in Unit 1.
  // ~18 minutes total.
  sessionSequence: [
    { type: 'vocabulary', minutes: 4, contentRef: 'chunks' },
    { type: 'reading', minutes: 4, contentRef: 'r1' },
    { type: 'listening', minutes: 3, contentRef: 'l1' },
    { type: 'grammar', minutes: 3, contentRef: 'g1' },
    { type: 'writing', minutes: 5, contentRef: 'w1' },
  ],
};

if (typeof window !== 'undefined') {
  window.UNIT_1 = UNIT_1;
}
