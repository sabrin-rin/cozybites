document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('nav-links');

  const handleResize = () => {
    if (window.innerWidth < 768) {
      menuToggle.style.display = 'block';
    } else {
      menuToggle.style.display = 'none';
      navLinks.classList.remove('show');
    }
  };

  handleResize(); // Initial check

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });

  window.addEventListener('resize', handleResize);

  displaySearchHistory(); // Moved here so it runs only once on load
});
// Get all important elements
const searchButton = document.getElementById('searchButton');
const recipesDiv = document.getElementById('recipes');
const errorCode = document.getElementById('errorCode');
const ingredientInputs = document.querySelectorAll('.ingredient-input');

// --- Autocomplete Setup ---
let datalist = document.createElement('datalist');
datalist.id = 'ingredient-autofill';
document.body.appendChild(datalist);

// Link all inputs to the same datalist
ingredientInputs.forEach(input => {
  input.setAttribute('list', 'ingredient-autofill');

  input.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) return;

    try {
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(query)}&number=5&apiKey=554dba92ad784afcba27b3d5fd21a970`);
      const data = await response.json();

      datalist.innerHTML = ''; // Clear old options
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        datalist.appendChild(option);
      });
    } catch (error) {
      console.error("Autocomplete API error:", error);
    }
  });
});

// --- Search Button Logic ---
searchButton.addEventListener('click', async () => {
  recipesDiv.innerHTML = '';
  errorCode.textContent = '';

  const ingredients = Array.from(ingredientInputs)
    .map(input => input.value.trim())
    .filter(Boolean)
    .join(',+'); // format for Spoonacular

  if (!ingredients) {
    errorCode.textContent = "Please enter at least one ingredient!";
    return;
  }

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&apiKey=554dba92ad784afcba27b3d5fd21a970`);
    const data = await response.json();

    if (data.length > 0) {
      data.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';

        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' recipe')}`;

        recipeCard.innerHTML = `
          <img src="${recipe.image}" alt="${recipe.title}">
          <h3>${recipe.title}</h3>
          <p id="used">Used Ingredients: ${recipe.usedIngredientCount}</p>
          <a href="${youtubeSearchUrl}" target="_blank" class="yt-link">Watch on YouTube</a>
        `;

        recipesDiv.appendChild(recipeCard);
      });

      saveSearchHistory(ingredients);
      displaySearchHistory();
    } else {
      errorCode.textContent = "No recipes found with those ingredients.";
    }
  } catch (error) {
    console.error("Recipe search error:", error);
    errorCode.textContent = "An error occurred. Please try again.";
  }
});

// --- History Logic ---
function saveSearchHistory(ingredients) {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(ingredients)) {
    history.unshift(ingredients);
    history = history.slice(0, 10); // Keep only 10 entries
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}

function displaySearchHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  historyList.innerHTML = '';

  history.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry.replace(/\+\+/g, ', ');
    li.classList.add('history-item');
    li.addEventListener('click', () => {
      const values = entry.split(',+');
      ingredientInputs.forEach((input, index) => {
        input.value = values[index] || '';
      });
    });
    historyList.appendChild(li);
  });
}

// Load history on page load
document.addEventListener('DOMContentLoaded', () => {
  displaySearchHistory();
});
let lastScrollTop = 0;

const slideElements = document.querySelectorAll('.slide-in');

function handleScroll() {
  const currentScroll = window.pageYOffset;

  slideElements.forEach(el => {
    const rect = el.getBoundingClientRect();

    if (rect.top < window.innerHeight - 100 && currentScroll > lastScrollTop) {
      // Scrolling down
      el.classList.add('visible');
      el.classList.remove('fade-out');
    } else if (rect.top > window.innerHeight && currentScroll < lastScrollTop) {
      // Scrolling up
      el.classList.remove('visible');
      el.classList.add('fade-out');
    }
  });

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Avoid negative scroll
}

window.addEventListener('scroll', handleScroll);