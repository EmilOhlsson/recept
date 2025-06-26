const { chromium } = require('playwright');

async function testBrowserLogs() {
  console.log('Starting browser test with console logging...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    console.log(logEntry);
    consoleLogs.push(logEntry);
  });
  
  // Capture JavaScript errors
  page.on('pageerror', error => {
    const errorEntry = `[ERROR] ${error.message}`;
    console.log(errorEntry);
    consoleLogs.push(errorEntry);
  });
  
  try {
    // Navigate to the Jekyll site
    console.log('Navigating to http://localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    // Wait for JavaScript to execute
    await page.waitForTimeout(5000);
    
    // Check if tag buttons are present
    const tagButtons = await page.$$('.tag-button');
    console.log(`Found ${tagButtons.length} tag buttons`);
    
    // Check if tag data is present
    const tagDataExists = await page.$('#tag-data');
    console.log('Tag data element exists:', !!tagDataExists);
    
    // Get the actual tag data content
    if (tagDataExists) {
      const tagDataContent = await page.evaluate(() => {
        const element = document.getElementById('tag-data');
        return element ? element.textContent : null;
      });
      console.log('Tag data content length:', tagDataContent ? tagDataContent.length : 0);
      console.log('Tag data preview:', tagDataContent ? tagDataContent.substring(0, 100) + '...' : 'null');
    }
    
    // Test clicking a tag button if any exist
    if (tagButtons.length > 0) {
      console.log('Testing first tag button click...');
      await tagButtons[0].click();
      await page.waitForTimeout(1000);
      
      // Check recipe count after filtering
      const recipeCount = await page.evaluate(() => {
        const countElement = document.getElementById('recipe-count');
        return countElement ? countElement.textContent : null;
      });
      console.log('Recipe count after filtering:', recipeCount);
    }
    
    // Take screenshot
    await page.screenshot({ path: '/home/kotte/workspace/recept/browser-test-screenshot.png', fullPage: true });
    console.log('Screenshot saved to browser-test-screenshot.png');
    
  } catch (error) {
    console.error('Error during test:', error);
    consoleLogs.push(`[ERROR] ${error.message}`);
  }
  
  // Save console logs
  const fs = require('fs');
  fs.writeFileSync('/home/kotte/workspace/recept/browser-console-logs.txt', consoleLogs.join('\n'));
  console.log('Console logs saved to browser-console-logs.txt');
  
  await browser.close();
}

testBrowserLogs().catch(console.error);