const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const Job = require('./models/Job');

const resumePath = path.join(__dirname, 'resume.pdf');
const screenshotDir = path.join(__dirname, 'screenshots');

function getFieldValue(name, placeholder, labelText, type) {
  const lower = `${name} ${placeholder} ${labelText}`.toLowerCase();

  if (/name/.test(lower)) return 'Test User';
  if (/email/.test(lower)) return 'test@gmail.com';
  if (/phone|mobile|contact/.test(lower)) return '9999999999';
  if (/address|city|state|zip|country/.test(lower)) return 'Sample Data';
  if (type === 'email') return 'test@gmail.com';
  if (type === 'tel') return '9999999999';

  return 'Sample Data';
}

async function processJob(jobId) {
  const job = await Job.findById(jobId);
  if (!job) {
    console.error(`No job found for id ${jobId}`);
    return;
  }

  job.status = 'processing';
  await job.save();

  try {
    console.log(`Processing job ${jobId} - ${job.url}`);

    if (!fs.existsSync(resumePath)) {
      throw new Error('Resume file not found: backend/resume.pdf');
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');

    const fields = await page.$$('input, textarea, select');
    console.log(`Found ${fields.length} form field(s)`);

    for (const field of fields) {
      const tagName = await page.evaluate((element) => element.tagName.toLowerCase(), field);
      const type = (await field.getAttribute('type')) || '';
      const name = (await field.getAttribute('name')) || '';
      const placeholder = (await field.getAttribute('placeholder')) || '';
      const labelText = await page.evaluate((element) => {
        const label = element.closest('label');
        return label?.innerText || '';
      }, field);

      if (['hidden', 'button', 'submit', 'image', 'reset'].includes(type)) {
        continue;
      }

      if (type === 'file') {
        console.log('Uploading resume file');
        await field.setInputFiles(resumePath);
        continue;
      }

      if (type === 'checkbox' || type === 'radio') {
        try {
          await field.check();
        } catch (err) {
          console.log('Checkbox/radio skip:', err.message);
        }
        continue;
      }

      if (tagName === 'select') {
        try {
          await field.selectOption({ index: 0 });
        } catch (err) {
          console.log('Select field skip:', err.message);
        }
        continue;
      }

      const value = getFieldValue(name, placeholder, labelText, type);
      try {
        await field.fill(value);
      } catch (err) {
        console.log(`Could not fill field ${name}:${type} - ${err.message}`);
      }
    }

    let clicked = false;
    const applyButton = page.locator('button:has-text("Apply"), button:has-text("Submit")');
    if ((await applyButton.count()) > 0) {
      await applyButton.first().click({ timeout: 10000 });
      clicked = true;
      console.log('Clicked Apply/Submit button');
    } else {
      const submitInput = page.locator('input[type="submit"], input[type="button"]');
      if ((await submitInput.count()) > 0) {
        await submitInput.first().click({ timeout: 10000 });
        clicked = true;
        console.log('Clicked submit input button');
      }
    }

    if (!clicked) {
      console.log('No submit button found, trying Enter key');
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(3000);

    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, `job-${jobId}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

    await browser.close();

    job.status = 'completed';
    job.screenshotPath = screenshotPath;
    job.error = undefined;
    await job.save();
    console.log(`Job ${jobId} completed`);
  } catch (error) {
    console.error('Automation error:', error.message || error);
    job.status = 'failed';
    job.error = error.message || 'Unknown automation error';
    await job.save();
  }
}

module.exports = { processJob };
