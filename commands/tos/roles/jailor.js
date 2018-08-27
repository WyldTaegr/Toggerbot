module.exports.view = {
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
module.exports.object = class extends require('../src/game.js').player {
    constructor() {
        super();
        this.name = 'jailor'; //Note: used as identifier in code --> keep lowercase
    }
}