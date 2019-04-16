import Discord from 'discord.js';
import { Selection, Action, _View, _Player } from '../src/player';

const View = new _View({
    name: 'Doctor',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Doctor.png',
    alignment: 'Town',
    category: 'Protective',
    color: '#00ff00',
    abilities: `Heal one person each night, 
                preventing them from dying.`, //Note: keep lines short to allow commands to be in-line
    attributes: `You may only heal yourself once.
                 You will know if your target is attacked.`,
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
        this.name = 'doctor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 3; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None, set to Powerful on self-heal
        this.visits = true;
        this.selection = Selection.all; //TO-DO: can only target self once
    }

    action({agent, receiver}: Action) {

    }
}

module.exports = { View, Player }