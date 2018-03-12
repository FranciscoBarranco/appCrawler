var request = require('request'),
	cheerio = require('cheerio'),
    async = require("async"),
    methods = {};
    
methods.getBody = function(readPage){
    return new Promise(function(resolve, reject) {
        request(readPage, function(err, resp, body){
            if (err){
                // throw err;
                console.log('Error Fn', err);
                return;
            }
            resolve(body);
        });
    });
}

methods.processArray = function(url, uri, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback){
    var pauseFn = 500;
    methods.getBody(url+uri)
    .then(function(body){
        var $ = cheerio.load(body);
        if(uri){
            if(obtainDetails){
                var mapElms;
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
                    async.forEachLimit(mapElms, mapElms.length, function(file, next){
                        obtainDetails(url+file)
                        if(file === mapElms[mapElms.length-1]){
                            if(pagination){
                                if($(pagination + ' a:nth-last-child(2)').is(':contains(">")') || $(pagination + ' a:nth-last-child(2)').find('i').length > 0 ){
                                    nxt = $(pagination + ' a:nth-last-child(2)').attr('href');
                                    setTimeout(function () {
                                        methods.processArray(url, nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
                                    }, pauseFn);
                                }else if($(pagination).is('a')){
                                    nxt = $(pagination).attr('href');
                                    setTimeout(function () {
                                        methods.processArray(url, nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
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
                            return;
                        } else {
                            // callback();
                            console.log('All files have been processed successfully');
                            return;
                        }
                    })
                })
            }else{
                if(searchIntoElm){
                    var mapElms = $(elm).map(function(){
                        var getArrElms = $(this).find(searchIntoElm).attr('href');
                        return getArrElms;
                    }).get();
                }else{
                    var mapElms = $(elm).map(function(){
                        var getArrElms = $(this).attr('href');
                        return getArrElms;
                    }).get();
                }
                callback(mapElms);
                return mapElms;
            }
        }else{
            if(obtainDetails){
                var mapElms;
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
                    async.forEachLimit(mapElms, mapElms.length, function(file, next){
                        obtainDetails(url+file);
                        if(file === mapElms[mapElms.length-1]){
                            if(pagination){
                                if($(pagination + ' a:nth-last-child(2)').is(':contains(">")') || $(pagination + ' a:nth-last-child(2)').find('i').length > 0 ){
                                    nxt = $(pagination + ' a:nth-last-child(2)').attr('href');
                                    setTimeout(function () {
                                        methods.processArray(url, nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
                                    }, pauseFn);
                                }else if($(pagination).is('a')){
                                    nxt = $(pagination).attr('href');
                                    setTimeout(function () {
                                        methods.processArray(url, nxt, arrResult, elm, searchIntoElm, pagination, obtainDetails, callback);
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
                            return;
                        } else {
                            // callback();
                            console.log('All files have been processed successfully');
                            return;
                        }
                    })
                })
            }else{
                if(searchIntoElm){
                    var mapElms = $(elm).map(function(){
                        var getArrElms = $(this).find(searchIntoElm).attr('href');
                        return getArrElms;
                    }).get();
                }else{
                    var mapElms = $(elm).map(function(){
                        var getArrElms = $(this).attr('href');
                        return getArrElms;
                    }).get();
                }
                return mapElms;
            }
            // callback(mapElms);
            return mapElms;
        }
    });
};

module.exports = methods; 