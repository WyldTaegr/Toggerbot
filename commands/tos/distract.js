module.exports = {
    name: 'distract',
    aliases: ['d', 'block'],
    description: 'As the Escort in Town Of Salem, choose a person to distract for the night.',
    action(caller, target) {
        const client = require("../../index.js");
        const game = client.games.get(caller.guild.id);

        game.assignments.get(target).blocked = caller;
        target.user.send('Someone role-blocked you!');
    },
    execute(message) {
        if (!message.author.partOfTos) return;

        const client = require("../../index.js");
        const game = client.games.get(message.author.partOfTos);

        if (message.channel.type == 'text') return message.reply('Not out here!');
        if (game.stage != 'Night') return message.reply('Not now!');
        if (game.assignments.get(client.guilds.get(message.author.partOfTos).member(message)).name != 'escort') return message.reply("You can't do that!");
        if (!game.assignments.get(client.guilds.get(message.author.partOfTos).member(message)).alive) return message.reply('Ya ded.');
        if (!message.mentions.users.size) return message.channel.send("I'm sorry, but you can't distract yourself.");
        if (message.mentions.users.size > 1) return message.reply("You're attractive, but not that attractive.");
        
        message.mentions.users.map(user => {
            if (!user.partOfTos) return message.reply("That guy's not playing.");
            if (user.partOfTos != message.author.partOfTos) return message.reply("That guy's in a different game.");

            const target = client.guilds.get(message.author.partOfTos).member(user);
            game.actions[1].push(client.guilds.get(message.author.partOfTos).member(message), 'distract', target);
            game.assignments.get(target).visited.push(message.member);
            message.channel.send(`You have decided to distract ${user.username} for tonight.`);
        });
    }
}