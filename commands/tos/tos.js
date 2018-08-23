const game = require("./src/game.js");

/*const initializeChannels = async function(message) {
    message.guild.createChannel('Town Of Salem', "category")
            .then(game.category = message.guild.channels.find(channel => channel.name == 'Town Of Salem'))
            .then(message.guild.createChannel("gods-hand", 'text'))
            .then(game.botChannel = message.guild.channels.find(channel => channel.name == "gods-hand"))
            .then(message.channel.send(game.category + game.botChannel))
            .then(console.log(game))
            .then(game.botChannel.setParent(game.category))
}; */

const initializeGame = async function (message) {
    game.category = await message.guild.createChannel('Town Of Salem', 'category');
    game.botChannel = await message.guild.createChannel('gods-hand', 'text');
    game.botChannel.setParent(game.category);
}

module.exports = {
    name: "tos",
    description: `Start a game of Town Of Salem, with you as the moderator.`,
    execute(message) {
        if (game.running) return message.reply("Stop being a sore-ass loser");
        game.running = true;
        game.moderator = message.author;
        game.players.push(message.author);
        
        //create tos category, voice channel, bot channel private mafia text channel
        initializeGame(message);
    }
}