const Discord = require('discord.js');

module.exports.game = class {
    constructor() {
        this.running = false; //checks if there is a game currently going
        this.moderator = null; //person who starts the game --> will have empowered commands
        this.players = []; //Array of GuildMembers, assigned with message.member
        this.roles = []; //Array of role names as strings
        this.assignments = new Discord.Collection(); //Maps players (As GuildMembers) with their roles (As role.object), assigned after start
        this.stage = null; //Either 'Setup', 'Night', 'Processing' 'Day', or 'Trial'
        this.actions = [[], [], [], [], []]; //Array of arrays, organizes actions by priority number
        this.counter = 0; //Counts the number of Nights/Days that have gone by
        this.category = null;
        this.botChannel = null;
        this.origin = null; //Channel where the game was started, where the endcard will go upon game finish
    }

    reset() { //used to end a game
        this.running = false;
        this.moderator = null;
        this.players = []; 
        this.roles = []; 
        this.assignments = new Discord.Collection();
        this.stage = null;
        this.actions = [[], [], [], [], []];
        this.counter = 0;
        this.category = null;
        this.botChannel = null;
        this.origin = null;
    }

    cycleNight() {
        this.counter++;
        this.stage = 'Night';
        const night = new Discord.RichEmbed()
            .setTitle(`${this.stage} ${this.counter}`)
            .setDescription('You have 30 seconds to do something.')
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setTimestamp();
        this.botChannel.send(night);
        setTimeout(() => {
            for (let priority = 0; priority < this.actions.length; priority++) {
                for (const action of this.actions[priority]) {
                    if (action.length == 2) {
                        require(`../${action[1]}.js`).action();
                    } else if (action.length == 3) {
                        require(`../${action[1]}.js`).action(action[0], action[2]);
                    } else {
                        require(`../${action[1]}.js`).action(action[0], action[2], action[3]);
                    }
                }
            }
        }, 30000);
    }
}
module.exports.player = class {
    constructor() {
        this.alive = true;
        this.will = '`Succ my ducc`';
        this.visited = []; //Array of players who visit that night
        this.blocked = false; //Checks if role-blocked
    }
}