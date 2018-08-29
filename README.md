# Toggerbot
A discord bot

## Currently developing: **Town Of Salem**
Here's a list of useful definitions:

### Class Definitions
#### Toggerbot/commands/tos/src/game.js
##### Game
*Used to define a single game instance.*  
`Running: Boolean`: Checks if a game is currently running  
`Moderator: GuildMember`: The person who starts the game --> Access to empowered commands  
`Players: Array of GuildMembers`: The people in the game  
`Roles: Array of Role Names`: The roles added to the game  
`Assignments: Collection(GuildMember => role.object)`: Assigns players with roles from respective arrays  
`Stage: String`: Current stage of game, either `Setup`, `Night`, `Day`, or `Trial`  
`Actions: Array of Arrays of Actions`: Organizes all actions a single night by priority, resets every new day
`Counter: Number`: Counts the number of Night/Day cycles that have gone by  
`Category: CategoryChannel`: The Discord guild category within which the game resides  
`BotChannel: TextChannel`: The Discord guild text channel where Toggerbot will make announcements as God  
`Origin: TextChannel`: The Discord guild text channel where the game was started  
`Reset: Function()`: Used to end a game  
`CycleNight: Function()`: Brings the game onward into the next Night  

##### Player
*Base object used to define a player's role*  
`Alive: Boolean`: Tells whether the player is alive  
`Will: String`: A player's last will  
`Visited: Array of GuildMembers`: The players that visit that night  
`Blocked: Boolean`: Checks if the player has been role-blocked  

#### Toggerbot/commands/tos/roles
*Folder containing files for every role*  
`Module.exports.view`: Contains display information for the `tos!role` and `tos!me` commands  
- *Note:* Keep lines short for the `Abilities` property to allow the `Commands` property to be in-line  
`Module.exports.object`: Extends [Game.Player](#player), the object that is ultimately assigned to a player when a game begins  
- `Name: String`  
- `Priority: Number`: The priority level of the role's night ability  
- `Attack: Number`: 0-3, None < Basic < Powerful < Unstoppable  
- `Defense: Number`: 0-3 , None < Basic < Powerful < Invincible  
- `Visits: Boolean`: States whether the role's ability causes it to visit another player  

### Object Definitions  
#### Toggerbot/index.js  
*client.games:* Collection(*Guild<i>.id* => [game](#Game)) *Links every accessible guild with a Town Of Salem game instance*  
*client.prefixes:* Collection(*folderName* => Collection(*commandName* => *command*)) *A Collection of commands, organized by prefix*  