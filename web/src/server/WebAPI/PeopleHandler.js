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
var PickModel = require("../Models/PickModel");
var BoardModel = require("../Models/BoardModel");
var Settings = require("../lib/Settings");

var PeopleHandler = function(){
    
}

_.extend(PeopleHandler.prototype,RequestHandlerBase.prototype);

PeopleHandler.prototype.attach = function(router){
        
    var self = this;
    
    
    /**
     * パスワードの初期化、認証URLを忘れたときの再送、パスワード変更
     * mail  : メールアドレス
     * type 1: パスワードの初期化
     *      2: パスワード変更
     *      3: 認証URLを忘れたときの再送
     */
    router.get('/change',function(request,response){
    	
    	var mail     = '';
    	var type     = 0;
    	var password = '';

    	// メールで利用する変数
    	var  title    = '';
    	var  bodyHtml = '';

    	
    	// メールの入力チェック
        if(!Utils.isEmpty(request.query.mail)){
        	mail = request.query.mail;
        } else {
        	self.setRes(response, Const.httpCodeBadRequest, "input error mail", request.query);
            return;
        }
    	// メールの入力チェック
        if(!Utils.isEmpty(request.query.type) && (request.query.type == '1' || request.query.type == '2' || request.query.type == '3')){
        	type = parseInt(request.query.type);
        	
        	// パスワード変更の場合はパスワードもチェックする
        	if (type == 2) {
        		// パスワードチェック
	        	if (!Utils.isEmpty(request.query.password)) {
	        		password = request.query.password;
	        	} else {
	        		self.setRes(response, Const.httpCodeBadRequest, "input error password", request.query);
	                return;
	        	}
        	} 
        } else {
        	self.setRes(response, Const.httpCodeBadRequest, "input error type", request.query);
            return;
        }
        
        
        // ピープルの取得
        PeopleModel.getPeople(mail,function (err,people) {
        	
        	if (people) {
        		
        		if (type == 1 || type == 2) {
        			var upobj = null;
        			
		        	if (type == 1) {
		        		password = Utils.randomString(6, null);
		        	}
		        	
        			people.update({
		        		password: password,
		        		updated : Utils.now()
	        		},{},function(err,peopleResult){
		                if(err){
		                	self.setRes(response,Const.httpCodeAccepted,"password update fail", people);
		                	return;
		                }else{
		                	
		                	if (type == 1) {
		                		// パスワードの初期化
		                		title    = Const.mailTitleInitPassword;
		                		bodyHtml = Const.mailHtmlInitPassword + "<br>パスワード：" + people.password + Const.mailSignature;
		                	} else {
		                		// パスワード変更
		                		title    = Const.mailTitleChangePassword;
		                		bodyHtml = Const.mailHtmlChangePassword + Const.mailSignature; 
		                	}

		                	
							 // メール送信
							 // SMTPコネクションプールを作成(Gmail)
							 var smtpTransport = mailer.createTransport("SMTP", {
								 service: "Gmail",
								 auth: {
									 XOAuth2: {
										user: Const.mailUser, // Your gmail address.
										clientId: Const.mailClientId,
										clientSecret: Const.mailClientSecret,
										refreshToken: Const.mailRefreshToken
									 }
								 }
							 });
							 // unicode文字でメールを送信
							 var mailOptions = {
				            	    from: Const.mailUser, 		// sender address
				            	    to: mail,					// list of receivers
				            	    subject: title, // Subject line
				            	    html: bodyHtml 			// html body
							 }
							 
							 
							 //console.log(mailOptions);
							 // 先ほど宣言したトランスポートオブジェクトでメールを送信
							 smtpTransport.sendMail(mailOptions, function (error, mailResponse) {
								 if (error) {
									 self.setRes(response,Const.httpCodeInternalServerError,"password update fail", error);
				            	 } else {
				            		 self.setRes(response,Const.httpCodeSucceed,"password update ok", people);
				            	 }
				            	    // 他の送信処理はなければ、下記のコメントを解除して、トランスポートオブジェクトをクローズしてください。
				            	 smtpTransport.close(); // shut down the connection pool, no more messages
				                 return;
							 });
		                }                
	        		});

        		} else {
        			
        			 var authURL = Const.mailAuthUrl + people.token;
					 var bodyHtml = Const.mailHtmlAuth + '<br><a href="' + authURL +'">' + authURL + '</a>' + Const.mailSignature;
					 
					 // メール送信
					 // SMTPコネクションプールを作成(Gmail)
					 var smtpTransport = mailer.createTransport("SMTP", {
						 service: "Gmail",
						 auth: {
							 XOAuth2: {
								user: Const.mailUser, // Your gmail address.
								clientId: Const.mailClientId,
								clientSecret: Const.mailClientSecret,
								refreshToken: Const.mailRefreshToken
							 }
						 }
					 });
					 // unicode文字でメールを送信
					 var mailOptions = {
		            	    from: Const.mailUser, 		// sender address
		            	    to: people.mail,			// list of receivers
		            	    subject: Const.mailTitleAuth, // Subject line
		            	    html: bodyHtml 			// html body
					 }
					 //console.log(mailOptions);
					 // 先ほど宣言したトランスポートオブジェクトでメールを送信
					 smtpTransport.sendMail(mailOptions, function (error, mailResponse) {
						 if (error) {
							 self.setRes(response,Const.httpCodeFileNotFound,"send mail err", error);
		            	 } else {
		            		 self.setRes(response,Const.httpCodeSucceed,"auth URL ok", people);
		            	 }
		            	 // 他の送信処理はなければ、下記のコメントを解除して、トランスポートオブジェクトをクローズしてください。
		            	 smtpTransport.close(); // shut down the connection pool, no more messages
		            	 
		              	 return;
					 });
        		}
	            
        	
        	} else {
        		self.setRes(response,Const.httpCodeFileNotFound,"not found people", people);
        		return;
        	}
        	
        	
        	
        });
        
      
    	
    });

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
    /**
     * ピープルIDでピープル情報を削除する
     */
    router.get('/delete/:peopleID',function(request,response){
        var peopleID = request.params.peopleID;

        PeopleModel.removePeople(peopleID,function (err,people) {

        	if(err){
        		self.setRes(response,Const.httpCodeFileNotFound,"remove people fail", peopleID);
            	return;
            	
            } else {
            	self.setRes(response,Const.httpCodeSucceed,"remove people success", peopleID);
            	return;
            }
              
        });
        
    });
    /**
     * ピープルIDでピープル情報を取得する
     */
    router.get('/count/:peopleID',function(request,response){
        var peopleID = request.params.peopleID;
        
        var counts = {
        		boardCount   : 0,
        		pickCount    : 0,
        		pickerCount  : 0
        }
        async.waterfall([
                         function (done) {
                        	 
                        	 BoardModel.getBoardCount(peopleID,function (err,count) {

                        		 counts.boardCount = count;
                        		 done();
                              
                             });
                        	 
                         },
                         function (done) {
                        	 PickModel.getPickCount(peopleID,function (err,count) {

                        		 counts.pickCount = count;
                        		 done();
                              
                             });
                         },
                         function (done) {
                        	 PickModel.getPickerCount(peopleID,function (err,count) {

                        		 counts.pickerCount = count;
                        		 done();
                              
                             });
                        	 
                         }
                         ],
                         function (err) {
                             
                             if(err){
                             	self.setRes(response,Const.httpCodeInternalServerError,"people count fail", err);
                             
                             }else{
                                 
                                 self.setRes(response,Const.httpCodeSucceed,"people count ok", counts);
                                 
                             }
                                  
                         }
        );
        
        
    });
    /**
     * ピープルIDでピープル情報を取得する
     */
    router.get('/:peopleID',function(request,response){
        var peopleID = request.params.peopleID;
        
        PeopleModel.findPeopleById(peopleID,function (err,people) {
            
            if(people != null){
            	self.setRes(response,Const.httpCodeSucceed,"get people success", people);
            	return;
            } else {
            	self.setRes(response,Const.httpCodeFileNotFound,"not people", peopleID);
            	return;
            }
              
        });
        
    });
    /**
     * サインインする
     */
    router.post('/signin',function(request,response){
        var mail     = request.body.mail;
        var password = request.body.password;
        
        PeopleModel.getPeople(mail,function (err,people) {
            
        	 if(err){
             	self.setRes(response,Const.httpCodeAccepted,"people　geet fail", people);
        	 } else {
	            if(people != null){
	            	
	            	if (people.password == password) {
	            		self.setRes(response,Const.httpCodeSucceed,"login success", people);
	            		return;
	            	} else {
	            		self.setRes(response,Const.httpCodeFileNotFound,"login fail", request.body);
	            		return;
	            	}
	
	            } else {
	            	self.setRes(response,Const.httpCodeInternalServerError,"server error", err);
	            	return;
	            }
        	 }
        });
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
		            			 self.setRes(response,Const.httpCodeInternalServerError,"people save fail", err);
		            			 return;
							 } else {
								 // 新規登録に成功したらメールを送信する
								 
								 var authURL = Const.mailAuthUrl + people.token;
								 var bodyTextHTML = Const.mailHtmlAuth + '<br><a href="' + authURL +'">' + authURL + '</a>' + Const.mailSignature;
								 
								 // メール送信
								 // SMTPコネクションプールを作成(Gmail)
								 var smtpTransport = mailer.createTransport("SMTP", {
									 service: "Gmail",
									 auth: {
										 XOAuth2: {
											user: Const.mailUser, // Your gmail address.
											clientId: Const.mailClientId,
											clientSecret: Const.mailClientSecret,
											refreshToken: Const.mailRefreshToken
										 }
									 }
								 });
								 // unicode文字でメールを送信
								 var mailOptions = {
					            	    from: Const.mailUser, 		// sender address
					            	    to: people.mail,			// list of receivers
					            	    subject: "Street 仮登録完了", // Subject line
					            	    html: bodyTextHTML 			// html body
								 }
								 //console.log(mailOptions);
								 // 先ほど宣言したトランスポートオブジェクトでメールを送信
								 smtpTransport.sendMail(mailOptions, function (error, mailResponse) {
									 if (error) {
										 self.setRes(response,Const.httpCodeInternalServerError,"signup mail fail", error);
					            	 } else {
					            	     self.setRes(response,Const.httpCodeSucceed,"signup ok", people);
					            	 }
					            	    // 他の送信処理はなければ、下記のコメントを解除して、トランスポートオブジェクトをクローズしてください。
					            	 smtpTransport.close(); // shut down the connection pool, no more messages
					            	 
					            	 return;
								 });
							 
								 
								
							 }
						});
            		 }
            	});
            } else {            	
            	self.setRes(response,Const.httpCodeAccepted,"signup fail. Signed people", people);
            	return;
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

    	// 登録ずみかチェックのためpeopleコレクションを取得してみる
        PeopleModel.findPeopleByToken(token,function (err,people) {

        	if (people) {
            	people.update({
	        		auth : 1,
	        		updated : Utils.now()
        		},{},function(err,peopleResult){
	                if(err){
	                	self.setRes(response,Const.httpCodeAccepted,"auth fail", people);
	                	return;
	                }else{
	                	self.setRes(response,Const.httpCodeSucceed,"auth ok", people);
	                	return;
	                }                
        		});
        	} else {
        		self.setRes(response,Const.httpCodeFileNotFound,"not found people", people);
        		return;
        	}
        });
    });
    /**
     * プロフィール登録でピープル情報を更新するAPI
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
