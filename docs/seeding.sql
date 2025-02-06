INSERT INTO command VALUES(1,'Profile','profile',replace('Exibe o perfil do personagem atual, incluindo:  \n\n- **Rank atual**  \n- **Próximo rank disponível** (se houver)  \n- **XP necessário para alcançar o próximo rank**  \n- **Quantidade atual de XP e dinheiro**  \n- **Posição nos rankings de XP e dinheiro**  \n\n## Sintaxe  \n\n`;profile <@menção> (opcional)`\n\n- **@Menção** *(opcional)*: Permite visualizar o perfil de outro usuário.  \n- Se a menção não for fornecida, o comando mostrará o perfil de quem enviou a mensagem.  \n- Caso o personagem ainda não exista, ele será criado automaticamente com a foto de perfil e o apelido atuais do servidor.  \n','\n',char(10)),1);
INSERT INTO command VALUES(2,'Add-Exp','add-exp',replace('Comando simples para adicionar XP a um personagem específico.\n\n## Sintaxe  \n\n`;add-exp <@menção> <quantidade>`\n\n- **@Menção**: A menção do jogador cujo personagem receberá o XP. Caso o personagem ainda não exista, ele será criado automaticamente, adotando a foto de perfil e o apelido atuais do servidor.\n- **Quantidade**: A quantidade (em números) de XP que será adicionada ao personagem.','\n',char(10)),1);
INSERT INTO command VALUES(3,'Remove-Exp','remove-exp',replace('Comando para remover XP de um personagem específico.\n\n## Sintaxe  \n\n`;remove-exp <@menção> <quantidade>`\n\n- **@Menção**: A menção do jogador cujo personagem perderá a experiência. Caso o personagem não tenha sido criado ainda, o comando não terá efeito.\n- **Quantidade**: A quantidade (em número) de XP a ser removida do personagem.','\n',char(10)),1);
INSERT INTO command VALUES(4,'Add-Gold','add-gold',replace('Comando utilizado para adicionar ouro a um personagem específico.\n\n## Sintaxe  \n\n`;add-gold <@menção> <quantidade>`\n\n- **@Menção**: A menção do jogador cujo personagem receberá o ouro. Caso o personagem ainda não exista, ele será automaticamente criado, com a foto de perfil e o apelido do servidor.\n- **Quantidade**: A quantidade (em número) de ouro a ser adicionada ao personagem.\n','\n',char(10)),1);
INSERT INTO command VALUES(5,'Remove-Gold','remove-gold',replace('Comando usado para remover ouro de um personagem específico.\n\n## Sintaxe  \n\n`;remove-gold <@menção> <quantidade>`\n\n- **@Menção**: A menção do jogador cujo personagem perderá o ouro. Se o personagem não existir, o comando não terá efeito.\n- **Quantidade**: A quantidade (em número) de ouro a ser removida do personagem.\n','\n',char(10)),1);


INSERT INTO family VALUES(1,'Inventário');
INSERT INTO family VALUES(2,'Objetivos');
INSERT INTO family VALUES(3,'Classes');
INSERT INTO family VALUES(4,'Objetivos de Classes');
INSERT INTO family VALUES(5,'Itens');
INSERT INTO family VALUES(6,'Missões');
INSERT INTO family VALUES(7,'Uso Geral');

INSERT INTO sqlite_sequence VALUES('family',7);
INSERT INTO sqlite_sequence VALUES('command',5);
