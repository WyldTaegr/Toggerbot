module.exports = {
    name: "interrogate",
    aliases: ['int'],
    description: "As the Sheriff in Town Of Salem, interrogate another player to see if they are suspicious.",
    action(caller, target) {
        const targetRole = require(`./roles/${target.name}.js`).view;
        if (targetRole.alignment = 'Town') {
            caller.user.send('Your target is not suspicious.');
        } else if (targetRole.alignment = "Mafia") {
            caller.user.send('Your target is a member of the Mafia!');
        } else if (targetRole.name = "Serial Killer") {
            caller.user.send('Your target is a Serial Killer!');
        }
    },
    execute(message) {
        if (!message.author.partOfTos) return;

        const client = require("../../index.js");
        const game = client.games.get(message.author.partOfTos);

        if (message.channel.type == 'text') return message.reply("Wow you're a Sheriff?");
        if (game.stage != 'Night') return message.channel.send('You can only interrogate someone at night.');
        if (game.assignments.get(client.guilds.get(message.author.partOfTos).member(message)).name != 'sheriff') return message.reply("You can't do that!");
        if (!game.assignments.get(client.guilds.get(message.author.partOfTos).member(message)).alive) return message.reply('Ya ded.');
        if (!message.mentions.users.size) return message.channel.send("You must interrogate another person!");
        if (message.mentions.users.size > 1) return message.channel.send("You can only interrogate one person at a time.");

        message.mentions.users.map(user => {
            if (!user.partOfTos) return message.reply("That guy's not playing.");
            if (user.partOfTos != message.author.partOfTos) return message.reply("That guy's in a different game.");

            const target = client.guilds.get(message.author.partOfTos).member(user);
            game.actions[3].push(client.guilds.get(message.author.partOfTos).member(message), 'interrogate', target);
            game.assignments.get(target).visited.push(message.member);
            message.channel.send(`You have decided to interrogate ${user.username} for tonight.`);
        });
    }
}