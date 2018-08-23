const game = require("./src/game.js");

module.exports = {
    name: "tos",
    description: `Start a game of Town Of Salem, with you as the moderator.`,
    async execute(message) {
        if (game.running) return message.reply("Stop being a sore-ass loser");
        game.running = true;
        game.moderator = message.author;
        game.players.push(message.author);
        //create tos category, voice channel, bot channel private mafia text channel
        message.guild.createChannel('Town Of Salem', "category")
            .then(game.category = message.guild.channels.find(channel => channel.name == 'Town Of Salem'))
            .then(message.guild.createChannel("gods-hand", 'text'))
            .then(game.botChannel = message.guild.channels.find(channel => channel.name == "gods-hand"))
            .then(game.botChannel.setParent(game.category))
    }
}