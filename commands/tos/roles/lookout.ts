import Discord from 'discord.js';
import { Selection, _View, _Player, Action } from '../src/player';

export const View = new _View({
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

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    visits: boolean;
    selection: Selection;
    view: _View;
    constructor(user: Discord.User) {
        super(user);
        this.name = 'lookout'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action(action: Action) {

    }
}