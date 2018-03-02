var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;

const CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const SECRET_ID = require('../config/config').GOOGLE_SECRET_ID;

const {OAuth2Client} = require('google-auth-library');

// ============================
// Autenticación De Google
// ============================
app.post('/google', (req, res,next) =>{
  var token = req.body.token;
  	const oAuth2Client = new OAuth2Client(CLIENT_ID,SECRET_ID);
   	const tiket = oAuth2Client.verifyIdToken({
     	idToken: token
     	//audience: GOOGLE_CLIENT_ID
   	});

   	tiket.then(data => {
	    Usuario.findOne({email: data.payload.email}, (err, usuario) => {
	   		if (err) {
	   			return res.status(500).json({
	   				ok: false,
	   				mensaje: 'Error al buscar usuario - login',
	   				errors: err
	   			});
	   		}
	   		if (usuario){
	   			if (usuario.google === false){
	   				return res.status(400).json({
	   					ok: true,
	   					mensaje: 'Debe de usar su autenticación normal'
	   				});
	   			}else {
	   				usuario.password = ':)';

					var token = jwt.sign({usuario: usuario}, SEED, {expiresIn: 14400}) //4horas

					res.status(200).json({
						ok: true,
						usuario: usuario,
						token: token,
						id: usuario._id
					});
	   			}

	   		}
	   		// Si el usuario no existe, creamos unos con los datos de Google
	   		else {
	   			var usuario = new Usuario();

	   			usuario.nombre = data.payload.name;
	   			usuario.email = data.payload.email;
	   			usuario.password = ':)';
	   			usuario.img = data.payload.picture;
	   			usuario.google = true;

	   			usuario.save((err, usuarioDB) => {
	   				if(err) {
	   					return res.status(500).json({
	   						ok: true,
	   						mensaje: 'Error al guardar usuario - Google',
	   						errors: err
	   					});
	   				}

	   				var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}) //4horas

					res.status(200).json({
						ok: true,
						usuario: usuarioDB,
						token: token,
						id: usuarioDB._id
					});
	   			});   			
	   		}
	   	});
   	});
});

// ============================
// Autenticación normal
// ============================
app.post('/', ( req, res) => {

	var body = req.body;

	Usuario.findOne({ email: body.email}, (err, usuarioDB) => {

		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar usuario',
				errors: err
			});
		}

		if(!usuarioDB){
			return res.status(400).json({
				ok: false,
				mensaje: 'Credenciales incorrectas - email',
				errors: err
			});
		}

		if( !bcrypt.compareSync(body.password, usuarioDB.password)){
			return res.status(400).json({
				ok: false,
				mensaje: 'Credenciales incorrectas - password',
				errors: err
			});
		}

		// Crear un token!!!
		usuarioDB.password = ':)';
		var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}) //4horas

		res.status(200).json({
			ok: true,
			usuario: usuarioDB,
			token: token,
			id: usuarioDB._id
		});
	});

});




module.exports = app;
