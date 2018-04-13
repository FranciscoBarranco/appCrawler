var mongoose = require('mongoose'),
    routes = require('../models/catalogs'),
    Catalogs = mongoose.model('Catalogs'),
    catalogsRoute = express.Router();
    
catalogsRoute.route('/catalogs')
    .get(Catalogs.findAll)
    .post(Catalogs.addProduct);

catalogsRoute.route('/catalogs/:id')
    .get(Catalogs.findById)
    .put(Catalogs.updateProduct)
    .delete(Catalogs.deleteProduct);
// router.get('/', function(req, res) {
//     res.send("Hello World!");
// });

// Obtener todos los elementos
exports.findAll = function(req, res){
    Catalogs.find(function(err, catalog){
        if(err) res.send(500, err.message);

        console.log('Get / catalog');
        res.status(200).jsonp(catalog);
    })
}

// Obtener todos los elementos filtrados por SKU
exports.findSku = function(req, res){
    console.log(req);
    Catalogs.find(req.producto.sku, function(err, catalog){
        if(err) return res.send(500, err.message);

        console.log('Get / catalog / ' + req.producto.sku);
        res.status(200).jsonp(catalog);
    })
}

// Obtener todos los elementos filtrados por ID
exports.findById = function(req, res){
    console.log(req);
    Catalogs.findById(req.params.id, function(err, catalog){
        if(err) return res.send(500, err.message);

        console.log('Get / catalogs / ' + req.params.id);
        res.status(200).jsonp(catalog);
    })
}

// Agregar producto
exports.addProduct = function(req, res){
    console.log('POST');
    console.log(req.body);

    var catalog = new Catalogs({
        store: req.body.store,
        producto: [{
            breadcrumb: req.body.producto.breadcrumb,
            name: req.body.producto.name,
            image: req.body.producto.image,
            sku: req.body.producto.sku, 
            details: [{
                description: req.body.producto.details.description,
                priceList: req.body.producto.details.priceList,
                promoPercent: req.body.producto.details.promoPercent,
                promoPrice: req.body.producto.details.promoPrice,
                available: req.body.producto.details.available,
                posibleStock: req.body.producto.details.posibleStock,
                date: req.body.producto.details.date
            }]
        }]
    });
    catalog.save(function(err, catalog){
        if(err) return res.status(500).send(err.message);
        res.status(200).jsonp/(catalog);
    })
}

// Actualizar producto
exports.updateProduct = function(req, res){
    catalogs.findById(req.params.id, function(err, catalog){
        catalog.store = req.body.store;
        catalog.producto.breadcrumb = req.body.producto.breadcrumb;
        catalog.producto.name = req.body.producto.name;
        catalog.producto.image = req.body.producto.image;
        catalog.producto.sku = req.body.producto.sku;
        catalog.producto.details.description = req.body.producto.details.description;
        catalog.producto.details.priceList = req.body.producto.details.priceList;
        catalog.producto.details.promoPercent = req.body.producto.details.promoPercent;
        catalog.producto.details.promoPrice = req.body.producto.details.promoPrice;
        catalog.producto.details.available = req.body.producto.details.available;
        catalog.producto.details.posibleStock = req.body.producto.details.posibleStock;
        catalog.producto.details.date = req.body.producto.details.date;

        catalog.save(function(err){
            if(err) return res.status(500).send(err.message);
            res.status(200).jsonp(catalog);
        });
    });
}

// Eliminar producto
exports.deleteProduct = function(req, res){
    catalogs.findById(req.params.id, function(err, catalog){
        catalog.remove(function(err){
            if(err) return res.status(500).send(err.message);
            res.status(200).send();
        })
    })
}