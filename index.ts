const { id, token } = require("./config.json");

import Discord from "discord.js"
import fs from 'fs';
import { Game, Stage } from "./commands/tos/src/game";
//@ts-ignore
import { Handler } from "reaction-core";
import { isString, isNumber, isUndefined } from "./utils";
import { isNull } from "./utils";
import fetch from "cross-fetch";

console.clear()

async function createBotGuild(client: GameClient) {
    //Delete extra servers if necessary
    for (const [, server] of client.guilds) {
        if (server.name == "ToggerLand") server.delete();
    }
    //Create Guild
    const guild = await fetch('https://discordapp.com/api/guilds', {
        method: "POST",
        body: JSON.stringify({ 
            name: "ToggerLand",
            roles: [
                {
                    id: 41771983423143936,
                    name: "Infiltrator",
                    color: 0,
                    hoist: true,
                    position: 1,
                    permissions: 0,
                    managed: true,
                    mentionable: true
                }
            ],
            channels: [
                {
                    name: "admin",
                    type: 0,
                }
            ]
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${token}`,
        }
    }).then(async (response) => {
        return await response.json()
    });
    
    const application = await client.fetchApplication();
    if (client.guild = application.client.guilds.get(guild.id)) console.log("\n Linked with guild: ", client.guild.name);
    else {
        console.log("Could not connect with guild !!")
        console.log("Response: \n", guild)
        console.log("Registered Guild: \n", client.guild)
        client.destroy();
    }
}

export class Command {
    name: string;
    aliases: string[] | undefined;
    description: string;
    usage: string;  
    guildOnly: boolean;
    cooldown: number;
    requireArgs: boolean;
    execute: (message: Discord.Message, args?: string[]) => void;
    constructor(props: {
        name: string;
        aliases: string[] | undefined;
        description: string;
        usage: string;  
        guildOnly: boolean;
        cooldown: number;
        requireArgs: boolean;
        execute: (message: Discord.Message, args?: string[]) => void;
    }) {
        this.name = props.name;
        this.aliases = props.aliases;
        this.description = props.description;
        this.usage = props.usage;
        this.guildOnly = props.guildOnly;
        this.cooldown = props.cooldown;
        this.requireArgs = props.requireArgs;
        this.execute = props.execute;
    }
}

export class GameClient extends Discord.Client {
    handler: any; //Rip no types in reaction-core
    guild?: Discord.Guild;
    games: Discord.Collection<string, Game>;
    prefixes: Discord.Collection<
        string, Discord.Collection<
            string, string | Command
        >
    >;
    constructor(props: Discord.ClientOptions) {
        super(props)
        this.handler = new Handler();
        this.games = new Discord.Collection();
        this.prefixes = new Discord.Collection();
            const commandFolders = fs.readdirSync("./commands");
            for (const folder of commandFolders) {
                const commands: Discord.Collection<string, string | Command> = new Discord.Collection();
                const commandFiles = fs
                    .readdirSync(`./commands/${folder}`)
                    .filter(file => file.endsWith(".ts"));
                commands.set("name", folder);
                for (const file of commandFiles) {
                    const command: Command = require(`./commands/${folder}/${file}`);
                    commands.set(command.name, command);
                }
                this.prefixes.set(folder, commands);
            }
    }
}

const client = new GameClient({ sync: true });

const cooldowns: Discord.Collection<
    string, Discord.Collection<
        string, number
    >
> = new Discord.Collection();

client.on("ready", async () => {
    console.log("Ready!");
    console.log("Server count:", client.guilds.size)
    for (const [, server] of client.guilds) {
        console.log(`\n ${server.name}`);
    }
    await createBotGuild(client)

    const Tiger = client.users.get('179697448300576778');
    //@ts-ignore
    Tiger.pending = "Admin";
    const admin = await client.guild!.channels.find(channel => channel.name === "admin") as Discord.TextChannel
    const devInvite = await admin.createInvite()
    if (!isUndefined(Tiger)) Tiger.send(devInvite.url);
    admin.send("Ready!")
    const cfc = client.guilds.get("480906166541484033")
    if (!isUndefined(cfc)) cfc.me.setNickname("Sex Bot");
    client.user.setActivity("Finding Jerry");
    for (const guild of client.guilds) {
        //When iterating through a collection, the const returns an Array[key, value]
        const game = new Game();
        client.games.set(guild[0], game);
    }
    module.exports = client;
});

client.on("messageReactionAdd", (messageReaction, user) =>
    client.handler.handle(messageReaction, user)
);

client.on("guildMemberAdd", async (member) => {
    if (member.guild !== client.guild) return;
    //@ts-ignore
    if (!member.user.pending) return member.kick();
    if (member.user.id == "179697448300576778") {
        const admin = await client.guild.channels.find(channel => channel.name === "admin") as Discord.TextChannel;
        admin.overwritePermissions(member.user, {
            'SEND_MESSAGES': true,
            'READ_MESSAGES': true,
            'VIEW_CHANNEL': true,
            'READ_MESSAGE_HISTORY': true
        })
    }
    //@ts-ignore
    const pending = member.user.pending;
    console.log(`${member.user.username}: ${pending}`)
    //@ts-ignore
    if (pending === "Admin") return member.user.pending = undefined;
    const game = client.games.get(pending);
    if (isUndefined(game) || game.stage !== Stage.Setup) return member.kick();
    if (member.user === game.moderator) game.announcements!.overwritePermissions(game.moderator.id, { 'SEND_MESSAGES': true });
    game.players.push(member);
    member.addRole(game.role!);
    game.setup!.edit(game.setupEmbed())
    //@ts-ignore
    member.user.partOfTos = pending;
})

client.on("message", message => {
    if (message.author.bot) return;
    if (message.guild && message.guild.id == "480906166541484033") {
        //Requested by Jerry
        if (message.content.toLowerCase() == "suck my pepe") {
            return message.channel.send(
                "<@360984532951760896>, yes anything for you papa"
            );
        }
    }

    let commandType: string | undefined;
    for (const prefix of client.prefixes) {
        if (message.content.startsWith(prefix[1].get("name") + id)) {
            commandType = prefix[1].get("name") as string;
        }
    }

    if (isUndefined(commandType)) return;

    const args: string[] = message.content
        .slice(commandType.length + id.length)
        .split(/ +/);

    const _commandName: string | undefined = args.shift()
    if (!_commandName) return;
    const commandName: string = _commandName.toLowerCase();

    const possibleCommands: Discord.Collection<string, string | Command> | undefined = client.prefixes.get(commandType);
        if (isUndefined(possibleCommands)) return;
    const command = (
        possibleCommands.get(commandName) ||
        possibleCommands
            .find((cmd: string | Command) => {
                if (isString(cmd)) return false;
                if (cmd.aliases && cmd.aliases.includes(commandName)) return true; else return false;
            })) as Command;

    if (isNull(command)) return;

    if (command.guildOnly && message.channel.type !== "text") {
        return message.reply("I can't execute that command inside DMs!");
    }

    if (command.requireArgs && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${commandType + id + command.name} ${
                command.usage
            }\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now: number = Date.now();
    const timestamps: Discord.Collection<string, number> | undefined = cooldowns.get(command.name);
    const cooldownAmount: number = (command.cooldown || 3) * 1000;
    if (!isUndefined(timestamps)) {
        if (!timestamps.has(message.author.id)) {
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            const userCooldown: number | undefined = timestamps.get(message.author.id)
            if (isNumber(userCooldown)) {
                const expirationTime = userCooldown + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(
                        `please wait ${timeLeft.toFixed(
                            1
                        )} more second(s) before reusing the \`${
                            command.name
                        }\` command.`
                    );
                }
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }
    }

    try {
        command.execute(message, args);
        console.log(`${message.author.username} : ${message.content}`);
    } catch (error) {
        console.error(error);
        message.reply("no u");
    }
});

client.login(token);
