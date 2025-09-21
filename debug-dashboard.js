#!/usr/bin/env node

// Debug script to test dashboard functionality
console.log('🔍 Testing dashboard functionality...');

// Test the API mock data structure
try {
  // Simulate the mock data structure from api.ts
  const mockSavedCurricula = [
    {
      id: 'saved-1',
      personalNotes: 'Great for visual learners. My kids love the colorful illustrations.',
      savedAt: '2024-01-15T10:30:00Z',
      curriculum: {
        id: '1',
        name: 'Saxon Math',
        publisher: 'Saxon Publishers',
        description: 'A comprehensive math curriculum that uses incremental development and continual review.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.1,
        gradeLevel: {
          name: 'K-12'
        },
        subjects: [
          { name: 'Mathematics' }
        ],
        teachingApproachStyle: 'Traditional',
        costPriceRange: '$$',
        timeCommitmentDailyMinutes: 45
      }
    },
    {
      id: 'saved-2',
      personalNotes: 'Perfect for our family. The self-paced approach works well.',
      savedAt: '2024-01-10T14:20:00Z',
      curriculum: {
        id: '2',
        name: 'Teaching Textbooks',
        publisher: 'Teaching Textbooks',
        description: 'Self-teaching math curriculum with automated grading and built-in help system.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.3,
        gradeLevel: {
          name: '3-12'
        },
        subjects: [
          { name: 'Mathematics' }
        ],
        teachingApproachStyle: 'Self-Directed',
        costPriceRange: '$$',
        timeCommitmentDailyMinutes: 30
      }
    }
  ];
  
  console.log('✅ Mock data structure is valid');
  console.log('📊 Mock data:', JSON.stringify(mockSavedCurricula, null, 2));
  
  // Test data access patterns
  mockSavedCurricula.forEach((item, index) => {
    console.log(`\n📚 Testing item ${index + 1}:`);
    console.log(`- ID: ${item.id}`);
    console.log(`- Name: ${item.curriculum.name}`);
    console.log(`- Publisher: ${item.curriculum.publisher}`);
    console.log(`- Rating: ${item.curriculum.overallRating}`);
    console.log(`- Grade Level: ${item.curriculum.gradeLevel.name}`);
    console.log(`- Subjects: ${item.curriculum.subjects.map(s => s.name).join(', ')}`);
    console.log(`- Cost: ${item.curriculum.costPriceRange}`);
    console.log(`- Time: ${item.curriculum.timeCommitmentDailyMinutes} min/day`);
  });
  
} catch (error) {
  console.error('❌ Error in mock data structure:', error);
}

console.log('\n🔍 Check the browser console for runtime errors when visiting the dashboard.');
console.log('💡 Common issues to check:');
console.log('- Network errors in browser dev tools');
console.log('- JavaScript errors in console');
console.log('- React component errors');
console.log('- Authentication state issues');