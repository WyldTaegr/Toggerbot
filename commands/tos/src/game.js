class Game {
    constructor() {
        running: false; //checks if there is a game currently going
        moderator: null; //person who starts the game --> will have empowered commands
        players: []; //list of people in the game
        roles: []; //list of roles in the game
        category: null;
        botChannel: null;
    }
}

module.exports = Game;