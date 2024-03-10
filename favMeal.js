// getting all the favourite meals stored in local storage
let favMeal = JSON.parse(localStorage.getItem('favouriteMeal'));

// DOM get element to get from html
const favMealCntEl = document.getElementsByClassName('favMealCnt');
const mealList = document.getElementById('meal');
const searchInput = document.getElementById('search-input');
    // get recipe of the meal
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const goToHomeEl = document.getElementById('goToHome');
const closePageEl = document.getElementById('closePage');

/*---   --- */
const mealSearchCntEl = document.getElementById('meal-search'); 
const mealResultCntEl = document.getElementById('meal-result')
const mealResultTitleEl = document.getElementById('title');
/*---   --- */

let searchInputTxt = "";

// event listeners
searchInput.addEventListener('input', (e) => showFavMeal(e.target.value));
mealList.addEventListener('click', getMealRecipe);
goToHomeEl.addEventListener('click', openHomePage);
closePageEl.addEventListener('click', closePage);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// Showing the list of favourite meals
function showFavMeal(inputVal) {
    let isPresent = false;
    let html = "";
    inputVal ? (searchInputTxt = inputVal) : (searchInputTxt = inputVal);
    if (searchInputTxt) {
        // checking if favourite meal is empty or not
        if (favMeal && favMeal.length > 0) {
            favMeal.forEach(meal => {
                // will match the searched item and display it
                if (meal.strMeal.toLowerCase().includes(searchInputTxt.toLowerCase())) {
                    isPresent = true;
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
                }
            })
            // if the searched meal is not present in the favourite meals
            if(!isPresent) {
                html = `Sorry, we didn't find any meal : ${searchInputTxt.toUpperCase()}!`;
                mealList.classList.add('notFound');
            }
        }       
    } else {
        // checking if favourite meal is present or not
        if(favMeal && favMeal.length > 0) {
            // will show all the favourite meals
            favMeal.forEach(meal => {
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
        } else {
                html = `Sorry, You had not added any favourite meal!`;
                mealList.classList.add('notFound');
                
                /*--- Hiding the search input field and title: your search results  --- */
                mealSearchCntEl.style.display = 'none';
                mealResultTitleEl.style.display = 'none';
                mealResultCntEl.style.marginTop = '15%';
        }
    }
    mealList.innerHTML = html;
    updateUI();
}

showFavMeal();

function getMealRecipe(e){
    e.preventDefault();
    if(e.target.classList.contains('recipe-btn')){
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals));
    }
}

// create a modal
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

// like button
function updateUI() {
    if(favMeal) {
        /* ---  WHEN PAGE IS REFRESHED CHECK THE DATA IN LOCAL STORAGE AND UPDATE THE UI ON THAT BASIS OF LIKED OR NOT  --- */
        for (let i = 0; i < favMeal.length; i++) {
            // console.log(favMeal[i].idMeal);
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
            updateUnLikedMealUI(data.idMeal);
            return;
        }
    }
}

// Function to update the UI when a meal is liked
function updateLikedMealUI(mealId) {
    const likedIcons = document.querySelectorAll(`.meal-item[data-id="${mealId}"] .like-btn`);
    likedIcons.forEach(icon => {
        icon.style.fontWeight = 900;
    });
    localStorage.setItem('favouriteMeal', JSON.stringify(favMeal));
}

function updateUnLikedMealUI(mealId) {
    // Select the meal item with the given ID and remove it from the meal list
    const mealItemToRemove = document.querySelector(`.meal-item[data-id="${mealId}"]`);

    if (mealItemToRemove) {
        mealItemToRemove.remove(); // Remove the meal item from the UI
    }
    
    // Remove the meal from the favMeal array
    favMeal = favMeal.filter(meal => meal.idMeal !== mealId);

    // Update the local storage with the modified favMeal array
    localStorage.setItem('favouriteMeal', JSON.stringify(favMeal));

    // if favourite meal is not present then we should be showing "No favorite meals added"
    if(favMeal.length === 0) {
        showFavMeal();
    }
}

// opening favourite meal page 
function openHomePage() {
    // to open favourite meal page, to open in new tab - '_blank' is passed
    window.location.href = './index.html';
}

function closePage() {
    window.close();
}

// Check for changes to the localStorage and reload if it is true
window.addEventListener('storage', function (event) {
    this.location.reload();
});
