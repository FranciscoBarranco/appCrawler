var express = require('express'),
    mongoose = require('mongoose'),
	request = require('request'),
	cheerio = require('cheerio'),
	http = require('http'),
    async = require("async"),
	port = 8000;

var arr = ['/tienda/ropa/catst4003074?showPLP',
    '/tienda/zapatos/catst4003075?showPLP',
    '/tienda/bolsas/catst4003077?showPLP',
    '/tienda/accesorios/catst4003079?showPLP',
    '/tienda/marcas-destacadas/catst4003081?showPLP',
    '/tienda/ella/catst4003829?showPLP',
    '/tienda/ropa/cat610037?showPLP',
    '/tienda/zapatos/cat5040004?showPLP',
    '/tienda/accesorios/cat1300601?showPLP',
    '/tienda/marcas-destacadas/catst4580698?showPLP',
    '/tienda/ropa-zapatos-y-accesorios/catst5620583?showPLP',
    '/tienda/todo-para-tu-bebé/catst5620311?showPLP',
    '/tienda/habitación/catst5620584?showPLP',
    '/tienda/marcas-destacadas/catst6650157?showPLP',
    '/tienda/ella/cat5040495?showPLP',
    '/tienda/él/cat5040523?showPLP',
    '/tienda/infantiles/cat5040525?showPLP',
    '/tienda/tenis-deportivos/catst7715682?showPLP',
    '/tienda/maquillaje/catst6202920?showPLP',
    '/tienda/perfumes/catst6202922?showPLP',
    '/tienda/cuidado-del-cabello/catst6202921?showPLP',
    '/tienda/cuidado-de-la-piel/catst8000446?showPLP',
    '/tienda/hombres/catst8000490?showPLP',
    '/tienda/marcas-destacadas/catst6267371?showPLP',
    '/tienda/regalos/catst6700518?showPLP',
    '/tienda/relojes/catst6220025?showPLP',
    '/tienda/lentes/catst6220029?showPLP',
    '/tienda/joyería/catst6220026?showPLP',
    '/tienda/marcas-destacadas/catst6220037?showPLP',
    '/tienda/disciplinas/cat5020007?showPLP',
    '/tienda/tenis-deportivos/cat490423?showPLP',
    '/tienda/ropa-y-accesorios/catst8040507?showPLP',
    '/tienda/aparatos-de-ejercicio-y-motos/cat5070030?showPLP',
    '/tienda/marcas-destacadas/catst7543594?showPLP',
    '/tienda/computadoras/cat3410055?showPLP',
    '/tienda/electrónica/cat480017?showPLP',
    '/tienda/instrumentos-musicales/cat480105?showPLP',
    '/tienda/marcas-destacadas/cat5030004?showPLP',
    '/tienda/equipos/cat5150018?showPLP',
    '/tienda/accesorios/cat480056?showPLP',
    '/tienda/celulares-por-compañia/cat5150023?showPLP',
    '/tienda/promo-celulares-telcel-y-motorola/cat6880000?showPLP',
    '/tienda/pre-ventas-y-top-ventas/catst4818770?showPLP',
    '/tienda/consolas/cat940612?showPLP',
    '/tienda/juegos/cat1161024?showPLP',
    '/tienda/accesorios/cat5030010?showPLP',
    '/tienda/pc-gamer/catst4818765?showPLP',
    '/tienda/por-categoria/catst1833786?showPLP',
    '/tienda/por-marca/catst1833787?showPLP',
    '/tienda/por-edad/catst1833788?showPLP',
    '/tienda/línea-blanca/cat5020036?showPLP',
    '/tienda/electrodomésticos/cat861236?showPLP',
    '/tienda/marcas-destacadas/catst6266277?showPLP',
    '/tienda/muebles/cat5020039?showPLP',
    '/tienda/colchones/cat4340026?showPLP',
    '/tienda/muebles-para-bebé/cat5300050?showPLP',
    '/tienda/arte-y-decoración/cat5170154?showPLP',
    '/tienda/marcas-destacadas/catst6266642?showPLP',
    '/tienda/electrodomésticos/cat480268?showPLP',
    '/tienda/casa/cat5020000?showPLP',
    '/tienda/cocina/cat480213?showPLP',
    '/tienda/ferretería-y-automotriz/cat4490030?showPLP',
    '/tienda/marcas-destacadas/catst6615768?showPLP',
    '/tienda/vinos/cat5300086?showPLP',
    '/tienda/licores-y-destilados/cat5300088?showPLP',
    '/tienda/la-selección-de-la-cava/catst6337104?showPLP',
    '/tienda/complementos/catst6337107?showPLP',
    '/tienda/marcas-destacadas/catst6592543?showPLP']
    
var server=http.createServer(function(req,res){
    res.end('test');
});

server.on('listening',function(){
    console.log('¡Servidor corriendo!');
});

server.listen(port);

// mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/crawler');
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
});

db.dropDatabase(); // Para borrar la DB

var url = 'http://www.liverpool.com.mx';

var getBody = function(readPage){
    return new Promise(function(resolve, reject) {
        request(readPage, function(err, resp, body){
            if (err){
                console.log(err);
            }
            resolve(body);
        });
    });
}

var detallesProducto = function(uri){
    getBody(uri)
    .then(function(body){
        var $ = cheerio.load(body);
        //Inicia Editable
        var arrBread = [];
        $('#breadcrum').find('li').each(function(){
            var getItemBread = $(this).find('a').text();
            if(getItemBread != ''){
                arrBread.push(getItemBread);
            }
        });
        var getImage = $('#jsonImageMap').val(),
            jsonImage = JSON.parse(getImage),
            arrJson = [];
        for (x in jsonImage) {
            arrJson.push(jsonImage[x])
        }
        
        var catalogo = mongoose.model('catalogo', catalogoSchema);
        var nuevaCarga = new catalogo({
            store: 'Liverpool',
            producto: [{
                name: $('#productName h1').html(),
                breadcrumb: arrBread,
                image: arrJson[0],
                sku: $('#prodId').val(), 
                details: [{
                    date: new Date,
                    priceList: $('#requiredlistprice').val(),
                    promoPrice: $('#requiredpromoprice').val(),
                    available: $('#stockThresholdEnabled').val(),
                    posibleStock:$('#numRecords').val()
                }]
            }]
        });
        // console.log(nuevaCarga.producto[0].details);
        //Fin Editable
        nuevaCarga.save(function (err, data) {
            if(err){
                    console.log(err);
            }else{
                console.log('Guardado : ', data );
            }
        });
    });
};

var processArr = function(uri, elm, searchIntoElm, pagination, obtainDetails, callback){
    var iElms = 0,
        mapElms,
        pauseFn = 500;
    getBody(uri)
    .then(function(body){
        var $ = cheerio.load(body);
        
        new Promise(function(resolve, reject) {
            if(searchIntoElm){
                mapElms = $(elm).map(function(){
                    var getArrElms = $(this).find(searchIntoElm).attr('href');
                    return getArrElms;
                }).get();
                resolve(mapElms);
            }else{
                mapElms = $(elm).map(function(){
                    var getArrElms = $(this).attr('href');
                    return getArrElms;
                }).get();
                resolve(mapElms);
            }
        })
        .then(function(mapElms){
            async.forEachLimit(mapElms, 10, function(file, next){
                obtainDetails(url+file)
                if(file === mapElms[mapElms.length-1]){
                    if(pagination){
                        if($(pagination + ' a:nth-last-child(2)').is(':contains(">")') || $(pagination + ' a:nth-last-child(2)').find('i').length > 0 ){
                            nxt = $(pagination + ' a:nth-last-child(2)').attr('href');
                            setTimeout(function () {
                                processArr(url+nxt, elm, searchIntoElm, pagination, obtainDetails, callback);
                            }, pauseFn);
                        }else if($(pagination).is('a')){
                            nxt = $(pagination).attr('href');
                            setTimeout(function () {
                                processArr(url+nxt, elm, searchIntoElm, pagination, obtainDetails, callback);
                            }, pauseFn);
                        }else{
                            console.log('¡Terminó paginación!');
                            next();
                            return;
                        }
                    }
                }else{
                    next();
                }
            }, function(err){
                if( err ) {
                    console.log('A file failed to process');
                } else {
                    console.log(callback);
                    callback('callback');
                    console.log('All files have been processed successfully');
                }
            })
        });
    });
}

var pagination = '#controls-pagination';
var i = 0;
var resultProds = function(uri, elm, searchIntoElm, pagination, obtainDetails, callback){
    processArr(uri, elm, searchIntoElm, pagination, obtainDetails, function(){
        if (++i < arr.length) {
            resultProds(url+arr[++i], '.product-cell', 'a', pagination, detallesProducto);
        }else{
            console.log('¡¡¡Habemus productos completos!!!');
        }
    });
}
resultProds(url+arr[i], '.product-cell', 'a', pagination, detallesProducto);