import Discord from 'discord.js';
import { Selection, _View, _Player, Action } from '../src/player';

const View = new _View({
    name: 'Lookout',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Lookout.png',
    alignment: 'Town',
    category: 'Investigative',
    color: "#00ff00",
    abilities: `Watch one person at night to 
                see who visits them.`, //Note: keep lines short to allow commands to be in-line
    attributes: 'None',
    goal: "Lynch every criminal and evildoer."
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
        this.name = 'lookout'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
    }

    action(action: Action) {

    }
}

module.exports = { View, Player }