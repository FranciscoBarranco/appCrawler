var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require('mongoose'),
    catalogProds = require('./controllers/actions'),
    port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var catalogsRoute = express.Router();

catalogsRoute.route('/catalogs')
    .get(catalogProds.findAll)
    .post(catalogProds.addProduct);

catalogsRoute.route('/catalogs/:id')
    .get(catalogProds.findById)
    .put(catalogProds.updateProduct)
    .delete(catalogProds.deleteProduct);
// router.get('/', function(req, res) {
//     res.send("Hello World!");
// });

app.use('/api', catalogsRoute);
    
mongoose.connect('mongodb://localhost/catalogs', function(err, res){
    if(err){
        console.log('¡Error de conexión!', err);
    }
    app.listen(port, function() {
        console.log("Node server running on http://localhost:"+port);
        });
});