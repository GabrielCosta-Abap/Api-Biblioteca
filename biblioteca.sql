-- USUÁRIOS
CREATE TABLE lib_usuarios (
	user_id serial PRIMARY KEY,
	username VARCHAR ( 50 ) UNIQUE NOT NULL,
	password VARCHAR ( 50 ) NOT NULL
);

INSERT INTO lib_usuarios (username, password)
    VALUES ('ADM', 'ADM123');
	
	SELECT * FROM lib_usuarios

-- LIVROS
drop table lib_livros
CREATE TABLE lib_livros (
	book_id serial PRIMARY KEY,
	isbn varchar ( 50 ) UNIQUE NOT NULL,
	nome varchar ( 50 ) NOT NULL,
	autor_id integer,
	FOREIGN KEY (autor_id) REFERENCES lib_autores(autor_id),
	editora varchar(50) NOT NULL,
	ano_publicacao char(4),
	disponivel varchar(1)
);

INSERT INTO lib_livros (isbn, nome, autor_id, editora, ano_publicacao)
    			VALUES ('123', 'PATINHO FEIO', 1, 'LEGAL', '25-10-1998');
	
select * from lib_livros WHERE ANO_PUBLICACAO = '1998-10-25'

-- AUTORES
CREATE TABLE lib_autores (
	autor_id serial PRIMARY KEY,
	nome VARCHAR ( 50 ) UNIQUE NOT NULL,
	pais_orig VARCHAR ( 3 ) NOT NULL
);

INSERT INTO lib_autores (nome, pais_orig)
    			 VALUES ('Calabreso', 'BR');

select * from lib_autores

-- CLIENTES
drop table lib_clientes
CREATE TABLE lib_clientes (
	matricula serial PRIMARY KEY,
	nome VARCHAR ( 50 ) UNIQUE NOT NULL,
	telefone VARCHAR ( 20 ) NOT NULL,
	livros_retirados integer 
);
INSERT INTO lib_clientes (nome, telefone, livros_retirados)
    			 VALUES ('Mortadelo', '(51)98888-8888', 0);
				 
select * from lib_clientes

-- RETIRADA
CREATE TABLE lib_retirada (
	id_retirada serial primary key,
	matricula_cliente integer,
		FOREIGN KEY (matricula_cliente) REFERENCES lib_clientes(matricula),
	book_id integer,
		FOREIGN KEY (book_id) REFERENCES lib_livros(book_id),
	data_retirada date,
	prazo_entrega date	
);
select * from lib_retirada

-- DEVOLUÇÃO
CREATE TABLE lib_devolucao (
	id_devolucao serial primary key,
	retirada_ref integer,
		FOREIGN KEY (retirada_ref) REFERENCES lib_retirada(id_retirada),
	data_entrega date,
	dias_atraso integer
);
select * from lib_devolucao