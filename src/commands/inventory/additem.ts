import Command from '../command';

export default class AddItem extends Command {
    public async execute(): Promise<void> {
        const msgArray = this.message.content.split(' ').slice(1);

        this.message.reply(
            'Aviso: O comando por extenso acaba por ser muito confuso, é recomendado utilizar o `Slash Command` nesta ocasião',
        );
    }
}
