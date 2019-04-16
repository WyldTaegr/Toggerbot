import { Selection, Action, _View, _Player } from '../src/player';
import Discord from 'discord.js';

const View = new _View({
    name: 'Escort',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Escort.png',
    alignment: 'Town',
    category: 'Support',
    color: '#00ff00',
    abilities: `Distract someone each night.`, //Note: keep lines short to allow commands to be in-line
    attributes: `Distraction blocks your target from using their role's night ability.
                You cannot be role blocked.`,
    goal: 'Lynch every criminal and evildoer.'
})

const Player = class extends _Player {
    user: Discord.User;
    name: string;
    priority: number;
    attack: number;
    defense: number;
    visits: boolean;
    selection: Selection;
    constructor(user: Discord.User) {
        super();
        this.user = user;
        this.name = 'escort'; //Note: used as identifier in code --> keep lowercase
        this.priority = 2; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
    }

    action({agent, receiver}: Action) {
        receiver.blocked = agent;
        receiver.user.send('Someone role-blocked you!')
    }
}

module.exports = { View, Player }