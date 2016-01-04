var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var RequestHandlerBase = require("./RequestHandlerBase");
var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var PeopleModel = require("../Models/PeopleModel");
var CounterModel = require("../Models/CounterModel");
var Settings = require("../lib/Settings");

var PeopleHandler = function(){
    
}

_.extend(PeopleHandler.prototype,RequestHandlerBase.prototype);

PeopleHandler.prototype.attach = function(app){
        
    var self = this;

    /**
     * @api {get} /user/list/:roomID  Get List of Users in room
     * @apiName Get User List
     * @apiGroup WebAPI
     * @apiDescription Get list of users who are currently in the room

     * @apiParam {String} roomID ID of the room
     *
     *     
     * @apiSuccessExample Success-Response:
		{
		  "success": 1,
		  "result": 
		    {
		      "people": "test",
		      "name": "test",
		      "avatarURL": "http://localhost:8080/img/noavatar.png",
		      "roomID": "test",
		      "socketID": "Znw8kW-ulKXBMoVAAAAB"
		    }
		}
    */
    app.get(this.path('/people/:peopleID'),function(request,response){
        var peopleID = request.params.peopleID;

        PeopleModel.findPeopleById(peopleID,function (err,people) {
            
            if(people != null){
				self.successResponse(response,{
					token: token,
					people: people
				});

            } else {
				
				self.errorResponse(
				    response,
				    Const.httpCodeSucceed,
				    Const.responsecodeParamError,
				    Utils.localizeString(err),
				    true
				);
            }
              
        });
        //self.successResponse(response,peopleID);
        
    });
    
    app.post(this.path('/people/login'),function(request,response){
        var mail     = request.body.mail;
        var password = request.body.password;
        
        PeopleModel.getPeople(mail,function (err,people) {
            
        	
            if(people != null){
            	
            	if (people.password == password) {
            		self.successResponse(response,{
    					token: people.token,
    					people: people
    				});
            	} else {
            		self.errorResponse(
        				    response,
        				    Const.httpCodeSucceed,
        				    Const.responsecodeParamError,
        				    Utils.localizeString(err),
        				    true
            		);
            	}

            } else {
				
				self.errorResponse(
				    response,
				    Const.httpCodeSucceed,
				    Const.responsecodeParamError,
				    Utils.localizeString(err),
				    true
				);
            }
              
        });
        //self.successResponse(response,peopleID);
        
    });
    

    /**
     * @api {post} /user/login Get api token
     * @apiName Login
     * @apiGroup WebAPI
     * @apiDescription Login to the room specified in request, and get token for the room.
     * @apiParam {mail} 
     * @apiParam {password}
     * @apiParam {nicname}
     * @apiSuccess {String} Token
     * @apiSuccess {String} User Model of loginned user
     * @apiSuccessExample Success-Response:
            {
				"success": 1
				"result": {
				"token": "KUfcImFziOp2GNPvPz0Zbluj"
				"people": {
					"__v": 0
					"peopleID": "15"
					"mail": "yama@local-c.com"
					"password": "1234"
					"nicname": "hoge"
					"auth": 0
					"token": "KUfcImFziOp2GNPvPz0Zbluj"
					"created": 1451820799014
					"_id": "568906ff12d61a9c06141cdf"
					}-
				}-
			}
    */
     app.post(this.path('/people'),function(request,response){
		var mail     = request.body.mail;    
		var password = request.body.password;
		var nicname  = request.body.nicname;
		var auth     = 0;

		console.log(request.body);
		
		// メール必須チェック
        if(Utils.isEmpty(mail)){
            self.errorResponse(
                response,
                Const.httpCodeSucceed,
                Const.responsecodeParamError,
                Utils.localizeString("Please specify mail."),
                false
            );
            return;
        }
		// パスワード必須チェック
        if(Utils.isEmpty(password)){
            self.errorResponse(
                response,
                Const.httpCodeSucceed,
                Const.responsecodeParamError,
                Utils.localizeString("Please specify password."),
                false
            );
            return;
        }
		// ニックネーム必須チェック
        if(Utils.isEmpty(nicname)){
        
            self.errorResponse(
                response,
                Const.httpCodeSucceed,
                Const.responsecodeParamError,
                Utils.localizeString("Please specify nicname."),
                false
            );
            
            return;
            
        }
        
        // create token
        var token = Utils.randomString(24);

        // check existance
        PeopleModel.getPeople(mail,function (err,people) {
                      
        	
            if(people == null){
            
            	// カウンターからピープルIDを取得する
            	CounterModel.getNewId(function (err,people) {
            		 if(err){            			 
            			 self.errorResponse(
                             response,
                             Const.httpCodeSucceed,
                             Const.responsecodeParamError,
                             Utils.localizeString(err),
                             true
                         );
            			 
            		 } else {
						// save to database
						var newPeople = new DatabaseManager.peopleModel({
						    peopleID: people.seq,
							mail    : mail,
							password: password,
						    nicname : nicname,
						    auth    : auth,
						    token: token,
						    created: Utils.now()
						});
						newPeople.save(function(err,people){
						    if(err) throw err;
						    self.successResponse(response,{
						        token: token,
						        people: people
						    });
						});
            		 }
            	});
            } else {
                
                self.errorResponse(
                    response,
                    Const.httpCodeSucceed,
                    Const.responsecodeParamError,
                    Utils.localizeString(err),
                    true
                );
                                   
            }
              
        });
        
    });


}


module["exports"] = new PeopleHandler();