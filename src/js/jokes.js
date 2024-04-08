const JokeAPI = require("sv443-joke-api");

JokeAPI.getJokes()
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
  });
