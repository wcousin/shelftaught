import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import SEO from './SEO';

describe('SEO Component', () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = '';
    document.title = '';
  });

  it('should update document title', () => {
    const title = 'Test Page Title';
    render(<SEO title={title} />);
    
    expect(document.title).toBe(`${title} | Shelf Taught`);
  });

  it('should update meta description', () => {
    const description = 'Test description for SEO';
    render(<SEO description={description} />);
    
    const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(metaDescription?.content).toBe(description);
  });

  it('should update Open Graph meta tags', () => {
    const title = 'Test OG Title';
    const description = 'Test OG description';
    const url = 'https://example.com/test';
    
    render(<SEO title={title} description={description} url={url} />);
    
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    
    expect(ogTitle?.content).toBe(`${title} | Shelf Taught`);
    expect(ogDescription?.content).toBe(description);
    expect(ogUrl?.content).toBe(url);
  });

  it('should add canonical URL', () => {
    const url = 'https://example.com/canonical';
    render(<SEO url={url} />);
    
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical?.href).toBe(url);
  });

  it('should add structured data when provided', () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Test Product"
    };
    
    render(<SEO structuredData={structuredData} />);
    
    const script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    expect(script?.textContent).toBe(JSON.stringify(structuredData));
  });
});