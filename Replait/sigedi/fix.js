const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// 1. Gera a senha criptografada correta
const senhaCorreta = bcrypt.hashSync('admin123', 10);

// 2. Conecta no seu banco (com a senha vazia que você configurou)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'sigeti'
});

// 3. Atualiza o usuário no banco
connection.query(
  "UPDATE users SET password = ? WHERE email = 'admin@sigeti.com'",
  [senhaCorreta],
  function(err, results) {
    if (err) {
        console.log('❌ Erro no banco:', err.message);
    } else if (results.affectedRows === 0) {
      console.log('❌ O usuário admin@sigeti.com não existe no banco.');
      console.log('Você chegou a rodar o script database.sql no MySQL?');
    } else {
      console.log('✅ Senha reconfigurada com sucesso!');
      console.log('Pode voltar no navegador e logar com a senha: admin123');
    }
    process.exit(0);
  }
);