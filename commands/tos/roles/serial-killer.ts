import Discord from 'discord.js';
import { Selection, _View, _Player, Action, Color, Alignment, Category, Attack, Defense } from '../src/player';

const image = new Discord.Attachment('images/tos/serial-killer.png')

export const View = new _View({
    name: 'Serial Killer',
    picture: image,
    pictureUrl: 'attachment://serial-killer.png',
    alignment: Alignment.Neutral,
    category: Category.Killing,
    color: Color.Neutral,
    abilities: `Kill someone each night.`,
    attributes: `If you are role blocked you will attack the role
                 blocker instead of your target.
                 You can not be killed at night.`,
    goal: "Kill everyone who would oppose you."
})

export default class Player extends _Player {
    name: string;
    priority: number;
    attack: number;
    defense: number;
    visits: boolean;
    selection: Selection;
    view: _View;
    constructor(user: Discord.User, index: number) {
        super(user, index);
        this.name = 'serial';
        this.priority = 5;
        this.attack = Attack.Basic;
        this.defense = Defense.Basic;
        this.visits = true;
        this.selection = Selection.others;
        this.view = View;
    }

    action({ agent, receiver, game }: Action) {
        if (!agent.input) return console.error('Serial Killer: agent.input is not defined');
        if (!receiver.input) return console.error ('Serial Killer: receiver.input is not defined');
        if (agent.blocked.length >= 0 && agent.blocked.find((player) => player.alive)) { //Serial Killer was role-blocked
            agent.input.send("Someone role blocked you, so you attacked them!");
            agent.blocked.forEach(blocker => {
                if (!blocker.alive) return; //Role-blocker has already died to other causes, won't actually visit the Serial Killer
                blocker.alive = false;
                blocker.input!.send('You were murdered by the Serial Killer you visited!');
                game.deaths.set(blocker, {
                    killers: 1,
                    cause: 'They were stabbed by a Serial Killer',
                    deathNotes: agent.deathNote ? [agent.deathNote] : []
                })
            })
            agent.blocked = []
        } else if (!receiver.alive) { //Serial Killer's target was already killed
            const death = game.deaths.get(receiver)
            if (!death) return console.error("Serial Killer: Already killed target returned no death object");
            death.killers++;
            death.cause = death.cause.concat("\nThey were also stabbed by a Serial Killer.")
            agent.deathNote && death.deathNotes.push(agent.deathNote)
            game.deaths.set(receiver, death);
        } else if (receiver.defense >= Defense.Basic) { //Serial Killer attacked a target with higher defense
            agent.input.send("Your target's defence was too high to kill!");
            receiver.input.send("Someone attacked you but your defence was too high!")
        } else if (false) { //TO-DO: target was healed or otherwise had increased defence by an ability

        } else { //Serial Killer successfully attacked their target
            receiver.alive = false;
            game.deaths.set(receiver, {
                killers: 1,
                cause: "They were stabbed by a Serial Killer.",
                deathNotes: agent.deathNote ? [agent.deathNote] : []
            })
        }
    }
}