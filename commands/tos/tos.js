const Game = require("./src/game.js");

const initializeGame = async function (message, game) {
    game.category = await message.guild.createChannel('Town Of Salem', 'category');
    game.botChannel = await message.guild.createChannel('gods-hand', 'text');
    game.botChannel.setParent(game.category);
}

module.exports = {
    name: "tos",
    description: `Start a game of Town Of Salem, with you as the moderator.`,
    execute(message) {
        const games = require("../../index.js").games;
        const game = games.get(message.guild.id);
        if (game.running) return message.reply("Stop being a sore-ass loser");
        game.running = true;
        game.moderator = message.author;
        game.players.push(message.author);
        
        //create tos category, voice channel, bot channel private mafia text channel
        initializeGame(message, game);
    }
}