import Discord, { GuildMember, Message } from "discord.js"
//@ts-ignore
import { Menu } from 'reaction-core';
import { shuffle, emojis as _emojis, isUndefined, isNull } from '../../../utils';
import { _Player, Action, _View } from './player';

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
    mafia: Discord.TextChannel | null;
    jail: Discord.TextChannel | null;
    graveyard: Discord.TextChannel | null;
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
        this.mafia = null;
        this.jail = null;
        this.graveyard = null;
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

    get mafiaMembers() {
        return this.players.filter(member => {
            const player = this.assignments.get(member);
                if (isUndefined(player)) return;
            const role = player.name
            const { View }: { View: _View} = require(`../roles/${role}`)
            return View.alignment === "Mafia";
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

    death({user, name, will}: _Player, causeOfDeath: string, deathNote: string | undefined) { //Announce the death of a player
        console.log(user, will, deathNote)
    }
}