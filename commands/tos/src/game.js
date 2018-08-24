module.exports = class {
    constructor() {
        this.running = false; //checks if there is a game currently going
        this.moderator = null; //person who starts the game --> will have empowered commands
        this.players = []; //list of people in the game
        this.roles = []; //list of roles in the game
        this.category = null;
        this.botChannel = null;
    }
    reset() { //used to end a game
        this.running = false;
        this.moderator = null;
        this.players = []; 
        this.roles = []; 
        this.category = null;
        this.botChannel = null;
    }
}