const { Player } = require("../src/game");

const View = {
    name: 'Investigator',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Investigator.png',
    alignment: 'Town',
    category: 'Investigative',
    color: "#00ff00",
    abilities: `Investigate one person each night 
                for a clue to their role.`, //Note: keep lines short to allow commands to be in-line
    commands: '`tos!investigate`',
    attributes: 'None',
    goal: "Lynch every criminal and evildoer."
} 
const Object = class extends Player {
    constructor() {
        super();
        this.name = 'investigator'; //Note: used as identifier in code --> keep lowercase
        this.commands = 'investigate';
        this.priority = 4; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = "others";
    }
}

const action = (agent, receiver) => {
    const client = require("../../../index");
    const game = client.games.get(agent.guild.id);
    const objectC = game.assignments.get(agent);
    const objectT = game.assignments.get(receiver);
    objectT.visited.push(objectC)
    const role = objectT.name;
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
    } else console.log(`Error with Investigator action; Role given: ${role}`);
}

module.exports = { View, Object, action }