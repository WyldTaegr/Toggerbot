# Toggerbot

A discord bot (ReadMe is outdated!)

## Currently developing: **Town Of Salem**

Here's a list of useful definitions:

### Class Definitions

#### Toggerbot/commands/tos/src/game.js

##### Game

*Used to define a single game instance.*  

- `Running: Boolean`: Checks if a game is currently running  
- `Moderator: GuildMember`: The person who starts the game --> Access to empowered commands  
- `_Players: Array of GuildMembers`: The people in the game  
- `Roles: Array of Role Names`: The roles added to the game  
- `Assignments: Collection(GuildMember => role.object)`: Assigns players with roles from respective arrays  
- `Stage: String`: Current stage of game: `Setup`, `Night`, `Processing`, `Day`, or `Trial`  
- `Actions: Array of Arrays of Action{ name: String, agent: GuildMember, receiver: GuildMember}`: Organizes all actions for a single night by priority, resets every new day  
- `Counter: Number`: Counts the number of Night/Day cycles that have gone by  
- `Category: CategoryChannel`: The Discord guild category within which the game resides  
- `chat: TextChannel`: The Discord guild text channel where Toggerbot will make announcements as God  
- `Origin: TextChannel`: The Discord guild text channel where the game was started  
- `Reset: Function()`: Used to end a game  
- `CheckNight: Function(Message, action: String, targets: Number)`: Checks if the command can be passed. Parameters: action: the name of the command targets: the number of players the command can target; returns: Array of role.objects of targets  
- `CycleNight: Function()`: Brings the game onward into the next Night
- `ProcessNight: Function(menu: String)`: Processes all actions selected by players during Night phase; Parameter: menu: Id of the message with action selection, used to close reaction menu

##### Player

*Base object used to define a player's role*  

- `Alive: Boolean`: Tells whether the player is alive  
- `Will: String`: A player's last will  
- `Visited: Array of GuildMembers`: The players that visit that night  
- `Blocked: GuildMember`: False if not role-blocked; the player that role-blocked that night  

#### Toggerbot/commands/tos/roles

*Folder containing files for every role*  
`View`: Object containing display information for the `tos!role` and `tos!me` commands  
+ *Note:* Keep lines short for the `Abilities` property to allow the `Commands` property to be in-line  
`Object`: Extends [Game._Player](#player), the object that is ultimately assigned to a player when a game begins  
- `Name: String`  
- `Commands: String`: A string that includes all the names of commands that the role can use
- `Priority: Number`: The priority level of the role's night ability *Might not be necessary?*
- `Attack: Number`: 0-3, None < Basic < Powerful < Unstoppable  
- `Defense: Number`: 0-3 , None < Basic < Powerful < Invincible  
- `Visits: Boolean`: States whether the role's ability causes it to visit another player  

### Object Definitions  

#### Toggerbot/index.ts  

*client.games:* Collection(*Guild<i>.id* => [Game](#game)) *Links every accessible guild with a Town Of Salem game instance*  
*client.prefixes:* Collection(*folderName* => Collection(*commandName* => *command*)) *Organizes commands by prefix*  

### Bot-Defined Object Properties

*User.partOfTos: Guild<i>.id False if user is not part of a game*