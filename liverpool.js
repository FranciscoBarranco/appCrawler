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

var url = 'http://www.liverpool.com.mx';

var detallesProducto = function(uri){
    fns.getBody(uri)
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

        catalogo.findOne({'producto.sku':$('#prodId').val()}, (error, item) => {
            if(error){
                console.log(error);
            }
            if(item){
                item.producto[0].details.push({
                    date: new Date,
                    priceList: $('#requiredlistprice').val(),
                    promoPrice: $('#requiredpromoprice').val(),
                    available: $('#stockThresholdEnabled').val(),
                    posibleStock:$('#numRecords').val()
                });
                item.save(function(err, data){
                    if(err){
                        console.log(err);
                    }else{
                        return;
                    }
                })
            }else{
                console.log(uri);
                var nuevaCarga = new catalogo({
                    store: 'Liverpool',
                    producto: [{
                        name: $('#productName h1').text(),
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
                nuevaCarga.save(function (err, data) {
                    if(err){
                        console.log(err);
                    }else{
                        return;
                    }
                });
            }
        });
        //Fin Editable
    });
};

//Inicia Editable
var pagination = '#controls-pagination';
//Fin Editable
new Promise(function(resolve, reject) {
    //Inicia Editable
    fns.processArray(url, '', '', '.depart-dropdown-menu > li', 'a', '', '', function(arrCateg){
        arrCateg.splice(-1, 1);
        arrCateg.splice(-1, 1);
        resolve(arrCateg);
    })
    //Fin Editable
}).then(function(arrCateg){
    console.log('Obteniendo páginas...');
    var i = 0;
    var pause = 300;
    var arrPages = [];
    var resultCateg = function(url, uri, arrResult, elm){
        new Promise(function(resolve, reject) {
            fns.processArray(url, uri, arrResult, elm, '', '', '', function(urlPage){
                urlPage.forEach(element => {
                    arrPages.push(element);
                });
                if (++i < arrCateg.length) {
                    setTimeout(function () {
                        //Inicia Editable
                        resultCateg(url, arrCateg[i], arrResult, elm);
                        //Fin Editable
                    }, pause);
                }else{
                    resolve(arrPages);
                }								
            });
        }).then(function(arrPages){
            var iPages = 0;
            var resultProds = function(url, uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback){
                fns.processArray(url, uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, function(){
                    if (++iPages < arrPages.length) {
                        console.log(url + arrPages[iPages]);
                        resultProds(url, arrPages[iPages], arrResult, elm, searchIntoElm, pagination, obtainDetails);
                    }else{
                        console.log('¡¡¡Habemus terminado!!!');
                    }
                });
            }
            resultProds(url, arrPages[iPages], '', '.product-cell', 'a', pagination, detallesProducto);
        })
    }
    //Inicia Editable
    resultCateg(url, arrCateg[i], '', "#content .left-nav > a");
    //Fin Editable
});