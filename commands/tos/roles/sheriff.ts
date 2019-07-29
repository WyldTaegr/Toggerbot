import Discord from 'discord.js';
import { Selection, _View, _Player, Action } from '../src/player'

export const View = new _View({
    name: 'Sheriff',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Sheriff.png',
    alignment: 'Town',
    category: 'Investigative',
    color: "#00ff00",
    abilities: `Check one person each night 
                for suspicious activity.`,
    attributes: `You will know if your target is a member of the Mafia, except for the Godfather.
                 You will know if your target is a Serial Killer.`,
    goal: "Lynch every criminal and evildoer."
})

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    visits: boolean;
    selection: Selection;
    view: _View
    constructor(user: Discord.User) {
        super(user);
        this.name = 'sheriff'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action({agent, receiver}: Action) {
        const receiverRole: _View = require(`./roles/${receiver.name}.ts`).View;
        if (receiverRole.alignment === 'Town') {
            agent.user.send('Your target is not suspicious.');
        } else if (receiverRole.alignment === "Mafia") {
            agent.user.send('Your target is a member of the Mafia!');
        } else if (receiverRole.name === "Serial Killer") {
            agent.user.send('Your target is a Serial Killer!');
        }
    }
}