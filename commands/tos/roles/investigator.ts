import Discord from 'discord.js';
import { Selection, Action, _View, _Player, Alignment, Category, Color, Attack, Defense } from '../src/player';

const image = new Discord.Attachment('images/tos/investigator.png', 'investigator.png')

export const View = new _View({
    name: 'Investigator',
    picture: image,
    alignment: Alignment.Town,
    category: Category.Investigative,
    color: Color.Town,
    abilities: "Investigate one person each night\nfor a clue to their role.",
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
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'investigator'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = Attack.None;
        this.defense = Defense.None;
        this.selection = Selection.others;
        this.unique = false;
        this.view = View;
    }

    targetMessage(target: _Player) { return `You have decided to investigate <@${target.user.id}> tonight.` };

    action() {
        if (!this.target) return;
        if (this.blocked.length !== 0) return this.input!.send("Someone occupied your night. You were role blocked!")
        this.target.visited.push(this)
        const role = this.target.name;
        if (!this.input) return console.error("Investigator has no input channel");
        if (role === 'vigilante' || role === 'veteran' || role === 'mafioso') {
            this.input.send("Your target could be a `Vigilante`, `Veteran`, or `Mafioso`.");
        } else if (role === 'medium' || role === 'janitor' || role === 'retributionist') {
            this.input.send('Your target could be a `Medium`, `Janitor`, or `Retributionist`.');
        } else if (role === 'survivor' || role === 'vampire hunter' || role === 'amnesiac') {
            this.input.send('Your target could be a `Survivor`, `Vampire Hunter`, or `Amnesiac`.');
        } else if (role === 'spy' || role === 'blackmailer' || role === 'jailor') {
            this.input.send('Your target could be a `Spy`, `Blackmailer`, or `Jailor`.');
        } else if (role === 'sheriff' || role === 'executioner' || role === 'werewolf') {
            this.input.send('Your target could be a `Sheriff`, `Executioner`, or `Werewolf`.');
        } else if (role === 'framer' || role === 'vampire' || role === 'jester') {
            this.input.send('Your target could be a `Framer`, `Vampire`, or `Jester`.');
        } else if (role === 'lookout' || role === 'forger' || role === 'witch') {
            this.input.send('Your target could be a `Lookout`, `Forger`, or `Witch`.');
        } else if (role === 'escort' || role === 'transporter' || role === 'consort') {
            this.input.send('Your target could be an `Escort`, `Transporter`, or `Consort`.');
        } else if (role === 'doctor' || role === 'disguiser' || role === 'serial') {
            this.input.send('Your target could be a `Doctor`, `Disguiser`, or `Serial Killer`.');
        } else if (role === 'investigator' || role === 'consigliere' || role === 'mayor') {
            this.input.send('Your target could be an `Investigator`, `Consigliere`, or `Mayor`.');
        } else if (role === 'bodyguard' || role === 'godfather' || role === 'arsonist') {
            this.input.send('Your target could be a `Bodyguard`, `Godfather`, or `Arsonist`.');
        } else console.log(`Error with Investigator action; Role given: ${role}`)
    }
}