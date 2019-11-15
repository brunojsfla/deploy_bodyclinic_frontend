const express = require('express');
const app = express();
const port = process.env.PORT || 8085;

app.use(express.static(__dirname + '/app')); 
app.listen(port);

console.log(`Servidor executando na porta ${port}`);