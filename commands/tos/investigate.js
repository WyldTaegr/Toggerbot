module.exports = {
    name: 'investigate',
    aliases: ['inv'],
    description: 'As the Investigator in Town Of Salem, find the possible roles of another player.',
    action(caller, target) {
        const client = require("../../index.js");
        const game = client.games.get(caller.guild.id);
        const role = game.assignments.get(target).name;
        if (role == 'vigilante' || 'veteran' || 'mafioso') {
            caller.user.send("Your target could be a `Vigilante`, `Veteran`, or `Mafioso`.");
        } else if (role == 'medium' || 'janitor' || 'retributionist') {
            caller.user.send('Your target could be a `Medium`, `Janitor`, or `Retributionist`.');
        } else if (role == 'survivor' || 'vampire hunter' || 'amnesiac') {
            caller.user.send('Your target could be a `Survivor`, `Vampire Hunter`, or `Amnesiac`.');
        } else if (role == 'spy' || 'blackmailer' || 'jailor') {
            caller.user.send('Your target could be a `Spy`, `Blackmailer`, or `Jailor`.');
        } else if (role == 'sheriff' || 'executioner' || 'werewolf') {
            caller.user.send('Your target could be a `Sheriff`, `Executioner`, or `Werewolf`.');
        } else if (role == 'framer' || 'vampire' || 'jester') {
            caller.user.send('Your target could be a `Framer`, `Vampire`, or `Jester`.');
        } else if (role == 'lookout' || 'forger' || 'witch') {
            caller.user.send('Your target could be a `Lookout`, `Forger`, or `Witch`.');
        } else if (role == 'escort' || 'transporter' || 'consort') {
            caller.user.send('Your target could be an `Escort`, `Transporter`, or `Consort`.');
        } else if (role == 'doctor' || 'disguiser' || 'serial killer') {
            caller.user.send('Your target could be a `Doctor`, `Disguiser`, or `Serial Killer`.');
        } else if (role == 'investigator' || 'consigliere' || 'mayor') {
            caller.user.send('Your target could be an `Investigator`, `Consigliere`, or `Mayor`.');
        } else if (role == 'bodyguard' || 'godfather' || 'arsonist') {
            caller.user.send('Your target could be a `Bodyguard`, `Godfather`, or `Arsonist`.');
        }
    },
    execute(message) {
        if (!message.author.partOfTos) return;

        const client = require("../../index.js");
        const game = client.games.get(message.author.partOfTos);

        if (game.stage != 'Night') return message.channel.send('You can only investigate someone at night.');
        if (game.assignments.get(client.guilds.get(message.author.partOfTos).member(message)).name != 'investigator') return message.reply("You can't do that!");
        if (!game.assignments.get(client.guilds.get(message.author.partOfTos).member(message)).alive) return message.reply('Ya ded.');
        if (!message.mentions.members.size) return message.channel.send("You must investigate another person!");
        if (message.mentions.members.size > 1) return message.channel.send("You can only investigate one person at a time.");

        message.mentions.members.map(user => {
            if (!user.partOfTos) return message.reply("That guy's not playing.");
            if (user.partOfTos != message.author.partOfTos) return message.reply("That guy's in a different game.");

            const target = client.guilds.get(message.author.partOfTos).member(user);
            game.actions[3].push(client.guilds.get(message.author.partOfTos).member(message), 'interrogate', target);
            game.assignments.get(target).visited.push(message.member);
            message.author.send(`You have decided to investigate ${user.username} tonight.`);
        });
    }
}