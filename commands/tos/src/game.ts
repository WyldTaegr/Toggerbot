import Discord, { GuildMember, Message } from "discord.js"
import { emojis as _emojis, isUndefined } from '../../../utils';
import { _Player, Action, _View } from './player';
import { GameClient } from "../../..";
import { CycleNight, ProcessNight } from "./Night";
import { CycleDay } from "./Day";
import { CycleTrial } from "./Trial";
import Doctor from '../roles/doctor';
import Escort from '../roles/escort';
import Investigator from '../roles/investigator';
import Jailor from '../roles/jailor';
import Lookout from '../roles/lookout';
import Sheriff from '../roles/sheriff';

export enum RoleName {
    Doctor = "doctor",
    Escort = "escort",
    Investigator = "investigator",
    Jailor = "jailor",
    Lookout = "lookout",
    Sheriff = "sheriff",
}

export const Roles: Discord.Collection<RoleName, typeof _Player> = new Discord.Collection([
    [RoleName.Doctor, Doctor],
    [RoleName.Escort, Escort],
    [RoleName.Investigator, Investigator],
    [RoleName.Jailor, Jailor],
    [RoleName.Lookout, Lookout],
    [RoleName.Sheriff, Sheriff]
])

export enum ActiveMenu {
    Vote = "Vote",
    Setup = "Setup",
    Night = "Night"
}

export enum Stage {
    Setup = "Setup",
    Night = "Night",
    Processing = "Processing",
    Day = "Day",
    Trial = "Trial",
    Ended = "Ended",
}

export function roleEmbed(role: _View) {
    const embed = new Discord.RichEmbed()
        .setTitle(role.name)
        .setThumbnail(role.pictureUrl)
        .setColor(role.color)
        .setDescription(`Alignment: ${role.alignment} (${role.category})`)
        .addField('Abilities', role.abilities, true)
        .addField('Attributes', role.attributes, false)
        .addField('Goal', role.goal, false)
    return embed;
}

class MenuChannel extends Discord.TextChannel {
    sendMenu?: (message: any) => Promise<Message>; //Any should be Menu - Rip no types in reaction-core
}

export class Game {
    moderator: Discord.User | null;
    role: Discord.Role | null //The GuildRole that signifies guild origin on Bot server
    players: Discord.GuildMember[];
    roles: RoleName[];
    setup: Discord.Message | null; //the Discord message used in setup
    assignments: Discord.Collection<GuildMember, _Player>
    stage: Stage;
    actions: Array<Action[]>;
    counter: number;
    category: Discord.CategoryChannel | null;
    announcements: MenuChannel | null;
    mafia: Discord.TextChannel | null;
    jail: Discord.TextChannel | null;
    graveyard: Discord.TextChannel | null;
    origin: Discord.TextChannel | null;
    activeMenuIds: Discord.Collection<string, string>;
    guiltyVote: _Player[];
    innocentVote: _Player[];
    suspect: _Player | null;
    deaths: {victim: _Player, cause: string, deathNote?: string}[];
    constructor() {
        this.moderator = null; //person who starts the game --> will have empowered commands
        this.role = null;
        this.players = []; //Array of GuildMembers, assigned with message.member
        this.roles = []; //Array of role names as strings
        this.setup = null;
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
        this.activeMenuIds = new Discord.Collection();
        this.guiltyVote = [];
        this.innocentVote = [];
        this.suspect = null; //The person being tried in a trial
        this.deaths = []; //The deaths that had occurred recently
    }

    reset(result: Discord.RichEmbed) { //used to end a game
        const client: GameClient = require('../../../index');
        //Remove public reaction menus
        for (const [, activeMenuId] of this.activeMenuIds) {
            client.handler.removeMenu(activeMenuId);
        }
        //Delete individual player channels
        for (const [member, player] of this.assignments) {
            //@ts-ignore
            member.user.partOfTos = undefined;
            if (player.input) {
            client.handler.removeMenu(player.activeMenuId);
            player.input.delete()
            }
        }
        //Delete public channels and roles
        this.role && this.role.delete();
        this.announcements && this.announcements.delete();
        this.mafia && this.mafia.delete();
        this.jail && this.jail.delete();
        this.graveyard && this.graveyard.delete();

        //Report result of the game
        this.origin!.send(result)

        //Reset variables
        this.moderator = null;
        this.role = null;
        this.players = []; 
        this.roles = [];
        this.setup = null;
        this.assignments = new Discord.Collection();
        this.stage = Stage.Ended;
        this.actions = [[], [], [], [], []];
        this.counter = 0;
        this.category = null;
        this.announcements = null;
        this.mafia = null;
        this.jail = null;
        this.graveyard = null;
        this.origin = null;
        this.activeMenuIds = new Discord.Collection();
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
            return player.view.alignment === "Mafia";
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

    setupEmbed() {
        const playerNames = this.players.map((member: Discord.GuildMember) => member.nickname || member.user.username)
            .toString()
            .replace(/,/g, '\n');
        const roleNames = this.roles.map((role: string) => role.charAt(0).toUpperCase() + role.slice(1))
            .toString()
            .replace(/,/g, '\n');

        const embed = new Discord.RichEmbed()
            .setTitle('Town of Salem')
            .setColor('#ffff00')
            .setDescription(`Moderator: ${this.moderator!.username!}`)
            .addField('Players:', playerNames || "loading...", true)
            .addField('Roles:', roleNames || 'No roles yet lol', true)
        return embed;
    }

    route() {
        switch (this.stage) {
            case Stage.Night:
                ProcessNight(this);
                break;
            case Stage.Day:
                this.stage = Stage.Day;
                CycleDay(this);
                break;
            case Stage.Trial:
                this.stage = Stage.Trial;
                CycleTrial(this)
        }
    }
}