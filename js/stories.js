"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup");

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class= "star-icon">
          <i class = "far fa-star"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/*agregar event listener a los íconos de estrella y trash
para estrella, extraer storId y alimentar addToFavorites con ese parámetro
para trash crear función para eliminar las historias propias.
*/

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $favoriteStoriesList.hide()
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//##############################################
function generateFavoriteMarkup(favorite){
  console.debug("generateFavoriteMarkup", favorite);
  return $(`
    <li id="${favorite.storyId}">
        <span class= "star-icon">
          <i class = "far fa-star"></i>
        </span>
        <span class= "trash-icon">
          <i class = "fas fa-trash"></i>
        </span>
        <a href="${favorite.url}" target="a_blank" class="favorite-link">
          ${favorite.title}
        </a>
        <small class="favorite-hostname">(${favorite.url})</small>
        <small class="favorite-author">by ${favorite.author}</small>
        <small class="favorite-user">posted by ${favorite.username}</small>
      </li>
  `)

}

//##############################################

async function putFavoritesOnPage(){
  console.debug("putFavoritesOnPage");
  $favoriteStoriesList.empty();
  await checkForRememberedUser();
  for (let favorite of currentUser.favorites){
    const $favorite = generateFavoriteMarkup(favorite);
    $favoriteStoriesList.append($favorite);
  }
  $favoriteStoriesList.show()
}



function retrieveStoryData(evt){
  evt.preventDefault();
  const newStory = {};
  console.debug("retrieveStoryData");
  newStory.author = $authorInput.val();
  newStory.title = $titleInput.val();
  newStory.url = $urlInput.val();
  //empty input fields
  $authorInput.val("");
  $titleInput.val("");
  $urlInput.val("");
  $submitForm.hide();
  return StoryList.addStory(newStory);
}

$submitForm.on("submit", retrieveStoryData);