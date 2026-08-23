# SIGETI - Sistema de Gestão e Inventário de Equipamentos de TI

Sistema web completo para gestão, inventário, acompanhamento e controle de equipamentos e materiais de TI. Desenvolvido com arquitetura MVC/Service baseada em Node.js e TypeScript no backend, e HTML/CSS/JS puro no frontend, focando em performance, rastreabilidade e responsividade.

## 🚀 Tecnologias Utilizadas

**Backend:**
* Node.js
* Express
* TypeScript
* MySQL (mysql2)
* Autenticação via JWT (jsonwebtoken)
* Criptografia de senhas (bcryptjs)

**Frontend:**
* HTML5 / CSS3 / JavaScript (Vanilla)
* Variáveis CSS e Flexbox/Grid
* Ícones Lucide
* Tema Claro (Foco corporativo e legibilidade)

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 16 ou superior)
* [MySQL Server](https://dev.mysql.com/downloads/) (Local ou Remoto)

## 🔧 Instalação e Configuração

**1. Clone ou crie a pasta do projeto e instale as dependências:**
\`\`\`bash
npm init -y
npm install express mysql2 dotenv cors bcryptjs jsonwebtoken
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken ts-node-dev rimraf
npx tsc --init
\`\`\`

**2. Configure as variáveis de ambiente:**
* Copie o arquivo `.env.example` e renomeie a cópia para `.env`.
* Atualize as credenciais com os dados do seu banco MySQL local:
\`\`\`env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=sigeti
JWT_SECRET=chave_super_secreta_2026
\`\`\`

**3. Criação do Banco de Dados:**
Abra o seu gerenciador MySQL (DBeaver, phpMyAdmin, ou terminal) e execute todo o conteúdo do arquivo `database.sql` fornecido no projeto. Ele criará o banco, as tabelas, os relacionamentos e os dados iniciais.

## 💻 Comandos de Execução

**Ambiente de Desenvolvimento:**
Executa o projeto utilizando `ts-node-dev`, reiniciando automaticamente a cada alteração no código.
\`\`\`bash
npm run dev
\`\`\`

**Compilação para Produção:**
Limpa a pasta `dist` antiga e converte todo o TypeScript para JavaScript puro.
\`\`\`bash
npm run build
\`\`\`

**Execução em Produção:**
Roda a versão compilada (mais leve e rápida). É necessário rodar o comando de compilação antes.
\`\`\`bash
npm start
\`\`\`

## 🔑 Credenciais de Teste Padrão

Após criar o banco de dados via script, você pode logar no sistema utilizando:

* **E-mail:** `admin@sigeti.com`
* **Senha:** `admin123`

## 📡 Endpoints da API

* `POST /api/auth/login` - Autenticação de usuário
* `GET /api/dashboard` - Estatísticas gerais
* `GET /api/equipments` - Lista equipamentos
* `POST /api/equipments` - Cadastra equipamento
* `GET /api/companies` - Lista todas as empresas
* `GET /api/companies/my-allocations` - Lista empresas alocadas ao usuário
* `GET /api/categories` - Lista categorias de hardware
* `POST /api/disposals` - Solicita descarte
* `GET /api/history` - Busca trilha de auditoria
* `DELETE /api/history` - Limpa histórico
* `DELETE /api/history/:id` - Deleta um log específico

## 📂 Estrutura do Projeto

\`\`\`text
sigeti/
├── src/                  # Código fonte do Backend (TypeScript)
│   ├── config/           # Configurações globais
│   ├── controllers/      # Regras das rotas (Auth, Equipments, etc)
│   ├── database/         # Conexão MySQL (db.ts)
│   ├── middlewares/      # Interceptadores (Autenticação JWT)
│   ├── routes/           # Mapeamento de URLs (index.ts)
│   ├── utils/            # Funções de apoio (historyLogger.ts)
│   ├── app.ts            # Inicialização do Express
│   └── server.ts         # Ponto de entrada
├── public/               # Código do Frontend (HTML, CSS, JS)
│   ├── css/              # Estilos e responsividade
│   └── pages/            # Telas da aplicação
├── dist/                 # Arquivos compilados (gerado via tsc)
├── .env                  # Variáveis locais (Não versionado)
├── package.json          # Dependências
└── tsconfig.json         # Configurações do TypeScript
\`\`\`