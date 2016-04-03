var express = require('express');
var router = express.Router();
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var RequestHandlerBase = require("./RequestHandlerBase");
var PeoplesManager = require("../lib/PeoplesManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var PeopleModel = require("../Models/PeopleModel");
var PickModel = require("../Models/PickModel");
var Settings = require("../lib/Settings");
var Const = require("../const");
var async = require('async');


var SigninHandler = function(){
    
}
_.extend(SigninHandler.prototype,RequestHandlerBase.prototype);

SigninHandler.prototype.attach = function(router){
        
    var self = this;

    /**
     * @api {post} /room/signin Get api token
     * @apiName Login
     * @apiGroup WebAPI
     * @apiDescription Login to the room specified in request, and get token for the room.

     * @apiParam {name} Users Name
     * @apiParam {avatarURL} URL of avatar image
     * @apiParam {roomID} Room Name to login
     * @apiParam {userID} User's Unique ID
     *
     * @apiSuccess {String} Token
     * @apiSuccess {String} User Model of loginned user
     *     
     * @apiSuccessExample Success-Response:

{
	code: 1,
	data: {
		token: 'FPzdinKSETyXrx0zoxZVYoVt',
		user: {
			_id: '564b128a94b8f880877eb47f',
			userID: 'test',
			name: 'test',
			avatarURL: 'test',
			token: 'zJd0rlkS6OWk4mBUDTL5Eg5U',
			created: 1447760522576,
			__v: 0
		}
	}
}

    */
    router.post('/',function(request,response){
    	
    	var peopleID     = request.body.peopleID;    
		var peoplePickID = request.body.peoplePickID;

		
		// ピープルID必須チェック
        if(Utils.isEmpty(peopleID)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error peopleID", request.body);
            return;
        }
		// ピープルピックID必須チェック
        if(Utils.isEmpty(peoplePickID)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error peoplePickID", request.body);
            return;
        }
        
        
    	PickModel.upsertPick(peopleID, peoplePickID, function (err,pick) {
    		
    		 if(err){
             	self.setRes(response,code, err);
             } else {
            	 self.setRes(response,Const.httpCodeSucceed,"create pick OK", pick);
             }
            
        },function(err,code){
            
            if(err){
            	self.setRes(response,code, err);
             }
            
        });
        
    });
    
    router.get('/list',function(request,response){

         var peopleID = request.query.peopleID;
         // ピープルIDの必須チェック
         if (Utils.isEmpty(peopleID)) {
        	 self.setRes(response, Const.httpCodeBadRequest,"input error peopleID");
             return;
         }
         /**
          * roomを取得
          * peopleを取得
          * msgを取得
          */
         async.waterfall(
        		 [
        		  	function (done) {
        		  		// roomを検索してあれば、ルームIDとメンバーを返す
        		  		PickModel.findPickByPeopleID(peopleID,function (err,picks) {
                       		
                       		done(err,picks);
                       	});
                              
                     },
                     function (picks,done) {
                    	 if (picks.length > 0) {
                    		 
                			 PickModel.populatePick(picks,function (err,picks) {
                				 console.log(picks);
                				 done(null,picks);
							
                			 });
                    		
                     	 } else {
                     		done(null,[]);
                     	 }
                     }
                     ],
                     function (err, data) {
                              
                              if(err){
                            	  self.setRes(response,Const.httpCodeInternalServerError, "get room list fail");
                              }else{
                            	  self.setRes(response,Const.httpCodeSucceed,"get room list OK", data);
                                  
                              }
                                   
                          }
                          
                      );
        
         
         
         
         
         
         
    });

}

new SigninHandler().attach(router);
module["exports"] = router;
