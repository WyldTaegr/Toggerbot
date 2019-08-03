import Discord from 'discord.js';
import { Selection, _View, _Player, Alignment, Category, Color, Attack, Defense } from '../src/player'

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
    view: _View;
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
    targetMessage(target: _Player) { return `You have decided to interrogate <@${target.user.id}> tonight.` };

    action() {
        if (!this.target) return;
        if (!this.input) return console.error("Sheriff has no input channel");
        if (this.blocked.length !== 0) return this.input.send("Someone occupied your night. You were role blocked!")
        if (this.target.jailed) return this.input.send("Your target was jailed last night!");
        if (this.target.view.alignment === Alignment.Mafia || this.target.view.name === "Serial Killer") { //TODO: add exception to Godfather after role added
            this.input.send('Your target is suspicious.');
        } else {
            this.input.send('You cannot find evidence of wrongdoing. Your target seems innocent.')
        }
    }
}