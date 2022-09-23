const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const secretKey = 'Barbara123';
const { nuevoUsuario, setUsuarioEstado, getUsuarios} = require('./consultas.js');
const { send } = require('process');
const fs = require('fs');

app.listen(4000, () => console.log('Server 4000'));
function myMiddleware(req, res, next) {
    console.log('middleware');
    next();
};

app.use(myMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    "handlebars",
    exphbs.engine({
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);
app.set("view engine", "handlebars");

app.get('/registro', (req, res) => {
    res.render('registro');
    
} );
app.post('/registro', async(req, res) => {
    const { email, nombre, password} = req.body
  
    let is_approved = false;
  
   try {
    
    const usuario = await nuevoUsuario(email, nombre, password, is_approved);
    res.status(201).send(usuario);        
   }catch (e) {
    res.status(500).send({
        error: `Algo salio mal... ${e}`,
        code: 500
    })
};   
});
app.put("/administrador", async (req, res) => {
    const {id, is_approved} = req.body;
    try {
        const usuario = await setUsuarioEstado(id, is_approved);
        res.status(200).send(usuario);
    } catch (e) {
        res.status(500).send({error: ` Algo salio mal... ${e}`, code: 500})
    };
});
app.get('/administrador', async(req, res) => {
    try{
        const usuarios = await getUsuarios();
        res.render("administrador", { usuarios});        
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    }; 

} )
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/verify', async function (req, res) {
    const { email, password } = req.body;
    //console.log(req.body)
    const user = await getUsuario(email, password);
    if (user) {
        if (user.estado) {
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 180,
                    data: user,
                },
                secretKey
            );
            console.log(token)
            res.send(token);
        } else {
            res.status(401).send({
                error: 'usuario no habilitado',
                code: 401
            });
        }
    } else {
        res.status(404).send({
            error: 'usuario no registrado',
            code: 404,
        });
    }
});

app.get('/datos',  (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => {
        //const { nombre, email } = data
        //const { data } = decoded
        
        err
        ? res.status(401).send(
            {
                error: '401 deshabilitado',
                message: 'no estas habilitado',
                token_error: err.message,
            })
        
        : res.render('datos', {token});
    });
});
app.get('/ingresar', (req, res) => {
    res.render('ingresar');
    
} );
app.post('/ingresar', (req, res) => {
    const {documento} = req.body;
    
    if (!documento) {
        return res.status(400).json({message: 'ingrese un documento válido'});
    }else{
   
    let previos = [];
    const alreadyExists = fs.existsSync('documento.json');
    if(alreadyExists) {
        previos = JSON.parse(fs.readFileSync('documento.json', 'utf-8'));
    }
    const documentos = [...previos];
    
    const payload = JSON.stringify([...documentos]);
    fs.writeFileSync('documentos.json', payload, 'utf-8');
    res.status(201).json({message: 'Ingresado', documento});
    
}
    
});