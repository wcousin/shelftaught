import DatabaseService from '../services/database';

describe('DatabaseService', () => {
  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = DatabaseService.getInstance();
      const instance2 = DatabaseService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should return a PrismaClient instance', () => {
      const instance = DatabaseService.getInstance();
      expect(instance).toBeDefined();
      expect(typeof instance.$connect).toBe('function');
      expect(typeof instance.$disconnect).toBe('function');
    });
  });

  describe('connect', () => {
    it('should connect to database successfully', async () => {
      await expect(DatabaseService.connect()).resolves.not.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy database', async () => {
      const isHealthy = await DatabaseService.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from database successfully', async () => {
      await expect(DatabaseService.disconnect()).resolves.not.toThrow();
    });
  });
});