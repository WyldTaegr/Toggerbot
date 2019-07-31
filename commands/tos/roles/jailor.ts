import Discord from 'discord.js';
import { Selection, _View, _Player, Action, Alignment, Category, Color, Attack, Defense } from '../src/player';

const image = new Discord.Attachment('images/tos/jailor.png')

export const View = new _View({
    name: 'Jailor',
    picture: image,
    pictureUrl: 'attachment://jailor.png',
    alignment: Alignment.Town,
    category: Category.Killing,
    color: Color.Town,
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
        this.attack = Attack.Unstoppable;
        this.defense = Defense.None;
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action(action: Action) {

    }
}