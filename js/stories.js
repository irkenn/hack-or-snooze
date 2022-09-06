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
        <span class= "trash-icon hidden">
          <i class = "fas fa-trash"></i>
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
  User.favoriteStarToggler();
  $allStoriesList.show();
  User.addTrashIcon();
}

function retrieveStoryData(evt){
  console.debug("retrieveStoryData");
  evt.preventDefault();
  const newStory = {};
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

async function favoriteHandler(evt){
  console.debug("favoriteHandler");
  evt.preventDefault();
  //light star => add favorite

  if (evt.target.parentElement.className === "star-icon"){
    if (evt.target.classList.contains("far", "fa-star")){
      await User.addFavorite(evt.target.parentElement.parentElement.id);
      evt.target.classList.remove("far", "fa-star");
      evt.target.classList.add("fas", "fa-star");
    }
    //bold star => delete favorite
    else if (evt.target.classList.contains("fas", "fa-star")){
      await User.deleteFavorite(evt.target.parentElement.parentElement.id);
      evt.target.classList.remove("fas", "fa-star");
      evt.target.classList.add("far", "fa-star");
      // await User.putFavoritesOnPage();
    }
  }
      //trash can => delete story
  else if (evt.target.parentElement.classList.contains("trash-icon")){
    console.debug("Trash icon selected");
    await User.deleteStory(evt.target.parentElement.parentElement.id);
    getAndShowStoriesOnStart();
  }

}

$allStoriesList.on("click", favoriteHandler);
$favoriteStoriesList.on("click", favoriteHandler);
