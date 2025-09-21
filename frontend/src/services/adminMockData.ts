// Mock data for admin panel functionality

export const mockAdminData = {
  // Mock curricula data for admin management
  getCurricula: (page = 1, limit = 10, search = '') => {
    const allCurricula = [
      {
        id: '1',
        name: 'Saxon Math',
        publisher: 'Saxon Publishers',
        description: 'A comprehensive math curriculum that uses incremental development and continual review.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.1,
        gradeLevel: { id: '1', name: 'K-12' },
        subjects: [{ id: '1', name: 'Mathematics' }],
        teachingApproachStyle: 'Traditional',
        costPriceRange: '$$',
        timeCommitmentDailyMinutes: 45,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        _count: { savedBy: 25 }
      },
      {
        id: '2',
        name: 'Teaching Textbooks',
        publisher: 'Teaching Textbooks',
        description: 'Self-teaching math curriculum with automated grading and built-in help system.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.3,
        gradeLevel: { id: '2', name: '3-12' },
        subjects: [{ id: '1', name: 'Mathematics' }],
        teachingApproachStyle: 'Self-Directed',
        costPriceRange: '$$',
        timeCommitmentDailyMinutes: 30,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        _count: { savedBy: 18 }
      },
      {
        id: '3',
        name: 'Apologia Science',
        publisher: 'Apologia Educational Ministries',
        description: 'Creation-based science curriculum with hands-on experiments and detailed explanations.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.5,
        gradeLevel: { id: '3', name: '6-12' },
        subjects: [{ id: '2', name: 'Science' }],
        teachingApproachStyle: 'Traditional',
        costPriceRange: '$$$',
        timeCommitmentDailyMinutes: 60,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        _count: { savedBy: 32 }
      },
      {
        id: '4',
        name: 'All About Reading',
        publisher: 'All About Learning Press',
        description: 'Multisensory reading program that teaches phonics, fluency, and comprehension.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.7,
        gradeLevel: { id: '4', name: 'K-5' },
        subjects: [{ id: '3', name: 'Language Arts' }],
        teachingApproachStyle: 'Multisensory',
        costPriceRange: '$$',
        timeCommitmentDailyMinutes: 30,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
        _count: { savedBy: 41 }
      },
      {
        id: '5',
        name: 'Story of the World',
        publisher: 'Well-Trained Mind Press',
        description: 'Four-year history curriculum covering ancient times through modern day.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.2,
        gradeLevel: { id: '5', name: '1-12' },
        subjects: [{ id: '4', name: 'History' }],
        teachingApproachStyle: 'Charlotte Mason',
        costPriceRange: '$',
        timeCommitmentDailyMinutes: 45,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
        _count: { savedBy: 29 }
      },
      {
        id: '6',
        name: 'Khan Academy',
        publisher: 'Khan Academy',
        description: 'Free online learning platform with comprehensive courses in multiple subjects.',
        imageUrl: '/images/placeholder.svg',
        overallRating: 4.0,
        gradeLevel: { id: '6', name: 'K-12' },
        subjects: [
          { id: '1', name: 'Mathematics' },
          { id: '2', name: 'Science' },
          { id: '4', name: 'History' }
        ],
        teachingApproachStyle: 'Self-Directed',
        costPriceRange: 'Free',
        timeCommitmentDailyMinutes: 30,
        createdAt: '2024-01-06T00:00:00Z',
        updatedAt: '2024-01-06T00:00:00Z',
        _count: { savedBy: 67 }
      }
    ];

    // Filter by search term if provided
    const filteredCurricula = search 
      ? allCurricula.filter(c => 
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.publisher.toLowerCase().includes(search.toLowerCase())
        )
      : allCurricula;

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCurricula = filteredCurricula.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredCurricula.length / limit);

    return {
      data: {
        success: true,
        data: {
          curricula: paginatedCurricula,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: filteredCurricula.length,
            itemsPerPage: limit
          }
        }
      }
    };
  },

  // Mock users data for admin management
  getUsers: (page = 1, limit = 10, search = '', role = 'all') => {
    const allUsers = [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        createdAt: '2024-01-15T10:30:00Z',
        _count: { savedCurricula: 3 }
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        createdAt: '2024-01-20T14:20:00Z',
        _count: { savedCurricula: 7 }
      },
      {
        id: '3',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        createdAt: '2024-01-01T00:00:00Z',
        _count: { savedCurricula: 0 }
      },
      {
        id: '4',
        email: 'mary.johnson@example.com',
        firstName: 'Mary',
        lastName: 'Johnson',
        role: 'user',
        createdAt: '2024-02-01T09:15:00Z',
        _count: { savedCurricula: 12 }
      },
      {
        id: '5',
        email: 'david.wilson@example.com',
        firstName: 'David',
        lastName: 'Wilson',
        role: 'user',
        createdAt: '2024-02-10T16:45:00Z',
        _count: { savedCurricula: 5 }
      }
    ];

    // Filter by search term and role
    let filteredUsers = allUsers;
    
    if (search) {
      filteredUsers = filteredUsers.filter(u => 
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (role !== 'all') {
      filteredUsers = filteredUsers.filter(u => 
        u.role.toLowerCase() === role.toLowerCase()
      );
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / limit);

    return {
      data: {
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: filteredUsers.length,
            itemsPerPage: limit
          }
        }
      }
    };
  },

  // Mock analytics data
  getAnalytics: () => ({
    data: {
      success: true,
      data: {
        totalCurricula: 6,
        totalUsers: 150,
        totalReviews: 89,
        popularSubjects: ['Mathematics', 'Science', 'Language Arts', 'History'],
        recentActivity: [
          {
            id: '1',
            type: 'curriculum_added',
            description: 'New curriculum "Saxon Math" was added',
            timestamp: '2024-01-15T10:30:00Z',
            user: 'Admin User'
          },
          {
            id: '2',
            type: 'user_registered',
            description: 'New user John Doe registered',
            timestamp: '2024-01-14T15:20:00Z',
            user: 'System'
          },
          {
            id: '3',
            type: 'curriculum_updated',
            description: 'Curriculum "Teaching Textbooks" was updated',
            timestamp: '2024-01-13T09:45:00Z',
            user: 'Admin User'
          }
        ],
        monthlyStats: {
          newUsers: [12, 15, 18, 22, 19, 25],
          newCurricula: [2, 1, 3, 2, 1, 2],
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        }
      }
    }
  })
};