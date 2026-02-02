# AutoMecanico (Vehicle Companion AI)

Assistente inteligente para manutencao e diagnostico veicular baseado no manual do veiculo.

## Acesso web (recomendado)

Abra o aplicativo no navegador:

- https://ride-guide-logic.lovable.app/

### Como usar

1. Acesse o site e crie sua conta (ou faca login).
2. No painel, clique em "Adicionar Veiculo".
3. Preencha os dados do veiculo (marca, modelo, ano e quilometragem).
4. Envie o PDF do manual do veiculo (recomendado ate 20 MB).
5. Aguarde a validacao do documento.
6. Escolha uma das consultas disponiveis:
   - Explicar codigo OBD-II
   - Diagnostico por sintomas
   - Manutencao preventiva
   - Chat de manutencao
7. Consulte o historico para rever respostas anteriores.

## Funcionalidades principais

- Cadastro de veiculos com dados essenciais
- Upload de manual em PDF para respostas mais precisas
- Explicacao de codigos OBD-II em linguagem simples
- Diagnostico assistido com hipoteses e checklist
- Recomendacoes de manutencao preventiva
- Chat de manutencao baseado no manual
- Historico de consultas e documentos

## Executar localmente (passo a passo)

Use esta opcao se quiser rodar o app no seu computador.

Requisitos: Node.js 18+ e npm.

1. Abra o terminal na pasta do projeto.
2. Instale as dependencias:

```sh
npm install
```

3. Inicie a aplicacao:

```sh
npm run dev
```

4. Abra o endereco exibido no terminal (normalmente `http://localhost:5173`).

## Dicas de uso

- Use um PDF legivel e completo do manual do veiculo.
- Informe a quilometragem atual para obter recomendacoes melhores.
- Descreva sintomas com o maximo de detalhes possivel.
