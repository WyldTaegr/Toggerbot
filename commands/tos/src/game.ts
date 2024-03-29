import Discord from "discord.js"
import { isUndefined } from '../../../utils';
import { _Player, _View, Alignment } from './player';
import { GameClient } from "../../..";
import { CycleNight } from "./Night";
import { CycleDefense } from "./Trial";
import Doctor from '../roles/doctor';
import Escort from '../roles/escort';
import Investigator from '../roles/investigator';
import Jailor from '../roles/jailor';
import Lookout from '../roles/lookout';
import SerialKiller from '../roles/serial';
import Sheriff from '../roles/sheriff';
import { CycleVoting, CycleDiscussion } from "./Day";

const logo = new Discord.Attachment('images/tos/logo.png', "logo.png");
const night = new Discord.Attachment('images/tos/night.png', 'night.png');
const day = new Discord.Attachment('images/tos/day.png', 'day.png');

export enum RoleName {
    Doctor = "Doctor",
    Escort = "Escort",
    Investigator = "Investigator",
    Jailor = "Jailor",
    Lookout = "Lookout",
    SerialKiller = "Serial Killer",
    Sheriff = "Sheriff",
}

export function findRole(role: string) { //Returns a RoleName that starts with the given string
    function enumKeys<E>(e: E): (keyof E)[] {
        return Object.keys(e) as (keyof E)[];
    }
    for (const key of enumKeys(RoleName)) {
        if (key.toLowerCase().startsWith(role)) return RoleName[key];
    }
}

export const Roles: Discord.Collection<RoleName, typeof _Player> = new Discord.Collection([
    [RoleName.Doctor, Doctor],
    [RoleName.Escort, Escort],
    [RoleName.Investigator, Investigator],
    [RoleName.Jailor, Jailor],
    [RoleName.Lookout, Lookout],
    [RoleName.SerialKiller, SerialKiller],
    [RoleName.Sheriff, Sheriff],
])

export enum ActiveMenu {
    Accuse = "Accuse",
    Vote = "Vote",
    Setup = "Setup",
    Night = "Night"
}

export enum Stage {
    Setup = "Setup",
    Night = "Night",
    Deaths = "Deaths",
    Discussion = "Discussion",
    Voting = "Voting",
    Defense = "Defense",
    Judgement = "Judgement",
    Ended = "Ended",
    Lynch = "Lynch",
}

export function roleEmbed(role: _View) {
    const embed = new Discord.RichEmbed()
        .setTitle(role.name)
        .attachFile(role.picture)
        .setThumbnail(`attachment://${role.picture.name}`)
        .setColor(role.color)
        .setDescription(`Alignment: ${role.alignment} (${role.category})`)
        .addField('Abilities', role.abilities, true)
        .addField('Attributes', role.attributes, true)
        .addField('Goal', role.goal, true)
    return embed;
}

export interface death {
    killers: number
    cause: string,
    deathNotes: string[]
}

export class Game {
    moderator: Discord.User | null;
    role: Discord.Role | null //The GuildRole that signifies guild origin on Bot server
    players: Discord.GuildMember[];
    roles: RoleName[];
    setup: Discord.Message | null; //the Discord message used in setup
    assignments: Discord.Collection<Discord.GuildMember, _Player>
    _stage: Stage; //Getters and setters have been applied
    actions: _Player[];
    counter: number;
    category: Discord.CategoryChannel | null;
    chat: Discord.TextChannel | null;
    infoChannel: Discord.TextChannel | null;
    infoMessage: Discord.Message | null;
    mafia: Discord.TextChannel | null;
    graveyard: Discord.TextChannel | null;
    origin: Discord.TextChannel | null;
    activeMenuIds: Discord.Collection<ActiveMenu, string>;
    guiltyVote: _Player[];
    innocentVote: _Player[];
    trials: number;
    suspect: _Player | null;
    deaths: Discord.Collection<_Player, death>
    constructor() {
        this.moderator = null; //person who starts the game --> will have empowered commands
        this.role = null;
        this.players = []; //Array of GuildMembers, assigned with message.member
        this.roles = []; //Array of role names as strings
        this.setup = null;
        this.assignments = new Discord.Collection(); //Maps players (As GuildMembers) with their roles (As role.object), assigned after start
        this._stage = Stage.Ended; //Either 'Setup', 'Night', 'Processing' 'Day', 'Trial', or 'Ended'
        this.actions = []; //Array of arrays, organizes actions by priority number; [role of action-caller as role.object.name, caller as GuildMember, target as GuildMember]
        this.counter = 0; //Counts the number of Nights/Days that have gone by
        this.category = null;
        this.chat = null;
        this.infoChannel = null;
        this.infoMessage = null;
        this.mafia = null;
        this.graveyard = null;
        this.origin = null; //Channel where the game was started, where the endcard will go upon game finish
        this.activeMenuIds = new Discord.Collection();
        this.guiltyVote = [];
        this.innocentVote = [];
        this.trials = 3; //The town can only have 3 trials per day
        this.suspect = null; //The person being tried in a trial
        this.deaths = new Discord.Collection(); //The deaths that had occurred recently
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
        this.chat && this.chat.delete();
        this.infoChannel && this.infoChannel.delete();
        this.mafia && this.mafia.delete();
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
        this._stage = Stage.Ended;
        this.actions = [];
        this.counter = 0;
        this.category = null;
        this.chat = null;
        this.infoChannel = null;
        this.infoMessage = null;
        this.mafia = null;
        this.graveyard = null;
        this.origin = null;
        this.activeMenuIds = new Discord.Collection();
        this.guiltyVote = [];
        this.innocentVote = [];
        this.trials = 3;
        this.suspect = null;
        this.deaths = new Discord.Collection()
    }

    get alive() {
        return this.players.filter(member => {
            const player = this.assignments.get(member);
                if (isUndefined(player)) return;
            return player.alive;
        })
    }

    get dead() {
        return this.players.filter(member => {
            const player = this.assignments.get(member);
                if (isUndefined(player)) return;
            return !player.alive;
        })
    }

    get stage() { return this._stage };
    set stage(stage: Stage) {
        this._stage = stage;
        const jailor = this.actions.find(player => player.name === "jailor")
        if (stage === Stage.Night) { //No talking in chat, mafia can talk
            this.mafiaMembers.forEach(member => this.mafia!.overwritePermissions(member, {"SEND_MESSAGES": true}));
            this.chat!.overwritePermissions(this.role!, {"SEND_MESSAGES": false})
            //Jailor's day action
            if (jailor) jailor.action(this);
        } else { //Day - Mafia can no longer talk, talk in chat can start after death announcements
            this.mafiaMembers.forEach(member => this.mafia!.overwritePermissions(member, {"SEND_MESSAGES": false}));
            if (stage === Stage.Discussion) {
                this.chat!.overwritePermissions(this.role!, {"SEND_MESSAGES": true});
                //Jailor's day selection
                if (jailor) jailor.action(this);
            }
        }
        if (stage === Stage.Voting || stage === Stage.Night || (stage === Stage.Discussion && this.counter > 1)) this.updateStatus();
    }

    get mafiaMembers() {
        return this.players.filter(member => {
            const player = this.assignments.get(member);
                if (isUndefined(player)) return;
            return player.view.alignment === Alignment.Mafia;
        })
    }

    resetVotes() {
        this.assignments.forEach(player => {
            player.votes = 0;
            player.vote = null;
            player.abstain = true;
        })
        this.guiltyVote = [];
        this.innocentVote = [];
    }

    setupEmbed() {
        const playerNames = this.players.map((member: Discord.GuildMember) => member.nickname || member.user.username)
            .toString()
            .replace(/,/g, '\n');
        const roleNames = this.roles.toString().replace(/,/g, '\n');

        const embed = new Discord.RichEmbed()
            .setTitle('Town of Salem')
            .attachFile(logo)
            .setThumbnail('attachment://logo.png')
            .setColor('#ffff00')
            .setDescription(`Moderator: ${this.moderator!.username!}`)
            .addField('Players:', playerNames || "Loading...", true)
            .addField('Roles:', roleNames || 'No roles yet!', true)
        return embed;
    }
    
    async updateStatus() {
        let stage: string, image: Discord.Attachment, color: string;
        if (this.stage === Stage.Night) {
            [stage, image, color] = ["Night", night, "#562796"];
        } else {
            [stage, image, color] = ["Day", day, "#ffff00"]
        }
        let graveyard = "";
        this.dead.forEach(member => {
            const player = this.assignments.get(member);
            if (!player) return console.error("StatusEmbed: dead player has no assigned player object");
            graveyard = graveyard.concat(`${player.emoji} - ${player.user.username} (${player.view.name})\n`) //TODO: display false role if framed/disguised
        })


        const embed = new Discord.RichEmbed()
            .setTitle(`${stage} ${this.counter}`)
            .attachFile(image)
            .setThumbnail(`attachment://${image.name}`)
            .setColor(color)
            .addField("Graveyard", graveyard || "No one has died yet!", true)
            .addField("Role List", this.roles.toString().replace(/,/g, "\n",), true);
        
        if (!this.infoChannel) return console.error("UpdateStatus: game.infoChannel is null")
        if (this.infoMessage) this.infoMessage.delete();
        this.infoMessage = await this.infoChannel.send(embed) as Discord.Message;
    }

    route() {
        if (!this.chat) return console.error("Game.route: game.chat is null");
        switch (this.stage) {
            case Stage.Night:
                CycleDiscussion(this);
                break;
            case Stage.Voting:
                const client: GameClient = require("../../../index.ts");
                const activeMenuId = this.activeMenuIds.get(ActiveMenu.Accuse);
                if (!activeMenuId) return console.error("Game.route: ActiveMenu.Accuse did not exist");
                client.handler.removeMenu(activeMenuId);
                this.activeMenuIds.delete(ActiveMenu.Accuse);
                
                this.resetVotes();
                if (!this.suspect) {
                    this.chat.send("It is too late now to continue voting.");
                    setTimeout(() => CycleNight(this), 3000);
                } else {
                    CycleDefense(this);
                }
                break;
            case Stage.Judgement:
                if (this.trials === 0) {
                    this.chat.send("It is too late now to continue voting.");
                    setTimeout(() => CycleNight(this), 3000);
                }
                else CycleVoting(this);
                break;
            case Stage.Lynch:
                this.chat.send("It is too late now to continue voting.")
                setTimeout(() => CycleNight(this), 6000);
                break;
            default: 
                console.error(`Game.route: received stage ${this.stage} with no case.`);
        }
    }
}