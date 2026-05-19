const { chromium } = require('playwright');

class PlaywrightService {
  constructor() {
    this.browser = null;
    this.context = null;
  }

  // Initialize browser
  async initializeBrowser() {
    try {
      this.browser = await chromium.launch({
        headless: true,
      });
      return this.browser;
    } catch (error) {
      console.error('Error launching browser:', error);
      throw error;
    }
  }

  // Create new page context
  async createPage() {
    if (!this.browser) {
      await this.initializeBrowser();
    }
    return await this.browser.newPage();
  }

  // Close browser
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Navigate to URL
  async navigateToUrl(page, url, timeout = 30000) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      return true;
    } catch (error) {
      console.error(`Error navigating to ${url}:`, error);
      throw error;
    }
  }

  // Take screenshot
  async takeScreenshot(page, path) {
    try {
      await page.screenshot({ path });
      return path;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      throw error;
    }
  }

  // Fill form field
  async fillField(page, selector, value) {
    try {
      await page.fill(selector, value);
      return true;
    } catch (error) {
      console.error(`Error filling field ${selector}:`, error);
      throw error;
    }
  }

  // Click element
  async clickElement(page, selector) {
    try {
      await page.click(selector);
      return true;
    } catch (error) {
      console.error(`Error clicking element ${selector}:`, error);
      throw error;
    }
  }

  // Extract text from element
  async getElementText(page, selector) {
    try {
      return await page.$eval(selector, (el) => el.textContent);
    } catch (error) {
      console.error(`Error extracting text from ${selector}:`, error);
      throw error;
    }
  }

  // Wait for element
  async waitForElement(page, selector, timeout = 10000) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.error(`Error waiting for element ${selector}:`, error);
      throw error;
    }
  }

  // LinkedIn job application
  async applyToLinkedInJob(page, jobUrl, applicationData) {
    try {
      await this.navigateToUrl(page, jobUrl);
      
      // Wait for Easy Apply button
      const easyApplyButton = await page.$('button:has-text("Easy Apply")');
      if (!easyApplyButton) {
        throw new Error('Easy Apply button not found');
      }

      await easyApplyButton.click();
      await page.waitForTimeout(2000);

      // Handle form fields dynamically
      // This is simplified - real implementation would need to handle various form types
      const formFields = await page.$$('input, textarea, select');
      
      for (const field of formFields) {
        const name = await field.getAttribute('name');
        if (applicationData[name]) {
          await field.fill(applicationData[name]);
        }
      }

      // Submit application
      const submitButton = await page.$('button:has-text("Submit")');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(3000);
      }

      return { success: true, message: 'Application submitted' };
    } catch (error) {
      console.error('Error applying to LinkedIn job:', error);
      throw error;
    }
  }

  // Indeed job application
  async applyToIndeedJob(page, jobUrl, applicationData) {
    try {
      await this.navigateToUrl(page, jobUrl);
      
      // Wait for apply button
      const applyButton = await page.$('button[class*="apply"]');
      if (!applyButton) {
        throw new Error('Apply button not found');
      }

      await applyButton.click();
      await page.waitForTimeout(2000);

      // Handle form fields
      const formInputs = await page.$$('input, textarea');
      
      for (const input of formInputs) {
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        
        if (applicationData[placeholder] || applicationData[name]) {
          const value = applicationData[placeholder] || applicationData[name];
          await input.fill(value);
        }
      }

      // Submit
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }

      return { success: true, message: 'Application submitted' };
    } catch (error) {
      console.error('Error applying to Indeed job:', error);
      throw error;
    }
  }

  // Extract job details from page
  async extractJobDetails(page) {
    try {
      const jobDetails = await page.evaluate(() => {
        return {
          title: document.querySelector('[data-job-title], h1')?.textContent?.trim(),
          company: document.querySelector('[data-company], [class*="company"]')?.textContent?.trim(),
          description: document.querySelector('[data-job-description], [class*="description"]')?.textContent?.trim(),
          location: document.querySelector('[data-location], [class*="location"]')?.textContent?.trim(),
          salary: document.querySelector('[data-salary], [class*="salary"]')?.textContent?.trim(),
        };
      });

      return jobDetails;
    } catch (error) {
      console.error('Error extracting job details:', error);
      throw error;
    }
  }

  // Search jobs on LinkedIn
  async searchLinkedInJobs(page, query, filters = {}) {
    try {
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`;
      await this.navigateToUrl(page, searchUrl);

      // Apply filters if provided
      if (filters.location) {
        const locationField = await page.$('input[aria-label="City, state, or zip code"]');
        if (locationField) {
          await locationField.fill(filters.location);
          await page.press('input[aria-label="City, state, or zip code"]', 'Enter');
          await page.waitForTimeout(1000);
        }
      }

      // Extract job listings
      const jobs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-job-id]')).map((el) => ({
          id: el.getAttribute('data-job-id'),
          title: el.querySelector('[data-job-card-title]')?.textContent?.trim(),
          company: el.querySelector('[data-job-card-company-name]')?.textContent?.trim(),
          location: el.querySelector('[data-job-card-location]')?.textContent?.trim(),
        }));
      });

      return jobs;
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error);
      throw error;
    }
  }
}

module.exports = new PlaywrightService();
