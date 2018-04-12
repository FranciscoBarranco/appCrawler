var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require('mongoose'),
    routes = require('./controllers/routes'),
    port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var catalogsRoute = express.Router();

mongoose.connect('mongodb://localhost/catalogs', function(err, res){
    if(err){
        console.log('¡Error de conexión!', err);
    }
    app.listen(port, function() {
        console.log("Node server running on http://localhost:"+port);
        });
});

app.use('/api', catalogsRoute);