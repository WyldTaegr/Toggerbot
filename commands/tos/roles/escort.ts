import { Selection, Action, _View, _Player, Alignment, Category, Color, Attack, Defense } from '../src/player';
import Discord from 'discord.js';

const image = new Discord.Attachment('images/tos/escort.png', 'escort.png')

export const View = new _View({
    name: 'Escort',
    picture: image,
    alignment: Alignment.Town,
    category: Category.Support,
    color: Color.Town,
    abilities: "Distract someone each night.", //Note: keep lines short to allow commands to be in-line
    attributes: "Distraction blocks your target from using\ntheir role's night ability.\nYou cannot be role blocked.",
    goal: 'Lynch every criminal and evildoer.'
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
        this.name = 'escort'; //Note: used as identifier in code --> keep lowercase
        this.priority = 2; //Priority level of action
        this.attack = Attack.None;
        this.defense = Defense.None;
        this.selection = Selection.others;
        this.unique = false;
        this.view = View;
    }

    targetMessage(target: _Player) { return `You have decided to distract <@${target.user.id}> tonight.` };

    action() {
        if (!this.target) return;
        if (this.blocked.length !== 0) this.input!.send("Someone tried to role block you but you're immune!");
        this.target.blocked.push(this);
    }
}