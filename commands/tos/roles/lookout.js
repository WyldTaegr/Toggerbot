module.exports.view = {
    name: 'Lookout',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Lookout.png',
    alignment: 'Town',
    category: 'Investigative',
    color: "#00ff00",
    abilities: `Watch one person at night to 
                see who visits them.`, //Note: keep lines short to allow commands to be in-line
    commands: 'Not implemented yet!',
    attributes: 'None',
    goal: "Lynch every criminal and evildoer."
} 
module.exports.object = class extends require('../src/game.js').player {
    constructor() {
        super();
        this.name = 'lookout'; //Note: used as identifier in code --> keep lowercase
        this.priority = 4; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None
        this.visits = true;
    }
}