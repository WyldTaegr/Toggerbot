const game = require("../../index.js");

module.exports = {
    name: "tos",
    description: `Start a game of Town Of Salem, with you as the moderator.`,
    execute(message) {
        if (game.running) return message.reply("Stop being a sore-ass loser");
        game.running = true;
        game.moderator = message.author;
        game.players.push(message.author);
        //create tos category, voice channel, bot channel private mafia text channel
        game.category = message.guild.createChannel(`${message.author}'s Town Of Salem`, "category")
            .then(game.botChannel = message.guild.createChannel("God's Hand", 'text'))
            .then(game.botChannel.setParent(game.category))
    }
}