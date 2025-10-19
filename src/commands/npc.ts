import { npc } from '../db/schema';
import npcFactory from '../factories/npc-factory';
import {
    CreateNPCStrategy,
    DefaultStrategy,
    DeleteNPCStrategy,
    EditFieldStrategy,
    EditStrategy,
    ListNPCStrategy,
    SwitchNPCStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class NPC extends StrategyCommand {
    constructor() {
        super(
            'npc',
            {
                create: new CreateNPCStrategy(),
                switch: new SwitchNPCStrategy(),
                delete: new DeleteNPCStrategy(),
                list: new ListNPCStrategy(),
                edit: new EditStrategy({
                    prefix: new EditFieldStrategy(npc, npcFactory, 'prefix'),
                }),
            },
            new DefaultStrategy('npc', {
                create: 'Comando para criar um NPC: `;npc create <nome> <anexo_imagem(opcional)>`',
                switch: 'Comando para assumir um NPC, todas as mensagens que você enviar serão "sobreescrevidas" por ele. `;npc switch <nome_npc>`',
                delete: 'Serve para deletar um NPC. `;npc delete <nome>`',
                list: 'Irá listar todos os seus NPCs',
            }),
        );
    }
}
