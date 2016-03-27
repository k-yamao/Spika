var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var mailer = require('nodemailer');

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
            	var setting = {
            		    //SMTPサーバーを使う場合
            		    host: 'smtp.gmail.com',
            		    auth: {
            		        user: 'info@local-c.com',
            		        pass: 'localcolor',
            		        port: '587'
            		    }
            	};
            	
            	//メールの内容
            	var mailOptions = {
            	    from: 'info@local-c.com',
            	    to: 'yamao1983@gmail.com',
            	    subject: 'メールの件名',
            	    html: 'メールの内容' //HTMLタグが使えます
            	};
            	//SMTPの接続
            	var smtp = mailer.createTransport('SMTP', setting);

            	//メールの送信
            	smtp.sendMail(mailOptions, function(err, res){
            	    //送信に失敗したとき
            	    if(err){
            	        console.log(err);
            	    //送信に成功したとき
            	    }else{
            	        console.log('Message sent: ' + res.message);
            	    }
            	    //SMTPの切断
            	    smtp.close();
            	});
            	
            	self.setRes(response,Const.httpCodeSucceed,"get people success", people);

            } else {
            	self.setRes(response,Const.httpCodeFileNotFound,"not people", peopleID);
            }
              
        });
        //self.successResponse(response,peopleID);
        
    });
    
    router.post('/signin',function(request,response){
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
    router.post('/test',function(request,response){
    	
    	
    	self.setRes(response, Const.httpCodeSucceed, "OK", request.body);
    	
    	return;
    	
    	
    });
    
    
    /**
     * 新規登録API（メール、パスワード、ニックネームを登録）
     * サンプル
     * http://localhost:3000/spika/v1/people
     * http://spika.local-c.com:3000/spika/v1/people
     * {"mail": "yamao@local-c.com", "password": "1234", "nicname": "hoge"}
     * 新規登録成功"code": 200で返す
     * すでに登録済みのときは"code": 203で返す
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
						    loging  : Utils.now(),
						    updated : Utils.now(),
						    created : Utils.now()
						});
						// 新規登録
						newPeople.save(function(err,people){
							 if(err){            			 
		            			 self.setRes(response,Const.httpCodeInternalServerError,"people sabe fail", err);
							 } else {
								 self.setRes(response,Const.httpCodeSucceed,"signup ok", people);
							 }
						});
            		 }
            	});
            } else {
            	
            	self.setRes(response,Const.httpCodeAccepted,"signup fail. Signed people", people);
            }
        });
    });
    /**
     * メールアドレスの確認をして認証フラグ（auth=1）にする
     * http://localhost:3000/spika/v1/people/auth/o5bzmMhlJYRibnMht2lWLTAy
     * http://spika.local-c.com:3000/spika/v1/people/auth/o5bzmMhlJYRibnMht2lWLTAy
     * 認証成功"code": 200
     * 認証失敗"code": 203
     */
    router.get('/auth/:token',function(request,response){

    	var token =request.params.token;
    	
    	console.log(token);
    	// 登録ずみかチェックのためpeopleコレクションを取得してみる
        PeopleModel.findPeopleByToken(token,function (err,people) {

        	if (people) {
            	people.update({
	        		auth : 1,
	        		updated : Utils.now()
        		},{},function(err,peopleResult){
            
	                if(err){
	                	self.setRes(response,Const.httpCodeAccepted,"auth fail", people);
	                }else{
	                	self.setRes(response,Const.httpCodeSucceed,"auth ok", people);
	                }                
        		});

        	} else {
        		
        	}
        });
    });
    /**
     * プロフィール登録でピープル情報を更新するAPI
     * 
     */
    router.post('/profile',function(request,response){
    	var peopleID  = request.body.peopleID;
    	var nicname  = request.body.nicname;
    	var imageURL = request.body.imageURL;
    	var sex      = request.body.sex;
    	var birthDay = request.body.birthDay;
    	var pref     = request.body.pref;
    	var city     = request.body.city;
    	var appeal   = request.body.appeal;
    	var phrase   = request.body.phrase;
    	
    	
    	
    	
		/*********************************************
		 * TODOいつか入力チェックを実装する
		 *********************************************/
        
		// ピープルIDでピープル情報を取得
        PeopleModel.findPeopleById(peopleID,function (err,people) {

            if(people != null){
            
            	people.update({
            		nicname  : nicname,
            		imageURL : imageURL,
            		sex      : sex,
            		birthDay : birthDay,
            		pref     : pref,
            		city     : city,
            		appeal   : appeal,
            		phrase   : phrase,
            		loging   : Utils.now(),
	        		updated  : Utils.now()
        		},{},function(err,peopleResult){
            
	                if(err){
	                	self.setRes(response,Const.httpCodeAccepted,"people update fail", people);
	                }else{
	                	// 更新後のピープルを取得
	                    PeopleModel.findPeopleById(peopleID,function (err,people) {
	                    	console.log(people);
	                    	self.setRes(response,Const.httpCodeSucceed,"people update  success", people);
	                    });
	                	
	                }                
        		});

            } else {
            	self.setRes(response,Const.httpCodeAccepted,"not found people", people);
            }
        });
    });

}

new PeopleHandler().attach(router);
module["exports"] = router;
