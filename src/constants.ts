// API Configuration
export const API_CONFIGURATION = {
  API_GATES: {
    US: 'https://api-us.storyblok.com/v2/cdn',
    EU: 'https://api.storyblok.com/v2/cdn',
    AP: 'https://api-ap.storyblok.com/v2/cdn',
    CA: 'https://api-ca.storyblok.com/v2/cdn',
    CN: 'https://app.storyblokchina.cn/v2/cdn',
  },
};

// Data Roots with Domain Mapping
export const DATA_ROOTS = {
  'mock-project-1': {
    domain: 'example-domain-1.com'
  },
  'mock-project-2': {
    domain: 'example-domain-2.com/us'
  }
};

// Content Version Options
export const CONTENT_VERSIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' }
];

// Country Options
export const COUNTRIES = [
  { value: 'EU', label: '🇪🇺 Europe' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'AP', label: '🇦🇺 Australia' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'CN', label: '🇨🇳 China' }
];

// Default Configuration
export const DEFAULT_CONFIG = {
  ignorePath: 'configuration',
  prefix: undefined,
  country: 'US',
  contentVersion: 'published'
}; 