import { PrismaClient } from '@prisma/client';
import { AuthUtils } from '../src/utils/auth';
// import { SlugUtils } from '../src/utils/slug'; // Temporarily disabled

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create subjects
  const languageArts = await prisma.subject.upsert({
    where: { name: 'Language Arts' },
    update: {},
    create: {
      name: 'Language Arts',
      description: 'Reading, writing, grammar, and literature instruction'
    }
  });

  const mathematics = await prisma.subject.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: {
      name: 'Mathematics',
      description: 'Arithmetic, algebra, geometry, and mathematical reasoning'
    }
  });

  const science = await prisma.subject.upsert({
    where: { name: 'Science' },
    update: {},
    create: {
      name: 'Science',
      description: 'Biology, chemistry, physics, and earth sciences'
    }
  });

  const history = await prisma.subject.upsert({
    where: { name: 'History' },
    update: {},
    create: {
      name: 'History',
      description: 'World history, American history, and social studies'
    }
  });

  const phonics = await prisma.subject.upsert({
    where: { name: 'Phonics' },
    update: {},
    create: {
      name: 'Phonics',
      description: 'Letter sounds, decoding, and reading fundamentals'
    }
  });

  // Create grade levels
  const preschool = await prisma.gradeLevel.upsert({
    where: { name: 'Preschool' },
    update: {},
    create: {
      name: 'Preschool',
      ageRange: '3-5 years',
      minAge: 3,
      maxAge: 5
    }
  });

  const elementary = await prisma.gradeLevel.upsert({
    where: { name: 'Elementary (K-5)' },
    update: {},
    create: {
      name: 'Elementary (K-5)',
      ageRange: '5-11 years',
      minAge: 5,
      maxAge: 11
    }
  });

  const middleSchool = await prisma.gradeLevel.upsert({
    where: { name: 'Middle School (6-8)' },
    update: {},
    create: {
      name: 'Middle School (6-8)',
      ageRange: '11-14 years',
      minAge: 11,
      maxAge: 14
    }
  });

  // Create admin user with specified credentials
  const adminPassword = await AuthUtils.hashPassword('TestPass@321');
  const adminUser = await prisma.user.upsert({
    where: { email: 'wcousin@gmail.com' },
    update: {},
    create: {
      email: 'wcousin@gmail.com',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create a sample regular user
  const userPassword = await AuthUtils.hashPassword('password123');
  const regularUser = await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: {
      email: 'parent@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: userPassword,
      role: 'USER'
    }
  });

  // Create sample curricula
  const logicOfEnglish = await prisma.curriculum.create({
    data: {
      name: 'Logic of English Foundations',
      publisher: 'Logic of English',
      // slug: SlugUtils.createCurriculumSlug('Logic of English Foundations', 'Logic of English'), // Temporarily disabled
      description: 'A comprehensive phonics and spelling program that teaches the logic behind English spelling and reading through multi-sensory methods.',
      gradeLevelId: elementary.id,
      targetAgeGradeRating: 5,
      teachingApproachStyle: 'Orton-Gillingham Multi-sensory',
      teachingApproachDescription: 'Uses visual, auditory, and kinesthetic learning methods with systematic phonics instruction',
      teachingApproachRating: 5,
      subjectComprehensiveness: 4,
      subjectsCoveredRating: 4,
      materialsComponents: [
        'Teacher\'s Manual',
        'Student Workbooks',
        'Phonogram Cards',
        'Spelling Rule Cards',
        'Games and Activities',
        'Assessment Tools'
      ],
      materialsCompleteness: 5,
      materialsIncludedRating: 5,
      instructionStyleType: 'Parent-led with structured lessons',
      instructionSupportLevel: 4,
      instructionStyleRating: 4,
      timeCommitmentDailyMinutes: 30,
      timeCommitmentWeeklyHours: 2.5,
      timeCommitmentFlexibility: 4,
      timeCommitmentRating: 4,
      costPriceRange: '$$',
      costValue: 4,
      costRating: 3,
      strengths: [
        'Excellent for struggling readers',
        'Teaches spelling rules systematically',
        'Multi-sensory approach',
        'Strong teacher support',
        'Research-based methodology'
      ],
      weaknesses: [
        'Can be intensive for some children',
        'Requires parent preparation time',
        'Higher cost investment',
        'May be too structured for some learning styles'
      ],
      bestFor: [
        'Children with dyslexia',
        'Struggling readers',
        'Visual and kinesthetic learners',
        'Families wanting systematic phonics',
        'Children who need spelling help'
      ],
      availabilityInPrint: true,
      availabilityDigital: true,
      availabilityUsedMarket: true,
      availabilityRating: 5,
      overallRating: 4.4,
      reviewCount: 1
    }
  });

  const mathUSee = await prisma.curriculum.create({
    data: {
      name: 'Math-U-See',
      publisher: 'Math-U-See',
      // slug: SlugUtils.createCurriculumSlug('Math-U-See', 'Math-U-See'), // Temporarily disabled
      description: 'A mastery-based math curriculum using manipulatives and visual learning methods.',
      gradeLevelId: elementary.id,
      targetAgeGradeRating: 5,
      teachingApproachStyle: 'Mastery-based with manipulatives',
      teachingApproachDescription: 'Focuses on understanding concepts before moving to abstract thinking',
      teachingApproachRating: 5,
      subjectComprehensiveness: 5,
      subjectsCoveredRating: 5,
      materialsComponents: [
        'Instruction Manual',
        'Student Text',
        'Test Booklet',
        'Manipulative Blocks',
        'DVD Instruction'
      ],
      materialsCompleteness: 5,
      materialsIncludedRating: 5,
      instructionStyleType: 'Video-based with parent support',
      instructionSupportLevel: 5,
      instructionStyleRating: 5,
      timeCommitmentDailyMinutes: 45,
      timeCommitmentWeeklyHours: 3.75,
      timeCommitmentFlexibility: 5,
      timeCommitmentRating: 4,
      costPriceRange: '$$',
      costValue: 4,
      costRating: 4,
      strengths: [
        'Excellent for visual learners',
        'Builds strong foundation',
        'Self-paced learning',
        'Great manipulatives',
        'Clear video instruction'
      ],
      weaknesses: [
        'Can be slow for advanced students',
        'Limited word problems',
        'Repetitive for some children',
        'Requires storage space for manipulatives'
      ],
      bestFor: [
        'Visual learners',
        'Children who struggle with abstract concepts',
        'Families wanting mastery-based approach',
        'Students who need concrete examples'
      ],
      availabilityInPrint: true,
      availabilityDigital: false,
      availabilityUsedMarket: true,
      availabilityRating: 4,
      overallRating: 4.2,
      reviewCount: 1
    }
  });

  const sonlight = await prisma.curriculum.create({
    data: {
      name: 'Sonlight Core A',
      publisher: 'Sonlight Curriculum',
      // slug: SlugUtils.createCurriculumSlug('Sonlight Core A', 'Sonlight Curriculum'), // Temporarily disabled
      description: 'Literature-based curriculum covering history, geography, and language arts through living books.',
      gradeLevelId: elementary.id,
      targetAgeGradeRating: 4,
      teachingApproachStyle: 'Charlotte Mason / Living Books',
      teachingApproachDescription: 'Uses real books and literature to teach across multiple subjects',
      teachingApproachRating: 5,
      subjectComprehensiveness: 4,
      subjectsCoveredRating: 4,
      materialsComponents: [
        'Instructor\'s Guide',
        'Read-Aloud Books',
        'Readers',
        'Timeline Figures',
        'Map Work'
      ],
      materialsCompleteness: 4,
      materialsIncludedRating: 4,
      instructionStyleType: 'Parent-led read-aloud intensive',
      instructionSupportLevel: 3,
      instructionStyleRating: 4,
      timeCommitmentDailyMinutes: 90,
      timeCommitmentWeeklyHours: 7.5,
      timeCommitmentFlexibility: 3,
      timeCommitmentRating: 2,
      costPriceRange: '$$$',
      costValue: 4,
      costRating: 3,
      strengths: [
        'Rich literature exposure',
        'Integrated approach',
        'Develops love of reading',
        'Strong historical foundation',
        'Excellent book selection'
      ],
      weaknesses: [
        'Very time-intensive',
        'Heavy reading load for parents',
        'Expensive',
        'May not suit all learning styles',
        'Requires dedicated parent time'
      ],
      bestFor: [
        'Families who love reading',
        'Children who enjoy stories',
        'Parents with time to read aloud',
        'Literature-loving families'
      ],
      availabilityInPrint: true,
      availabilityDigital: false,
      availabilityUsedMarket: true,
      availabilityRating: 4,
      overallRating: 4.0,
      reviewCount: 1
    }
  });

  // Link curricula to subjects
  await Promise.all([
    // Logic of English - Language Arts, Phonics
    prisma.curriculumSubject.create({
      data: {
        curriculumId: logicOfEnglish.id,
        subjectId: languageArts.id
      }
    }),
    prisma.curriculumSubject.create({
      data: {
        curriculumId: logicOfEnglish.id,
        subjectId: phonics.id
      }
    }),

    // Math-U-See - Mathematics
    prisma.curriculumSubject.create({
      data: {
        curriculumId: mathUSee.id,
        subjectId: mathematics.id
      }
    }),

    // Sonlight - Language Arts, History
    prisma.curriculumSubject.create({
      data: {
        curriculumId: sonlight.id,
        subjectId: languageArts.id
      }
    }),
    prisma.curriculumSubject.create({
      data: {
        curriculumId: sonlight.id,
        subjectId: history.id
      }
    })
  ]);

  console.log('Database seeded successfully!');
  console.log(`Created admin user: ${adminUser.email}`);
  console.log(`Created regular user: ${regularUser.email}`);
  console.log(`Created ${[logicOfEnglish, mathUSee, sonlight].length} sample curricula`);
  console.log('✅ Ready for Railway deployment!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });