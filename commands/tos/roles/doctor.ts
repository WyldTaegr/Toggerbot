import Discord from 'discord.js';
import { Selection, Action, _View, _Player, Alignment, Category, Color, Attack, Defense } from '../src/player';

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
    visits: boolean;
    selection: Selection;
    unique: boolean;
    view: _View;
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'doctor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 3; //Priority level of action
        this.attack = Attack.None; //None
        this.defense = Defense.None; //None, set to Powerful on self-heal
        this.visits = true;
        this.selection = Selection.all; //TO-DO: can only target self once
        this.unique = false;
        this.view = View;
    }

    action({agent, receiver}: Action) {

    }
}