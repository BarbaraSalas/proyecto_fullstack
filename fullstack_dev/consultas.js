const { Pool } = require('pg');
const pool = new Pool ({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    database: 'materiales',
    port: 5432
});

async function nuevoUsuario(email, nombre, password, is_approved) {    
    const dbQuery = {
        text: 'INSERT INTO profesores (email, nombre, password, is_approved ) VALUES ($1, $2, $3, $4) RETURNING *',
        values: [email, nombre, password, is_approved ]
    }
    const result = await pool.query(dbQuery); 
    const usuario = result.rows[0];
    return usuario;
}
async function getUsuarios(){
    const result = await pool.query(`SELECT * FROM profesores`);
    return result.rows;
}

async function setUsuarioEstado(id, is_approved) {
    const result = await pool.query(
        `UPDATE profesores SET is_approved = ${is_approved} WHERE id = ${id} RETURNING *`
    );
    const usuario = result.rows[0];
    return usuario;
}

module.exports = {
    nuevoUsuario,
    setUsuarioEstado,
    getUsuarios
}
