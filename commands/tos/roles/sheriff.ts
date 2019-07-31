import Discord from 'discord.js';
import { Selection, _View, _Player, Action, Alignment, Category, Color, Attack, Defense } from '../src/player'

const image = new Discord.Attachment('images/tos/sheriff.png')

export const View = new _View({
    name: 'Sheriff',
    picture: image,
    pictureUrl: 'attachment://sheriff.png',
    alignment: Alignment.Town,
    category: Category.Investigative,
    color: Color.Town,
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
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'sheriff'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = Attack.None;
        this.defense = Defense.None;
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action({agent, receiver}: Action) {
        const receiverRole: _View = require(`./roles/${receiver.name}.ts`).View;
        if (!agent.input) return console.error("Sheriff has no input channel");
        if (receiverRole.alignment === 'Town') {
            agent.input.send('Your target is not suspicious.');
        } else if (receiverRole.alignment === "Mafia") {
            agent.input.send('Your target is a member of the Mafia!');
        } else if (receiverRole.name === "Serial Killer") {
            agent.input.send('Your target is a Serial Killer!');
        }
    }
}