"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */


//const sign = axios.post("https://hack-or-snooze-v3.herokuapp.com/signup", {"user":{"name":"John", "username": "jjdoee", "password":"Welcome123"}}); //Succesfully got a Token

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    return BASE_URL;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** StoryList will:
   *  - call the API
   *  - build an array of Story instances
   *  - make a single StoryList instance out of that
   *  - returns the StoryList instance.
   */
  static async getStories() {

    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  static async addStory(newStory) { 
    //get proper credentials
    const token = localStorage.token;
    const username = localStorage.username;
    //send the story to the API
    let response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      user: {"user": username, "token": token},
      data : { "token": token,
            "story" : newStory},
    });
    response = response.data.story;
    const story = new Story(response);
    //update the DOM with the new story
    hidePageComponents();
    getAndShowStoriesOnStart();  
    return story;
  }

}
/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */
  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });
    
    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }


  static async addFavorite(favoriteStoryId){
    console.debug("addFavorite");
    //get credentials
    const token = localStorage.token;
    const username = localStorage.username;
    //API communication
    let response = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${favoriteStoryId}`,
      method: "POST",
      data : { token: token },
    })
  }

  static async deleteFavorite(favoriteStoryId){
    console.debug("deleteFavorite");
    let response = await axios({
      url: `${BASE_URL}/users/${localStorage.username}/favorites/${favoriteStoryId}`,
      method : "DELETE",
      data : {token : localStorage.token },
    })
  }


  static generateFavoriteMarkup(favorite){
    console.debug("generateFavoriteMarkup");
    return $(`
      <li id="${favorite.storyId}">
          <span class= "star-icon">
            <i class = "fas fa-star"></i>
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

  
  static async putFavoritesOnPage(){
    console.debug("putFavoritesOnPage");
    $favoriteStoriesList.empty();
    await checkForRememberedUser();
    for (let favorite of currentUser.favorites){
      //add items to the Favorites section
      const $favorite = User.generateFavoriteMarkup(favorite);
      $favoriteStoriesList.append($favorite);
    }
    $favoriteStoriesList.show()
  }

  static async favoriteStarToggler(){
    console.debug("favoriteStarToggler");
    await checkForRememberedUser();
    for (let favorite of currentUser.favorites){
      const $liStory = $(`#${favorite.storyId}`).children().children();
      $liStory[0].classList.remove("far", "fa-star");
      $liStory[0].classList.add("fas", "fa-star");
    }
  }

  static async deleteStory(storyId){
    console.debug("deleteStorie");
    try {
      let response = await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: "DELETE",
        data : { token: localStorage.token },
      })
    } catch (err) {
      console.error("deleteStory failed");
    }
  }

  static async addTrashIcon(){
    console.debug("addTrashIcon");
    await checkForRememberedUser();
    for (let story of currentUser.ownStories){
      const $story = $(`#${story.storyId} :nth-child(2)`);
      $story.show();
    }
  }

}

