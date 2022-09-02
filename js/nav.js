"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Make the story submit form appear in the page */

function showSubmitForm(evt){
  console.debug("submitClick", evt);
  $favoriteStoriesList.hide();
  $submitForm.show();
  putStoriesOnPage();

}

$navSubmitStory.on("click", showSubmitForm);


/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);



/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserFeatures.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navFavoriteClick(evt){
  console.debug("navFavoriteClick", evt);
  hidePageComponents();
  putFavoritesOnPage();
}

$navFavoriteStory.on("click", navFavoriteClick);



$starIcon