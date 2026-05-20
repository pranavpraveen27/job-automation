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
    const page = await this.browser.newPage();
    page.setDefaultTimeout(Number(process.env.PLAYWRIGHT_ACTION_TIMEOUT || 10000));
    return page;
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

  normalizeFieldKey(value = '') {
    return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  getApplicationValue(applicationData = {}, ...fieldKeys) {
    const entries = Object.entries(applicationData);
    const normalizedFields = fieldKeys
      .filter(Boolean)
      .map((key) => this.normalizeFieldKey(key));

    const match = entries.find(([key]) => normalizedFields.includes(this.normalizeFieldKey(key)));
    return match ? String(match[1] ?? '') : '';
  }

  async getFieldHints(page, field) {
    return await field.evaluate((element) => {
      const labels = Array.from(element.labels || []).map((label) => label.textContent || '');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      if (ariaLabelledBy) {
        labels.push(
          ...ariaLabelledBy
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent || '')
        );
      }

      const parentText = element.closest('label, div, fieldset')?.textContent || '';
      return [
        element.getAttribute('name'),
        element.getAttribute('placeholder'),
        element.getAttribute('aria-label'),
        element.getAttribute('id'),
        element.getAttribute('autocomplete'),
        ...labels,
        parentText,
      ].filter(Boolean);
    });
  }

  async fillFormFields(page, applicationData = {}) {
    const fields = await page.$$('input, textarea, select');
    const filled = [];

    for (const field of fields) {
      const tagName = await field.evaluate((element) => element.tagName.toLowerCase());
      const type = (await field.getAttribute('type')) || '';
      const lowerType = type.toLowerCase();
      const disabled = await field.evaluate((element) => element.disabled || element.readOnly);
      if (disabled || ['hidden', 'file', 'submit', 'button', 'reset', 'image'].includes(lowerType)) {
        continue;
      }

      const hints = await this.getFieldHints(page, field);
      const value = this.getApplicationValue(applicationData, ...hints);
      if (!value) {
        continue;
      }

      try {
        if (tagName === 'select') {
          const selected = await field.selectOption({ label: value }).catch(async () => (
            field.selectOption(value)
          ));
          if (selected.length) filled.push({ field: hints[0] || hints[1] || tagName, value });
          continue;
        }

        if (lowerType === 'checkbox' || lowerType === 'radio') {
          const normalizedValue = this.normalizeFieldKey(value);
          if (['yes', 'true', '1', 'checked'].includes(normalizedValue)) {
            await field.check();
            filled.push({ field: hints[0] || hints[1] || lowerType, value });
          }
          continue;
        }

        await field.fill(value);
        filled.push({ field: hints[0] || hints[1] || tagName, value });
      } catch (error) {
        console.warn(`Skipping field ${hints[0] || hints[1] || tagName}: ${error.message}`);
      }
    }

    return filled;
  }

  async clickFirstAvailable(page, selectors) {
    for (const selector of selectors) {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        return selector;
      }
    }
    return null;
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

      const filledFields = await this.fillFormFields(page, applicationData);

      // Submit application
      const submitSelector = await this.clickFirstAvailable(page, [
        'button:has-text("Submit application")',
        'button:has-text("Submit")',
        'button[aria-label*="Submit"]',
      ]);
      if (submitSelector) {
        await page.waitForTimeout(3000);
      }

      return { success: true, message: submitSelector ? 'Application submitted' : 'Application form filled', filledFields };
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

      const filledFields = await this.fillFormFields(page, applicationData);

      // Submit
      const submitSelector = await this.clickFirstAvailable(page, [
        'button[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Apply")',
      ]);
      if (submitSelector) {
        await page.waitForTimeout(3000);
      }

      return { success: true, message: submitSelector ? 'Application submitted' : 'Application form filled', filledFields };
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
