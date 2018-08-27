function shuffle(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }

module.exports = {
    name: 'start',
    description: 'Starts the Town Of Salem game! Assigns roles to all players and begins Night 1.',
    guildOnly: true,
    execute(message) {
        const client = require("../../index.js");
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply('Setup a game first!');
        if (message.channel != game.botChannel) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != 'setup') return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        if (game.players.length > game.roles.length) return message.reply('You need to add more roles first!');

        if (game.players.length <= 5) message.channel.send('This is gonna be a pretty lame game, just saying.');
        message.channel.send('Shuffling roles...');
        //shuffle(game.roles);
        message.channel.send('Assigning to players...');
        for (let i = 0; i < game.players.length; i++) {
            const Role = require(`./roles/${game.roles[i]}.js`).object;
            const object = new Role()
            game.assignments.set(game.players[i], object);
        }
        message.channel.send('The game has begun!');
        game.cycleNight();

    }
}