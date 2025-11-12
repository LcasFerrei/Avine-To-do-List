create database if not exists avine_tarefa_db;

USE avine_tarefa_db;

create table if not exists tarefas(
 id INT AUTO_INCREMENT PRIMARY KEY,
 titulo VARCHAR(255) NOT NULL,
 descricao TEXT,
 data_vencimento DATE,
 concluida BOOLEAN DEFAULT FALSE
 )