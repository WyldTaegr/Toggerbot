import { Selection, Action, _View, _Player } from '../src/player';
import Discord from 'discord.js';

export const View = new _View({
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

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    visits: boolean;
    selection: Selection;
    view: _View;
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'escort'; //Note: used as identifier in code --> keep lowercase
        this.priority = 2; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action({agent, receiver}: Action) {
        receiver.blocked = agent;
        receiver.user.send('Someone role-blocked you!')
    }
}