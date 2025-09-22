/**
 * Utility functions for generating SEO-friendly URL slugs
 */

export class SlugUtils {
  /**
   * Generate a URL-friendly slug from text
   */
  static createSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate a curriculum slug from name and publisher
   */
  static createCurriculumSlug(name: string, publisher: string): string {
    const nameSlug = this.createSlug(name);
    const publisherSlug = this.createSlug(publisher);
    
    // Create format: curriculum-name-by-publisher
    return `${nameSlug}-by-${publisherSlug}`;
  }

  /**
   * Ensure slug uniqueness by appending numbers if needed
   */
  static async ensureUniqueSlug(
    baseSlug: string,
    checkExists: (slug: string) => Promise<boolean>,
    excludeId?: string
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Prevent infinite loops
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    return slug;
  }

  /**
   * Extract curriculum ID from various URL formats
   */
  static extractIdFromUrl(url: string): string | null {
    // Handle both old format (/curriculum/id) and new format (/curriculum/slug/id)
    const patterns = [
      /\/curriculum\/([^\/]+)\/([^\/]+)/, // New format: /curriculum/slug/id
      /\/curriculum\/([^\/]+)/, // Old format: /curriculum/id
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // For new format, return the second capture group (id)
        // For old format, return the first capture group (id)
        return match.length > 2 ? match[2] : match[1];
      }
    }

    return null;
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 200;
  }
}