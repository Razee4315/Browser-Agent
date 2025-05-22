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

export function createSearchPrompt(searchTerm: string, engine: 'google' | 'brave' = 'google', domain?: string): string {
  const baseUrl = engine === 'brave' ? 'https://search.brave.com/' : 'https://www.google.com';
  const clickAction = domain 
    ? `Click the first result that contains '${domain}' in the URL or title`
    : "Click the first search result";
    
  return `Navigate to ${baseUrl}, search for "${searchTerm}", and ${clickAction}. Take a screenshot of the final page.`;
}

export function createGoogleSearchPrompt(searchTerm: string, domain?: string): string {
  return createSearchPrompt(searchTerm, 'google', domain);
}

export function createBraveSearchPrompt(searchTerm: string, domain?: string): string {
  return createSearchPrompt(searchTerm, 'brave', domain);
} 