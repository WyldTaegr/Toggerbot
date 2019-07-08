import Discord, { GuildMember, Message } from "discord.js"
//@ts-ignore
import { Menu } from 'reaction-core';
import { shuffle, emojis as _emojis, isUndefined, isNull } from '../../../utils';
import { _Player, Action } from './player';

export enum Stage {
    Setup = "Setup",
    Night = "Night",
    Processing = "Processing",
    Day = "Day",
    Trial = "Trial",
    Ended = "Ended",
}

abstract class User {
    abstract partOfTos: boolean
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
    activeMenuId: string;
    guiltyVote: _Player[];
    innocentVote: _Player[];
    suspect: _Player | null;
    deaths: {victim: _Player, cause: string, deathNote?: string}[];
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
        this.activeMenuId = "";
        this.guiltyVote = [];
        this.innocentVote = [];
        this.suspect = null; //The person being tried in a trial
        this.deaths = []; //The deaths that had occurred recently
    }

    reset() { //used to end a game
        const client = require('../../../index');
        client.handler.removeMenu(this.activeMenuId);

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
        this.activeMenuId = "";
        this.guiltyVote = [];
        this.innocentVote = [];
        this.suspect = null;
        this.deaths = []
    }

    get alive() {
        return this.players.filter(member => {
            const player = this.assignments.get(member);
                if (isUndefined(player)) return;
            return player.alive;
        })
    }

    resetVotes() {
        this.assignments.forEach(player => {
            player.votes = 0;
            player.vote = null;
        })
        this.guiltyVote = [];
        this.innocentVote = [];
    }

    async death(victim: _Player) { //Announce the death of a player

    }

    cycleNight() {
        const client = require('../../../index.ts')

        this.counter++;
        this.stage = Stage.Night;
        const buttons: Object[] = [];
        
        const playerList = this.alive;

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
                    //@ts-ignore
                    if (user.partOfTos != message.guild.id) return dm.send("You're not playing.");
                    const agentMember = message.guild.members.get(user.id);
                    if (isUndefined(agentMember)) return;
                    const agent = this.assignments.get(agentMember);
                    if (isUndefined(agent)) return;
                    if (!agent.alive) return dm.send("You can't vote if you're dead!")
                    const receiver = this.assignments.get(member);
                    if (isUndefined(receiver)) return;
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
        // @ts-ignore
        this.announcements.sendMenu(message).then(message => this.activeMenuId = message.id);

        setTimeout(() => {
            this.processNight();
        }, 30000);
    }
// @ts-ignore
    processNight() {
        const client = require('../../../index.ts')

        if (isNull(this.announcements)) return;

        this.stage = Stage.Processing;
            client.handler.removeMenu(this.activeMenuId);
            this.announcements.send('Processing the night...');
            this.announcements.startTyping();
            this.players.forEach((member) => {
                const player = this.assignments.get(member);
                if (player && !isNull(player.target)) {
                    const priority = player.priority - 1; //Subtract 1 for array indexing!
                    const target = this.assignments.get(player.target);
                    if (isUndefined(target)) return;
                    this.actions[priority].push({
                        agent: player, 
                        receiver: target && target,
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
            this.cycleDay()
    }
    cycleDay() {
        const client = require('../../../index.ts');
        this.stage = Stage.Day;

        if (isNull(this.announcements)) return;
        //Day Announcement
        const day = new Discord.RichEmbed()
            .setTitle(`${this.stage} ${this.counter}`)
            .setColor('#ffff00')

        this.announcements.send(day);

        //Voting Selection
        const buttons: Object[] = [];
        const playerList = this.alive;
        let playerSelection = "";
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
                    //@ts-ignore
                    if (user.partOfTos != message.guild.id) return dm.send("You're not playing.");
                    const agentMember = message.guild.members.get(user.id);
                    if (isUndefined(agentMember)) return;
                    const agent = this.assignments.get(agentMember);
                    if (isUndefined(agent)) return;
                    if (!agent.alive) return dm.send("You can't vote if you're dead!")
                    const receiver = this.assignments.get(member);
                    if (isUndefined(receiver)) return;

                    if (agent.vote == receiver) { //Player selected the person he was already voting for
                        agent.vote = null;
                        receiver.votes -= 1;
                        this.announcements!.send(`<@${user.id}> is no longer voting for <@${member.user.id}>.`);
                    } else if (agent == receiver) { //Player selected himself
                        this.announcements!.send(`<@${user.id}> just tried to vote for themselves, what a moron!`)
                    } else if(agent.vote == null) { //Player selecting new person, not already voting
                        agent.vote = receiver;
                        receiver.votes += 1;
                        this.announcements!.send(`<@${user.id}> has voted for <@${member.user.id}>!`);
                        if (receiver.votes >= this.alive.length / 2) {
                            this.suspect = receiver;
                            this.cycleTrial();
                        }
                    } else { //Player selecting a new person, already voting for a different person
                        const oldVote = agent.vote;
                        oldVote.votes -= 1;
                        agent.vote = receiver;
                        receiver.votes += 1;
                        this.announcements!.send(`<@${user.id}> has changed his vote to <@${member.user.id}>!`);
                        if (receiver.votes >= this.alive.length / 2) {
                            this.suspect = receiver;
                            this.cycleTrial();
                        }
                    }
                }
            })
        })
        const embed = new Discord.RichEmbed()
            .setTitle(`${this.stage} ${this.counter}`)
            .setDescription('Vote for someone to lynch!')
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .addField('Suspects', playerSelection)
            .setFooter('Vote for someone by reacting below');
        const message = new Menu(embed, buttons);
        client.handler.addMenus(message);
        // @ts-ignore
        this.announcements.sendMenu(message).then(message => this.activeMenuId = message.id);
    }

    cycleTrial() {
        const client = require('../../../index.ts');
        this.stage = Stage.Trial;
        client.hander.removeMenu(this.activeMenuId);
        this.resetVotes();
        const trial = new Discord.RichEmbed()
            .setTitle(`${this.suspect!.user.username} is on trial`)
            .setDescription('Is he guilty or innocent?')
            .addField('','☠️ - Guilty \n ❎ - Innocent \n ⬜️ - Abstain');
        const buttons = [
            {
                emoji: '☠️',
                run: async (user: Discord.User, message: Discord.Message) => {
                    const dm = await user.createDM();
                    const agentMember = message.guild.members.get(user.id);
                    if (isUndefined(agentMember)) return;
                    const agent = this.assignments.get(agentMember);
                    if (isUndefined(agent)) return;
                    if (!agent.alive) return dm.send("You can't vote if you're dead!");
                    if (this.guiltyVote.includes(agent)) return dm.send('You have already voted guilty.');
                    if (this.innocentVote.includes(agent)) {
                        this.innocentVote.splice(this.innocentVote.findIndex(player => player == agent), 1);
                        this.guiltyVote.push(agent);
                        dm.send("You have changed your vote to guilty.");
                        this.announcements!.send(`${agent.user.username} has changed their vote.`);
                    } else if (agent.votes) { //_Player.votes used to mark a player as abstaining
                        agent.votes = 0;
                        this.guiltyVote.push(agent);
                        dm.send('You have changed your vote to guilty.');
                        this.announcements!.send(`${agent.user.username} has changed their vote.`);
                    } else {
                        this.guiltyVote.push(agent);
                        dm.send('You have voted guilty.');
                        this.announcements!.send(`${agent.user.username} has voted.`);
                    }
                }
            },
            {
                emoji: '❎',
                run: async (user: Discord.User, message: Discord.Message) => {
                    const dm = await user.createDM();
                    const agentMember = message.guild.members.get(user.id);
                    if (isUndefined(agentMember)) return;
                    const agent = this.assignments.get(agentMember);
                    if (isUndefined(agent)) return;
                    if (!agent.alive) return dm.send("You can't vote if you're dead!");
                    if (this.innocentVote.includes(agent)) return dm.send('You have already voted innocent.');
                    if (this.guiltyVote.includes(agent)) {
                        this.guiltyVote.splice(this.guiltyVote.findIndex(player => player == agent), 1);
                        this.innocentVote.push(agent);
                        dm.send("You have changed your vote to innocent.");
                        this.announcements!.send(`${agent.user.username} has changed their vote.`);
                    } else if (agent.votes) {
                        agent.votes = 0;
                        this.innocentVote.push(agent);
                        dm.send('You have changed your vote to innocent.');
                        this.announcements!.send(`${agent.user.username} has changed their vote.`);
                    } else {
                        this.innocentVote.push(agent);
                        dm.send('You have voted innocent.');
                        this.announcements!.send(`${agent.user.username} has voted.`);
                    }
                }
            },
            {
                emoji: '⬜️',
                run: async (user: Discord.User, message: Discord.Message) => {
                    const dm = await user.createDM();
                    const agentMember = message.guild.members.get(user.id);
                    if (isUndefined(agentMember)) return;
                    const agent = this.assignments.get(agentMember);
                    if (isUndefined(agent)) return;
                    if (!agent.alive) return dm.send("You can't vote if you're dead!");
                    if (this.guiltyVote.includes(agent)) {
                        this.guiltyVote.splice(this.guiltyVote.findIndex(player => player == agent), 1);
                        agent.votes = 1;
                        dm.send("You have abstained.");
                        this.announcements!.send(`${agent.user.username} has changed their vote.`);
                    } else if (this.innocentVote.includes(agent)) {
                        this.innocentVote.splice(this.innocentVote.findIndex(player => player == agent), 1);
                        agent.votes = 1;
                        dm.send('You have abstained.');
                        this.announcements!.send(`${agent.user.username} has changed their vote.`)
                    } else {
                        agent.votes = 1;
                        dm.send('You have abstained.');
                        this.announcements!.send(`${agent.user.username} has voted.`);
                    }
                }
            }
        ]
        const message = new Menu(trial, buttons);
        //@ts-ignore
        this.announcements.sendMenu(message).then(message => this.activeMenuId = message.id);
    }

    processTrial() {
        const client = require('../../../index.ts');
        this.stage = Stage.Processing;
        client.hander.removeMenu(this.activeMenuId);
        const guiltyList = this.guiltyVote.map(player => player.user);
        const innocentList = this.innocentVote.map(player => player.user);
        const abstainedList = this.players.filter(member => !guiltyList.includes(member.user) && !innocentList.includes(member.user)).map(member => member.user);
        function convertToString(list: Discord.User[]) {
            let string = '';
            list.forEach(user => {
                string = string.concat(user.username, '\n');
            })
            return string;
        }
        if (this.guiltyVote.length > this.innocentVote.length) {
            this.suspect!.alive = false;
            const embed = new Discord.RichEmbed()
                .setTitle(`The Town has voted ${this.suspect!.user.username} guilty, ${this.guiltyVote.length} to ${this.innocentVote.length}`)
                .setColor('#ffff00')
                .addField("Those who voted guilty:", convertToString(guiltyList))
                .addField("Those who voted innocent:", convertToString(innocentList))
                .addField("Those who abstained:", convertToString(abstainedList));
            this.announcements!.send(embed);
            this.resetVotes();
            this.death(this.suspect!) //FINISH THIS
            this.suspect = null;
            this.cycleNight();
        } else {
            const embed = new Discord.RichEmbed()
                .setTitle(`The Town has voted ${this.suspect!.user.username} innocent, ${this.innocentVote.length} to ${this.guiltyVote.length}`)
                .setColor('#ffff00')
                .addField("Those who voted guilty:", convertToString(guiltyList))
                .addField("Those who voted innocent:", convertToString(innocentList))
                .addField("Those who abstained:", convertToString(abstainedList));
            this.announcements!.send(embed);
            this.suspect = null;
            this.resetVotes();
            this.cycleDay();
        }
    }
}