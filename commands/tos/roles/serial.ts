import Discord from 'discord.js';
import { Selection, _View, _Player, Color, Alignment, Category, Attack, Defense } from '../src/player';
import { Game } from '../src/game';

const image = new Discord.Attachment('images/tos/serial-killer.png', 'serial-killer.png')

export const View = new _View({
    name: 'Serial Killer',
    picture: image,
    alignment: Alignment.Neutral,
    category: Category.Killing,
    color: Color.Neutral,
    abilities: "Kill someone each night.",
    attributes: "If you are role blocked you will attack\nthe role blocker instead of your target.\nYou can not be killed at night.",
    goal: "Kill everyone who would oppose you."
})

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    selection: Selection;
    useLimit?: number;
    unique: boolean;
    view: _View;
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'serial';
        this.priority = 5;
        this.attack = Attack.Basic;
        this.defense = Defense.Basic;
        this.selection = Selection.others;
        this.unique = false;
        this.view = View;
    }

    targetMessage(target: _Player) { return `You have decided to kill <@${target.user.id}> tonight.` };

    action(game: Game) {
        if (!this.target) return;
        if (!this.input) return console.error('Serial Killer: this.input is not defined');
        if (!this.target.input) return console.error ('Serial Killer: this.target.input is not defined');
        if (this.blocked.length >= 0 && this.blocked.find((player) => player.alive)) { //Serial Killer was role-blocked
            this.input.send("Someone role blocked you, so you attacked them!");
            this.blocked.forEach(blocker => {
                if (!blocker.alive) return; //Role-blocker has already died to other causes, won't actually visit the Serial Killer
                blocker.kill(
                    game,
                    'You were murdered by the Serial Killer you visited!',
                    {
                        killers: 1,
                        cause: 'They were stabbed by a Serial Killer',
                        deathNotes: this.deathNote ? [this.deathNote] : []
                    }
                )
            })
        } else {
            this.target.visited.push(this);
            if (!this.target.alive) { //Serial Killer's target was already killed
                const death = game.deaths.get(this.target)
                if (!death) return console.error("Serial Killer: Already killed target returned no death object");
                death.killers++;
                death.cause = death.cause.concat("\nThey were also stabbed by a Serial Killer.")
                this.deathNote && death.deathNotes.push(this.deathNote)
                game.deaths.set(this.target, death);
            } else if (this.target.defense >= Defense.Basic) { //Serial Killer attacked a target with higher defense
                this.input.send("Your target's defence was too high to kill!");
                this.target.input.send("Someone attacked you but your defence was too high!")
            } else if (this.target.healed.length !== 0) { //TO-DO: target was healed or otherwise had increased defence by an ability
                for (const healer of this.target.healed) {
                    if (healer.name === "doctor") this.target.input!.send("You were attacked but someone nursed you back to health!");
                }
            } else if (this.target.jailed) {
                this.input.send("Your target was jailed last night!");
            } else { //Serial Killer successfully attacked their target
                this.target.kill(
                    game,
                    "You were stabbed by a Serial Killer!",
                    {
                        killers: 1,
                        cause: "They were stabbed by a Serial Killer.",
                        deathNotes: this.deathNote ? [this.deathNote] : []
                    }
                );
            }
        }
    }
}