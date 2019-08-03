import Discord from "discord.js";
import { emojis } from "../../../utils";
import { Game, death } from "./game";
import { GameClient } from "../../..";

export enum Selection {
  all,
  others,
  self
}

export enum Color {
  Town = "#00ff00",
  Mafia = "#ff0000",
  Neutral = "#03f4fc"
}

export enum Alignment {
  Town = "Town",
  Mafia = "Mafia",
  Neutral = "Neutral"
}

export enum Category {
  Killing = "Killing",
  Investigative = "Investigative",
  Support = "Support",
  Protective = "Protective"
}

export enum Attack {
  None = 0,
  Basic = 1,
  Powerful = 2,
  Unstoppable = 3
}
export enum Defense {
  None = 0,
  Basic = 1,
  Powerful = 2,
  Invincible = 3
}

export class _View {
  name: string;
  picture: Discord.Attachment;
  alignment: Alignment;
  category: Category;
  color: Color;
  abilities: string;
  attributes: string;
  goal: string;
  
  constructor(props: {
    name: string;
    picture: Discord.Attachment;
    alignment: Alignment;
    category: Category;
    color: Color;
    abilities: string;
    attributes: string;
    goal: string;
  }) {
    this.name = props.name;
    this.picture = props.picture;
    this.alignment = props.alignment;
    this.category = props.category;
    this.color = props.color;
    this.abilities = props.abilities;
    this.attributes = props.attributes;
    this.goal = props.goal;
  }
}

export abstract class _Player {
  user: Discord.User; //Used to DM a player when an action requires it
  emoji: string; //Used in reaction menus
  alive: boolean;
  will: string;
  visited: _Player[]; //Array of players as role.objects who visit that night
  blocked: _Player[]; //Checks if role-blocked
  healed: _Player[]; // Checks if doctor healed
  jailed: boolean;
  target: _Player | null; //targeted player for nighttime action
  votes: number;  //Number of votes against the player during Voting, abstain if true during Judgement
  vote: _Player | null; //This player's vote during Voting
  deathNote?: string; //Roles with a kill action have death notes
  input?: Discord.TextChannel; //The channel in which a player can make their actions
  activeMenuId?: string;
  //Defined in individual role class
  abstract name: string; //Used as identifier in code ---> keep lowercase
  abstract priority: number; //Priority level of action --> -1 for Array indexing
  abstract attack: Attack;
  abstract defense: Defense;
  abstract selection: Selection; //The set of players available for targeting
  abstract useLimit?: number; //Some actions have limited uses on certain roles
  abstract unique: boolean; //Some roles must only appear once per game
  abstract view: _View;
  abstract targetMessage(target: _Player): string;
  abstract action(game?: Game): void;
  
  constructor(user: Discord.User, index: number) {
    this.user = user;
    this.emoji = emojis[index];
    this.alive = true;
    this.will = "";
    this.visited = [];
    this.blocked = [];
    this.healed = [];
    this.jailed = false;
    this.target = null;
    this.votes = 0;
    this.vote = null;
  }

  async setTarget(player: _Player) {
    if (!player) return console.error("Player.setTarget: player is not defined");
    if (!this.input) return console.error("Player.setTarget: player.input is not defined");
    if (player === this.target) {
      this.target = null;
      this.input.send("You have changed your mind.");
    } else {
      this.target = player
      this.input.send(this.targetMessage(player));
    }
  }

  async kill(game: Game, notification: string, death: death) {
    this.alive = false;
    const embed = new Discord.RichEmbed()
      .setTitle(notification)
      .setColor('#ff0000')
    this.input!.send(embed);
    game.deaths.set(this, death);
    const client: GameClient = require('../../../index');
    const member = await client.guild!.fetchMember(this.user)
    game.chat!.overwritePermissions(member, {"SEND_MESSAGES": false, "ADD_REACTIONS": false})
    game.mafia!.overwritePermissions(member, {"SEND_MESSAGES": false})
    game.graveyard!.overwritePermissions(member, {"VIEW_CHANNEL": true, "READ_MESSAGE_HISTORY": true, "SEND_MESSAGES": true});
  }
}
