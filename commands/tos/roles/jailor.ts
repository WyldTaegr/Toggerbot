import Discord from 'discord.js';
import { Selection, _View, _Player, Action } from '../src/player';

export const View = new _View({
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
        this.name = 'jailor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 5; //Priority level of action
        this.attack = 3; //Unstoppable
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action(action: Action) {

    }
}