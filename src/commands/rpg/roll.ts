import Command from '../command';

const rollMessages = {
    simpleRoll: (dice: number, result: number) =>
        `:game_die: ➼ Um **d${dice}** foi rolado... O número obtido foi **${result}**`,
    simpleCriticalRoll: (dice: number) =>
        `:game_die: ➼ Um **d${dice}** foi rolado... **ACERTO CRÍTICO!** O número obtido foi **${dice}**`,
    simpleFailedRoll: (dice: number) =>
        `:game_die: ➼ Um **d${dice}** foi rolado... **FALHA CRÍTICA!** O número obtido foi **1**`,
};

export class Roll extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');
        const msgLenght = msgArray.length;

        if (msgLenght === 1) this.handleDiceRoll();
        else if (msgLenght === 2) this.handleCustomDiceRoll(msgArray);
        else this.handleComplexOperation(msgArray);
    }

    private handleDiceRoll(): void {
        const result = this.rollDice(6);

        let message: string;

        if (result === 1) message = rollMessages.simpleCriticalRoll(6);
        else if (result === 6) message = rollMessages.simpleFailedRoll(6);
        else message = rollMessages.simpleRoll(6, result);

        this.message.reply(message!);
    }

    private handleCustomDiceRoll(msgArray: Array<string>): void {
        const dice: number = parseInt(msgArray[1]);
        if (isNaN(dice) || dice < 1) {
            this.message.reply(`O valor **${msgArray[1]}** não é um número válido`);
            return;
        }
        const result: number = this.rollDice(dice);

        let message: string;

        if (result === 1) message = rollMessages.simpleCriticalRoll(dice);
        else if (result === dice) message = rollMessages.simpleFailedRoll(dice);
        else message = rollMessages.simpleRoll(dice, result);

        this.message.reply(message!);
    }

    private handleComplexOperation(msgArray: Array<string>): void {
        const dice: number = parseInt(msgArray[1]);
        if (isNaN(dice) || dice < 1) {
            this.message.reply(`O valor **${msgArray[1]}** não é um número válido`);
            return;
        }

        const operation: string = msgArray[2][0];
        if (!['+', '-', '*', '/'].includes(operation)) {
            this.message.reply('Sintaxe do comando errada/Operação não suportada');
            return;
        }
        const result: number = this.rollDice(dice);

        const modifier: string = msgArray[2].replace(operation, '');

        const expression: string = `${modifier}${msgArray.slice(3).join('')}`;

        let totalResult: number;
        try {
            totalResult = eval(`${result}${operation}${expression}`);
        } catch (error) {
            this.message.reply(`A operação \`${expression}\` não é uma operação válida`);
            return;
        }

        this.message.reply(
            `:game_die: | Você rolou um 1d${dice}... E conseguiu **${totalResult!}**!\n:nerd: | **${totalResult!}** > \`${result} ${operation}${expression}\``,
        );
    }

    private rollDice(max: number): number {
        return Math.floor(Math.random() * max + 1);
    }

    private sendBasicMessage(dice: number, result: number): void {
        this.message.reply(`:game_die: | Você rolou um 1d${dice}... E conseguiu **${result}**`);
    }
}
