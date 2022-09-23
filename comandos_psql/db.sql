create database materiales;
\c materiales

create table profesores (id serial primary key, nombre varchar(80) , email varchar(80), is_approved boolean);
create table cursos (id serial primary key, nombre varchar(80));
create table asignaturas (id serial primary key, nombre varchar(80));

create table planificacion (id serial primary key, id_profesor int references profesores(id), id_curso int references cursos(id), id_asignatura int references asignaturas(id), unidad int);
create table evaluacion (id serial primary key, id_profesor int references profesores(id), id_curso int references cursos(id), id_asignatura int references asignaturas(id), unidad int);

