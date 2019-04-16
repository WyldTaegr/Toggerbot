import Discord from 'discord.js';
import { Selection, _View, _Player, Action } from '../src/player';

const View = new _View({
    name: 'Jailor',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Jailor.png',
    alignment: 'Town',
    category: 'Killing',
    color: "#00ff00",
    abilities: `You may choose one person during the 
    			day to jail for the night.`, //Note: keep lines short to allow commands to be in-line
    attributes: `You may anonymously talk with your prisoner.
				You can choose to attack your prisoner.
				The jailed target cannot perform their night ability.
				While jailed the prisoner is given Powerful defense.`,
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
        this.name = 'jailor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 5; //Priority level of action
        this.attack = 3; //Unstoppable
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
    }

    action(action: Action) {

    }
}

module.exports = { View, Player }