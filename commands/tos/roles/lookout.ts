import Discord from 'discord.js';
import { Selection, _View, _Player, Action, Alignment, Category, Color, Attack, Defense } from '../src/player';
import { Game } from '../src/game';

const image = new Discord.Attachment('images/tos/lookout.png', 'lookout.png')

export const View = new _View({
    name: 'Lookout',
    picture: image,
    alignment: Alignment.Town,
    category: Category.Investigative,
    color: Color.Town,
    abilities: "Watch one person at night to\nsee who visits them.",
    attributes: 'None',
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
    hasVisited: boolean; //Used to determine which callback to perform on action
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'lookout'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = Attack.None;
        this.defense = Defense.None;
        this.selection = Selection.others;
        this.unique = false;
        this.view = View;
        this.hasVisited = false;
    }

    action(game: Game) {
        if (!this.target) return;
        if (!this.input) return console.error("Lookout has no input channel");
        if (this.blocked.length !== 0) return this.input.send("Someone occupied your night. You were role blocked!")
        if (!this.hasVisited) {
            this.target.visited.push(this);
            this.hasVisited = true;
        } else {
            this.target.visited.forEach(player => player !== this && this.input!.send(`<@${player.user.id}> visited your target last night!`));
            this.hasVisited = false;
        }
    }
}