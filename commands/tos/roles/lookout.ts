import Discord from 'discord.js';
import { Selection, _View, _Player, Action, Alignment, Category, Color, Attack, Defense } from '../src/player';

const image = new Discord.Attachment('images/tos/lookout.png')

export const View = new _View({
    name: 'Lookout',
    picture: image,
    pictureUrl: 'attachment://lookout.png',
    alignment: Alignment.Town,
    category: Category.Investigative,
    color: Color.Town,
    abilities: `Watch one person at night to 
                see who visits them.`, //Note: keep lines short to allow commands to be in-line
    attributes: 'None',
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
        this.name = 'lookout'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = Attack.None; //None
        this.defense = Defense.None; //None
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action(action: Action) {

    }
}