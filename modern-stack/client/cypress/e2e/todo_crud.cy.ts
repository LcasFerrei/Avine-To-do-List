describe('CRUD de Tarefas', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  // --- TESTE 1: VALIDAÇÃO ---
  it('deve mostrar um modal de erro se o título estiver vazio', () => {
    cy.contains('button', 'Salvar Tarefa').click();
    cy.wait(1000); 
    cy.contains('Atenção').should('be.visible');
    cy.contains('O título é obrigatório.').should('be.visible');
    cy.get('.fixed.inset-0').find('button').contains('OK').click();
    cy.wait(500);
    cy.contains('Atenção').should('not.exist');
  });

  // --- TESTE 2: CRIAR ---
  it('deve criar uma nova tarefa', () => {
    const tituloTarefa = 'Tarefa (Cypress) - Criar';
    const descricaoTarefa = 'Descrição (Cypress)';

    cy.get('#titulo').type(tituloTarefa);
    cy.wait(1000); 
    cy.get('#descricao').type(descricaoTarefa);
    cy.wait(1000); 

    cy.contains('button', 'Salvar Tarefa').click();
    cy.wait(1000); 

    cy.contains(tituloTarefa).should('be.visible');
    cy.contains(descricaoTarefa).should('be.visible');
  });

  // --- TESTE 3: EDITAR ---
  it('deve editar uma tarefa existente', () => {
    const tituloOriginal = 'Tarefa (Cypress) - Editar';
    cy.get('#titulo').type(tituloOriginal);
    cy.contains('button', 'Salvar Tarefa').click();
    cy.wait(1000); 

    cy.contains(tituloOriginal)
      .closest('li')
      .find('button')
      .contains('Editar')
      .click();
    cy.wait(1000); 

    const textoEditado = ' - EDITADA';
    cy.get('#titulo').type(textoEditado);
    cy.wait(1000); 

    cy.contains('button', 'Salvar Alterações').click();
    cy.wait(1000); 

    cy.contains(tituloOriginal + textoEditado).should('be.visible');
  });

  // --- TESTE 4: CONCLUIR E DESFAZER ---
  it('deve marcar uma tarefa como concluída e desfazer', () => {
    const tituloTarefa = 'Tarefa (Cypress) - Concluir';
    cy.get('#titulo').type(tituloTarefa);
    cy.contains('button', 'Salvar Tarefa').click();
    cy.wait(1000);

    cy.contains(tituloTarefa)
      .closest('li')
      .find('button')
      .contains('Concluir')
      .click();
    cy.wait(1000); 

    cy.contains(tituloTarefa)
      .closest('li')
      .find('button')
      .contains('Desfazer') 
      .should('be.visible');
      
    cy.contains(tituloTarefa)
      .closest('li')
      .find('button:contains("Editar")') 
      .should('not.exist');             

    cy.contains(tituloTarefa)
      .closest('li')
      .find('button')
      .contains('Desfazer')
      .click();
    cy.wait(1000); 

    cy.contains(tituloTarefa)
      .closest('li')
      .find('button')
      .contains('Concluir') 
      .should('be.visible');
      
    cy.contains(tituloTarefa)
      .closest('li')
      .find('button:contains("Editar")') 
      .should('be.visible');              
  });

  // --- TESTE 5: EXCLUIR ---
  it('deve excluir uma tarefa existente', () => {
    const tituloParaExcluir = 'Tarefa (Cypress) - Excluir';
    cy.get('#titulo').type(tituloParaExcluir);
    cy.contains('button', 'Salvar Tarefa').click();
    cy.wait(1000);

    cy.contains(tituloParaExcluir).closest('li').find('button').contains('Excluir').click();
    cy.wait(1000); 

    cy.get('.fixed.inset-0').find('button').contains('Excluir').click();
    cy.wait(1000); 

    cy.contains(tituloParaExcluir).should('not.exist');
  });

});