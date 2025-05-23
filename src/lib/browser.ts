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
    console.log('[BrowserAutomation] Starting executePlan...');
    if (!this.page) {
      console.error('[BrowserAutomation] Page not initialized in executePlan.');
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const results: any[] = [];
    let success = true;
    let error: string | undefined;

    try {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        console.log(`[BrowserAutomation] Executing action ${i + 1}/${actions.length}: ${action.description} (Type: ${action.type})`);
        
        const result = await this.executeAction(action);
        results.push({
          action: action.description,
          type: action.type,
          result,
          timestamp: new Date().toISOString()
        });
        console.log(`[BrowserAutomation] Action ${i + 1} completed. Current URL: ${this.page?.url()}`);
        await this.page.waitForTimeout(300); // Minimal delay
      }
      console.log('[BrowserAutomation] All actions in plan completed.');
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[BrowserAutomation] Error executing plan:', error);
    } finally {
      console.log('[BrowserAutomation] executePlan finally block. Success:', success);
      // IMPORTANT: We are deferring the close to the caller in the API route
      // await this.close(); 
    }

    return {
      success,
      results,
      screenshots: this.screenshots,
      error
    };
  }

  private async executeAction(action: BrowserAction): Promise<any> {
    if (!this.page) {
      console.error('[BrowserAutomation] Page not available in executeAction.');
      throw new Error('Page not available');
    }
    console.log(`[BrowserAutomation] Executing action: ${action.type} - "${action.description}"`);
    const timeout = action.timeout || 7000; // Slightly increased default timeout for clicks

    switch (action.type) {
      case 'navigate':
        if (!action.target) throw new Error('Navigate action requires target URL');
        console.log(`[BrowserAutomation] Navigating to: ${action.target}`);
        await this.navigateWithRetry(action.target, 3);
        console.log(`[BrowserAutomation] Navigation to ${action.target} successful. New URL: ${this.page.url()}`);
        return { url: action.target };

      case 'click':
        if (!action.target && !(action.description?.toLowerCase().includes('search result'))) {
          // Target is required unless it's a search result click that AI will figure out
          console.error('[BrowserAutomation] Click action requires a target selector or a search result description.');
          throw new Error('Click action requires a target selector or a search result description');
        }
        console.log(`[BrowserAutomation] Attempting click. Description: "${action.description}", Planned Target: "${action.target}"`);

        try {
          const description = action.description?.toLowerCase() || "";
          const plannedTarget = action.target || ""; // Target from the AI plan

          // Define specific conditions for different click types
          const isRequestForSpecificLinkInResults =
            (description.includes('search result') || description.includes('first result')) &&
            (description.includes('wikipedia') ||
             description.includes('github') ||
             description.includes('official') ||
             description.includes('docs') ||
             description.includes('documentation') ||
             description.match(/linking to [\w-]+\.(com|org|net|io|dev|ai)/i) || // e.g., "linking to example.com"
             plannedTarget.includes('wikipedia.org') || // Also check target if AI planned it
             plannedTarget.includes('github.com'));

          const isRequestForGenericFirstResult =
            (description.includes('search result') || description.includes('first result')) &&
            !isRequestForSpecificLinkInResults;

          const isRequestForSearchButton =
            plannedTarget.includes('btnK') || // Legacy Google
            description.includes('search button') ||
            description === 'click search'; // Exact phrase for button

          // 1. AI Smart Selection for Specific Links in Search Results
          if (isRequestForSpecificLinkInResults) {
            console.log('[BrowserAutomation] 🧠 Attempting AI smart selection for specific link in search results...');
            await this.page.waitForTimeout(1500); // Wait for results to settle

            try {
              const screenshot = await this.page.screenshot({ fullPage: false });
              const base64Screenshot = screenshot.toString('base64');
              
              const searchResults = await this.page.evaluate(() => {
                const results: { index: number; title: string; url: string; snippet: string; selector: string; }[] = [];
                const resultContainers = document.querySelectorAll('article[data-testid="result"], div.result, div.g, div.yuRUbf, div[data-testid="web-result"], div.fdb > div.result, li.ais-Hits-item'); // Common containers
                
                results_loop: for (let i = 0; i < resultContainers.length; i++) {
                    const container = resultContainers[i];
                    let titleElement = container.querySelector('h2 a, h3 a, a h3, a[data-testid="result-title-a"], span[role="text"] a');
                    let linkElement = container.querySelector('a[href]');
                    
                    if (!titleElement && linkElement && linkElement.closest('h1,h2,h3,h4')) { // If link is inside a heading
                        titleElement = linkElement;
                    } else if (titleElement && !linkElement) { // If title is a link itself
                         linkElement = titleElement as HTMLAnchorElement;
                    }

                    if (titleElement && linkElement) {
                        const title = titleElement.textContent?.trim() || '';
                        const url = (linkElement as HTMLAnchorElement).href;
                        const snippet = container.querySelector('p, span:not([role="text"])')?.textContent?.trim() || container.textContent?.trim().substring(0,150) || '';
                        
                        // Construct a more robust selector
                        let robustSelector = ``;
                        if (container.id) robustSelector = `#${container.id} a[href="${url}"]`;
                        else if (container.getAttribute('data-testid')) robustSelector = `[data-testid="${container.getAttribute('data-testid')}"] a[href="${url}"]`;
                        else robustSelector = `article:nth-of-type(${i + 1}) a[href], div.result:nth-of-type(${i + 1}) a[href]`; // Fallback

                        // Try to make selector more specific to the found link if possible
                        const directLinkSelector = Array.from(container.querySelectorAll('a[href]')).find(a => (a as HTMLAnchorElement).href === url);
                        if (directLinkSelector) {
                            robustSelector = `:scope a[href="${url}"]`; // Use :scope if referring to within the container
                             // To make it globally unique from document root, one would need a full path or unique parent.
                             // For now, let's rely on Playwright's $ to find within the right container later if needed,
                             // or just the direct href match.
                        }


                        results.push({ index: results.length + 1, title, url, snippet, selector: robustSelector });
                        if (results.length >= 10) break results_loop;
                    }
                }
                return results;
              });

              if (!searchResults || searchResults.length === 0) {
                throw new Error('No search results extracted from page for AI analysis.');
              }
              console.log(`[BrowserAutomation] Found ${searchResults.length} potential results for AI analysis.`);
              
              const analysisPrompt = `
                Task: User wants to click a search result: "${action.description}"
                Based on this, which of the following search results is the MOST relevant?
                ${searchResults.map(r => `${r.index}. Title: "${r.title}" | URL: ${r.url}`).join('\n')}
                Respond with ONLY the number of the best result (e.g., "3"). If none seem relevant, respond "0".`;
              
              const analysis = await analyzeScreenshot(base64Screenshot, analysisPrompt);
              const selectedIndex = parseInt(analysis.trim()) - 1;

              if (selectedIndex < 0 || selectedIndex >= searchResults.length) {
                console.warn(`[BrowserAutomation] AI could not select a relevant result (index: ${selectedIndex + 1}). Falling back to first generic result strategy.`);
                 // Explicitly fall through to the generic first result clicker
              } else {
                const selectedResult = searchResults[selectedIndex];
                console.log(`[BrowserAutomation] 🎯 AI selected result #${selectedResult.index}: "${selectedResult.title}" (${selectedResult.url})`);
                
                // Attempt to click the AI chosen result, prioritizing its specific URL
                let finalSelectorToClick = `a[href="${selectedResult.url}"]`; // Prioritize direct href match
                const specificElement = await this.page.$(finalSelectorToClick);

                if (specificElement) {
                    await specificElement.evaluate(node => { if (node.hasAttribute('target')) node.removeAttribute('target'); });
                    await specificElement.click();
                    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
                    console.log(`[BrowserAutomation] ✅ Clicked AI-selected specific link. New URL: ${this.page.url()}`);
                    return { clicked: finalSelectorToClick, type: 'ai-selected-specific-result', title: selectedResult.title };
                } else {
                    // Fallback to the less specific selector if the href direct match fails (e.g. due to trackers)
                    console.warn(`[BrowserAutomation] Could not find AI selected element by direct href, trying selector: ${selectedResult.selector}`);
                    const elementByStoredSelector = await this.page.$(selectedResult.selector);
                    if (elementByStoredSelector) {
                        await elementByStoredSelector.evaluate(node => { if (node.hasAttribute('target')) node.removeAttribute('target'); });
                        await elementByStoredSelector.click();
                        await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
                        console.log(`[BrowserAutomation] ✅ Clicked AI-selected specific link (using stored selector). New URL: ${this.page.url()}`);
                        return { clicked: selectedResult.selector, type: 'ai-selected-specific-result-fallback-selector', title: selectedResult.title };
                    }
                    throw new Error(`AI selected result #${selectedResult.index} ("${selectedResult.title}") but could not find element to click using selector "${finalSelectorToClick}" or "${selectedResult.selector}".`);
                }
              }
            } catch (specificAiError) {
              console.error('[BrowserAutomation] Error during AI smart selection for specific link:', specificAiError);
              // Fall through to generic first result if AI specific selection fails critically
              console.warn('[BrowserAutomation] AI specific selection failed. Falling back to generic first result strategy.');
            }
          }
          
          // 2. Generic "First Search Result" Click (also acts as fallback for failed AI specific selection)
          if (isRequestForGenericFirstResult || (isRequestForSpecificLinkInResults && !this.page.url().startsWith('http'))) { // Second condition is a basic check if navigation happened
            console.log('[BrowserAutomation] 📍 Clicking first available (generic) search result...');
            await this.page.waitForTimeout(500); // Brief wait
            const searchResultSelectors = [ /* ... your extensive list from before ... */
                '[data-result="1"] h2 a', 'article[data-testid="result"]:first-child h2 a', '.result:first-child h2 a',
                '.fdb > .result:first-child h3 a', '#search .g:first-child h3 a', '[data-testid="result"]:first-child a',
                'a[data-testid="result-title-a"]:first-of-type' // Add more general selectors
            ];
            const foundSelector = await this.findElementWithFallbacks(searchResultSelectors, timeout);
            if (foundSelector) {
              console.log(`[BrowserAutomation] Fallback found first result selector: ${foundSelector}. Current URL: ${this.page.url()}`);
              await this.page.evaluate((selector) => { /* remove target */ }, foundSelector);
              await this.page.click(foundSelector);
              await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
              console.log(`[BrowserAutomation] ✅ Clicked fallback first search result. New URL: ${this.page.url()}`);
              return { clicked: foundSelector, type: 'first-generic-result' };
            } else {
              throw new Error('Fallback: No generic first search results found to click.');
            }
          }
          
          // 3. Search Button Click
          else if (isRequestForSearchButton) {
            console.log('[BrowserAutomation] 🔳 Clicking search button...');
            const searchButtonSelectors = [ /* ... your extensive list from before ... */
                'input[name="btnK"]', 'button[type="submit"]', 'button[aria-label="Search"]', '#search_button_homepage'
            ];
            const foundButton = await this.findElementWithFallbacks(searchButtonSelectors, timeout);
            if (foundButton) {
              await this.page.click(foundButton);
              await this.page.waitForLoadState('domcontentloaded', { timeout: 7000 }); // Wait for results
              console.log(`[BrowserAutomation] ✅ Clicked search button. New URL: ${this.page.url()}`);
              return { clicked: foundButton, type: 'search-button' };
            } else {
              // If no button, try Enter in search input (if exists)
                const searchInputSelectors = ['input[name="q"]', 'textarea[name="q"]', 'input#searchbox_input'];
                const searchInput = await this.findElementWithFallbacks(searchInputSelectors, 3000);
              if (searchInput) {
                    console.log('[BrowserAutomation] No search button, pressing Enter in search input.');
                await this.page.focus(searchInput);
                await this.page.keyboard.press('Enter');
                    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
                    return { clicked: 'Enter in search input', searchInput };
                }
              throw new Error('No search button found, and no search input to press Enter in.');
            }
          }
          
          // 4. Generic Click on a Specific Target from the Plan
          else if (plannedTarget) {
            console.log(`[BrowserAutomation] 🎯 Performing generic click on planned target: ${plannedTarget}`);
            await this.page.waitForSelector(plannedTarget, { timeout });
            const elementToClick = await this.page.$(plannedTarget);
            if (elementToClick) {
              const isLink = await elementToClick.evaluate(node => node.tagName === 'A');
              if (isLink) {
                await elementToClick.evaluate(node => { if (node.hasAttribute('target')) node.removeAttribute('target'); });
              }
              await elementToClick.click();
              console.log(`[BrowserAutomation] Attempted generic click on ${plannedTarget}. Checking for navigation...`);
              try {
                await this.page.waitForLoadState('domcontentloaded', { timeout: 7000 }); // Wait for potential navigation
                console.log(`[BrowserAutomation] ✅ Clicked generic element ${plannedTarget}. New URL: ${this.page.url()}`);
              } catch (navError) {
                 console.warn(`[BrowserAutomation] No navigation or timeout after clicking ${plannedTarget}. Current URL: ${this.page.url()}`);
              }
              return { clicked: plannedTarget, type: 'generic-planned-target' };
            } else {
              throw new Error(`Element ${plannedTarget} (from plan) not found for generic click.`);
            }
          }
          
          // If no specific click logic was matched and resolved:
          console.warn(`[BrowserAutomation] Click action for "${description}" did not match any specific click logic and did not resolve.`);
          throw new Error(`Click action for "${description}" could not be resolved.`);

        } catch (error) {
          console.error(`[BrowserAutomation] Click action failed for "${action.description}". Error: ${(error as Error).message}. Current URL: ${this.page?.url()}`);
          const screenshot = await this.page.screenshot({ fullPage: false }); // For AI analysis
          const base64Screenshot = screenshot.toString('base64');
          const analysisContext = `Click failed. User wanted to: "${action.description}". Planned target was: "${action.target}". Error: ${(error as Error).message}. Analyze screenshot for alternative.`;
          const analysis = await analyzeScreenshot(base64Screenshot, analysisContext);
          throw new Error(`Click failed: ${(error as Error).message}. AI Analysis: ${analysis}`);
        }

      case 'type':
        if (!action.target || !action.value) throw new Error('Type action requires target selector and value');
        console.log(`[BrowserAutomation] Typing "${action.value}" into "${action.target}"`);
        await this.page.waitForSelector(action.target, {timeout});
        await this.page.fill(action.target, action.value);
        return { typed: action.value, into: action.target };

      case 'wait':
        const waitTime = action.timeout || 1000;
        console.log(`[BrowserAutomation] Waiting for ${waitTime}ms`);
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
        console.log(`[BrowserAutomation] Taking screenshot. Description: ${action.description}. Current URL: ${this.page.url()}`);
        const timestamp = Date.now();
        const screenshotPath = `screenshot_${timestamp}.png`;
        const fullPageScreenshot = await this.page.screenshot({ path: `public/screenshots/${screenshotPath}`, fullPage: true, type: 'png', animations: 'disabled'});
        const viewportScreenshot = await this.page.screenshot({ fullPage: false, type: 'png', animations: 'disabled' });
        const screenshotData: ScreenshotData = {
          timestamp, description: action.description,
          fullPage: fullPageScreenshot.toString('base64'), viewport: viewportScreenshot.toString('base64'),
          path: screenshotPath, url: await this.page.url(), title: await this.page.title()
        };
        this.screenshots.push(screenshotData);
        return { path: screenshotPath, metadata: screenshotData };

      case 'extract':
        console.log(`[BrowserAutomation] Extracting data. Target: "${action.target || 'page info'}"`);
        let extractedData;
        if (action.target) {
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
          extractedData = await this.page.evaluate(() => ({ title: document.title, url: window.location.href, text: document.body.textContent?.slice(0,1000) }));
        }
        return { extracted: extractedData };

      default:
        console.error(`[BrowserAutomation] Unknown action type: ${action.type}`);
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
    console.log('[BrowserAutomation] close() called.');
    if (this.browser) {
      try {
      await this.browser.close();
        console.log('[BrowserAutomation] Browser instance closed successfully.');
      } catch (closeError) {
        console.error('[BrowserAutomation] Error closing browser:', closeError);
      }
      this.browser = null;
      this.context = null;
      this.page = null;
    } else {
      console.log('[BrowserAutomation] close() called, but no browser instance to close.');
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