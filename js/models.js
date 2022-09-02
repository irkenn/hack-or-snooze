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
    // UNIMPLEMENTED: complete this function!
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

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method? Answer: Because the URL is static?

    // query the /stories endpoint (no auth required)
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


//  async function addFavorites(favoriteStoryId){
//     //get credentials
//     const token = localStorage.token;
//     const username = localStorage.username;
//     //API communication
//     let response = await axios({
//       url: `${BASE_URL}/users/${username}/favorites/${favoriteStoryId}`,
//       method: "POST",
//       user: {"user": username, "token": token},
//       data : { "token": token,
//             "favorites" : favoriteStoryId},
//     })
//     console.log("This is response :", response);

//   }
  //##################################################
  /*hice add favorites para enviar mensaje al API el resultado se puede ver
  en currentUser.favorites ahí se muestran todas las historias favoritas.

  Con getFavorites (LN:129), se buscan las historias favoritas que puedan estar almacenadas
  ahi   (¿Qué pasa con currentUser cuando se hace el log out? ¿Se borra el array de 
        favoritos?)
  Lo siguiente es usar el array de get favorites, para hace un loop que pueda 
  agregarlos al DOM, (línea 55 de stories.js)  
  ¿Se usa una Clase y cual sería el objetivo de usar una clase?
  Eliminar favoritos => trabajar en el proceso con la API
  
  La lista se agrega a $favoriteStoriesList, ahí se necesita un  .show() y .hide(), etc
*/
  //##################################################
  async function getFavorites(){

  }


  async function addFavorite(favoriteStoryId){
    //get credentials
    const token = localStorage.token;
    const username = localStorage.username;
    //API communication
    let response = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${favoriteStoryId}`,
      method: "POST",
      data : { token: token },
    })
    //add it to currentUser.favorites
    await putFavoritesOnPage();
  }

  async function deleteFavorite(favoriteStoryId){

    let response = await axios({
      url: `${BASE_URL}/users/${localStorage.username}/favorites/${favoriteStoryId}`,
      method : "DELETE",
      data : {token : localStorage.token },
    })
    console.log("This is delete response :", response);
    await putFavoritesOnPage();
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
}
