var express = require('express');
var fileUpload = require('express-fileupload');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Default options
app.use(fileUpload());
var fs = require('fs');

app.put('/:tipo/:id', (req, res, next) => {

	var tipo = req.params.tipo;
	var id = req.params.id;

	// Tipos de colección
	var tipoValidos = ['hospitales', 'usuarios', 'medicos'];
	if(tipoValidos.indexOf(tipo) < 0){
		return res.status(400).json({
			ok: false,
			mensaje: 'Tipo de colección no es válida',
			errors: {message: 'Tipo de colección no es válida'}
		});
	}

	if(!req.files){		
		return res.status(400).json({
			ok: false,
			mensaje: 'No selecciono nada',
			errors: {message: 'Debe seleccionar una imagen'}
		});
	}

	// Obtener nombre del archivo
	var archivo = req.files.imagen;
	var nombreCortado = archivo.name.split('.');
	var extArchivo = nombreCortado[nombreCortado.length - 1];

	// Solo estas extensiones aceptamos
	var extValidas = ['png', 'jpg', 'gif', 'jpeg'];

	if(extValidas.indexOf(extArchivo) < 0){
		return res.status(400).json({
			ok: false,
			mensaje: 'Extension no válida',
			errors: {message: 'Las extensiones válidas son '+ extValidas.join(', ')}
		});
	}

	// Nombre de archivo personalizado - 123123132-213.png
	var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extArchivo}`;

	// Mover el archivo del temporal a un path
	var path = `./uploads/${tipo}/${nombreArchivo}`;

	archivo.mv(path, err => {
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al mover archivo',
				errors: err
			});
		}

		subirPorTipo(tipo, id, nombreArchivo, res);		
	});	
});

function subirPorTipo(tipo, id, nombreArchivo, res){

	if(tipo === 'usuarios'){
		Usuario.findById(id, (err, usuario) => {
			var pathViejo = './uploads/usuarios/'+ usuario.img;			

			// Si existe, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			usuario.img = nombreArchivo;

			usuario.save((err, usuarioActualizado) => {
				usuarioActualizado.password = undefined;
				res.status(200).json({
					ok: true,
					mensaje: 'Imagen de usuario actualizada',
					usuario: usuarioActualizado
				});
			});
		});
	}

	if(tipo === 'medicos'){
		Medico.findById(id, (err, medico) => {
			var pathViejo = './uploads/medicos/'+ medico.img;

			// Si existe, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			medico.img = nombreArchivo;

			medico.save((err, medicoActualizado) => {
				res.status(200).json({
					ok: true,
					mensaje: 'Imagen del médico actualizada',
					medico: medicoActualizado
				});
			});
		});
	}

	if(tipo === 'hospitales'){
		Hospital.findById(id, (err, hospital) => {
			var pathViejo = './uploads/hospitales/'+ hospital.img;

			// Si existe, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			hospital.img = nombreArchivo;

			hospital.save((err, hospitalActualizado) => {
				res.status(200).json({
					ok: true,
					mensaje: 'Imagen del hospital actualizada',
					hospital: hospitalActualizado
				});
			});
		});
	}
}

module.exports = app;