const Game = require("./src/game.js");

module.exports = {
    name: "end",
    description: 'Ends a Town Of Salem game. Only executable by moderator',
    execute(message) {
        const games = require("../../index.js").games;
        const game = games.get(message.guild.id);
        if (!game.running) return message.reply("Wow you really don't like this game.");
        if (message.author != game.moderator) return message.reply("Ask the faggot in charge");
        if (message.channel != game.botChannel) return message.reply('Wrong channel my dood');
        game.botChannel.delete();
        game.category.delete();
        game.reset();
    }
}