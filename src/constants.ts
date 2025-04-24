export const API_CONFIGURATION = {
  API_GATES: {
    US: 'https://api-us.storyblok.com/v2/cdn',
    EU: 'https://api.storyblok.com/v2/cdn',
    AP: 'https://api-ap.storyblok.com/v2/cdn',
    CA: 'https://api-ca.storyblok.com/v2/cdn',
    CN: 'https://app.storyblokchina.cn/v2/cdn',
  },
};

export const DATA_ROOTS = {
  'subfolder-prefix-1': {
    domain: 'website1.com'
  },
  'subfolder-prefix-2': {
    domain: 'website2.com/us'
  },
};

export const CONTENT_VERSIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' }
];

export const COUNTRIES = [
  { value: 'EU', label: '🇪🇺 Europe' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'AP', label: '🇦🇺 Australia' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'CN', label: '🇨🇳 China' }
];

export const DEFAULT_CONFIG = {
  ignorePath: 'configuration',
  prefix: 'jackpot-city',
  country: 'US',
  contentVersion: 'published'
}; 