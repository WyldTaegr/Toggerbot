import Discord from 'discord.js';

export enum Selection {
  all,
  others,
  self,
}

export interface Action {
  agent: _Player,
  receiver: _Player,
}

export class _View {
  name: string;
  pictureUrl: string;
  alignment: string;
  category: string;
  color: string;
  abilities: string;
  attributes: string;
  goal: string;

  constructor(props) {
    this.name = props.name;
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
  alive: boolean;
  will: string;
  visited: _Player[];
  blocked: _Player | boolean; //if not blocked, false; if blocked, shows who blocked
  target: Discord.GuildMember;
  //Defined in individual role class
  user: Discord.User; //Used to DM a player when an action requires it
  name: string; //Used as identifier in code ---> keep lowercase
  priority: number; //Priority level of action --> -1 for Array indexing
  attack: number; //TODO - When implemented, create enums to reference?
  defense: number;
  visits: boolean; //Whether the role visits its target on its action
  selection: Selection; //The set of players available for targeting
  abstract action(action: Action): void;
  
  constructor() {
      this.alive = true;
      this.will = '`Succ my ducc`';
      this.visited = []; //Array of players as role.objects who visit that night
      this.blocked = false; //Checks if role-blocked
      this.target = null; //GuildMember: targeted player for nighttime action
  }

  checkSelection(receiver) { //Checks if the player can be selected as a target during Night stage
      if (this.selection === Selection.all) return false;
      if (this.selection === Selection.others && this === receiver) return ("You can't target yourself!");
      if (this.selection === Selection.self && this != receiver) return ("You can only target yourself!");
  }

  checkAction() { //Checks if action can be carried out during Processing stage
      if (!this.alive) return false;
      if (this.blocked) return false;
      return true;
  }
}