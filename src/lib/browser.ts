import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { BrowserAction, analyzeScreenshot } from './gemini';
import { inspectPageElements } from './debug-helpers';

interface ScreenshotData {
  timestamp: number;
  description: string;
  fullPage: string;
  viewport: string;
  path: string;
  url: string;
  title: string;
}

export class BrowserAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private screenshots: ScreenshotData[] = [];

  async initialize(headless: boolean = false): Promise<void> {
    try {
      this.browser = await chromium.launch({ 
        headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      this.page = await this.context.newPage();
      
      // Set faster default timeout
      this.page.setDefaultTimeout(8000);
      
      console.log('Browser automation initialized');
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async executePlan(actions: BrowserAction[]): Promise<{ 
    success: boolean; 
    results: any[];
    screenshots: ScreenshotData[];
    error?: string;
  }> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const results: any[] = [];
    let success = true;
    let error: string | undefined;

    try {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        console.log(`Executing action ${i + 1}/${actions.length}: ${action.description}`);
        
        const result = await this.executeAction(action);
        results.push({
          action: action.description,
          type: action.type,
          result,
          timestamp: new Date().toISOString()
        });

        // Minimal delay between actions
        await this.page.waitForTimeout(300);
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error executing plan:', error);
    }

    return {
      success,
      results,
      screenshots: this.screenshots,
      error
    };
  }

  private async executeAction(action: BrowserAction): Promise<any> {
    if (!this.page) throw new Error('Page not available');

    const timeout = action.timeout || 5000;

    switch (action.type) {
      case 'navigate':
        if (!action.target) throw new Error('Navigate action requires target URL');
        await this.navigateWithRetry(action.target, 3);
        return { url: action.target };

      case 'click':
        if (!action.target) throw new Error('Click action requires target selector');
        try {
          // Smart selector handling for common elements
          let actualSelector = action.target;
          
          // Special handling for search result links
          if (action.description?.toLowerCase().includes('first result') || action.description?.toLowerCase().includes('first search result')) {
            const searchResultSelectors = [
              // Brave Search result selectors
              '.fdb > .result:first-child h3 a',
              '.fdb > .result:first-child a[href]:first-of-type',
              '.search-results .result:first-child h3 a',
              '.search-results .result:first-child a[href]',
              
              // Google search result selectors
              '#search .g:first-child h3 a',
              '#search .yuRUbf:first-child a',
              '.g:first-child .yuRUbf a',
              
              // Generic search result selectors
              '[data-testid="result"]:first-child a',
              '.search-result:first-child a',
              '.result:first-child a[href]',
              'article:first-child a[href]',
              '.organic-result:first-child a',
              
              // Fallback to any first link in results area
              '#search a[href]:first-of-type',
              '.search-results a[href]:first-of-type',
              '.results a[href]:first-of-type'
            ];
            
            // Quick wait for search results to load
            await this.page.waitForTimeout(800);
            
            const foundSelector = await this.findElementWithFallbacks(searchResultSelectors, timeout);
            if (foundSelector) {
              actualSelector = foundSelector;
              console.log(`About to click search result: ${actualSelector}`);
              await this.page.click(actualSelector);
              return { clicked: actualSelector, type: 'search-result' };
            } else {
              // Take a debug screenshot to see what's on the page
              const debugScreenshot = await this.page.screenshot({ fullPage: false });
              const base64Screenshot = debugScreenshot.toString('base64');
              this.screenshots.push({
                timestamp: Date.now(),
                description: 'Debug: No search results found',
                fullPage: base64Screenshot,
                viewport: base64Screenshot,
                path: `debug_no_results_${Date.now()}.png`,
                url: await this.page.url(),
                title: await this.page.title()
              });
              throw new Error('No search results found to click');
            }
          }
          // Special handling for search buttons
          else if (action.target.includes('btnK') || action.description?.toLowerCase().includes('search button') || action.description?.toLowerCase().includes('search')) {
            const searchButtonSelectors = [
              // Google selectors
              'input[name="btnK"]',
              'button[type="submit"]',
              '[data-ved] input[type="submit"]',
              
              // Brave Search specific selectors
              'button[aria-label="Search"]',
              'button[aria-label*="search" i]',
              '.search-btn',
              'button.search-submit',
              '[data-testid="search-submit"]',
              
              // Generic search button selectors
              'input[value*="Search" i]',
              'button:has-text("Search")',
              'button[data-testid*="search" i]',
              'form[role="search"] button',
              'form button[type="submit"]',
              '.search-button',
              '#search-button',
              
              // Icon-based search buttons (like magnifying glass)
              'button[title*="search" i]',
              '[role="button"][title*="search" i]',
              'svg[aria-label*="search" i]',
              'button svg',
              '.search-icon'
            ];
            const foundSelector = await this.findElementWithFallbacks(searchButtonSelectors, timeout);
            if (foundSelector) {
              actualSelector = foundSelector;
              await this.page.click(actualSelector);
              return { clicked: actualSelector };
            } else {
              // If no search button found, try pressing Enter in the search input
              console.log('No search button found, trying to press Enter in search input...');
              const searchInputSelectors = [
                'input[name="q"]',
                'input#searchbox',
                'input[placeholder*="search" i]',
                'input[aria-label*="search" i]',
                'form input[type="text"]'
              ];
              const searchInput = await this.findElementWithFallbacks(searchInputSelectors, timeout);
              if (searchInput) {
                await this.page.focus(searchInput);
                await this.page.keyboard.press('Enter');
                return { clicked: 'Enter key in search input', searchInput };
              } else {
                throw new Error('Neither search button nor search input found');
              }
            }
          } else {
            await this.page.waitForSelector(action.target, { timeout });
            await this.page.click(actualSelector);
            return { clicked: actualSelector };
          }
        } catch (error) {
          // If selector fails, try vision-based analysis
          console.log('Taking screenshot for AI analysis...');
          const screenshot = await this.page.screenshot({ fullPage: false });
          const base64Screenshot = screenshot.toString('base64');
          
          // Store screenshot for debugging
          const debugScreenshotData = {
            timestamp: Date.now(),
            description: `Debug screenshot for failed action: ${action.description}`,
            fullPage: base64Screenshot,
            viewport: base64Screenshot,
            path: `debug_${Date.now()}.png`,
            url: await this.page.url(),
            title: await this.page.title()
          };
          this.screenshots.push(debugScreenshotData);
          
          const analysis = await analyzeScreenshot(base64Screenshot, 
            `Failed to find clickable element with selector "${action.target}". Current action: ${action.description}. Please analyze the screenshot and suggest alternative selectors or specific elements to click.`);
          
          throw new Error(`Click failed: ${error instanceof Error ? error.message : 'Unknown error'}. AI Analysis: ${analysis}`);
        }

      case 'type':
        if (!action.target || !action.value) {
          throw new Error('Type action requires target selector and value');
        }
        try {
          // Smart selector handling for common elements
          let actualSelector = action.target;
          
          // Special handling for search input fields
          if (action.target.includes('input[name="q"]') || action.description?.toLowerCase().includes('search')) {
            const searchInputSelectors = [
              // Standard search input selectors
              'input[name="q"]',
              'textarea[name="q"]',
              
              // Brave Search specific selectors
              'input#searchbox',
              'input[data-testid="searchbox"]',
              'input[placeholder*="search" i]',
              'input[aria-label*="search" i]',
              
              // Google specific selectors  
              '#APjFqb',
              'input.gLFyf',
              
              // Generic fallbacks
              'input[title="Search"]',
              '[role="combobox"]',
              'input[type="text"][title*="search" i]',
              'input[data-testid*="search" i]',
              'form input[type="text"]',
              'input[type="search"]',
              '.search-input',
              '[role="searchbox"]'
            ];
            const foundSelector = await this.findElementWithFallbacks(searchInputSelectors, timeout);
            if (foundSelector) {
              actualSelector = foundSelector;
            }
          } else {
            await this.page.waitForSelector(action.target, { timeout });
          }
          
          await this.page.fill(actualSelector, action.value);
          return { typed: action.value, into: actualSelector };
        } catch (error) {
          // If selector fails, try vision-based analysis
          const screenshot = await this.page.screenshot({ fullPage: false });
          const base64Screenshot = screenshot.toString('base64');
          const analysis = await analyzeScreenshot(base64Screenshot, 
            `Failed to find input field with selector "${action.target}" to type "${action.value}". Please analyze the screenshot and suggest alternative selectors.`);
          
          throw new Error(`Type failed: ${error instanceof Error ? error.message : 'Unknown error'}. AI Analysis: ${analysis}`);
        }

      case 'wait':
        const waitTime = action.timeout || 1000;
        await this.page.waitForTimeout(waitTime);
        return { waited: waitTime };

      case 'scroll':
        const scrollTarget = action.target || 'body';
        await this.page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollBy(0, 500);
          }
        }, scrollTarget);
        return { scrolled: scrollTarget };

      case 'screenshot':
        const timestamp = Date.now();
        const screenshotPath = `screenshot_${timestamp}.png`;
        
        // Take high-quality screenshot with better options
        const screenshot = await this.page.screenshot({ 
          path: `public/screenshots/${screenshotPath}`,
          fullPage: true,
          type: 'png',
          animations: 'disabled', // Disable animations for cleaner screenshots
        });
        
        // Also take a viewport screenshot for quick preview
        const viewportScreenshot = await this.page.screenshot({
          fullPage: false,
          type: 'png',
          animations: 'disabled'
        });
        
        const base64Screenshot = screenshot.toString('base64');
        const base64Viewport = viewportScreenshot.toString('base64');
        
        // Store both screenshots with metadata
        const screenshotData = {
          timestamp,
          description: action.description,
          fullPage: base64Screenshot,
          viewport: base64Viewport,
          path: screenshotPath,
          url: await this.page.url(),
          title: await this.page.title()
        };
        
        this.screenshots.push(screenshotData);
        return { 
          screenshot: base64Screenshot,
          viewport: base64Viewport, 
          path: screenshotPath,
          metadata: screenshotData
        };

      case 'extract':
        let extractedData;
        if (action.target) {
          // Extract specific element text/attributes
          extractedData = await this.page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).map(el => ({
              text: el.textContent?.trim(),
              html: el.innerHTML,
              attributes: Array.from(el.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {} as Record<string, string>)
            }));
          }, action.target);
        } else {
          // Extract page title and basic info
          extractedData = await this.page.evaluate(() => ({
            title: document.title,
            url: window.location.href,
            text: document.body.textContent?.slice(0, 1000)
          }));
        }
        return { extracted: extractedData };

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async getCurrentPageInfo(): Promise<{ 
    url: string; 
    title: string; 
    content: string;
  }> {
    if (!this.page) throw new Error('Page not available');
    
    return await this.page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      content: document.body.textContent?.slice(0, 2000) || ''
    }));
  }

  async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('Page not available');
    
    const timestamp = Date.now();
    const screenshot = await this.page.screenshot({ 
      fullPage: true,
      type: 'png',
      animations: 'disabled'
    });
    const base64Screenshot = screenshot.toString('base64');
    
    const screenshotData = {
      timestamp,
      description: 'Manual screenshot',
      fullPage: base64Screenshot,
      viewport: base64Screenshot,
      path: `manual_${timestamp}.png`,
      url: await this.page.url(),
      title: await this.page.title()
    };
    
    this.screenshots.push(screenshotData);
    return base64Screenshot;
  }

  async analyzeCurrentPage(context: string): Promise<string> {
    if (!this.page) throw new Error('Page not available');
    
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      const base64Screenshot = screenshot.toString('base64');
      
      const analysis = await analyzeScreenshot(base64Screenshot, context);
      return analysis;
    } catch (error) {
      console.error('Error analyzing current page:', error);
      return 'Unable to analyze current page';
    }
  }

    // Enhanced method to find elements with multiple selector fallbacks
  async findElementWithFallbacks(selectors: string[], timeout: number = 5000): Promise<string | null> {
    if (!this.page) throw new Error('Page not available');
    
    // Try all selectors in parallel for faster detection
    const promises = selectors.map(async (selector) => {
      try {
        await this.page!.waitForSelector(selector, { timeout: timeout / 2 });
        return selector;
      } catch {
        return null;
      }
    });
    
    // Return the first one that succeeds
    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        console.log(`✓ Found element with selector: "${result.value}"`);
        return result.value;
      }
    }
    
    console.log(`❌ None of the ${selectors.length} selectors worked`);
    return null;
  }

  // Enhanced navigation with better error handling
  async navigateWithRetry(url: string, retries: number = 2): Promise<void> {
    if (!this.page) throw new Error('Page not available');
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt + 1} to ${url}`);
        
        // Try different wait strategies (faster)
        if (attempt === 0) {
          await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
        } else if (attempt === 1) {
          await this.page.goto(url, { waitUntil: 'load', timeout: 12000 });
        } else {
          await this.page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        }
        
        console.log(`Successfully navigated to ${url}`);
        return;
      } catch (error) {
        console.log(`Navigation attempt ${attempt + 1} failed:`, error);
        if (attempt === retries - 1) {
          throw error;
        }
        await this.page.waitForTimeout(500); // Brief pause before retry
      }
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      console.log('Browser closed');
    }
  }
}

// Singleton instance
let browserInstance: BrowserAutomation | null = null;

export function getBrowserInstance(): BrowserAutomation {
  if (!browserInstance) {
    browserInstance = new BrowserAutomation();
  }
  return browserInstance;
} 