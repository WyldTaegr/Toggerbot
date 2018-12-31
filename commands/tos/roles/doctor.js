const { Player } = require("../src/game");

const View = {
    name: 'Doctor',
    pictureUrl: 'http://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Doctor.png',
    alignment: 'Town',
    category: 'Protective',
    color: '#00ff00',
    abilities: `Heal one person each night, 
                preventing them from dying.`, //Note: keep lines short to allow commands to be in-line
    commands: 'Not implemented yet!',
    attributes: `You may only heal yourself once.
                 You will know if your target is attacked.`,
    goal: 'Lynch every criminal and evildoer.'
}
const Object = class extends Player {
    constructor() {
        super();
        this.name = 'doctor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 3; //Priority level of action
        this.attack = 0; //None
        this.defense = 0; //None, set to Powerful on self-heal
        this.visits = true;
    }
}

module.exports = { View, Object }