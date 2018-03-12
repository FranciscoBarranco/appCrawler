var mongoose = require('mongoose'),
	cheerio = require('cheerio'),
	http = require('http'),
    fns = require('./functions.js'),
    port = 8000;

var server=http.createServer(function(req,res){
    res.end('test');
});

server.on('listening',function(){
    console.log('¡Servidor corriendo!');
});

server.listen(port);

// mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/larva');
var db = mongoose.connection;
 
db.on('error', function (err) {
	console.log('¡Error de conexión!', err);
});
db.once('open', function () {
	console.log('¡Conectado!');
});

var catalogoSchema = new mongoose.Schema({
	store: String,
	producto: [{
		breadcrumb: String,
		name: String,
		image: String,
		sku: String, 
		details: [{
			description: String,
			priceList: Number,
			promoPercent: Number,
			promoPrice: Number,
			available: String,
			posibleStock: Number,
			date: Date
		}]
	}]
}, { usePushEach: true });

//db.dropDatabase(); // Para borrar la DB

var url = 'http://www.linio.com.mx';

var detallesProducto = function(uri){
    fns.getBody(uri)
    .then(function(body){
        var $ = cheerio.load(body);
        //Inicia Editable
        var arrBread = [];
        $('.breadcrumb').find('li').each(function(){
            var getItemBread = $(this).find('a > span').text();
            if(getItemBread != ''){
                arrBread.push(getItemBread);
            }
        });
        var itemLinio = $('main.container-fluid .product-detail');
        var getImage = itemLinio.find('meta[itemprop=image]').attr('content');
        var priceListLinio = itemLinio.find('.buy-information .product-price-container').find('.original-price').text();
        var promoPriceLinio = itemLinio.find('.buy-information .product-price-container').find('.price.price-main').text();
        var catalogo = mongoose.model('catalogo', catalogoSchema);

        if(priceListLinio){
            priceListLinio = parseInt(priceListLinio.replace(/[^\d.]/g, ''));
            if(promoPriceLinio){
                promoPriceLinio = parseInt(promoPriceLinio.replace(/[^\d.]/g, ''));
            }else{
                fns.processArray(uri, '', '', '.catalogue-product.row', '.image-container > a', pagination, detallesProducto);
            }
        }else{
            priceListLinio = 0;
            if(promoPriceLinio){
                promoPriceLinio = parseInt(promoPriceLinio.replace(/[^\d.]/g, ''));
            }else{
                fns.processArray(uri, '', '', '.catalogue-product.row', '.image-container > a', pagination, detallesProducto);
            }
        }

        catalogo.findOne({store:'Linio', 'producto.sku':itemLinio.find('meta[itemprop=sku]').attr('content')}, (error, item) => {
            if(error){
                console.log('Error 1', error);
                return;
            }
            if(item){
                item.producto[0].details.push({
                    date: new Date,
                    priceList: priceListLinio,
                    promoPrice: promoPriceLinio,
                    available: '',
                    posibleStock: ''
                });
                item.save(function(err, data){
                    if(err){
                        console.log('Error 2', err);
                        return;
                    }else{
                        return;
                    }
                })
            }else{
                catalogo.count({store:'Linio'}, function(err, c){
                    console.log(c);
                });
                console.log(uri);
                var nuevaCarga = new catalogo({
                    store: 'Linio',
                    producto: [{
                        name: itemLinio.find('span[itemprop=name]').text(),
                        breadcrumb: arrBread,
                        image: getImage,
                        sku: itemLinio.find('meta[itemprop=sku]').attr('content'), 
                        details: [{
                            date: new Date,
                            priceList: priceListLinio,
                            promoPrice: promoPriceLinio,
                            available: '',
                            posibleStock: ''
                        }]
                    }]
                });
                nuevaCarga.save(function (err, data) {
                    if(err){
                        console.log('Error 3', err);
                        return;
                    }else{
                        return;
                    }
                });
            }
    });
        // console.log(nuevaCarga.producto[0].details);
        //Fin Editable
    });
};

//Inicia Editable
var pagination = '.pagination-container ul li:nth-last-child(2) > a';
//Fin Editable
new Promise(function(resolve, reject) {
    //Inicia Editable
    fns.processArray(url, '/search?q=*', '', '.catalogue-list-container .catalogue-list ul', 'li > a', '', '', function(arrPages){
        resolve(arrPages);
    })
    //Fin Editable
}).then(function(arrPages){
    var iPages = 0;
    var resultProds = function(url, uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback){
        fns.processArray(url, uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, function(){
            console.log(arrPages[iPages]);
            if (++iPages < arrPages.length) {
                resultProds(url, arrPages[iPages],'', '.catalogue-product.row', 'a', pagination, detallesProducto);
            }else{
                console.log('¡¡¡Habemus terminado!!!');
            }
        });
    }
    resultProds(url, arrPages[iPages], '', '.catalogue-product.row', '.image-container > a', pagination, detallesProducto);
});