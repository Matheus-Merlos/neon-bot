import Command from '../command';

export class Roll extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        switch (msgArray.length) {
            case 1: {
                const result = this.rollDice(6);
                this.sendBasicMessage(6, result);
                break;
            }
            case 2: {
                const dice: number = parseInt(msgArray[1]);
                if (isNaN(dice)) {
                    this.message.reply(`O valor **${msgArray[1]}** não é um número válido`);
                    return;
                }
                const result: number = this.rollDice(dice);

                this.sendBasicMessage(dice, result);
                break;
            }
            default: {
                this.handleComplexOperation(msgArray);
                break;
            }
        }
    }

    private rollDice(max: number): number {
        return Math.floor(Math.random() * max + 1);
    }

    private sendBasicMessage(dice: number, result: number): void {
        this.message.reply(`:game_die: | Você rolou um 1d${dice}... E conseguiu **${result}**`);
    }

    private handleComplexOperation(msgArray: Array<string>): void {
        const dice: number = parseInt(msgArray[1]);
        if (isNaN(dice)) {
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
}
