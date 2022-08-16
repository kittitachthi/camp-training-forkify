import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import fracty from 'fracty';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

//from percel
/* if (module.hot) {
  module.hot.accept();
} */

const controlRecipes = async function () {
  try {
    //get id
    const id = window.location.hash.slice(1);

    //guard cluse
    if (!id) return;
    //loading spinner
    recipeView.renderSpinner();

    //0) Update result view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    //1)Update bookmark
    bookmarksView.update(model.state.bookmarks);

    //2)loading recipe
    await model.loadRecipe(id);

    //3)rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    //1 get search query
    const query = searchView.getQuery();

    //guard cluse
    if (!query) return;

    //loading spinner
    resultsView.renderSpinner();

    //2 load search results
    await model.loadSearchResults(query);

    //3 render result
    /* resultsView.render(model.state.search.results); */
    resultsView.render(model.getSearchResultsPage());

    //4 render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //1 render new result
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2 render new pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe serving (in state)
  model.updateServings(newServings);

  //update the recipe view
  /* recipeView.render(model.state.recipe); */
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1. Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.delectBookmark(model.state.recipe.id);

  //2. Update recipe view
  recipeView.update(model.state.recipe);

  //3. Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //upload new recipe data
    await model.uploadRecipe(newRecipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //sucess message
    addRecipeView.renderMessage();

    //render bookmark
    bookmarksView.render(model.state.bookmarks);

    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    /* window.history.back() */

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

//listen to event on window when hash change call controlRecipes which render recipe zone.

//smart way to do if we have many event to do at the same timr by order.
/* ['hashchange', 'load'].forEach(ev =>
  window.addEventListener(ev, controlRecipes)
); */

/* window.addEventListener('hashchange', controlRecipes);
window.addEventListener('load', controlRecipes); */
