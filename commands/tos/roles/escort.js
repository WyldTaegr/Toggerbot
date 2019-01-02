const { Player } = require("../src/game");

const View = {
    name: 'Escort',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Escort.png',
    alignment: 'Town',
    category: 'Support',
    color: '#00ff00',
    abilities: `Distract someone each night.`, //Note: keep lines short to allow commands to be in-line
    commands: '`tos!distract`',
    attributes: `Distraction blocks your target from using their role's night ability.
                You cannot be role blocked.`,
    goal: 'Lynch every criminal and evildoer.'
}
const Object = class extends Player {
    constructor() {
        super();
        this.name = 'escort'; //Note: used as identifier in code --> keep lowercase
        this.commands = 'distract';
        this.priority = 2; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = "others";
    }
}

const action = (agent, receiver) => {
    const client = require("../../../index");
    const game = client.games.get(agent.guild.id);

    game.assignments.get(receiver).blocked = agent;
    receiver.user.send('Someone role-blocked you!');
}

module.exports = { View, Object, action }