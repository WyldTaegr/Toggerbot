const utils = require('../../utils.js');

module.exports = {
    name: 'start',
    description: 'Starts the Town Of Salem game! Assigns roles to all players and begins Night 1.',
    guildOnly: true,
    execute(message) {
        const client = require("../../index.js");
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply('Setup a game first!');
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != 'setup') return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        if (game.players.length > game.roles.length) return message.reply('You need to add more roles first!');

        if (game.players.length <= 5) message.channel.send('This is gonna be a pretty lame game, just saying.');
        message.channel.send('Shuffling roles...');
        game.roles = utils.shuffle(game.roles);
        message.channel.send('Assigning to players...');
        game.players.forEach((member, index) => {
            const { Object } = require(`./roles/${game.roles[index]}.js`);
            const object = new Object()
            game.assignments.set(member, object);
        });
        message.channel.send('The game has begun!');
        game.cycleNight();
    }
}