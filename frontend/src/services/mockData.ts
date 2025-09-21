import type { Curriculum, Subject, GradeLevel } from '../types';

// Mock curriculum data
export const mockCurricula: Curriculum[] = [
  {
    id: '1',
    name: 'All About Reading',
    publisher: 'All About Learning Press',
    description: 'A highly respected, multisensory reading curriculum designed for preschool through approximately 4th grade.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'All About Reading is a highly respected, multisensory reading curriculum designed for preschool through approximately 4th grade. Rooted in the Orton-Gillingham approach, it offers a step-by-step, mastery-based program that teaches phonics, decoding, fluency, and comprehension in a way that\'s both effective and engaging. Lessons are fully scripted and open-and-go, making it an ideal choice for parents with little teaching experience or those who want a structured, low-prep option. The program includes interactive components such as letter tiles, flashcards, and hands-on games, which appeal to a wide variety of learning styles, especially kinesthetic and visual learners. It\'s particularly strong for children with dyslexia or reading struggles, offering ample built-in review and a gentle pace. While the initial cost can be high (around $150–$200 per level), many materials are reusable for future students. It\'s important to note that All About Reading focuses exclusively on reading skills, so families will need a separate program for spelling and writing—often All About Spelling, its companion program. Overall, All About Reading is a well-structured, parent-friendly curriculum that delivers strong reading results through a multisensory, student-centered approach.',
    targetAgeGrade: {
      minAge: 4,
      maxAge: 9,
      gradeRange: 'PreK-4th',
      rating: 5
    },
    teachingApproach: {
      style: 'Orton-Gillingham',
      description: 'Multisensory, mastery-based, step-by-step phonics instruction',
      rating: 5
    },
    subjectsCovered: {
      subjects: ['Reading', 'Phonics', 'Comprehension'],
      comprehensiveness: 4,
      rating: 4
    },
    materialsIncluded: {
      components: ['Teacher\'s manual', 'Student activity book', 'Readers', 'Letter tiles', 'Flashcards', 'Review box'],
      completeness: 5,
      rating: 5
    },
    instructionStyle: {
      type: 'Parent-Led',
      supportLevel: 5,
      rating: 5
    },
    timeCommitment: {
      dailyMinutes: 25,
      weeklyHours: 2.1,
      flexibility: 4,
      rating: 4
    },
    cost: {
      priceRange: '$$$',
      value: 4,
      rating: 3
    },
    strengths: ['Truly open-and-go for parents', 'Engaging, hands-on materials', 'Mastery-based with built-in review', 'Excellent for struggling readers'],
    weaknesses: ['Requires parent involvement daily', 'High upfront cost', 'Not a complete language arts program (does not cover spelling or writing)'],
    bestFor: ['Homeschoolers seeking a gentle, structured reading program', 'Ideal for dyslexic or struggling readers', 'Parents wanting easy-to-teach lessons'],
    availability: {
      inPrint: true,
      digitalAvailable: true,
      usedMarket: true,
      rating: 5
    },
    overallRating: 4.6,
    reviewCount: 234,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-12-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Explode the Code',
    publisher: 'EPS/School Specialty',
    description: 'A classic phonics-based workbook series designed to build essential literacy skills in children.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'Explode the Code is a classic phonics-based workbook series designed to build essential literacy skills in children, typically from Pre-K through 4th grade. The program focuses on phonemic awareness, phonics, vocabulary, and reading comprehension using a straightforward, no-frills approach. Each workbook presents skills in small, manageable chunks with plenty of repetition, making it especially useful for struggling readers or students who benefit from consistent reinforcement. The black-and-white illustrations and simple page design minimize distractions, though they may feel dry or unengaging for more visually-oriented or creative learners. The series is sequential and self-paced, allowing students to work independently once they understand the format. There is also an online version that adds a bit of interactivity, but most users stick with the physical books. Instruction is minimal, so it works well as a supplement to a more comprehensive language arts program rather than a full curriculum on its own. It\'s also very affordable, with individual workbooks typically costing under $15, making it accessible for budget-conscious families. While Explode the Code lacks the bells and whistles of more modern programs, its clear structure, phonics reinforcement, and ease of use have made it a staple in many homeschools and classrooms. It\'s best suited for parents looking for an independent, low-prep supplement to strengthen early reading and spelling skills in a systematic way.',
    targetAgeGrade: {
      minAge: 4,
      maxAge: 10,
      gradeRange: 'PreK-4th',
      rating: 4
    },
    teachingApproach: {
      style: 'Traditional',
      description: 'Phonics-based, mastery-focused, with emphasis on repetition and skill reinforcement',
      rating: 4
    },
    subjectsCovered: {
      subjects: ['Phonics', 'Reading', 'Vocabulary'],
      comprehensiveness: 3,
      rating: 3
    },
    materialsIncluded: {
      components: ['Student workbooks', 'Optional teacher guides', 'Online version available'],
      completeness: 3,
      rating: 3
    },
    instructionStyle: {
      type: 'Independent',
      supportLevel: 2,
      rating: 4
    },
    timeCommitment: {
      dailyMinutes: 18,
      weeklyHours: 1.5,
      flexibility: 5,
      rating: 5
    },
    cost: {
      priceRange: '$',
      value: 5,
      rating: 5
    },
    strengths: ['Affordable and accessible', 'Simple and consistent format', 'Effective phonics reinforcement', 'Easy to implement'],
    weaknesses: ['Repetitive and not visually engaging', 'Not a complete language arts program', 'Limited interactivity (unless using online version)'],
    bestFor: ['Supplementing a core language arts program', 'Independent learners', 'Struggling readers needing extra phonics practice'],
    availability: {
      inPrint: true,
      digitalAvailable: true,
      usedMarket: true,
      rating: 5
    },
    overallRating: 3.8,
    reviewCount: 156,
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2023-11-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Reading Eggs',
    publisher: 'Blake eLearning',
    description: 'A highly engaging, interactive, and digital-based reading curriculum designed for children ages 2–13.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'Reading Eggs is a highly engaging, interactive, and digital-based reading curriculum designed for children ages 2–13. It uses a game-like platform to teach phonics, sight words, comprehension, and early reading skills through colorful animations, songs, and activities. The program is divided into different stages: Reading Eggs Junior (ages 2–4), Reading Eggs (ages 3–7), and Reading Eggspress (ages 7–13), ensuring a tailored learning experience as children grow. Lessons are self-paced, making it ideal for independent learners or as a supplement to other curricula. One of Reading Eggs\' standout features is its progress tracking, which provides detailed reports for parents and rewards children with points to maintain motivation. While the program offers comprehensive phonics and literacy instruction, it works best as a supplement to hands-on or print-based learning, as it doesn\'t include spelling or writing instruction. It\'s also heavily reliant on technology, requiring reliable internet access. The cost is affordable, with monthly subscriptions and free trial options available. Overall, Reading Eggs is a fun, effective way to build foundational reading skills, particularly for tech-savvy families and visual learners.',
    targetAgeGrade: {
      minAge: 2,
      maxAge: 13,
      gradeRange: 'PreK-7th',
      rating: 5
    },
    teachingApproach: {
      style: 'Digital/Interactive',
      description: 'Game-based, interactive, multisensory, mastery-focused, self-paced digital learning',
      rating: 5
    },
    subjectsCovered: {
      subjects: ['Phonics', 'Reading', 'Comprehension', 'Vocabulary'],
      comprehensiveness: 4,
      rating: 4
    },
    materialsIncluded: {
      components: ['Online platform', 'Interactive games', 'Progress tracking', 'Printable worksheets', 'eBooks'],
      completeness: 4,
      rating: 4
    },
    instructionStyle: {
      type: 'Independent',
      supportLevel: 4,
      rating: 5
    },
    timeCommitment: {
      dailyMinutes: 22,
      weeklyHours: 1.8,
      flexibility: 5,
      rating: 5
    },
    cost: {
      priceRange: '$',
      value: 5,
      rating: 5
    },
    strengths: ['Fun and engaging for children', 'Self-paced and interactive', 'Tracks progress effectively', 'Affordable with free trials'],
    weaknesses: ['Requires reliable internet access', 'No comprehensive writing or spelling instruction', 'Heavily reliant on screen time'],
    bestFor: ['Tech-savvy families', 'Independent learners', 'Visual and auditory learners', 'Those seeking a supplemental reading program'],
    availability: {
      inPrint: false,
      digitalAvailable: true,
      usedMarket: false,
      rating: 4
    },
    overallRating: 4.2,
    reviewCount: 189,
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2023-12-05T00:00:00Z'
  },
  {
    id: '4',
    name: 'The Good and the Beautiful',
    publisher: 'The Good and the Beautiful',
    description: 'A faith-based curriculum designed to provide a gentle yet thorough approach to teaching reading.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'The Good and the Beautiful Reading Program is a faith-based curriculum designed to provide a gentle yet thorough approach to teaching reading. Geared toward children from preschool through elementary school, it combines phonics, sight words, reading comprehension, and vocabulary instruction into a beautifully designed package. The program features hands-on activities, engaging stories, and high-quality illustrations that make learning enjoyable for young readers. Its lessons are scripted and easy to follow, making it accessible even for parents without teaching experience. One of its unique features is the integration of wholesome themes and moral lessons into the stories, aligning with its focus on building character alongside literacy. The curriculum includes workbooks, flashcards, phonics cards, and readers, and it is reasonably priced, making it a budget-friendly option for families. While it is comprehensive, it may not appeal to families seeking a secular program, as it includes religious elements. Additionally, its structured nature might not suit more relaxed homeschooling styles. Overall, The Good and the Beautiful Reading Program is an excellent choice for families looking for a high-quality, values-based reading curriculum that combines phonics instruction with beautiful literature.',
    targetAgeGrade: {
      minAge: 4,
      maxAge: 11,
      gradeRange: 'PreK-5th',
      rating: 4
    },
    teachingApproach: {
      style: 'Literature-Based',
      description: 'Faith-based, literature-rich, phonics-based with an emphasis on character building',
      rating: 4
    },
    subjectsCovered: {
      subjects: ['Reading', 'Phonics', 'Vocabulary', 'Character Development'],
      comprehensiveness: 4,
      rating: 4
    },
    materialsIncluded: {
      components: ['Teacher\'s guides', 'Student workbooks', 'Phonics cards', 'Readers', 'Activity books'],
      completeness: 4,
      rating: 4
    },
    instructionStyle: {
      type: 'Parent-Led',
      supportLevel: 4,
      rating: 4
    },
    timeCommitment: {
      dailyMinutes: 22,
      weeklyHours: 1.8,
      flexibility: 3,
      rating: 3
    },
    cost: {
      priceRange: '$',
      value: 5,
      rating: 5
    },
    strengths: ['Wholesome, character-building content', 'Beautifully designed materials', 'Affordable', 'Open-and-go for parents'],
    weaknesses: ['Includes religious content (not suitable for secular families)', 'Structured approach may not appeal to relaxed homeschoolers'],
    bestFor: ['Families seeking a faith-based reading program with a focus on phonics and literature-rich learning'],
    availability: {
      inPrint: true,
      digitalAvailable: true,
      usedMarket: true,
      rating: 4
    },
    overallRating: 4.3,
    reviewCount: 298,
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-12-10T00:00:00Z'
  },
  {
    id: '5',
    name: 'Teach Your Child to Read in 100 Easy Lessons',
    publisher: 'Touchstone Books',
    description: 'A straightforward, highly effective phonics-based reading program designed for parents to teach children as young as 4 years old.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'Teach Your Child to Read in 100 Easy Lessons is a straightforward, highly effective phonics-based reading program designed for parents to teach children as young as 4 years old. Based on the DISTAR method, the program simplifies the process of learning to read by using scripted lessons that focus on phonemic awareness, decoding, and fluency. The lessons are short, typically taking 15–20 minutes a day, and build progressively, helping children move from sounding out letters to reading full sentences and stories. The program requires no additional materials, making it an extremely affordable option, with the book itself usually costing under $25. Its step-by-step approach is ideal for parents with no prior teaching experience, though some may find the format overly repetitive or the use of specialized symbols (to guide pronunciation) unnecessary. Despite these minor drawbacks, the method has proven effective for many families, particularly those seeking a quick-start, low-cost way to teach foundational reading skills. Overall, Teach Your Child to Read in 100 Easy Lessons is best suited for parents who value simplicity and want a clear, consistent path to help their child become a confident reader.',
    targetAgeGrade: {
      minAge: 4,
      maxAge: 7,
      gradeRange: 'PreK-1st',
      rating: 4
    },
    teachingApproach: {
      style: 'Traditional',
      description: 'Phonics-based, scripted lessons, DISTAR method with systematic instruction',
      rating: 4
    },
    subjectsCovered: {
      subjects: ['Phonics', 'Reading', 'Decoding'],
      comprehensiveness: 3,
      rating: 3
    },
    materialsIncluded: {
      components: ['Single book with 100 scripted lessons'],
      completeness: 2,
      rating: 3
    },
    instructionStyle: {
      type: 'Parent-Led',
      supportLevel: 5,
      rating: 5
    },
    timeCommitment: {
      dailyMinutes: 18,
      weeklyHours: 1.5,
      flexibility: 3,
      rating: 4
    },
    cost: {
      priceRange: '$',
      value: 5,
      rating: 5
    },
    strengths: ['Inexpensive', 'Easy for parents with no teaching experience', 'Proven, structured approach', 'Short daily lessons'],
    weaknesses: ['Format can feel repetitive', 'Use of special pronunciation symbols may confuse some children', 'Limited engagement for creative learners'],
    bestFor: ['Families seeking a low-cost, simple, and effective way to teach foundational reading skills to young children'],
    availability: {
      inPrint: true,
      digitalAvailable: true,
      usedMarket: true,
      rating: 5
    },
    overallRating: 4.1,
    reviewCount: 445,
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-11-20T00:00:00Z'
  },
  {
    id: '6',
    name: 'Bob Books',
    publisher: 'Scholastic',
    description: 'A beloved early reading program designed to help young children build confidence and foundational reading skills.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'Bob Books is a beloved early reading program designed to help young children build confidence and foundational reading skills. Targeted at preschool through early elementary students (ages 3–7), Bob Books focuses on phonics, sight words, and early literacy development. The program consists of leveled sets of small, engaging books that progress in difficulty, starting with simple, phonics-based text and gradually introducing more complex words and sentence structures. The books feature minimal illustrations and uncluttered pages, which reduce distractions and help children focus on decoding words. They are also lightweight and portable, making them convenient for on-the-go learning. While Bob Books are not a comprehensive reading curriculum, they are an excellent supplement to phonics instruction or other literacy programs. Their simplicity may not appeal to children who prefer colorful or highly detailed stories, but for early or struggling readers, the incremental progression builds both skills and confidence. Bob Books are affordable (typically $15–$20 per set) and widely available through online retailers, bookstores, and libraries. They are particularly well-suited for parents who want a gentle, confidence-building resource to complement a phonics-based approach or for those looking for an engaging way to introduce their child to independent reading.',
    targetAgeGrade: {
      minAge: 3,
      maxAge: 7,
      gradeRange: 'PreK-1st',
      rating: 4
    },
    teachingApproach: {
      style: 'Traditional',
      description: 'Phonics-based, sequential, confidence-building approach',
      rating: 4
    },
    subjectsCovered: {
      subjects: ['Phonics', 'Reading', 'Sight Words'],
      comprehensiveness: 3,
      rating: 3
    },
    materialsIncluded: {
      components: ['Sets of small, leveled books', 'Optional companion activities'],
      completeness: 3,
      rating: 3
    },
    instructionStyle: {
      type: 'Independent',
      supportLevel: 3,
      rating: 4
    },
    timeCommitment: {
      dailyMinutes: 10,
      weeklyHours: 0.8,
      flexibility: 5,
      rating: 5
    },
    cost: {
      priceRange: '$',
      value: 4,
      rating: 4
    },
    strengths: ['Builds early reader confidence', 'Simple and uncluttered design', 'Portable and easy to use', 'Low-cost resource'],
    weaknesses: ['Limited engagement for visually creative learners', 'Not a comprehensive curriculum on its own'],
    bestFor: ['Families seeking a gentle, effective introduction to independent reading or supplemental phonics practice'],
    availability: {
      inPrint: true,
      digitalAvailable: false,
      usedMarket: true,
      rating: 4
    },
    overallRating: 3.9,
    reviewCount: 267,
    createdAt: '2023-01-25T00:00:00Z',
    updatedAt: '2023-12-08T00:00:00Z'
  },
  {
    id: '7',
    name: 'Sonlight Language Arts',
    publisher: 'Sonlight Curriculum',
    description: 'A literature-based curriculum that integrates reading, writing, grammar, and spelling into a cohesive learning experience.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'Sonlight Language Arts is a literature-based curriculum that integrates reading, writing, grammar, and spelling into a cohesive learning experience. Designed for preschool through high school, it uses high-quality books and read-alouds as the foundation for teaching language arts skills. Each level includes detailed instructor\'s guides, writing assignments, grammar exercises, and optional spelling and handwriting components. The program emphasizes creative and analytical writing, encouraging students to engage deeply with the literature they read. One of Sonlight\'s strengths is its ability to foster a love of reading and critical thinking through rich, meaningful texts. The instructor\'s guides provide detailed lesson plans, making it accessible for parents, even if they are new to teaching. However, the program requires significant parental involvement, which might be challenging for families with limited time. Additionally, its literature-heavy approach may not suit all learners, particularly those who prefer more workbook-based or independent study methods. While Sonlight is a premium-priced curriculum, the investment includes a well-rounded, engaging educational experience. It is best suited for families who value literature-based learning and are willing to dedicate time to discussion and hands-on teaching.',
    targetAgeGrade: {
      minAge: 4,
      maxAge: 18,
      gradeRange: 'PreK-12th',
      rating: 5
    },
    teachingApproach: {
      style: 'Literature-Based',
      description: 'Integrated learning with emphasis on reading, writing, and discussion',
      rating: 5
    },
    subjectsCovered: {
      subjects: ['Reading', 'Writing', 'Grammar', 'Spelling', 'Literature'],
      comprehensiveness: 5,
      rating: 5
    },
    materialsIncluded: {
      components: ['Instructor\'s guides', 'High-quality literature', 'Writing assignments', 'Grammar exercises'],
      completeness: 5,
      rating: 5
    },
    instructionStyle: {
      type: 'Parent-Led',
      supportLevel: 4,
      rating: 4
    },
    timeCommitment: {
      dailyMinutes: 90,
      weeklyHours: 7.5,
      flexibility: 2,
      rating: 2
    },
    cost: {
      priceRange: '$$$$',
      value: 4,
      rating: 3
    },
    strengths: ['Rich, high-quality literature', 'Integrated approach to language arts', 'Encourages critical thinking and creativity'],
    weaknesses: ['Requires significant parent involvement', 'Literature-heavy approach may not suit all learners', 'Higher price point'],
    bestFor: ['Families who value literature-based learning and are willing to engage in discussion and guided instruction'],
    availability: {
      inPrint: true,
      digitalAvailable: false,
      usedMarket: true,
      rating: 4
    },
    overallRating: 4.5,
    reviewCount: 189,
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2023-12-12T00:00:00Z'
  },
  {
    id: '8',
    name: 'Hooked on Phonics',
    publisher: 'Hooked on Phonics',
    description: 'A widely recognized, user-friendly program designed to teach children foundational reading skills through phonics-based methods and engaging multimedia tools.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'Hooked on Phonics is a widely recognized, user-friendly program designed to teach children foundational reading skills through a combination of phonics-based methods and engaging multimedia tools. Targeted at children from preschool to second grade, the program uses a systematic, step-by-step approach to build phonemic awareness, decoding, and reading fluency. Each level includes a mix of workbooks, online lessons, interactive apps, and physical readers that reinforce the skills taught in each session. One of the key strengths of Hooked on Phonics is its flexibility and accessibility. Children can progress at their own pace, and the interactive components keep lessons engaging. The program is ideal for parents seeking an easy-to-use, supplementary resource, especially for children who enjoy screen-based learning. While it is effective for foundational skills, it may not be comprehensive enough for older readers or those needing more in-depth instruction in comprehension or writing. The cost is moderate, with subscription options for digital access or bundles that include physical materials. Overall, Hooked on Phonics is best suited for families seeking a fun, interactive, and straightforward way to introduce early reading skills or reinforce phonics instruction.',
    targetAgeGrade: {
      minAge: 3,
      maxAge: 8,
      gradeRange: 'PreK-2nd',
      rating: 4
    },
    teachingApproach: {
      style: 'Digital/Interactive',
      description: 'Phonics-based, systematic, multimedia approach with interactive elements',
      rating: 4
    },
    subjectsCovered: {
      subjects: ['Phonics', 'Reading', 'Sight Words', 'Decoding'],
      comprehensiveness: 3,
      rating: 3
    },
    materialsIncluded: {
      components: ['Workbooks', 'Interactive apps', 'Physical readers', 'Digital lessons', 'Reward stickers'],
      completeness: 4,
      rating: 4
    },
    instructionStyle: {
      type: 'Independent',
      supportLevel: 4,
      rating: 4
    },
    timeCommitment: {
      dailyMinutes: 22,
      weeklyHours: 1.8,
      flexibility: 4,
      rating: 4
    },
    cost: {
      priceRange: '$$',
      value: 3,
      rating: 3
    },
    strengths: ['Engaging multimedia format', 'Flexible and self-paced', 'Easy for parents to use', 'Combines digital and print'],
    weaknesses: ['Limited focus on comprehension and writing', 'Heavy reliance on screen-based components for some learners'],
    bestFor: ['Families seeking a fun, interactive tool to teach phonics and early reading skills, particularly for tech-savvy children'],
    availability: {
      inPrint: true,
      digitalAvailable: true,
      usedMarket: false,
      rating: 4
    },
    overallRating: 3.7,
    reviewCount: 334,
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z'
  },
  {
    id: '9',
    name: 'Foundations in Sounds',
    publisher: 'Foundations in Sounds',
    description: 'A specialized reading program designed to build phonemic awareness and foundational literacy skills, particularly for young learners or struggling readers.',
    imageUrl: '/images/placeholder.svg',
    fullReview: 'Foundations in Sounds is a specialized reading program designed to build phonemic awareness and foundational literacy skills, particularly for young learners or struggling readers. It is especially helpful for children with learning challenges such as dyslexia or auditory processing issues. The program focuses on developing skills like identifying sounds, segmenting and blending phonemes, and improving auditory discrimination, which are critical precursors to effective reading and spelling. Foundations in Sounds uses a structured, multisensory approach that incorporates visual, auditory, and kinesthetic learning methods to ensure engagement and retention. The lessons are sequential and incremental, building confidence as students master each skill. The program includes instructor guides, student materials, and engaging activities designed for consistent, short practice sessions. While it is a valuable resource for addressing phonemic awareness deficits, it is not a comprehensive reading curriculum and works best as a supplement. This program is ideal for parents or educators working with children who need targeted support in phonemic awareness before advancing to more traditional phonics instruction.',
    targetAgeGrade: {
      minAge: 4,
      maxAge: 8,
      gradeRange: 'PreK-2nd',
      rating: 4
    },
    teachingApproach: {
      style: 'Multisensory',
      description: 'Structured, sequential, with emphasis on auditory and phonemic awareness skills',
      rating: 5
    },
    subjectsCovered: {
      subjects: ['Phonemic Awareness', 'Sound Discrimination', 'Pre-Reading Skills'],
      comprehensiveness: 2,
      rating: 4
    },
    materialsIncluded: {
      components: ['Instructor guides', 'Student materials', 'Hands-on activities'],
      completeness: 4,
      rating: 4
    },
    instructionStyle: {
      type: 'Parent-Led',
      supportLevel: 4,
      rating: 4
    },
    timeCommitment: {
      dailyMinutes: 15,
      weeklyHours: 1.25,
      flexibility: 4,
      rating: 4
    },
    cost: {
      priceRange: '$$',
      value: 4,
      rating: 4
    },
    strengths: ['Ideal for struggling readers', 'Multisensory and engaging', 'Focuses on essential phonemic awareness skills'],
    weaknesses: ['Not a comprehensive reading curriculum', 'May not suit learners who already have strong phonemic awareness'],
    bestFor: ['Children needing targeted support in phonemic awareness, especially those with dyslexia or auditory processing challenges'],
    availability: {
      inPrint: true,
      digitalAvailable: false,
      usedMarket: false,
      rating: 3
    },
    overallRating: 4.2,
    reviewCount: 87,
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2023-12-18T00:00:00Z'
  }
];

export const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics', description: 'Math curricula for all grade levels', curriculumCount: 45 },
  { id: '2', name: 'Science', description: 'Science curricula including biology, chemistry, and physics', curriculumCount: 32 },
  { id: '3', name: 'History', description: 'History and social studies curricula', curriculumCount: 28 },
  { id: '4', name: 'Literature', description: 'Literature and language arts curricula', curriculumCount: 38 },
  { id: '5', name: 'Foreign Language', description: 'Foreign language learning curricula', curriculumCount: 15 },
  { id: '6', name: 'Art', description: 'Art and creative curricula', curriculumCount: 12 },
  { id: '7', name: 'Music', description: 'Music education curricula', curriculumCount: 8 },
  { id: '8', name: 'Physical Education', description: 'PE and health curricula', curriculumCount: 6 }
];

export const mockGradeLevels: GradeLevel[] = [
  { id: '1', name: 'PreK-K', ageRange: '3-5 years', curriculumCount: 18 },
  { id: '2', name: 'Elementary (1-5)', ageRange: '6-10 years', curriculumCount: 52 },
  { id: '3', name: 'Middle School (6-8)', ageRange: '11-13 years', curriculumCount: 38 },
  { id: '4', name: 'High School (9-12)', ageRange: '14-18 years', curriculumCount: 42 }
];

// Mock API responses
export const mockApiResponses = {
  getCurricula: (params?: any) => {
    const { limit = 10, sortBy = 'rating', sortOrder = 'desc' } = params || {};
    
    let sortedCurricula = [...mockCurricula];
    
    // Simple sorting
    if (sortBy === 'rating') {
      sortedCurricula.sort((a, b) => 
        sortOrder === 'desc' ? b.overallRating - a.overallRating : a.overallRating - b.overallRating
      );
    } else if (sortBy === 'name') {
      sortedCurricula.sort((a, b) => 
        sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
      );
    }
    
    return {
      data: {
        success: true,
        data: sortedCurricula.slice(0, limit),
        total: mockCurricula.length,
        page: 1,
        limit
      }
    };
  },
  
  getCurriculumById: (id: string) => {
    const curriculum = mockCurricula.find(c => c.id === id);
    return {
      data: {
        success: true,
        data: curriculum || null
      }
    };
  },
  
  searchCurricula: (query: string, filters?: any) => {
    const filtered = mockCurricula.filter(curriculum =>
      curriculum.name.toLowerCase().includes(query.toLowerCase()) ||
      curriculum.publisher.toLowerCase().includes(query.toLowerCase()) ||
      curriculum.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      data: {
        success: true,
        data: filtered,
        total: filtered.length,
        query
      }
    };
  },
  
  getCategories: () => ({
    data: {
      success: true,
      data: {
        subjects: mockSubjects,
        gradeLevels: mockGradeLevels
      }
    }
  })
};