module.exports = class {
    constructor() {
        this.running = false; //checks if there is a game currently going
        this.starting = false; //checks if the game is in the setup stage
        this.moderator = null; //person who starts the game --> will have empowered commands
        this.players = []; //Array of GuildMembers, assigned with message.member
        this.roles = []; //list of roles in the game
        this.category = null;
        this.botChannel = null;
        this.origin = null; //Channel where the game was started, where the endcard will go upon game finish
    }
    reset() { //used to end a game
        this.running = false;
        this.starting = false;
        this.moderator = null;
        this.players = []; 
        this.roles = []; 
        this.category = null;
        this.botChannel = null;
    }
}