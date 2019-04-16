import Discord from 'discord.js';
import { Selection, Action, _View, _Player } from '../src/player';

const View = new _View({
    name: 'Investigator',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Investigator.png',
    alignment: 'Town',
    category: 'Investigative',
    color: "#00ff00",
    abilities: `Investigate one person each night 
                for a clue to their role.`, //Note: keep lines short to allow commands to be in-line
    attributes: 'None',
    goal: "Lynch every criminal and evildoer."
})

const Player = class extends _Player {
    user: Discord.User;
    name: string;
    priority: number;
    attack: number;
    defense: number;
    visits: boolean;
    selection: Selection;
    constructor(user: Discord.User) {
        super();
        this.user = user;
        this.name = 'investigator'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = Selection.others;
    }

    action({agent, receiver}: Action) {
        receiver.visited.push(agent)
        const role = receiver.name;
        if (role === 'vigilante' || role === 'veteran' || role === 'mafioso') {
            agent.user.send("Your target could be a `Vigilante`, `Veteran`, or `Mafioso`.");
        } else if (role === 'medium' || role === 'janitor' || role === 'retributionist') {
            agent.user.send('Your target could be a `Medium`, `Janitor`, or `Retributionist`.');
        } else if (role === 'survivor' || role === 'vampire hunter' || role === 'amnesiac') {
            agent.user.send('Your target could be a `Survivor`, `Vampire Hunter`, or `Amnesiac`.');
        } else if (role === 'spy' || role === 'blackmailer' || role === 'jailor') {
            agent.user.send('Your target could be a `Spy`, `Blackmailer`, or `Jailor`.');
        } else if (role === 'sheriff' || role === 'executioner' || role === 'werewolf') {
            agent.user.send('Your target could be a `Sheriff`, `Executioner`, or `Werewolf`.');
        } else if (role === 'framer' || role === 'vampire' || role === 'jester') {
            agent.user.send('Your target could be a `Framer`, `Vampire`, or `Jester`.');
        } else if (role === 'lookout' || role === 'forger' || role === 'witch') {
            agent.user.send('Your target could be a `Lookout`, `Forger`, or `Witch`.');
        } else if (role === 'escort' || role === 'transporter' || role === 'consort') {
            agent.user.send('Your target could be an `Escort`, `Transporter`, or `Consort`.');
        } else if (role === 'doctor' || role === 'disguiser' || role === 'serial killer') {
            agent.user.send('Your target could be a `Doctor`, `Disguiser`, or `Serial Killer`.');
        } else if (role === 'investigator' || role === 'consigliere' || role === 'mayor') {
            agent.user.send('Your target could be an `Investigator`, `Consigliere`, or `Mayor`.');
        } else if (role === 'bodyguard' || role === 'godfather' || role === 'arsonist') {
            agent.user.send('Your target could be a `Bodyguard`, `Godfather`, or `Arsonist`.');
        } else console.log(`Error with Investigator action; Role given: ${role}`)
    }
}

module.exports = { View, Player }