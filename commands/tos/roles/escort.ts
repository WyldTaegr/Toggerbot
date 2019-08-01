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
    visits: boolean;
    selection: Selection;
    unique: boolean;
    view: _View;
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'escort'; //Note: used as identifier in code --> keep lowercase
        this.priority = 2; //Priority level of action
        this.attack = Attack.None;
        this.defense = Defense.None;
        this.visits = true;
        this.selection = Selection.others;
        this.unique = false;
        this.view = View;
    }

    action({agent, receiver}: Action) {
        receiver.blocked.push(agent);
    }
}