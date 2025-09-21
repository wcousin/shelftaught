-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,

    CONSTRAINT "grade_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curricula" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "gradeLevelId" TEXT NOT NULL,
    "targetAgeGradeRating" INTEGER NOT NULL DEFAULT 0,
    "teachingApproachStyle" TEXT NOT NULL,
    "teachingApproachDescription" TEXT NOT NULL,
    "teachingApproachRating" INTEGER NOT NULL DEFAULT 0,
    "subjectComprehensiveness" INTEGER NOT NULL DEFAULT 0,
    "subjectsCoveredRating" INTEGER NOT NULL DEFAULT 0,
    "materialsComponents" TEXT[],
    "materialsCompleteness" INTEGER NOT NULL DEFAULT 0,
    "materialsIncludedRating" INTEGER NOT NULL DEFAULT 0,
    "instructionStyleType" TEXT NOT NULL,
    "instructionSupportLevel" INTEGER NOT NULL DEFAULT 0,
    "instructionStyleRating" INTEGER NOT NULL DEFAULT 0,
    "timeCommitmentDailyMinutes" INTEGER NOT NULL DEFAULT 0,
    "timeCommitmentWeeklyHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeCommitmentFlexibility" INTEGER NOT NULL DEFAULT 0,
    "timeCommitmentRating" INTEGER NOT NULL DEFAULT 0,
    "costPriceRange" TEXT NOT NULL,
    "costValue" INTEGER NOT NULL DEFAULT 0,
    "costRating" INTEGER NOT NULL DEFAULT 0,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "bestFor" TEXT[],
    "availabilityInPrint" BOOLEAN NOT NULL DEFAULT true,
    "availabilityDigital" BOOLEAN NOT NULL DEFAULT false,
    "availabilityUsedMarket" BOOLEAN NOT NULL DEFAULT false,
    "availabilityRating" INTEGER NOT NULL DEFAULT 0,
    "overallRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_subjects" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "curriculum_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_curricula" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "personalNotes" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_curricula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_key" ON "subjects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grade_levels_name_key" ON "grade_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_subjects_curriculumId_subjectId_key" ON "curriculum_subjects"("curriculumId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_curricula_userId_curriculumId_key" ON "saved_curricula"("userId", "curriculumId");

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "grade_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_curricula" ADD CONSTRAINT "saved_curricula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_curricula" ADD CONSTRAINT "saved_curricula_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;