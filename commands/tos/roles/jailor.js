const { Player } = require("../src/game");

const View = {
    name: 'Jailor',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Jailor.png',
    alignment: 'Town',
    category: 'Killing',
    color: "#00ff00",
    abilities: `You may choose one person during the 
    			day to jail for the night.`, //Note: keep lines short to allow commands to be in-line
    commands: 'Not implemented yet!',
    attributes: `You may anonymously talk with your prisoner.
				You can choose to attack your prisoner.
				The jailed target cannot perform their night ability.
				While jailed the prisoner is given Powerful defense.`,
    goal: "Lynch every criminal and evildoer."
} 
const Object = class extends Player {
    constructor() {
        super();
        this.name = 'jailor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 5; //Priority level of action
        this.attack = 3; //Unstoppable
        this.defense = 0; //None
        this.visits = true;
    }
}

const action = () => {

}

module.exports = { View, Object, action }