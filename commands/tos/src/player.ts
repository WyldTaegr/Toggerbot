import Discord from 'discord.js';
import { emojis } from "../../../utils";
import { Game } from './game';

export enum Selection {
  all,
  others,
  self,
}

export interface Action {
  agent: _Player,
  receiver: _Player,
  game: Game
}

export enum Color {
  Town = '#00ff00',
  Mafia = '#ff0000',
  Neutral = '#03f4fc',
}

export enum Alignment {
  Town = 'Town',
  Mafia = 'Mafia',
  Neutral = 'Neutral'
}

export enum Category {
  Killing = 'Killing',
  Investigative = 'Investigative',
  Support = 'Support',
  Protective = 'Protective',
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
  pictureUrl: string;
  alignment: string;
  category: string;
  color: string;
  abilities: string;
  attributes: string;
  goal: string;

  constructor(props: {
    name: string;
    picture: Discord.Attachment;
    pictureUrl: string;
    alignment: string;
    category: string;
    color: string;
    abilities: string;
    attributes: string;
    goal: string;
  }) {
    this.name = props.name;
    this.picture = props.picture;
    this.pictureUrl = props.pictureUrl;
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
  visited: _Player[];
  blocked: _Player[]; //if not blocked, false; if blocked, shows who blocked
  target: Discord.GuildMember | null;
  votes: number;
  vote: _Player | null;
  deathNote?: string; //Roles with a kill action have death notes
  input?: Discord.TextChannel; //The channel in which a player can make their actions
  activeMenuId?: string; 
  //Defined in individual role class
  abstract name: string; //Used as identifier in code ---> keep lowercase
  abstract priority: number; //Priority level of action --> -1 for Array indexing
  abstract attack: number; //TODO - When implemented, create enums to reference?
  abstract defense: number;
  abstract visits: boolean; //Whether the role visits its target on its action
  abstract selection: Selection; //The set of players available for targeting
  abstract view: _View;
  abstract action(action: Action): void;
  
  constructor(user: Discord.User, index: number) {
      this.user = user;
      this.emoji = emojis[index];
      this.alive = true;
      this.will = '';
      this.visited = []; //Array of players as role.objects who visit that night
      this.blocked = []; //Checks if role-blocked
      this.target = null; //GuildMember: targeted player for nighttime action
      this.votes = 0; //Number of votes against the player for Trial
      this.vote = null; //This player's vote
  }
}