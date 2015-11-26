var express 	= 	require("express"),
	app			= 	express(),
	cons 		=	require("consolidate"),
	puerto 		= 	process.env.PORT || 8081,
	bodyParser 	= 	require('body-parser'),
	mysql   	= 	require('mysql');

//Conexión
var conexion = mysql.createConnection({
  host     	: '127.0.0.1',
  user     	: 'jluislopez',
  password 	: '',
  database 	: 'trivia'
});
conexion.connect();

//consolidate integra swig con express...
app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));
//Para indicar que se envía y recibe información por medio de Json...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", function(req, res)
{
	res.render("index");
});
//Servicios REST...
app.get('/getQuestions', function(req, res)
{
	//Traer todas las preguntas de manera aleatoria
	var sql = "select numpregunta, pregunta, opcion1, opcion2, opcion3, opcion4 from Preguntas order by rand()";
	queryMysql(sql, function(err, data){
		if (err) throw err;
		res.json(data);
	});
});

//valida la respuesta
app.post('/isValid', function (req, res)
{
	//se busca la respuesta correcta
	var sql = "select correcta from Preguntas where numpregunta = " + req.body.numPregunta;
	var respuestaUsuario = req.body.respuesta;
	queryMysql(sql, function(err, data)
	{
		if (err) throw err;
		res.json({
					respuestaCorrecta : data[0].correcta,
					correcto	: data[0].correcta === respuestaUsuario ? true : false //if abreviado correcot ? true:
		});
	});
});

//Para cualquier url que no cumpla la condición...
app.get("*", function(req, res)
{
	res.status(404).send("Página no encontrada en el momento");
});
// se realiza la consulta y se verifica la integracion de la bd
var queryMysql = function(sql, callback)
{
	conexion.query(sql, function(err, rows, fields) //sentencia sql hacia el servidor (sentencia,entrada)
	{
		if (err) throw err; //errores cuando no se tiene un callback
		callback(err, rows);
	});
};
app.listen(puerto);
console.log("Express server iniciado en el " + puerto);
