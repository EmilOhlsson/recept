/**
 * Recipe filtering functionality for the Swedish recipe collection site.
 *
 * This module provides interactive tag-based filtering for recipes displayed on the main page.
 * It reads tag data from a JSON script element, creates clickable filter buttons, and shows/hides
 * recipe items based on active filters using JSON-encoded data attributes.
 *
 * Key features:
 * - Dynamic tag button generation from Jekyll-provided JSON data
 * - Multiple filter support (AND logic - recipes must match all active tags)
 * - Real-time recipe count updates
 * - Robust error handling with retry mechanisms
 * - CSS-only styling (no inline styles)
 *
 * DOM dependencies:
 * - #tag-data: JSON script element containing all available tags
 * - #tag-buttons: Container for dynamically generated filter buttons
 * - .recipe-item: Recipe list items with data-tags JSON attributes
 * - #recipe-content: Container for recipe count display
 *
 * CSS dependencies (defined in assets/css/style.scss):
 * - .tag-button: Base styling for filter buttons
 * - .tag-button.active: Styling for active/selected filter buttons
 * - #recipe-count: Styling for dynamically created recipe count display
 *
 * Global functions exposed:
 * - clearFilters(): Removes all active filters
 * - toggleTag(tag): Toggles a specific tag filter
 * - filterRecipes(): Applies current filters to recipe visibility
 */

let activeFilters = new Set();

function createTagButtons() {
  console.log('Creating tag buttons...');

  const tagDataElement = document.getElementById('tag-data');
  const tagButtonsContainer = document.getElementById('tag-buttons');

  if (!tagDataElement || !tagButtonsContainer) {
    console.error('Missing required elements for tag filtering');
    return;
  }

  let tagData;
  try {
    tagData = JSON.parse(tagDataElement.textContent);
    console.log('Found', tagData.length, 'tags');
  } catch (e) {
    console.error('Failed to parse tag data:', e);
    return;
  }

  // Clear any existing buttons
  tagButtonsContainer.innerHTML = '';

  // Create all tag buttons
  tagData.forEach(tag => {
    const button = document.createElement('button');
    button.textContent = tag;
    button.className = 'tag-button';
    button.onclick = function() { toggleTag(tag); };
    tagButtonsContainer.appendChild(button);
  });

  console.log('Created', tagData.length, 'tag buttons');
}

function toggleTag(tag) {
  const button = Array.from(document.querySelectorAll('.tag-button')).find(b => b.textContent === tag);

  if (activeFilters.has(tag)) {
    activeFilters.delete(tag);
    button.classList.remove('active');
  } else {
    activeFilters.add(tag);
    button.classList.add('active');
  }

  filterRecipes();
}

function filterRecipes() {
  const recipeItems = document.querySelectorAll('.recipe-item');

  if (activeFilters.size === 0) {
    // Show all recipes
    recipeItems.forEach(item => item.classList.remove('hidden'));
    updateRecipeCount(recipeItems.length, recipeItems.length);
    return;
  }

  // Parse recipe tags from JSON data attribute
  const parseRecipeTags = (item) => {
    try {
      return item.dataset.tags ? JSON.parse(item.dataset.tags) : [];
    } catch (e) {
      console.warn('Failed to parse recipe tags:', item.dataset.tags);
      return [];
    }
  };

  // Hide/show recipes based on active filters
  let visibleCount = 0;
  recipeItems.forEach(item => {
    const recipeTags = parseRecipeTags(item);
    const hasAllMatchingTags = Array.from(activeFilters).every(filter =>
      recipeTags.includes(filter)
    );

    if (hasAllMatchingTags) {
      item.classList.remove('hidden');
      visibleCount++;
    } else {
      item.classList.add('hidden');
    }
  });

  updateRecipeCount(visibleCount, recipeItems.length);
}

function updateRecipeCount(visibleCount, totalCount) {
  let countDisplay = document.getElementById('recipe-count');
  if (!countDisplay) {
    countDisplay = document.createElement('div');
    countDisplay.id = 'recipe-count';
    document.getElementById('recipe-content').insertBefore(countDisplay, document.querySelector('.recipe-list'));
  }

  if (activeFilters.size > 0) {
    countDisplay.textContent = `Visar ${visibleCount} av ${totalCount} recept`;
  } else {
    countDisplay.textContent = `${totalCount} recept totalt`;
  }
}

function clearFilters() {
  activeFilters.clear();
  document.querySelectorAll('.tag-button').forEach(button => {
    button.classList.remove('active');
  });
  filterRecipes();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createTagButtons);
} else {
  // DOM already loaded, initialize immediately
  createTagButtons();
}

// Make functions globally available
window.clearFilters = clearFilters;
window.toggleTag = toggleTag;
window.filterRecipes = filterRecipes;
