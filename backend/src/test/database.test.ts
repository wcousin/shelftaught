import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Schema', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.savedCurriculum.deleteMany();
    await prisma.curriculumSubject.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.gradeLevel.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create and retrieve a subject', async () => {
    const subject = await prisma.subject.create({
      data: {
        name: 'Test Subject',
        description: 'A test subject for unit testing'
      }
    });

    expect(subject.id).toBeDefined();
    expect(subject.name).toBe('Test Subject');
    expect(subject.description).toBe('A test subject for unit testing');

    const retrieved = await prisma.subject.findUnique({
      where: { id: subject.id }
    });

    expect(retrieved).toEqual(subject);
  });

  test('should create and retrieve a grade level', async () => {
    const gradeLevel = await prisma.gradeLevel.create({
      data: {
        name: 'Test Grade',
        ageRange: '6-7 years',
        minAge: 6,
        maxAge: 7
      }
    });

    expect(gradeLevel.id).toBeDefined();
    expect(gradeLevel.name).toBe('Test Grade');
    expect(gradeLevel.minAge).toBe(6);
    expect(gradeLevel.maxAge).toBe(7);
  });

  test('should create a curriculum with all rating categories', async () => {
    // First create a grade level
    const gradeLevel = await prisma.gradeLevel.create({
      data: {
        name: 'Elementary Test',
        ageRange: '5-11 years',
        minAge: 5,
        maxAge: 11
      }
    });

    const curriculum = await prisma.curriculum.create({
      data: {
        name: 'Test Curriculum',
        publisher: 'Test Publisher',
        description: 'A comprehensive test curriculum',
        gradeLevelId: gradeLevel.id,
        targetAgeGradeRating: 4,
        teachingApproachStyle: 'Traditional',
        teachingApproachDescription: 'Structured learning approach',
        teachingApproachRating: 4,
        subjectComprehensiveness: 5,
        subjectsCoveredRating: 5,
        materialsComponents: ['Textbook', 'Workbook', 'Teacher Guide'],
        materialsCompleteness: 4,
        materialsIncludedRating: 4,
        instructionStyleType: 'Parent-led',
        instructionSupportLevel: 3,
        instructionStyleRating: 3,
        timeCommitmentDailyMinutes: 45,
        timeCommitmentWeeklyHours: 3.75,
        timeCommitmentFlexibility: 4,
        timeCommitmentRating: 4,
        costPriceRange: '$$',
        costValue: 4,
        costRating: 4,
        strengths: ['Comprehensive', 'Well-structured'],
        weaknesses: ['Time-intensive'],
        bestFor: ['Traditional learners', 'Structured families'],
        availabilityInPrint: true,
        availabilityDigital: false,
        availabilityUsedMarket: true,
        availabilityRating: 4,
        overallRating: 4.0
      }
    });

    expect(curriculum.id).toBeDefined();
    expect(curriculum.name).toBe('Test Curriculum');
    expect(curriculum.targetAgeGradeRating).toBe(4);
    expect(curriculum.materialsComponents).toEqual(['Textbook', 'Workbook', 'Teacher Guide']);
    expect(curriculum.strengths).toEqual(['Comprehensive', 'Well-structured']);
    expect(curriculum.overallRating).toBe(4.0);
  });

  test('should create user and saved curriculum relationship', async () => {
    // Create grade level and curriculum
    const gradeLevel = await prisma.gradeLevel.create({
      data: {
        name: 'Test Grade 2',
        ageRange: '7-8 years',
        minAge: 7,
        maxAge: 8
      }
    });

    const curriculum = await prisma.curriculum.create({
      data: {
        name: 'Test Curriculum 2',
        publisher: 'Test Publisher 2',
        description: 'Another test curriculum',
        gradeLevelId: gradeLevel.id,
        teachingApproachStyle: 'Charlotte Mason',
        teachingApproachDescription: 'Living books approach',
        instructionStyleType: 'Parent-led',
        costPriceRange: '$'
      }
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword'
      }
    });

    // Create saved curriculum
    const savedCurriculum = await prisma.savedCurriculum.create({
      data: {
        userId: user.id,
        curriculumId: curriculum.id,
        personalNotes: 'This looks interesting for my child'
      }
    });

    expect(savedCurriculum.id).toBeDefined();
    expect(savedCurriculum.personalNotes).toBe('This looks interesting for my child');

    // Test relationship queries
    const userWithSaved = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        savedCurricula: {
          include: {
            curriculum: true
          }
        }
      }
    });

    expect(userWithSaved?.savedCurricula).toHaveLength(1);
    expect(userWithSaved?.savedCurricula[0].curriculum.name).toBe('Test Curriculum 2');
  });

  test('should create curriculum-subject relationships', async () => {
    // Create subject and curriculum
    const subject = await prisma.subject.create({
      data: {
        name: 'Mathematics Test',
        description: 'Math curriculum testing'
      }
    });

    const gradeLevel = await prisma.gradeLevel.create({
      data: {
        name: 'Test Grade 3',
        ageRange: '8-9 years',
        minAge: 8,
        maxAge: 9
      }
    });

    const curriculum = await prisma.curriculum.create({
      data: {
        name: 'Math Curriculum Test',
        publisher: 'Math Publisher',
        description: 'A math-focused curriculum',
        gradeLevelId: gradeLevel.id,
        teachingApproachStyle: 'Mastery-based',
        teachingApproachDescription: 'Focus on understanding',
        instructionStyleType: 'Self-directed',
        costPriceRange: '$$'
      }
    });

    // Create relationship
    const curriculumSubject = await prisma.curriculumSubject.create({
      data: {
        curriculumId: curriculum.id,
        subjectId: subject.id
      }
    });

    expect(curriculumSubject.id).toBeDefined();

    // Test relationship query
    const curriculumWithSubjects = await prisma.curriculum.findUnique({
      where: { id: curriculum.id },
      include: {
        curriculumSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    expect(curriculumWithSubjects?.curriculumSubjects).toHaveLength(1);
    expect(curriculumWithSubjects?.curriculumSubjects[0].subject.name).toBe('Mathematics Test');
  });
});