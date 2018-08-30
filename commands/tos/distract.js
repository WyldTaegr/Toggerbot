module.exports = {
    name: 'distract',
    aliases: ['d', 'block'],
    description: 'As the Escort, choose a person to distract for the night.',
    action(caller, target) {
        game.assignments.get(target).blocked = caller;
        target.user.send('Someone role-blocked you!');
    },
    execute(message, args) {
        if (!message.author.partOfTos) return;

        const client = require("../../index.js");
        const game = client.games.get(message.author.partOfTos);

        if (message.channel.type == 'text') return message.reply('Not out here!');
        if (game.stage != 'Night') return message.reply('Not now!');
        if (game.assignments.get(client.guilds.get(message.author.partOfTos).member(message)).name != 'escort') return message.reply("You can't do that!");
        if (!message.mentions.users.size) return message.channel.send("I'm sorry, but you can't distract yourself.");
        if (message.mentions.users.size > 1) return message.reply("You're attractive, but not that attractive.");
        
        message.mentions.users.map(user => {
            if (!user.partOfTos) return message.reply("That guy's not playing.");
            if (user.partOfTos != message.author.partOfTos) return message.reply("That guy's in a different game.");

            game.actions[1].push(client.guilds.get(message.author.partOfTos).member(message), 'distract', client.guilds.get(message.author.partOfTos).member(user));
            message.channel.send(`You have decided to distract ${user.username} for tonight.`);
        })
    }
}