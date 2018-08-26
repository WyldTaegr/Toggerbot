const { id } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Lists all commands, or specific info for a command',
    aliases: ['commands'],
    usage: `s${id}help [command name]`, //NOTE: prefix before id depends on folder name!
    cooldown: 5,
    execute(message, args) {
        const { commands } = message.client;
        const client = require("../../index.js");

        const embedInitial = new Discord.RichEmbed()
            .setTitle('**ToggerBot**')
            .setDescription('A bot made by Togger')
            .addField(`List of Commands:`, `\nUse \`s${id}help [command name]\` to get info on a specific command`) //NOTE: prefix before id depends on folder name!
            .setColor(0x00AE86)
            .setThumbnail(client.user.avatarURL)
            .setTimestamp();
        const prefixList = [];
        commandList = new Discord.Collection(); //Categorizes commands by prefix
        for (const prefix of client.prefixes) {
            prefixList.push(prefix[0]);
            const commands = [];
            for (const command of client.prefixes.get(prefix[0])) {
                if (command[0] != 'name') commands.push(command[0]);
            }
            commandList.set(prefix[0], commands);
        }
        if (!args.length) {
            for (let i = 0; i < prefixList.length; i++) {
                let commands = " ";
                for (let a = 0; a < commandList.get(prefixList[i]).length; a++) {
                    commands = commands.concat(commandList.get(prefixList[i])[a], ` `);
                }
                embedInitial.addField(`${prefixList[i]}:`, "`" + commands + "`", false);
            }

            embedInitial.addField("___", "Note: although different commands require different prefixes, all commands can be looked up using `" + this.usage + "`", true);

            return message.author.send(embedInitial)
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply(`You need help.`);
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply(`I can't seem like I can\'t DM you! Do you have DMs disabled?`);
                });
        }

        const name = args[0].toLowerCase();
        const command = [];
        for (let i = 0; i < prefixList.length; i++) {
            for (const cmd of commandList.get(prefixList[i])) {
                if (name == cmd || client.prefixes.get(prefixList[i]).get(cmd).aliases && client.prefixes.get(prefixList[i]).get(cmd).aliases.includes(name)) {
                    command.push(client.prefixes.get(prefixList[i]).get(cmd));
                }
            }
        }

        if (command.length == 0) return message.reply(`Sorry, that's not a valid command`);

        const embed = new Discord.RichEmbed()
        if (command.length == 1) {
            cmd = command[0];
            embed.addField(`**${String(cmd.name).charAt(0).toUpperCase() + String(cmd.name).slice(1)}**`, cmd.aliases ? "Aliases: `" + String(cmd.aliases).replace(',', `, `) + "`" : 'Aliases: `none`')
                .setColor(0x00AE86)
                .setTimestamp()
                .setThumbnail(client.user.avatarURL);
            if (cmd.description) embed.addField("Description:", cmd.description);
            if (cmd.usage) embed.addField("Usage:", cmd.usage);
            if (cmd.cooldown) embed.addField("Cooldown:", cmd.cooldown + 'seconds');
        } else {
            const embed = new Discord.RichEmbed()
                .setDescription("`" + name + "` could refer to one of the following:");
            for (const cmd of command) {
                embed.addField(`**${cmd.name}**`, cmd.aliases ? cmd.aliases : 'No aliases');
                if (cmd.description) embed.addField("**Description:**", cmd.description);
                if (cmd.usage) embed.addField("**Usage:**", cmd.usage);
                if (cmd.cooldown) embed.addField("**Cooldown:**", cmd.cooldown);

            }
        }

        message.channel.send(embed);
    },
};