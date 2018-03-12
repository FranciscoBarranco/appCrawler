var express = require('express'),
	mongoose = require('mongoose'),
	request = require('request'),
	cheerio = require('cheerio'),
	http = require('http'),
	async = require("async"),
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

var url = 'http://www.amazon.com.mx/s/ref=nb_sb_noss?__mk_es_MX=%C3%85M%C3%85%C5%BD%C3%95%C3%91&url=search-alias%3Daps&field-keywords=%C3%85M%C3%85%C5%BD%C3%95%C3%91&rh=i%3Aaps%2Ck%3A%C3%85M%C3%85%C5%BD%C3%95%C3%91';

var getBody = function(readPage){
    return new Promise(function(resolve, reject) {
        request(readPage, function(err, resp, body){
            if (err){
                // throw err;
                console.log(err);
            }
            resolve(body);
        });
    });
}

var processArray = function(uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback){
    var pauseFn = 500;
    getBody(uri)
    .then(function(body){
        var $ = cheerio.load(body);
        if(uri === url){
            if(obtainDetails){
                var mapElms;
                new Promise(function(resolve, reject) {
                    if (err){
                        throw err;
                    }
                    if(searchIntoElm){
                        if(arrResult){
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).find(searchIntoElm).attr('href');
                                arrResult.push(getArrElms);
                                return arrResult;
                            }).get();
                            resolve(mapElms);
                        }else{
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).find(searchIntoElm).attr('href');
                                return getArrElms;
                            }).get();
                            resolve(mapElms);
                        }
                    }else{
                        if(arrResult){
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).attr('href');
                                arrResult.push(getArrElms);
                                return arrResult;
                            }).get();
                            resolve(mapElms);
                        }else{
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).attr('href');
                                return getArrElms;
                            }).get();
                            resolve(mapElms);
                        }
                    }
                })
                .then(function(mapElms){
                    async.forEachLimit(mapElms, 3, function(file, next){
                        obtainDetails(url+file)
                        if(file === mapElms[mapElms.length-1]){
                            if(pagination){
                                if($(pagination + ' a:nth-last-child(2)').is(':contains(">")') || $(pagination + ' a:nth-last-child(2)').find('i').length > 0 ){
                                    nxt = $(pagination + ' a:nth-last-child(2)').attr('href');
                                    setTimeout(function () {
                                        processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
                                    }, pauseFn);
                                }else if($(pagination).is('a')){
                                    nxt = $(pagination).attr('href');
                                    setTimeout(function () {
                                        processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
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
                            callback();
                            console.log('All files have been processed successfully');
                        }
                    })
                })
            }else{
                if(searchIntoElm){
                    if(arrResult){
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).find(searchIntoElm).attr('href');
                            arrResult.push(getArrElms);
                            return arrResult;
                        }).get();
                    }else{
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).find(searchIntoElm).attr('href');
                            return getArrElms;
                        }).get();
                    }
                }else{
                    if(arrResult){
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).attr('href');
                            arrResult.push(getArrElms);
                            return arrResult;
                        }).get();
                    }else{
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).attr('href');
                            return getArrElms;
                        }).get();
                    }
                }
                callback(mapElms);
                return mapElms;
            }
        }else{
            if(obtainDetails){
                var mapElms;
                new Promise(function(resolve, reject) {
                    if(searchIntoElm){
                        if(arrResult){
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).find(searchIntoElm).attr('href');
                                arrResult.push(getArrElms);
                                return arrResult;
                            }).get();
                            resolve(mapElms);
                        }else{
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).find(searchIntoElm).attr('href');
                                return getArrElms;
                            }).get();
                            resolve(mapElms);
                        }
                    }else{
                        if(arrResult){
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).attr('href');
                                arrResult.push(getArrElms);
                                return arrResult;
                            }).get();
                            resolve(mapElms);
                        }else{
                            mapElms = $(elm).map(function(){
                                var getArrElms = $(this).attr('href');
                                return getArrElms;
                            }).get();
                            resolve(mapElms);
                        }
                    }
                })
                .then(function(mapElms){
                    async.forEachLimit(mapElms, 3, function(file, next){
                        // console.log(url+file);
                        obtainDetails(url+file)
                        if(file === mapElms[mapElms.length-1]){
                            if(pagination){
                                if($(pagination + ' a:nth-last-child(2)').is(':contains(">")') || $(pagination + ' a:nth-last-child(2)').find('i').length > 0 ){
                                    nxt = $(pagination + ' a:nth-last-child(2)').attr('href');
                                    setTimeout(function () {
                                        console.log(url+nxt);
                                        processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
                                    }, pauseFn);
                                }else if($(pagination).is('a')){
                                    nxt = $(pagination).attr('href');
                                    setTimeout(function () {
                                        processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
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
                            callback();
                            console.log('All files have been processed successfully');
                        }
                    })
                })
            }else{
                if(searchIntoElm){
                    if(arrResult){
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).find(searchIntoElm).attr('href');
                            arrResult.push(getArrElms);
                            return arrResult;
                        }).get();
                    }else{
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).find(searchIntoElm).attr('href');
                            return getArrElms;
                        }).get();
                    }
                }else{
                    if(arrResult){
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).attr('href');
                            arrResult.push(getArrElms);
                            return arrResult;
                        }).get();
                    }else{
                        var mapElms = $(elm).map(function(){
                            var getArrElms = $(this).attr('href');
                            return getArrElms;
                        }).get();
                    }
                }
                callback(mapElms);
                return mapElms;
            }
        }
    });
};

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

        catalogo.findOne({'producto.sku':$('#prodId').val()}, (error, item) => {
            if(error){
                console.log(error);
                return;
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
                        return;
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
var pagination = '#controls-pagination';
//Fin Editable
new Promise(function(resolve, reject) {
    //Inicia Editable
    processArray(url, '', ".depart-dropdown-menu > li", 'a', '', '', function(arrCateg){
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
    var resultCateg = function(uri, arrResult, elm){
        new Promise(function(resolve, reject) {
            processArray(uri, arrResult, elm, '', '', '', function(urlPage){
                if (++i < arrCateg.length) {
                    setTimeout(function () {
                        //Inicia Editable
                        resultCateg(url+arrCateg[i], arrPages, "#content .left-nav > a");
                        //Fin Editable
                    }, pause);
                }else{
                    resolve(arrPages);
                }								
            });
        }).then(function(arrPages){
            var iPages = 0;
            var resultProds = function(uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback){
                processArray(uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, function(){
                    if (++iPages < arrPages.length) {
                        console.log(url+arrPages[iPages]);
                        resultProds(url+arrPages[iPages],'', '.product-cell', 'a', pagination, detallesProducto);
                    }else{
                        console.log('¡¡¡Habemus terminado!!!');
                    }
                });
            }
            resultProds(url+arrPages[iPages], '', '.product-cell', 'a', pagination, detallesProducto);
        })
    }
    //Inicia Editable
    resultCateg(url+arrCateg[i], arrPages, "#content .left-nav > a");
    //Fin Editable
});
