const { Player } = require("../src/game");

const View = {
    name: 'Sheriff',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Sheriff.png',
    alignment: 'Town',
    category: 'Investigative',
    color: "#00ff00",
    abilities: `Check one person each night 
                for suspicious activity.`, //Note: keep lines short to allow commands to be in-line
    commands: '`tos!interrogate`',
    attributes: `You will know if your target is a member of the Mafia, except for the Godfather.
                 You will know if your target is a Serial Killer.`,
    goal: "Lynch every criminal and evildoer."
} 
const Object = class extends Player {
    constructor() {
        super();
        this.name = 'sheriff'; //Note: used as identifier in code --> keep lowercase
        this.commands = 'interrogate';
        this.priority = 4; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
        this.selection = "others";
    }
}

const action = (action) => {
    const receiverRole = require(`./roles/${action.receiver.name}.js`).View;
    if (receiverRole.alignment === 'Town') {
        action.agent.user.send('Your target is not suspicious.');
    } else if (receiverRole.alignment === "Mafia") {
        action.agent.user.send('Your target is a member of the Mafia!');
    } else if (receiverRole.name === "Serial Killer") {
        action.agent.user.send('Your target is a Serial Killer!');
    }
}

module.exports = { View, Object, action }