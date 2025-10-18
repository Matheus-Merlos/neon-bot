import { CreateNPCStrategy, DefaultStrategy, SwitchNPCStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class NPC extends StrategyCommand {
    constructor() {
        super(
            'npc',
            {
                create: new CreateNPCStrategy(),
                switch: new SwitchNPCStrategy(),
            },
            new DefaultStrategy('npc', {
                create: 'Comando para criar um NPC: `;npc create <nome> <anexo_imagem(opcional)>',
                switch: 'Comando para assumir um NPC, todas as mensagens que você enviar serão "sobreescrevidas" por ele. `;npc switch <nome_npc>`',
            }),
        );
    }
}
