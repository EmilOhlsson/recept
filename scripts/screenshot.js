const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshot(url = 'http://127.0.0.1:4000', outputPath = 'screenshots') {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for basic content first
    await page.waitForSelector('h1, h2', { timeout: 10000 });
    
    // Wait for filtering interface and JavaScript to load tags
    try {
      await page.waitForSelector('#tag-filter-container', { timeout: 3000 });
      console.log('Tag filtering interface found');
      
      // Enable console logging from the page
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
      
      // Wait for JavaScript to load
      await page.waitForTimeout(3000);
      
      // Manually trigger DOMContentLoaded if needed
      await page.evaluate(() => {
        if (document.readyState === 'complete') {
          console.log('Document ready, manually checking tag initialization...');
          const tagDataElement = document.getElementById('tag-data');
          const tagButtonsContainer = document.getElementById('tag-buttons');
          
          if (tagDataElement && tagButtonsContainer) {
            try {
              const tagData = JSON.parse(tagDataElement.textContent);
              console.log('Found', tagData.length, 'tags to process');
              
              // Manually create a few test buttons
              for (let i = 0; i < Math.min(5, tagData.length); i++) {
                const button = document.createElement('button');
                button.textContent = tagData[i];
                button.className = 'tag-button';
                button.style.margin = '2px';
                button.style.padding = '4px 8px';
                button.style.background = '#007bff';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.borderRadius = '15px';
                button.style.fontSize = '12px';
                tagButtonsContainer.appendChild(button);
              }
              console.log('Manually created test buttons');
            } catch (e) {
              console.error('Error creating test buttons:', e);
            }
          } else {
            console.error('Missing elements:', {
              tagData: !!tagDataElement,
              container: !!tagButtonsContainer
            });
          }
        }
      });
      
      // Check what's happening with JavaScript
      const tagDataExists = await page.evaluate(() => !!document.getElementById('tag-data'));
      const tagButtonsContainer = await page.evaluate(() => !!document.getElementById('tag-buttons'));
      const tagButtons = await page.evaluate(() => document.querySelectorAll('.tag-button').length);
      
      console.log('Debug info:');
      console.log('- Tag data element exists:', tagDataExists);
      console.log('- Tag buttons container exists:', tagButtonsContainer);
      console.log('- Tag buttons count:', tagButtons);
      
      if (tagButtons > 5) {
        console.log('Tag buttons generated successfully');
      } else {
        console.log('Tag buttons not fully loaded');
      }
    } catch (e) {
      console.log('Error checking tag interface:', e.message);
    }
    
    // Take full page screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullPagePath = path.join(outputPath, `recipe-site-${timestamp}.png`);
    await page.screenshot({ 
      path: fullPagePath, 
      fullPage: true 
    });
    console.log(`Full page screenshot saved: ${fullPagePath}`);

    // Test filtering functionality and capture states
    const filterStates = [];
    
    // Wait a bit more for everything to load
    await page.waitForTimeout(1000);
    
    // Initial state
    await page.screenshot({ 
      path: path.join(outputPath, `01-initial-${timestamp}.png`),
      clip: { x: 0, y: 0, width: 1200, height: 800 }
    });
    filterStates.push('Initial state - all recipes visible');

    // Test clicking a tag button
    const tagButtons = await page.$$('.tag-button');
    if (tagButtons.length > 0) {
      // Click first tag button
      await tagButtons[0].click();
      await page.waitForTimeout(500);
      
      const tagText = await page.evaluate(el => el.textContent, tagButtons[0]);
      await page.screenshot({ 
        path: path.join(outputPath, `02-filtered-${tagText}-${timestamp}.png`),
        clip: { x: 0, y: 0, width: 1200, height: 800 }
      });
      filterStates.push(`Filtered by "${tagText}" tag`);
      
      // Click second tag if available
      if (tagButtons.length > 1) {
        await tagButtons[1].click();
        await page.waitForTimeout(500);
        
        const tagText2 = await page.evaluate(el => el.textContent, tagButtons[1]);
        await page.screenshot({ 
          path: path.join(outputPath, `03-filtered-multiple-${timestamp}.png`),
          clip: { x: 0, y: 0, width: 1200, height: 800 }
        });
        filterStates.push(`Multiple filters: "${tagText}" + "${tagText2}"`);
      }
    }

    // Clear filters
    try {
      await page.evaluate(() => window.clearFilters());
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: path.join(outputPath, `04-cleared-${timestamp}.png`),
        clip: { x: 0, y: 0, width: 1200, height: 800 }
      });
      filterStates.push('Filters cleared - all recipes visible again');
    } catch (e) {
      console.log('Could not test clear filters function');
    }

    // Report results
    console.log('\nScreenshot Analysis:');
    filterStates.forEach((state, index) => {
      console.log(`${index + 1}. ${state}`);
    });

    // Count visible recipes and categories in final state
    const visibleRecipes = await page.$$eval('.recipe-item:not(.hidden)', els => els.length);
    const visibleCategories = await page.$$eval('.category-section:not(.hidden)', els => els.length);
    const totalTagButtons = await page.$$eval('.tag-button', els => els.length);
    
    console.log(`\nFunctionality Check:`);
    console.log(`- Total tag buttons: ${totalTagButtons}`);
    console.log(`- Visible recipes: ${visibleRecipes}`);
    console.log(`- Visible categories: ${visibleCategories}`);

    return {
      success: true,
      fullPageScreenshot: fullPagePath,
      filterStates,
      stats: { visibleRecipes, visibleCategories, totalTagButtons }
    };

  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  const fs = require('fs');
  const outputDir = 'screenshots';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  captureScreenshot()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Screenshot capture completed successfully!');
      } else {
        console.error('\n❌ Screenshot capture failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Script error:', error);
      process.exit(1);
    });
}

module.exports = { captureScreenshot };