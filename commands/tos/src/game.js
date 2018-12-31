const Discord = require('discord.js');
const RC = require('reaction-core');
const utils = require('../../../utils.js');

const Game = class {
    constructor() {
        this.running = false; //checks if there is a game currently going
        this.moderator = null; //person who starts the game --> will have empowered commands
        this.players = []; //Array of GuildMembers, assigned with message.member
        this.roles = []; //Array of role names as strings
        this.assignments = new Discord.Collection(); //Maps players (As GuildMembers) with their roles (As role.object), assigned after start
        this.stage = null; //Either 'Setup', 'Night', 'Processing' 'Day', or 'Trial'
        this.actions = [[], [], [], [], []]; //Array of arrays, organizes actions by priority number; [role of action-caller as role.object.name, caller as GuildMember, target as GuildMember]
        this.counter = 0; //Counts the number of Nights/Days that have gone by
        this.category = null;
        this.announcements = null;
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
        this.announcements = null;
        this.origin = null;
    }

    cycleNight() {
        const client = require('../../../index.js')

        this.counter++;
        this.stage = 'Night';

        //this.players.filter(member => this.assignments.get(member).alive).forEach(player => this.nightMessage(player));
        const buttons = [];
        
        const playerList = this.players.filter(member => this.assignments.get(member).alive);

        let playerSelection = '';

        const emojis = utils.shuffle(utils.emojis);

        playerList.forEach((member, index) => {
            const emoji = emojis[index];
            playerSelection = playerSelection.concat(emoji, ' - ');

            if (member.nickname) {
                playerSelection = playerSelection.concat(member.nickname, ' or ');
            }
            playerSelection = playerSelection.concat(member.user.username, '\n');
            buttons.push({
                emoji: emoji,
                run: async (user, message) => {
                    const dm = await user.createDM();
                    if (user.partOfTos != message.guild.id) return dm.send("You're not playing.");
                    const agent = this.assignments.get(message.guild.members.get(user.id));
                    const receiver = this.assignments.get(member);
                    const { View } = require(`../roles/${agent.name}`);
                    const failureReason = agent.checkSelection(agent, receiver);
                    if (failureReason) return dm.send(failureReason);
                    agent.target = member; //Used to keep track of whether the person has already selected a target
                    const embed = new Discord.RichEmbed()
                        .setTitle(`You have targeted *${member.nickname || member.user.username}* for tonight.`)
                        .setColor(View.color)
                        .setThumbnail(View.pictureUrl);
                    dm.send(embed);
                }
            })
        })

        const embed = new Discord.RichEmbed()
            .setTitle(`${this.stage} ${this.counter}`)
            .setDescription('You have 30 seconds to do something.')
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .addField('Alive:', playerSelection)
            .setFooter('Set your target for tonight by reacting below');
        const message = new RC.Menu(embed, buttons);
        client.handler.addMenus(message);
        this.announcements.sendMenu(message);

        setTimeout(() => {
            this.processNight();
        }, 30000);
    }

    processNight() {
        this.stage = 'Processing';
            this.announcements.send('Processing the night...');
            this.players.forEach((member) => {
                const player = this.assignments.get(member);
                if (player.target) {
                    const priority = player.priority - 1; //Subtract 1 for array indexing!
                    this.actions[priority].push([player.name, member, player.target]);
                    player.target = null; //clean-up for next cycle
                }
            })
            for (let priority = 0; priority < this.actions.length; priority++) {
                for (const action of this.actions[priority]) {
                    const agent = this.assignments.get(action[1]);
                    if (!agent.checkAction()) return;
                    if (action.length == 2) {
                        require(`../roles/${action[0]}.js`).action();
                    } else if (action.length == 3) {
                        require(`../roles/${action[0]}.js`).action(action[1], action[2]);
                    } else {
                        require(`../roles/${action[0]}.js`).action(action[1], action[2], action[3]);
                    }
                }
            }
    }
}
const Player = class {
    constructor() {
        this.alive = true;
        this.will = '`Succ my ducc`';
        this.visited = []; //Array of players as role.objects who visit that night
        this.blocked = false; //Checks if role-blocked
        this.target = null; //GuildMember: targeted player for nighttime action
    }

    checkSelection(agent, receiver) { //Checks if the player can be selected as a target during Night stage

    }

    checkAction() { //Checks if action can be carried out during Processing stage
        if (!this.alive) return false;
        if (this.blocked) return false;
        return true;
    }
}

module.exports = { Game, Player };