var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var Const = require("../const");
var Settings = require("../lib/Settings");

var RequestHandlerBase = function(){
    
}

RequestHandlerBase.prototype.version = 'v1';

RequestHandlerBase.prototype.path = function(path){
    
    return Settings.options.urlPrefix + "/" + this.version + path;
    
}

// レスポンスを設定
RequestHandlerBase.prototype.setRes = function(response, httpCode, message, datas){
	// クロスドメイン設定
//	var header = {
//			"Access-Control-Allow-Origin":"*",
//			//"Access-Control-Allow-Headers":"X-PINGOTHER",
//			//"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
//			//"Access-Control-Max-Age: ": "3600",
//			//"Pragma": "no-cache",
//			//"Cache-Control" : "no-cache"	   
//		}
//	//response.setHeader("Access-Control-Allow-Origin", "*");
//	response.set(header);
	// ステータスコード
	response.status(httpCode); 
	// レスポンス
	response.json({
        code : httpCode,
        msg  : message,
        data : datas,
    });
	
	//response.writeHead(httpCode, header);
	
	//
}

RequestHandlerBase.prototype.errorResponse = function(
        response,
        httpCode){

    response.status(httpCode);
    response.send("");
    
}

RequestHandlerBase.prototype.successResponse = function(response,code,data){
    
    response.status(Const.httpCodeSucceed);
    
    if(code != Const.responsecodeSucceed){
        
        response.json({
            code : code
        });
        
    } else {

        response.json({
            code : Const.responsecodeSucceed,
            data : data
        });
    
    }

    
}

module["exports"] = RequestHandlerBase;