import { PrismaClient } from '@prisma/client';
import { AuthUtils } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive database seed...');

  // Clear existing data to avoid duplicates
  await prisma.curriculumSubject.deleteMany({});
  await prisma.savedCurriculum.deleteMany({});
  await prisma.curriculum.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.gradeLevel.deleteMany({});

  // Create subjects
  const languageArts = await prisma.subject.create({
    data: {
      name: 'Language Arts',
      description: 'Reading, writing, grammar, and literature instruction'
    }
  });

  const mathematics = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      description: 'Arithmetic, algebra, geometry, and mathematical reasoning'
    }
  });

  const phonics = await prisma.subject.create({
    data: {
      name: 'Phonics',
      description: 'Letter sounds, decoding, and reading fundamentals'
    }
  });

  const reading = await prisma.subject.create({
    data: {
      name: 'Reading',
      description: 'Reading comprehension, fluency, and literacy skills'
    }
  });

  // Create grade levels
  const preschool = await prisma.gradeLevel.create({
    data: {
      name: 'Preschool',
      ageRange: '3-5 years',
      minAge: 3,
      maxAge: 5
    }
  });

  const elementary = await prisma.gradeLevel.create({
    data: {
      name: 'Elementary (K-5)',
      ageRange: '5-11 years',
      minAge: 5,
      maxAge: 11
    }
  });

  // Create admin user
  const adminPassword = await AuthUtils.hashPassword('TestPass@321');
  const adminUser = await prisma.user.create({
    data: {
      email: 'wcousin@gmail.com',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create comprehensive curriculum data
  const allAboutReading = await prisma.curriculum.create({
    data: {
      name: 'All About Reading',
      publisher: 'All About Learning Press',
      description: 'A highly respected, multisensory reading curriculum designed for preschool through approximately 4th grade. Rooted in the Orton-Gillingham approach, it offers a step-by-step, mastery-based program that teaches phonics, decoding, fluency, and comprehension.',
      gradeLevelId: elementary.id,
      targetAgeGradeRating: 5,
      teachingApproachStyle: 'Orton-Gillingham influenced; multisensory, mastery-based',
      teachingApproachDescription: 'Step-by-step phonics instruction with hands-on components',
      teachingApproachRating: 5,
      subjectComprehensiveness: 4,
      subjectsCoveredRating: 4,
      materialsComponents: [
        'Teacher\'s manual',
        'Student activity book',
        'Readers',
        'Letter tiles',
        'Flashcards',
        'Phonogram app (optional)',
        'Review box'
      ],
      materialsCompleteness: 5,
      materialsIncludedRating: 5,
      instructionStyleType: 'Scripted, open-and-go lessons',
      instructionSupportLevel: 5,
      instructionStyleRating: 5,
      timeCommitmentDailyMinutes: 25,
      timeCommitmentWeeklyHours: 2.1,
      timeCommitmentFlexibility: 4,
      timeCommitmentRating: 4,
      costPriceRange: '$$',
      costValue: 4,
      costRating: 3,
      strengths: [
        'Truly open-and-go for parents',
        'Engaging, hands-on materials',
        'Mastery-based with built-in review',
        'Excellent for struggling readers'
      ],
      weaknesses: [
        'Requires parent involvement daily',
        'High upfront cost',
        'Not a complete language arts program',
        'Does not cover spelling or writing'
      ],
      bestFor: [
        'Homeschoolers seeking a gentle, structured reading program',
        'Ideal for dyslexic or struggling readers',
        'Parents wanting easy-to-teach lessons'
      ],
      availabilityInPrint: true,
      availabilityDigital: true,
      availabilityUsedMarket: true,
      availabilityRating: 5,
      overallRating: 4.6,
      reviewCount: 1
    }
  });

  const explodeTheCode = await prisma.curriculum.create({
    data: {
      name: 'Explode the Code',
      publisher: 'EPS/School Specialty',
      description: 'A classic phonics-based workbook series designed to build essential literacy skills in children, typically from Pre-K through 4th grade. Focuses on phonemic awareness, phonics, vocabulary, and reading comprehension.',
      gradeLevelId: elementary.id,
      targetAgeGradeRating: 4,
      teachingApproachStyle: 'Phonics-based, traditional, mastery-focused',
      teachingApproachDescription: 'Emphasis on repetition and skill reinforcement',
      teachingApproachRating: 4,
      subjectComprehensiveness: 3,
      subjectsCoveredRating: 3,
      materialsComponents: [
        'Student workbooks (Books A–8)',
        'Half books for extra practice',
        'Optional teacher guides',
        'Online version available'
      ],
      materialsCompleteness: 3,
      materialsIncludedRating: 3,
      instructionStyleType: 'Workbook-based; minimal instruction required',
      instructionSupportLevel: 2,
      instructionStyleRating: 3,
      timeCommitmentDailyMinutes: 18,
      timeCommitmentWeeklyHours: 1.5,
      timeCommitmentFlexibility: 5,
      timeCommitmentRating: 5,
      costPriceRange: '$',
      costValue: 5,
      costRating: 5,
      strengths: [
        'Affordable and accessible',
        'Simple and consistent format',
        'Effective phonics reinforcement',
        'Easy to implement'
      ],
      weaknesses: [
        'Repetitive and not visually engaging',
        'Not a complete language arts program',
        'Limited interactivity'
      ],
      bestFor: [
        'Supplementing a core language arts program',
        'Independent learners',
        'Struggling readers needing extra phonics practice'
      ],
      availabilityInPrint: true,
      availabilityDigital: true,
      availabilityUsedMarket: true,
      availabilityRating: 5,
      overallRating: 3.8,
      reviewCount: 1
    }
  });

  const readingEggs = await prisma.curriculum.create({
    data: {
      name: 'Reading Eggs',
      publisher: 'Blake eLearning',
      description: 'A highly engaging, interactive, and digital-based reading curriculum designed for children ages 2–13. Uses a game-like platform to teach phonics, sight words, comprehension, and early reading skills.',
      gradeLevelId: elementary.id,
      targetAgeGradeRating: 4,
      teachingApproachStyle: 'Game-based, interactive, multisensory',
      teachingApproachDescription: 'Self-paced digital learning with rewards and progress tracking',
      teachingApproachRating: 4,
      subjectComprehensiveness: 4,
      subjectsCoveredRating: 4,
      materialsComponents: [
        'Online platform with lessons',
        'Interactive activities',
        'Printable worksheets',
        'Ebooks',
        'Progress tracking',
        'Optional physical books'
      ],
      materialsCompleteness: 4,
      materialsIncludedRating: 4,
      instructionStyleType: 'Self-directed, online',
      instructionSupportLevel: 3,
      instructionStyleRating: 4,
      timeCommitmentDailyMinutes: 23,
      timeCommitmentWeeklyHours: 1.9,
      timeCommitmentFlexibility: 5,
      timeCommitmentRating: 5,
      costPriceRange: '$',
      costValue: 4,
      costRating: 4,
      strengths: [
        'Fun and engaging for children',
        'Self-paced and interactive',
        'Tracks progress effectively',
        'Affordable with free trials'
      ],
      weaknesses: [
        'Requires reliable internet access',
        'No comprehensive writing or spelling instruction',
        'Heavily reliant on screen time'
      ],
      bestFor: [
        'Tech-savvy families',
        'Independent learners',
        'Visual and auditory learners',
        'Those seeking a supplemental reading program'
      ],
      availabilityInPrint: false,
      availabilityDigital: true,
      availabilityUsedMarket: false,
      availabilityRating: 4,
      overallRating: 4.2,
      reviewCount: 1
    }
  });

  const goodAndBeautiful = await prisma.curriculum.create({
    data: {
      name: 'The Good and the Beautiful Reading Program',
      publisher: 'The Good and the Beautiful',
      description: 'A faith-based curriculum designed to provide a gentle yet thorough approach to teaching reading. Combines phonics, sight words, reading comprehension, and vocabulary instruction with wholesome themes.',
      gradeLevelId: elementary.id,
      targetAgeGradeRating: 4,
      teachingApproachStyle: 'Faith-based, literature-rich, phonics-based',
      teachingApproachDescription: 'Emphasis on character building and wholesome content',
      teachingApproachRating: 4,
      subjectComprehensiveness: 4,
      subjectsCoveredRating: 4,
      materialsComponents: [
        'Teacher\'s guides',
        'Student workbooks',
        'Phonics cards',
        'Readers',
        'Optional activity books'
      ],
      materialsCompleteness: 4,
      materialsIncludedRating: 4,
      instructionStyleType: 'Scripted lessons for parents',
      instructionSupportLevel: 4,
      instructionStyleRating: 4,
      timeCommitmentDailyMinutes: 23,
      timeCommitmentWeeklyHours: 1.9,
      timeCommitmentFlexibility: 4,
      timeCommitmentRating: 4,
      costPriceRange: '$',
      costValue: 5,
      costRating: 5,
      strengths: [
        'Wholesome, character-building content',
        'Beautifully designed materials',
        'Affordable',
        'Open-and-go for parents'
      ],
      weaknesses: [
        'Includes religious content (not suitable for secular families)',
        'Structured approach may not appeal to relaxed homeschoolers'
      ],
      bestFor: [
        'Families seeking a faith-based reading program',
        'Focus on phonics and literature-rich learning'
      ],
      availabilityInPrint: true,
      availabilityDigital: true,
      availabilityUsedMarket: true,
      availabilityRating: 4,
      overallRating: 4.3,
      reviewCount: 1
    }
  });

  const teachYourChild = await prisma.curriculum.create({
    data: {
      name: 'Teach Your Child to Read in 100 Easy Lessons',
      publisher: 'Engelmann & Bruner',
      description: 'A straightforward, highly effective phonics-based reading program designed for parents to teach children as young as 4 years old. Based on the DISTAR method.',
      gradeLevelId: preschool.id,
      targetAgeGradeRating: 5,
      teachingApproachStyle: 'Phonics-based, scripted lessons, DISTAR method',
      teachingApproachDescription: 'Systematic instruction and phonemic awareness',
      teachingApproachRating: 5,
      subjectComprehensiveness: 3,
      subjectsCoveredRating: 3,
      materialsComponents: [
        'Single book containing 100 scripted lessons'
      ],
      materialsCompleteness: 3,
      materialsIncludedRating: 3,
      instructionStyleType: 'Parent-led, fully scripted lessons',
      instructionSupportLevel: 5,
      instructionStyleRating: 4,
      timeCommitmentDailyMinutes: 18,
      timeCommitmentWeeklyHours: 1.5,
      timeCommitmentFlexibility: 3,
      timeCommitmentRating: 4,
      costPriceRange: '$',
      costValue: 5,
      costRating: 5,
      strengths: [
        'Inexpensive',
        'Easy for parents with no teaching experience',
        'Proven, structured approach',
        'Short daily lessons'
      ],
      weaknesses: [
        'Format can feel repetitive',
        'Use of special pronunciation symbols may confuse some children',
        'Limited engagement for creative learners'
      ],
      bestFor: [
        'Families seeking a low-cost, simple, and effective way to teach foundational reading skills'
      ],
      availabilityInPrint: true,
      availabilityDigital: false,
      availabilityUsedMarket: true,
      availabilityRating: 5,
      overallRating: 4.1,
      reviewCount: 1
    }
  });

  // Link curricula to subjects
  await Promise.all([
    // All About Reading - Language Arts, Phonics, Reading
    prisma.curriculumSubject.create({
      data: { curriculumId: allAboutReading.id, subjectId: languageArts.id }
    }),
    prisma.curriculumSubject.create({
      data: { curriculumId: allAboutReading.id, subjectId: phonics.id }
    }),
    prisma.curriculumSubject.create({
      data: { curriculumId: allAboutReading.id, subjectId: reading.id }
    }),

    // Explode the Code - Phonics, Reading
    prisma.curriculumSubject.create({
      data: { curriculumId: explodeTheCode.id, subjectId: phonics.id }
    }),
    prisma.curriculumSubject.create({
      data: { curriculumId: explodeTheCode.id, subjectId: reading.id }
    }),

    // Reading Eggs - Reading, Phonics
    prisma.curriculumSubject.create({
      data: { curriculumId: readingEggs.id, subjectId: reading.id }
    }),
    prisma.curriculumSubject.create({
      data: { curriculumId: readingEggs.id, subjectId: phonics.id }
    }),

    // Good and Beautiful - Language Arts, Reading, Phonics
    prisma.curriculumSubject.create({
      data: { curriculumId: goodAndBeautiful.id, subjectId: languageArts.id }
    }),
    prisma.curriculumSubject.create({
      data: { curriculumId: goodAndBeautiful.id, subjectId: reading.id }
    }),
    prisma.curriculumSubject.create({
      data: { curriculumId: goodAndBeautiful.id, subjectId: phonics.id }
    }),

    // Teach Your Child - Reading, Phonics
    prisma.curriculumSubject.create({
      data: { curriculumId: teachYourChild.id, subjectId: reading.id }
    }),
    prisma.curriculumSubject.create({
      data: { curriculumId: teachYourChild.id, subjectId: phonics.id }
    })
  ]);

  console.log('✅ Comprehensive database seeded successfully!');
  console.log(`Created admin user: ${adminUser.email}`);
  console.log(`Created 5 comprehensive curricula with detailed information`);
  console.log('🎯 Ready for production use!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });