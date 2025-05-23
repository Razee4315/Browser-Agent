// Enhanced selectors and templates for search engine automation

export const SearchEngineSelectors = {
  searchInput: [
    'input[name="q"]',
    'textarea[name="q"]', 
    'input#searchbox',
    'input[title="Search"]',
    '[role="combobox"]',
    'input[type="text"][title*="search" i]',
    'input[aria-label*="search" i]',
    'input[placeholder*="search" i]',
    '#APjFqb', // Google's search input ID
    'input.gLFyf', // Google's search input class
    'input[data-testid*="search" i]'
  ],
  searchButton: [
    'input[name="btnK"]',
    'button[type="submit"]',
    '[role="button"][aria-label*="search" i]',
    'input[value*="Search" i]',
    'button:has-text("Search")',
    'button[data-testid*="search" i]',
    'input.gNO89b', // Google search button class
    'center input[type="submit"]',
    'form[role="search"] button',
    'form button[type="submit"]'
  ],
  firstResult: [
    'h3 a[href*="http"]',
    'a[href*="http"] h3',
    '.g a[href]:first-of-type',
    '[data-ved] a[href*="http"]',
    'a[ping][href*="http"]',
    '.result a[href*="http"]',
    '.search-result a[href*="http"]'
  ]
};

export const DuckDuckGoSelectors = {
  searchInput: [
    'input[name="q"]',
    'input#searchbox_input',
    'input[placeholder*="Search" i]',
    'input[aria-label*="search" i]',
    'form input[type="text"]',
    'input[data-testid="searchbox"]'
  ],
  searchButton: [
    'button[type="submit"]',
    'input[type="submit"]',
    'button[aria-label="Search"]',
    'button:has-text("Search")',
    'form button[type="submit"]',
    '.search-btn',
    '#search_button_homepage'
  ],
  firstResult: [
    '[data-result="1"] h2 a',
    'article[data-testid="result"]:first-child h2 a',
    '.result:first-child h2 a',
    '.result--default:first-child h2 a',
    'h2 a[href*="http"]:first-of-type',
    'a[href*="http"] h2:first-of-type',
    '.search-result:first-child a[href*="http"]'
  ]
};

export const BraveSearchSelectors = {
  searchInput: [
    'input[name="q"]',
    'input#searchbox',
    'input[placeholder*="search" i]',
    'input[aria-label*="search" i]',
    'form input[type="text"]'
  ],
  searchButton: [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Search")',
    'form button'
  ],
  firstResult: [
    '.result a[href*="http"]',
    '.search-result a[href*="http"]',
    'h3 a[href*="http"]',
    'a[href*="http"]:first-of-type'
  ]
};

export function createSearchPrompt(searchTerm: string, engine: 'duckduckgo' | 'brave' | 'google' = 'duckduckgo', domain?: string): string {
  const urls = {
    duckduckgo: 'https://duckduckgo.com',
    brave: 'https://search.brave.com',
    google: 'https://www.google.com'
  };
  
  const baseUrl = urls[engine];
  const clickAction = domain 
    ? `Click the first result that contains '${domain}' in the URL or title`
    : "Click the first search result";
    
  return `Navigate to ${baseUrl}, search for "${searchTerm}", and ${clickAction}. Take a screenshot of the final page.`;
}

export function createDuckDuckGoSearchPrompt(searchTerm: string, domain?: string): string {
  return createSearchPrompt(searchTerm, 'duckduckgo', domain);
}

export function createBraveSearchPrompt(searchTerm: string, domain?: string): string {
  return createSearchPrompt(searchTerm, 'brave', domain);
}

export function createGoogleSearchPrompt(searchTerm: string, domain?: string): string {
  return createSearchPrompt(searchTerm, 'google', domain);
} 