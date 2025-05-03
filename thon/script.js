// Casual comments for clarity

// Get all important elements
const searchButton = document.getElementById('searchButton');
const recipesDiv = document.getElementById('recipes');
const errorCode = document.getElementById('errorCode');

// When the search button is clicked
searchButton.addEventListener('click', async () => {
  // Clear previous results
  recipesDiv.innerHTML = '';
  errorCode.textContent = '';

  // Grab the 5 ingredients
  const ingredients = [
    document.getElementById('ingredient1').value.trim(),
    document.getElementById('ingredient2').value.trim(),
    document.getElementById('ingredient3').value.trim(),
    document.getElementById('ingredient4').value.trim(),
    document.getElementById('ingredient5').value.trim()
  ].filter(Boolean).join(',+'); // Spoonacular likes '+' between ingredients

  if (!ingredients) {
    errorCode.textContent = "Please enter at least one ingredient!";
    return;
  }

  try {
    // Fetch data from Spoonacular
    const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&apiKey=554dba92ad784afcba27b3d5fd21a970`);
    const data = await response.json();

    if (data.length > 0) {
      // Loop through recipes and create cards
      data.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        recipeCard.innerHTML = `
          <img src="${recipe.image}" alt="${recipe.title}">
          <h3>${recipe.title}</h3>
          <p>Used Ingredients: ${recipe.usedIngredientCount}</p>
        `;

        recipesDiv.appendChild(recipeCard);
      });
    } else {
      errorCode.textContent = "No recipes found with those ingredients.";
    }
  } catch (error) {
    console.error(error);
    errorCode.textContent = "An error occurred. Please try again.";
  }
});
