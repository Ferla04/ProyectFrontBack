//1 - Invocamos a express
const express = require('express');
const app = express(); //Instancia del modulo de express

//2 - Seteamos urlencoded para capturar los datos del formulario
//Para evitar el error en variables no definidas al capturar datos del formulario
app.use(express.urlencoded({extended:false}));
//Especificamos que trabajamos con JSON
app.use(express.json());


//3 - Invocamos a dotenv
const dotenv = require('dotenv');
//se configuran todas las variables de entorno
dotenv.config({path: './env/.env'});


//4 - setear el directorio public
//referenciar la carpeta
app.use(express.static('public'));
// via de acceso absoluta del directorio, CUANDO mudamos el proyecto
app.use('/resources', express.static(__dirname + '/public'));
//el _dirname son la rutas anteriores de llegar a la carpeta principal
//console.log(__dirname);



//5 - Establemos el motor de la plantilla, este reemplaza el html.
//INPORTANTE: la carpeta de vistas se tiene que llamar obligatoriamente views
app.set('view engine', 'ejs')


//6 - Incovamos a bcryptjs, para encriptar/hasheado
const bcryptjs = require('bcryptjs');


//7 - Invocamos express-seccion(var de session)
const session = require('express-session');
//configuracion
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))


//8 - Invocamos al modulo de conexión de la BD (db.js)
const connection = require('./database/db');
const e = require('express');


//9 - Estableciendo rutas
    app.get('/login', (req,res) => {
        res.render('login');
    })

    app.get('/register', (req,res) => {
        res.render('register');
    })


//10 - Registracion: async = 
    app.post('/register', async (req, res) =>{
        const email = req.body.email;
        const user = req.body.user;
        const name = req.body.name;
        const pass = req.body.pass;
        const rol = req.body.rol;

        let passwordHash = await bcryptjs.hash(pass, 8);

        connection.query('INSERT INTO login set ?',
        {email:email, user:user, name: name, rol:rol, pass: passwordHash},
        async(error,results) =>{
            if(error){
                console.log(error);
            }else{
                res.render('register', {
                    alert: true,
                    alertTitle: 'Registration',
                    alertMessage: '¡Seccesful Registration!',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'login'
                });
            }
        })
    });

//11 - Autentificación
    app.post('/auth', async (req, res) =>{
        const email = req.body.email;
        const pass = req.body.pass;
        
        let passwordHash = await bcryptjs.hash(pass, 8);

        if(email && pass){
            connection.query('SELECT * FROM login WHERE email = ?', [email], async(error, results)=>{
                if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                    res.render('login',{
                        alert: true,
                        alertTitle: 'Error',
                        alertMessage: 'Usuario y/o password incorrectas',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    })
                }else{
                    req.session.loggedin = true;
                    req.session.name = results[0].name;
                    res.render('login',{
                        alert: true,
                        alertTitle: 'Conexión exitosa',
                        alertMessage: '!LOGIN CORRECTO!',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: '/'
                    })
                }
            })
        }else{
            res.render('login',{
                alert: true,
                alertTitle: 'Advertencia',
                alertMessage: 'porfas llene todos los campos',
                alertIcon: 'warning',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        }
    });

//12 - Auth pages
    app.get('/', (req, res)=>{
        if(req.session.loggedin){
            res.render('index', {
                login: true,
                name: req.session.name
            })
        }else{
            res.render('index',{
                login:false,
                name:'debe iniciar sesión'
            })
        }
    })

//13 - Logout
    app.get('/logout', (req, res) =>{
        req.session.destroy(() =>{
            res.redirect('/');
        })
    })


//Conecccion con el puerto
app.listen(3001, (req, res) =>{
    console.log('SERVER RUNNING IN http://localhost:3000/');
})
