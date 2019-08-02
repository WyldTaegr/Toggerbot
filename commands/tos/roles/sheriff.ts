import Discord from 'discord.js';
import { Selection, _View, _Player, Action, Alignment, Category, Color, Attack, Defense } from '../src/player'

const image = new Discord.Attachment('images/tos/sheriff.png', 'sheriff.png')

export const View = new _View({
    name: 'Sheriff',
    picture: image,
    alignment: Alignment.Town,
    category: Category.Investigative,
    color: Color.Town,
    abilities: "Check one person each night\nfor suspicious activity.",
    attributes: "You will know if your target is suspicious",
    goal: "Lynch every criminal and evildoer."
})

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    selection: Selection;
    useLimit?: number;
    unique: boolean;
    view: _View
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'sheriff'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = Attack.None;
        this.defense = Defense.None;
        this.selection = Selection.others;
        this.unique = false;
        this.view = View;
    }

    action({agent, receiver}: Action) {;
        if (!agent.input) return console.error("Sheriff has no input channel");
        if (agent.blocked.length !== 0) return agent.input.send("Someone occupied your night. You were role blocked!")
        if (receiver.view.alignment === Alignment.Mafia || receiver.view.name === "Serial Killer") { //TODO: add exception to Godfather after role added
            agent.input.send('Your target is suspicious.');
        } else {
            agent.input.send('You cannot find evidence of wrongdoing. Your target seems innocent.')
        }
    }
}