import Discord from 'discord.js';
import { Selection, _View, _Player, Alignment, Category, Color, Attack, Defense } from '../src/player';
import { Game, Stage } from '../src/game';
//@ts-ignore
import { Menu } from 'reaction-core';
import { GameClient } from '../../..';

const image = new Discord.Attachment('images/tos/jailor.png', 'jailor.png')

export const View = new _View({
    name: 'Jailor',
    picture: image,
    alignment: Alignment.Town,
    category: Category.Killing,
    color: Color.Town,
    abilities: "You may choose one person during the\nday to jail for the night.",
    attributes: "You may anonymously talk with your prisoner.\nYou can choose to attack your prisoner.\nThe jailed target cannot perform their night ability.\nWhile jailed the prisoner is given Powerful defense.",
    goal: "Lynch every criminal and evildoer."
})

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    selection: Selection;
    useLimit: number;
    unique: boolean;
    view: _View;
    execute: boolean; //Whether the Jailor will execute his prisoner
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'jailor'; //Note: used as identifier in code --> keep lowercase
        this.priority = 5; //Priority level of action
        this.attack = Attack.Unstoppable;
        this.defense = Defense.None;
        this.selection = Selection.others;
        this.useLimit = 3;
        this.unique = true;
        this.view = View;
        this.execute = false;
    }

    targetMessage(target: _Player) { return `You have decided to jail <@${target.user.id}> tonight.` };

    action(game: Game) {
        const client: GameClient = require('../../../index');
        if (game.stage === Stage.Discussion) {
            const buttons: Object[] = [];
            let playerSelection = '';
            game.alive.forEach(member => {
                const receiver = game.assignments.get(member);
                    if (!receiver) return console.error("Jailor.action: GuildMember without Player assignment")
                playerSelection = playerSelection.concat(receiver.emoji, ` - <@${member.user.id}>\n`);
                if (receiver !== this) buttons.push({
                    emoji: receiver.emoji,
                    run: async () => {
                        if (!this.input) return console.error("Jailor.action: player.input is not defined [1]");
                        if (receiver === this.target) {
                            this.target = null;
                            this.input.send("You have changed your mind.");
                        } else {
                            this.target = receiver;
                            this.input.send(`You have decided to jail <@${receiver.user.id}> tonight.`)
                        }
                    }
                })
            })
            const embed = new Discord.RichEmbed()
                .setTitle(`Day ${game.counter}`)
                .setDescription("Choose someone to jail tonight.")
                .setColor("#ffff00")
                .attachFile(image)
                .setThumbnail("attachment://jailor.png")
                .addField("Alive:", playerSelection)
            const message = new Menu(embed, buttons);
            client.handler.addMenus(message);
            //@ts-ignore
            this.input.sendMenu(message).then(message => this.activeMenuId = message.id);
        } else if (game.stage === Stage.Night) {
            client.handler.removeMenu(this.activeMenuId);
            if (!this.target) return;
            this.target.jailed = true;
            game.jail!.overwritePermissions(this.target.user, { "VIEW_CHANNEL": true, "READ_MESSAGES": true, "SEND_MESSAGES": true})
            this.target.input!.send("You have been hauled off to jail!")
            const buttons = [
                {
                    emoji: '❎',
                    run: (user: Discord.User, message: Discord.Message) => {
                        if (!game.jail) return console.error("Jailor.action: game.jail is null [1]");
                        if (!this.input) return console.error("Jailor.action: player.input is not defined [2]");
                        if (this.execute) {
                            game.jail.send("The jailor has changed their mind.")
                            this.input.send("You have changed your mind.")
                        }                    
                        this.execute = false;
                    }
                },
                {
                    emoji: '💀',
                    run: (user: Discord.User, message: Discord.Message) => {
                        if (!game.jail) return console.error("Jailor.action: game.jail is null [2]");
                        if (!this.input) return console.error("Jailor.action: player.input is not defined [3]");
                        if (!this.useLimit) return this.input.send("You have no executions remaining.");
                        if (!this.execute) {
                            game.jail.send("The jailor has decided to execute you.");
                            this.input.send(`You have decided to execute your prisoner.\nYou have ${this.useLimit} execution${this.useLimit === 1 ? "" : "s"} remaining.`);
                        }
                        this.execute = true;
                    }
                }
            ]
            const embed = new Discord.RichEmbed()
                .setTitle(`You have hauled **${this.target.user.username}** off to jail!`)
                .attachFile(image)
                .setThumbnail('attachment://jailor.png')
                .setColor('#ff0000')
                .addField("Are they good or evil??", "❎ - Good\n☠️ - Evil")
                .setFooter(this.useLimit ? `You have ${this.useLimit} executions remaining` : 'You have no executions remaining')
            const message = new Menu(embed, buttons);
            client.handler.addMenus(message);
            //@ts-ignore
            this.input.sendMenu(message).then(message => this.activeMenuId = message.id)
        } else if (game.stage === Stage.Processing) {
            if (!this.target) return;
            game.jail!.overwritePermissions(this.target.user, { "VIEW_CHANNEL": false})
            if (this.execute) {
                this.useLimit--;
                this.target.kill(
                    game, 
                    "You were executed by the Jailor!",
                    {
                        killers: 1,
                        cause: "They were executed by the Jailor.",
                        deathNotes: []
                    }
                );
            } else if (this.target.name === "serial") {
                this.kill(
                    game,
                    "You were stabbed by the Serial Killer you jailed!",
                    {
                        killers: 1,
                        cause: "They were stabbed by a Serial Killer.",
                        deathNotes: this.target.deathNote ? [this.target.deathNote] : []
                    }
                )
            }
        } else console.error(`Jailor.action: ${game.stage} was not accounted for`)
    }
}