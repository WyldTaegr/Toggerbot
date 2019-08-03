import Discord from 'discord.js';
import { Selection, _View, _Player, Alignment, Category, Color, Attack, Defense } from '../src/player';

const image = new Discord.Attachment('images/tos/doctor.png', 'doctor.png')

export const View = new _View({
    name: 'Doctor',
    picture: image,
    alignment: Alignment.Town,
    category: Category.Protective,
    color: Color.Town,
    abilities: "Heal one person each night,\npreventing them from dying.", //Note: keep lines short to allow commands to be in-line
    attributes: "You may only heal yourself once.\nYou will know if your target is attacked.",
    goal: 'Lynch every criminal and evildoer.'
})

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    selection: Selection;
    useLimit: number;
    unique: boolean;
    view: _View;
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'doctor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 3; //Priority level of action
        this.attack = Attack.None;
        this.defense = Defense.None;
        this.selection = Selection.all; //TO-DO: can only target self once
        this.useLimit = 1;
        this.unique = false;
        this.view = View;
    }

    targetMessage(target: _Player): string {
        return `You have decided to heal ${this === target ? "yourself": `<@${target.user.id}>`} tonight.`
    };

    action() {
        if (!this.target) return;
        if (!this.input) return console.error("Doctor: this.input is not defined");
        this.visited.push(this)
        if (this.blocked.length !== 0) return this.input.send("Someone occupied your night. You were role blocked!");
        if (this.target.jailed) return this.input.send("Your target was jailed last night!");
        if (this === this.target) {
            this.useLimit--;
            this.selection = Selection.others;
        }
        this.target.healed.push(this);
    }
}