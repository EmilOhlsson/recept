---
layout: default
title: Emils receptsamling
---


En liten receptsamling, mest för att det ska gå snabbare på ICA

<div id="tag-filter-container">
  <h3>Filtrera recept på ingredienser och typ</h3>
  <div id="tag-buttons">
    <!-- Tag buttons populated by createTagButtons() in /assets/js/recipe-filter.js -->
  </div>
  <button onclick="clearFilters()" class="clear-filters-btn">Rensa filter</button>
</div>

{% comment %} Collect all tags from all recipes for the filter {% endcomment %}
{% assign all_tags = "" | split: "" %}
{% assign recipes = site.recipes %}
{% for recipe in recipes %}
  {% if recipe.tags %}
    {% assign all_tags = all_tags | concat: recipe.tags %}
  {% endif %}
{% endfor %}
{% assign unique_tags = all_tags | uniq | sort %}

<!-- JSON array of all unique recipe tags for JavaScript filtering -->
<script type="application/json" id="tag-data">
{{ unique_tags | jsonify }}
</script>

{% comment %} Sort all recipes alphabetically by title {% endcomment %}
{% assign sorted_recipes = site.recipes | sort: "title" %}

<div id="recipe-content">
  <h2>Alla recept (alfabetisk ordning)</h2>
  <ul class="recipe-list">
    {% for recipe in sorted_recipes %}
      <li class="recipe-item" data-tags='{{ recipe.tags | jsonify }}'>
        <a href="{{ recipe.url | relative_url }}">{{ recipe.title }}</a>
      </li>
    {% endfor %}
  </ul>
</div>


<script src="{{ '/assets/js/recipe-filter.js' | relative_url }}"></script>
