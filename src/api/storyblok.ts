// @ts-ignore
import fetch from 'node-fetch';
import { API_CONFIGURATION, DATA_ROOTS, DEFAULT_CONFIG } from '../constants';

// Interface for fetch configuration
export interface FetchConfig {
  prefix?: string;
  ignorePath?: string;
  country?: string;
  contentVersion?: string;
}

async function getSBcacheCVparameter(config: FetchConfig) {
  const searchParamsData = {
    token: process.env.SB_PREVIEW_TOKEN,
    version: config.contentVersion || DEFAULT_CONFIG.contentVersion,
  };

  const searchParams = new URLSearchParams(searchParamsData);
  const apiGate = API_CONFIGURATION.API_GATES[config.country as keyof typeof API_CONFIGURATION.API_GATES] || 
                 API_CONFIGURATION.API_GATES.US;

  try {
    const response = await fetch(
      `${apiGate}/stories?${searchParams.toString()}`,
      {
        method: 'GET',
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.cv;
  } catch (error) {
    console.error('Error fetching cache version:', error);
    throw error;
  }
}

export async function fetchPagesByConfig(config: FetchConfig) {
  try {
    const { prefix, ignorePath, country, contentVersion } = {
      ...DEFAULT_CONFIG,
      ...config
    };
    
    const cv = await getSBcacheCVparameter(config);
    const apiGate = API_CONFIGURATION.API_GATES[country as keyof typeof API_CONFIGURATION.API_GATES] || 
                   API_CONFIGURATION.API_GATES.US;

    const commonFetchParams: Record<string, string> = {
      version: contentVersion,
      token: process.env.SB_PREVIEW_TOKEN,
      cv: cv.toString(),
      per_page: '1000',
      include_dates: '1',
    };

    // Only add starts_with if prefix is provided
    if (prefix) {
      commonFetchParams.starts_with = prefix;
    }

    const searchParams = new URLSearchParams(commonFetchParams);

    // For requests without a prefix, we need to fetch stories instead of links
    // since the links endpoint requires a starts_with parameter
    const endpoint = prefix ? 'links' : 'stories';
    
    const response = await fetch(
      `${apiGate}/${endpoint}?${searchParams.toString()}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if (endpoint === 'stories') {
      // Handle stories endpoint response
      const storiesData = await response.json();
      const total = storiesData.total || 0;
      let stories = storiesData.stories || [];
      const lastPageNumber = Math.ceil(total / 1000);

      // Fetch additional pages if pagination is required
      for (let i = 2; i <= lastPageNumber; i++) {
        const paginatedStoriesResponse = await fetch(
          `${apiGate}/stories?${searchParams.toString()}&page=${i}`,
          {
            method: 'GET',
          }
        );

        if (!paginatedStoriesResponse.ok) {
          throw new Error(`HTTP error! Status: ${paginatedStoriesResponse.status}`);
        }

        const paginatedStoriesData = await paginatedStoriesResponse.json();
        stories = stories.concat(paginatedStoriesData.stories || []);
      }

      // Filter stories and format them
      const filteredStories = stories.filter((story: any) => {
        // Skip configuration paths if ignorePath is specified
        if (ignorePath && story.full_slug.includes(ignorePath)) return false;
        
        return true;
      });

      // Format the stories URLs
      const formattedLinks = filteredStories.map((story: any) => {
        // For stories API, we use full_slug
        return story.full_slug;
      });

      return formattedLinks;
    } else {
      // Handle links endpoint response (with prefix)
      const pagesData = await response.json();
      const total = Number(response.headers.get('Total'));
      const lastPageNumber = Math.ceil(total / 1000);

      let pages = Object.values(pagesData.links);

      // Fetch additional pages if pagination is required
      for (let i = 2; i <= lastPageNumber; i++) {
        const paginatedLinksResponse = await fetch(
          `${apiGate}/links?${searchParams.toString()}&page=${i}`,
          {
            method: 'GET',
          }
        );

        if (!paginatedLinksResponse.ok) {
          throw new Error(`HTTP error! Status: ${paginatedLinksResponse.status}`);
        }

        const paginatedLinksData = await paginatedLinksResponse.json();
        pages = pages.concat(Object.values(paginatedLinksData.links));
      }

      // Filter out configuration folder and root entry if needed
      const filteredPages = pages.filter((page: any) => {
        // Skip root entries
        if (prefix && page.slug === prefix) return false;
        
        // Skip configuration paths if ignorePath is specified
        if (ignorePath && prefix && page.slug.includes(`${prefix}/${ignorePath}`)) return false;
        
        // Only include actual pages, not folders
        return page.is_folder === false;
      });

      // Format the links
      const formattedLinks = filteredPages.map((page: any) => {
        let formattedSlug = page.slug;
        
        // Remove prefix if exists
        if (prefix && formattedSlug.startsWith(prefix + '/')) {
          formattedSlug = formattedSlug.replace(`${prefix}/`, '');
        }
        
        // Add domain if prefix is specified and exists in DATA_ROOTS
        if (prefix && prefix in DATA_ROOTS) {
          const domainBase = DATA_ROOTS[prefix as keyof typeof DATA_ROOTS]?.domain || '';
          return `${domainBase}/${formattedSlug}`;
        }
        
        return formattedSlug;
      });

      return formattedLinks;
    }
  } catch (error) {
    console.error(`Error fetching pages:`, error);
    throw error;
  }
}

export function getDataRoots() {
  return Object.keys(DATA_ROOTS);
} 