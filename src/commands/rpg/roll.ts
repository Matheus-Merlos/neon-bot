import { Message } from 'discord.js';
import { Command } from '../command';

const rollMessages = {
    simpleRoll: (dice: number, result: number) =>
        `:game_die: **➼** Um **d${dice}** foi rolado... O número obtido foi **${result}**`,
    simpleCriticalRoll: (dice: number) =>
        `:game_die: **➼** Um **d${dice}** foi rolado... **ACERTO CRÍTICO!** O número obtido foi **${dice}**`,
    simpleFailedRoll: (dice: number) =>
        `:game_die: **➼** Um **d${dice}** foi rolado... **FALHA CRÍTICA!** O número obtido foi **1**`,

    complexRoll: (
        dice: number,
        diceResult: number,
        finalResult: number,
        operation: string,
        expression: string,
    ) => `:game_die: ➼ Um **d${dice}** foi rolado... O número obtido foi **${finalResult}**
:diamond_shape_with_a_dot_inside: **➼ ${finalResult}** ⟷ \`${dice}=${diceResult}\` ${operation} \`${expression}\`
    `,
    complexCriticalRoll: (
        dice: number,
        diceResult: number,
        finalResult: number,
        operation: string,
        expression: string,
    ) => `:game_die: ➼ Um **d${dice}** foi rolado... **ACERTO CRÍTICO!** O número obtido foi **${finalResult}**
:diamond_shape_with_a_dot_inside: **➼ ${finalResult}** ⟷ \`${dice}=${diceResult}\` ${operation} \`${expression}\`
    `,
    complexFailedRoll: (
        dice: number,
        diceResult: number,
        finalResult: number,
        operation: string,
        expression: string,
    ) => `:game_die: ➼ Um **d${dice}** foi rolado... **FALHA CRÍTICA!** O número obtido foi **${finalResult}**
:diamond_shape_with_a_dot_inside: **➼ ${finalResult}** ⟷ \`${dice}=${diceResult}\` ${operation} \`${expression}\`
    `,
};

export class Roll implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');
        const msgLenght = msgArray.length;

        if (msgLenght === 1) this.handleDiceRoll(message);
        else if (msgLenght === 2) this.handleCustomDiceRoll(message, msgArray);
        else this.handleComplexOperation(message, msgArray);
    }

    private handleDiceRoll(msg: Message): void {
        const result = this.rollDice(6);

        let message: string;

        if (result === 1) message = rollMessages.simpleCriticalRoll(6);
        else if (result === 6) message = rollMessages.simpleFailedRoll(6);
        else message = rollMessages.simpleRoll(6, result);

        msg.reply(message!);
    }

    private handleCustomDiceRoll(msg: Message, msgArray: Array<string>): void {
        const dice: number = parseInt(msgArray[1]);
        if (isNaN(dice) || dice < 1) {
            msg.reply(`O valor **${msgArray[1]}** não é um número válido`);
            return;
        }
        const result: number = this.rollDice(dice);

        let message: string;

        if (result === 1) message = rollMessages.simpleCriticalRoll(dice);
        else if (result === dice) message = rollMessages.simpleFailedRoll(dice);
        else message = rollMessages.simpleRoll(dice, result);

        msg.reply(message!);
    }

    private handleComplexOperation(msg: Message, msgArray: Array<string>): void {
        const dice: number = parseInt(msgArray[1]);
        if (isNaN(dice) || dice < 1) {
            msg.reply(`O valor **${msgArray[1]}** não é um número válido`);
            return;
        }

        const operation: string = msgArray[2][0];
        if (!['+', '-', '*', '/'].includes(operation)) {
            msg.reply('Sintaxe do comando errada/Operação não suportada');
            return;
        }
        const result: number = this.rollDice(dice);

        const modifier: string = msgArray[2].replace(operation, '');

        const expression: string = `${modifier}${msgArray.slice(3).join('')}`;

        let totalResult: number;
        try {
            totalResult = eval(`${result}${operation}${expression}`);
        } catch (error) {
            msg.reply(`A operação \`${expression}\` não é uma operação válida`);
            return;
        }

        let message: string;

        if (result === 1)
            message = rollMessages.complexFailedRoll(
                dice,
                result,
                totalResult,
                operation,
                expression,
            );
        else if (result === dice)
            message = rollMessages.complexCriticalRoll(
                dice,
                result,
                totalResult,
                operation,
                expression,
            );
        else message = rollMessages.complexRoll(dice, result, totalResult, operation, expression);

        msg.reply(message!);
    }

    private rollDice(max: number): number {
        return Math.floor(Math.random() * max + 1);
    }
}
