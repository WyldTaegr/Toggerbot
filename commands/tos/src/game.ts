import Discord, { GuildMember, Message } from "discord.js"
//@ts-ignore
import { Menu } from 'reaction-core';
import { shuffle, emojis as _emojis, isUndefined } from '../../../utils';
import { _Player, Action } from './player';

export enum Stage {
    Setup = "Setup",
    Night = "Night",
    Processing = "Processing",
    Day = "Day",
    Trial = "Trial",
    Ended = "Ended",
}

class MenuChannel extends Discord.TextChannel {
    sendMenu?: (message: any) => Promise<Message>; //Any should be Menu - Rip no types in reaction-core
}

export class Game {
    running: boolean;
    moderator: Discord.GuildMember | null;
    players: Discord.GuildMember[];
    roles: string[];
    assignments: Discord.Collection<GuildMember, _Player>
    stage: Stage;
    actions: Array<Action[]>;
    counter: number;
    category: Discord.CategoryChannel | Discord.TextChannel | Discord.VoiceChannel | null;
    announcements: MenuChannel | null;
    origin: Discord.TextChannel | null;
    constructor() {
        this.running = false; //checks if there is a game currently going
        this.moderator = null; //person who starts the game --> will have empowered commands
        this.players = []; //Array of GuildMembers, assigned with message.member
        this.roles = []; //Array of role names as strings
        this.assignments = new Discord.Collection(); //Maps players (As GuildMembers) with their roles (As role.object), assigned after start
        this.stage = Stage.Ended; //Either 'Setup', 'Night', 'Processing' 'Day', 'Trial', or 'Ended'
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
        this.stage = Stage.Ended;
        this.actions = [[], [], [], [], []];
        this.counter = 0;
        this.category = null;
        this.announcements = null;
        this.origin = null;
    }

    cycleNight() {
        const client = require('../../../index.ts')

        this.counter++;
        this.stage = Stage.Night;

        //this.players.filter(member => this.assignments.get(member).alive).forEach(player => this.nightMessage(player));
        const buttons: Object[] = [];
        
        const playerList = this.players.filter(member => {
            const player = this.assignments.get(member)
                if (isUndefined(player)) return;
            return player.alive;
        });

        let playerSelection = '';

        const emojis = shuffle(_emojis);

        playerList.forEach((member, index) => {
            const emoji = emojis[index];
            playerSelection = playerSelection.concat(emoji, ' - ');

            if (member.nickname) {
                playerSelection = playerSelection.concat(member.nickname, ' or ');
            }
            playerSelection = playerSelection.concat(member.user.username, '\n');
            buttons.push({
                emoji: emoji,
                run: async (user: Discord.User, message: Discord.Message) => {
                    const dm = await user.createDM();
                    if (user.partOfTos != message.guild.id) return dm.send("You're not playing.");
                    const agent = this.assignments.get(message.guild.members.get(user.id));
                    const receiver = this.assignments.get(member);
                    const { View } = require(`../roles/${agent.name}`);
                    const failureReason = agent.checkSelection(receiver);
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
        const message = new Menu(embed, buttons);
        client.handler.addMenus(message);
        let messageId: string; //Used to eventually remove the menu during Processing stage
        this.announcements.sendMenu(message).then(message => messageId = message.id);

        setTimeout(() => {
            this.processNight(messageId);
        }, 30000);
    }

    processNight(menu) {
        const client = require('../../../index.ts')

        this.stage = Stage.Processing;
            client.handler.removeMenu(menu);
            this.announcements.send('Processing the night...');
            this.announcements.startTyping();
            this.players.forEach((member) => {
                const player = this.assignments.get(member);
                if (player.target) {
                    const priority = player.priority - 1; //Subtract 1 for array indexing!
                    this.actions[priority].push({
                        agent: player, 
                        receiver: this.assignments.get(player.target),
                    });
                    player.target = null; //clean-up for next cycle
                }
            })
            for (const priority of this.actions) {
                for (const action of priority) {
                    if (action.agent.checkAction()) action.agent.action(action);
                }
            }
            this.announcements.stopTyping(true);
    }
}