var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var RequestHandlerBase = require("./RequestHandlerBase");
var PeoplesManager = require("../lib/PeoplesManager");
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

PeopleHandler.prototype.attach = function(router){
        
    var self = this;

    /**
     * @api {get} /people/list/:roomID  Get List of Users in room
     * @apiName Get People List
     * @apiGroup WebAPI
     * @apiDescription Get list of users who are currently in the room

     * @apiParam {String} peopleID
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
    router.get('/:peopleID',function(request,response){
        var peopleID = request.params.peopleID;

        PeopleModel.findPeopleById(peopleID,function (err,people) {
            
            if(people != null){
            	
            	self.setRes(response,Const.httpCodeSucceed,"get people success", people);

            } else {
            	self.setRes(response,Const.httpCodeFileNotFound,"not people", peopleID);
            }
              
        });
        //self.successResponse(response,peopleID);
        
    });
    
    router.post('/login',function(request,response){
        var mail     = request.body.mail;
        var password = request.body.password;
        
        PeopleModel.getPeople(mail,function (err,people) {
            
        	
            if(people != null){
            	
            	if (people.password == password) {
            		self.setRes(response,Const.httpCodeSucceed,"login success", people);
            	} else {
            		self.setRes(response,Const.httpCodeFileNotFound,"login fail", request.body);
            	}

            } else {
            	self.setRes(response,Const.httpCodeInternalServerError,"server error", err);
            }
              
        });
        //self.successResponse(response,peopleID);
        
    });
    

    /**
     * @api {post} /people/login Get api token
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
    router.post('/',function(request,response){
		var mail     = request.body.mail;    
		var password = request.body.password;
		var nicname  = request.body.nicname;
		var auth     = 0;

		// メール必須チェック
        if(Utils.isEmpty(mail)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error mail", request.body);
            return;
        }
		// パスワード必須チェック
        if(Utils.isEmpty(password)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error password", request.body);
            return;
        }
		// ニックネーム必須チェック
        if(Utils.isEmpty(nicname)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error nicname", request.body);
            return;
        }
        
        // create token
        var token = Utils.randomString(24);

		// 登録ずみかチェックのためpeopleコレクションを取得してみる
        PeopleModel.getPeople(mail,function (err,people) {

            if(people == null){
            
            	// カウンターからピープルIDを取得する
            	CounterModel.getNewId("peoples", function (err,counter) {
            		 if(err){            			 
            			 self.setRes(response,Const.httpCodeInternalServerError,"signup fail peopleID seq", err);
            			 
            		 } else {
						// save to database
						var newPeople = new DatabaseManager.peopleModel({
						    peopleID: counter.seq,
							mail    : mail,
							password: password,
						    nicname : nicname,
						    auth    : auth,
						    token   : token,
						    updated : Utils.now(),
						    created: Utils.now()
						});
						// 新規登録
						newPeople.save(function(err,people){
						    if(err) throw err;

						    self.setRes(response,Const.httpCodeSucceed,"signup ok", people);
						});
            		 }
            	});
            } else {
            	
            	self.setRes(response,Const.httpCodeAccepted,"signup fail. Signed people", people);
            }
        });
    });

}

new PeopleHandler().attach(router);
module["exports"] = router;
