import { db } from '$lib/db';
import { command, family } from './schema';

async function seed() {
    await db
        .insert(family)
        .values([
            { id: 1, description: 'Inventário' },
            { id: 2, description: 'Objetivos' },
            { id: 3, description: 'Classes' },
            { id: 4, description: 'Objetivos de Classes' },
            { id: 5, description: 'Itens' },
            { id: 6, description: 'Missões' },
            { id: 7, description: 'Uso Geral' },
        ])
        .execute();

    await db
        .insert(command)
        .values([
            {
                id: 1,
                name: 'Profile',
                slug: 'profile',
                description: `Exibe o perfil do personagem atual, incluindo:  \n\n- **Rank atual**  \n- **Próximo rank disponível** (se houver)  \n- **XP necessário para alcançar o próximo rank**  \n- **Quantidade atual de XP e dinheiro**  \n- **Posição nos rankings de XP e dinheiro**  \n\n## Sintaxe  \n\n\`;profile <@menção> (opcional)\`\n\n- **@Menção** *(opcional)*: Permite visualizar o perfil de outro usuário.  \n- Se a menção não for fornecida, o comando mostrará o perfil de quem enviou a mensagem.  \n- Caso o personagem ainda não exista, ele será criado automaticamente com a foto de perfil e o apelido atuais do servidor.  \n`,
                family: 1,
            },
            {
                id: 2,
                name: 'Add-Exp',
                slug: 'add-exp',
                description: `Comando simples para adicionar XP a um personagem específico.\n\n## Sintaxe  \n\n\`;add-exp <@menção> <quantidade>\`\n\n- **@Menção**: A menção do jogador cujo personagem receberá o XP. Caso o personagem ainda não exista, ele será criado automaticamente, adotando a foto de perfil e o apelido atuais do servidor.\n- **Quantidade**: A quantidade (em números) de XP que será adicionada ao personagem.`,
                family: 1,
            },
            {
                id: 3,
                name: 'Remove-Exp',
                slug: 'remove-exp',
                description: `Comando para remover XP de um personagem específico.\n\n## Sintaxe  \n\n\`;remove-exp <@menção> <quantidade>\`\n\n- **@Menção**: A menção do jogador cujo personagem perderá a experiência. Caso o personagem não tenha sido criado ainda, o comando não terá efeito.\n- **Quantidade**: A quantidade (em número) de XP a ser removida do personagem.`,
                family: 1,
            },
            {
                id: 4,
                name: 'Add-Gold',
                slug: 'add-gold',
                description: `Comando utilizado para adicionar ouro a um personagem específico.\n\n## Sintaxe  \n\n\`;add-gold <@menção> <quantidade>\`\n\n- **@Menção**: A menção do jogador cujo personagem receberá o ouro. Caso o personagem ainda não exista, ele será automaticamente criado, com a foto de perfil e o apelido do servidor.\n- **Quantidade**: A quantidade (em número) de ouro a ser adicionada ao personagem.\n`,
                family: 1,
            },
            {
                id: 5,
                name: 'Remove-Gold',
                slug: 'remove-gold',
                description: `Comando usado para remover ouro de um personagem específico.\n\n## Sintaxe  \n\n\`;remove-gold <@menção> <quantidade>\`\n\n- **@Menção**: A menção do jogador cujo personagem perderá o ouro. Se o personagem não existir, o comando não terá efeito.\n- **Quantidade**: A quantidade (em número) de ouro a ser removida do personagem.\n`,
                family: 1,
            },
        ])
        .execute();

    console.log('Seeding completed!');
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
});
