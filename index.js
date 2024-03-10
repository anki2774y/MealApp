// DOM get element to get from html
const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('fa-search');
const allMealsEl = document.getElementById('allMeals');
const favMealEl = document.getElementById('favMeal');

// Search Icon and Search Input
let srchIcon = false;
let searchInputTxt = '';

// hiding the input display until we don't need it
searchInput.style.display = 'none';

// event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
searchInput.addEventListener('input', (e) => getMealList(e.target.value));
favMealEl.addEventListener('click', openFavMeal);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// get meal list that matches with the ingredients
function getMealList(input){
    searchInputTxt = input;

    // setting the url based on getting all meal data or only the search input data
    const url = searchInputTxt.length > 0 
                ? 
                    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInputTxt}` 
                :     
                    `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        let html = "";

        // displaying search input field once we get all meals details
        if(!srchIcon) {
            searchBtn.style.display = 'none';
            searchInput.style.display = 'block';
            srchIcon = !srchIcon;
        }
        
        // checking if data has some value or not
        if(data.meals){
            data.meals.forEach(meal => {
                html += `
                    <div class="meal-item" data-id="${meal.idMeal}">
                        <div class="meal-img">
                            <img src="${meal.strMealThumb}" alt="food">                           
                            <i class="fa-regular fa-heart like-btn" onclick="handleLikeBtn('${encodeURIComponent(JSON.stringify(meal))}')"></i>
                        </div>
                        <div class="meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href="#" class="recipe-btn" >Get Recipe</a>
                        </div>
                    </div>
                `;
            });
            mealList.classList.remove('notFound');
        } else{  
            if(searchInputTxt.length > 0) {
                html = `Sorry, we didn't find any meal : ${searchInputTxt.toUpperCase()}!`;
            }
            mealList.classList.add('notFound');
        }
        mealList.innerHTML = html;
        updateUI();
    });
}


// get recipe of the meal
function getMealRecipe(e){
    e.preventDefault();
    if(e.target.classList.contains('recipe-btn')){
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals));
    }
}

// create a modal of the recipie details 
function mealRecipeModal(meal){
    meal = meal[0];
    let html = `
        <h2 class = "recipe-title">${meal.strMeal}</h2>
        <p class = "recipe-category">${meal.strCategory}</p>
        <div class = "recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = "">
        </div>
        <div class = "recipe-link">
            <a href = "${meal.strYoutube}" target = "_blank">Watch Video</a>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}

// getting favourite meal to show the same and the updating that to UI
const favMealLocalStorage = JSON.parse(localStorage.getItem('favouriteMeal'));
const favMeal = [];

// Updating the UI if some meal is liked already
function updateUI() {
    if(favMealLocalStorage) {
        favMeal.push(...favMealLocalStorage);       
        /* ---  WHEN PAGE IS REFRESHED CHECK THE DATA IN LOCAL STORAGE AND UPDATE THE UI ON THAT BASIS OF LIKED OR NOT  --- */
        for (let i = 0; i < favMeal.length; i++) {
            updateLikedMealUI(favMeal[i].idMeal);
        }
    }
}

// Function to handle heart icon click
const handleLikeBtn = (meal) => {
    let data = JSON.parse(decodeURIComponent(meal));
    // Do something with the meal object
    for (let i = 0; i < favMeal.length; i++) {
        if(favMeal[i].idMeal === data.idMeal) {
            favMeal.splice(i, 1);
            updateUnLikedMealUI(data.idMeal);
            return;
        }
    }
    favMeal.push(data);
    updateLikedMealUI(data.idMeal);
}

// Function to update the UI when a meal is liked
function updateLikedMealUI(mealId) {
    const likedIcons = document.querySelectorAll(`.meal-item[data-id="${mealId}"] .like-btn`);
    likedIcons.forEach(icon => {
        icon.style.fontWeight = 900;
    });
    localStorage.setItem('favouriteMeal', JSON.stringify(favMeal));
}

// Function to update the UI when a meal is un-liked
function updateUnLikedMealUI(mealId) {
    const likedIcons = document.querySelectorAll(`.meal-item[data-id="${mealId}"] .like-btn`);
    likedIcons.forEach(icon => {
        icon.style.fontWeight = 500;
    });
    localStorage.setItem('favouriteMeal', JSON.stringify(favMeal));
}

// opening favourite meal page 
function openFavMeal() {
    // to open favourite meal page, to open in new tab - '_blank' is passed
    window.open('./favMeal.html', '_blank');
    localStorage.setItem('favouriteMealPage', 'open');
}