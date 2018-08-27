module.exports.view = {
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
module.exports.object = class extends require('../src/game.js').player {
    constructor() {
        super();
        this.name = 'Doctor';
    }