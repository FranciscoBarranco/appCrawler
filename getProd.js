var express = require('express'),
	mongoose = require('mongoose'),
	request = require('request'),
	cheerio = require('cheerio'),
	queue = require('queue'),
	q = queue(),
	app = express(),
	port = 8000;

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

var arrCateg = [];
var arrPages = [];
var totalProd = 0;

var options = {
	hostname: 'www.liverpool.com.mx'
}

request(url, function(err, resp, body){
    if (err){
        throw err;
    }
	var $ = cheerio.load(body);
	var arrPagination = [];

	var getBody = function(readPage){
		return new Promise(function(resolve, reject) {
			if (err){
				throw err;
			}
			console.log(readPage);
			request(readPage, function(err, resp, body){
				if (err){
					throw err;
				}
				resolve(body);
			});
		});
	}

	var processArray = function(uri, arrResult, elm, searchIntoElm, pagination, obtainDetails){
		var countElm = $(elm).length;
		if(!arrResult && !obtainDetails){
			console.log("¡Falta el 'array' resultante y también la función para obtener datos!");
		}else{
			if(uri === url){
				if(obtainDetails){
					var arrProductos = [];
					return new Promise(function(resolve, reject) {
						$(elm).each(function(){
							if(searchIntoElm){
								var getArrElms = $(this).find(searchIntoElm).attr('href');
								arrProductos.push(getArrElms);
							}else{
								var getArrElms = $(this).attr('href');
								arrProductos.push(getArrElms);
							}
						});
						resolve();
					})
					.then(function(){
						q.push(function(){
							var i = 0;
							var pauseProd = 1 * 1000;
							var saveProds = function(urlProd){
								q.push(function(){
								// return new Promise(function(resolve, reject) {
									// resolve(obtainDetails(urlProd));
									obtainDetails(urlProd);
								})
								q.push(function(){
								// .then(function(){
									if(++i < arrProductos.length){
										setTimeout(function () {
											saveProds(url+arrProductos[i]);
										}, pauseProd);
									}else{
										console.log('¡Se guardaron los elementos de esta página!')
										return
									}
								});
								q.start(function (err) {
								  if (err) throw err
								});
							}
							saveProds(url+arrProductos[i]);
						});
					})
				}else{
					$(elm).each(function(i){
						if(searchIntoElm === undefined || searchIntoElm === ''){
							var getArrElms = $(this).attr('href');
						}else{
							var getArrElms = $(this).find(searchIntoElm).attr('href');
						}
						arrResult.push(getArrElms);
						if(++i === countElm && pagination === undefined || ++i === countElm && pagination === ""){
							// resolve(arrResult);
							return;
						}
					});
					if(pagination){
						if($(pagination + ' a:nth-last-child(2)').is(':contains(">")') || $(pagination + ' a:nth-last-child(2)').find('i').length > 0 ){
							nxt = $(pagination + ' a:nth-last-child(2)').attr('href');
							setTimeout(function () {
								processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails);
							}, 2000);
						}else if($(pagination).is('a')){
							nxt = $(pagination).attr('href');
							setTimeout(function () {
								processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails);
							}, 2000);
						}else{
							return;
						}
					}
				}
			}else{
				getBody(uri)
				.then(function(body){
					if (err){
						throw err;
					}
					var $ = cheerio.load(body);
					if(obtainDetails){
						var arrProductos = [];
						return new Promise(function(resolve, reject) {
							$(elm).each(function(){
								if(searchIntoElm){
									var getArrElms = $(this).find(searchIntoElm).attr('href');
									arrProductos.push(getArrElms);
								}else{
									var getArrElms = $(this).attr('href');
									arrProductos.push(getArrElms);
								}
							});
							resolve();
						})
						.then(function(){
							q.push(function(){
								var i = 0;
								var pauseProd = 1 * 1000;
								var saveProds = function(urlProd){
									q.push(function(){
									// return new Promise(function(resolve, reject) {
										// resolve(obtainDetails(urlProd));
										obtainDetails(urlProd);
									})
									q.push(function(){
									// .then(function(){
										if(++i < arrProductos.length){
											setTimeout(function () {
												saveProds(url+arrProductos[i]);
											}, pauseProd);
										}else{
											console.log('¡Se guardaron los elementos de esta página!')
											return
										}
									});
									q.start(function (err) {
									  if (err) throw err
									});
								}
								saveProds(url+arrProductos[i]);
							});
						})
					}else{
						$(elm).each(function(i){
							if(searchIntoElm === undefined || searchIntoElm === ''){
								var getArrElms = $(this).attr('href');
							}else{
								var getArrElms = $(this).find(searchIntoElm).attr('href');
							}
							arrResult.push(getArrElms);
							if(++i === countElm && pagination === undefined || ++i === countElm && pagination === ""){
								// resolve(arrResult);
								return;
							}
						});
						if(pagination){
							if($(pagination + ' a:nth-last-child(2)').is(':contains(">")') || $(pagination + ' a:nth-last-child(2)').find('i').length > 0 ){
								nxt = $(pagination + 'a:nth-last-child(2)').attr('href');
								setTimeout(function () {
									processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails);
								}, 1500);
							}else if($(pagination).is('a')){
								nxt = $(pagination).attr('href');
								setTimeout(function () {
									processArray(url+nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails);
								}, 1500);
							}else{
								return;
							}
						}
					}
					// resolve(arrResult);
				})
			}
		}
	}

	var detallesProducto = function(uri){
		getBody(uri)
		.then(function(body){
			if (err){
				throw err;
			}
			var $ = cheerio.load(body);			
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
				if (err) console.log(err);
				else console.log('Guardado : ', data );
			});
		});
	};

	//Inicia Editable
	var pagination = '#controls-pagination';
	//Fin Editable
	new Promise(function(resolve, reject) {
		//Inicia Editable
		var principalCateg = processArray(url, arrCateg, ".depart-dropdown-menu > li", 'a');
		//Fin Editable
		arrCateg.splice(-1, 1);
		arrCateg.splice(-1, 1);
		resolve(arrCateg);
	}).then(function(principalCateg){
		console.log('Obteniendo categorías...');
		var i = 0;
		var pause = 1 * 1000;
		var resultSecondCateg = function(uri, arrPages, elm){ // Los parámetros van a depender de la estructura, pueden ser 2, 3 ó 4.
			// Aquí se obtiene el Array con todas las categorías donde se buscaran los productos
			var secondCateg;
			q.push(function(callback){
				secondCateg = processArray(uri, arrPages, elm);
				return new Promise(function(resolve, reject) {
					if (++i < principalCateg.length) {
						setTimeout(function () {
							//Inicia Editable
							resultSecondCateg(url+principalCateg[i], arrPages, "#content .left-nav > a");
							//Fin Editable
						}, pause);
					}else{
						console.log('¡Terminé!');
						resolve();
					}
				}).then(function(){
					q.push(function(){
						var iPages = 0;
						var pausePages = 1 * 1000;

						var resultLinkProd = function(uri, arrResult, elm, searchIntoElm, pagination, obtainDetails){ // Los parámetros van a depender de la estructura, pueden ser 2, 3 ó 4.
							// Aquí se obtiene el Array con todos los productos donde se ingresará para obtener los datos finales. 
							q.push(function(){
							// return new Promise(function(resolve, reject) {
								processArray(uri, arrResult, elm, searchIntoElm, pagination, obtainDetails);
							})
							q.push(function(){
							// .then(function(){
								// if(++iPages < arrPages.length){
								// 	setTimeout(function () {
								// 		resultLinkProd(url+arrPages[iPages], '', '.product-cell', 'a', pagination, detallesProducto);
								// 	}, pausePages);
								// }else{
								// 	console.log('-----------------------¡Se guardó esta página!-----------------------')
								// }
							});
							q.start(function (err) {
							  if (err) throw err
							});
							// new Promise((resolve, reject) => {
							// 	if (++iPages < arrPages.length) {
							// 		setTimeout(function () {
							// 			//Inicia Editable
							// 			resultLinkProd(url+arrPages[iPages], '', '.product-cell', 'a', pagination, detallesProducto);
							// 			//Fin Editable
							// 		}, pausePages);
						 //        }else{
							// 		console.log('¡Terminé!');
							// 		resolve();
						 //        }
							// })
							// .then(function(){
							// 	console.log('Obteniendo información...');
							// 	var iProd = 0;
							// 	var pauseProduct = 1 * 1000;
							// 	//detallesProducto(arrProductos[iProd]);
							// });
						};
						resultLinkProd(url+arrPages[iPages], '', '.product-cell', 'a', pagination, detallesProducto);
				    });
					callback();
				})
			});

			// 	.then(function(arrPages){
			// 		console.log('MERGE:', arrPages);
			// 		console.log('Obteniendo páginas...');
			// 		var iPages = 0;
			// 		var pausePages = 1 * 1000;

			// q.on('success', function(callback){
			// 	console.log('all done:', arrPages);
			// })
			q.start(function (err) {
			  if (err) throw err
			  console.log('all done:', arrPages);
			});
		}
		resultSecondCateg(url+principalCateg[i], arrPages, "#content .left-nav > a");
	});
});