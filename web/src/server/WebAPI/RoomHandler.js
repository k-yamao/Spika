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
var RoomModel = require("../Models/RoomModel");
var MsgModel = require("../Models/MsgModel");
var Settings = require("../lib/Settings");
var Const = require("../const");
var async = require('async');

var RoomLogic = require("../Logics/Room");

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
    router.post('/signin',function(request,response){

    	RoomLogic.execute(request.body,function(result){

    		self.setRes(response,Const.httpCodeSucceed,"create room OK", result);
            
        },function(err,code){
            
            if(err){
            	self.setRes(response,code, err);
             }
            
        });
        
    });
    /**
     * ボードIDでボードを削除する
     */
    router.get('/delete/:roomID',function(request,response){

    	var roomID = request.params.roomID;
    	
    	// ルームIDチェック
        if(Utils.isEmpty(roomID)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error roomID", request.params);
            return;
        }
        
        // ボードを削除する
        RoomModel.removeRoom(roomID, function (err) {
    		if(err){
        		self.setRes(response,Const.httpCodeFileNotFound,"remove room fail", roomID);
            	return;
            	
            } else {
            	self.setRes(response,Const.httpCodeSucceed,"remove room success", roomID);
            	return;
            }            
        });
    	
        
    });
    router.get('/list',function(request,response){
    	
    	var peopleID = request.query.peopleID;
    	
    	
    	var roomList = [];
    		
		/**
         * roomを取得
         * peopleを取得
         * msgを取得
         */
        async.waterfall(
        		[
					function (done) {
        		  		// roomを検索してあれば、ルームIDとメンバーを返す
                       	RoomModel.findRoomBypeopleID(peopleID,function (err,rooms) {
                       		
                       		done(err,rooms);
                       	});
                              
                     },
                     function (rooms,done) {

						RoomModel.findRoomByrooms(rooms,function (err,rooms) {
							done(err,rooms);
						});
						
                     },
                     function (roomList,done) {
                    	 if (roomList.length > 0) {
                    		 var rl = [];
                    		 async.eachSeries(roomList, function(room, next){
                    			 RoomModel.populatePeople(room,function (err,r) {
                    				 rl.push(r)
                    				 next();
                    			 });
                    			 
                    		 }, function complete(err) {
                    			 done(err,rl);
                    		 });
                    	 } else {
                    		done(null,roomList);
                     	 }
                     },
                     function (roomList, done) {
                    	 var rs = [];
                    	 async.eachSeries(roomList, function(room, next){
                    		 // メッセージからルームIDを取得する
                    		 MsgModel.findMsgRoomIDCreatedMsg(room.roomID,function (err,msg){
                    			 if (msg != null) {
                    				 room.msg = msg.msg;
                    				 room.created = msg.created;
                        			 rs.push(room);
                    			 } else {
                    				 rs.push(room);
                    			 }
                    			 next();
                    		 });
                    	 }, function complete(err) {
                    		 rs.sort(function(a,b){
                			    if(a.created>b.created) return -1;
                			    if(a.created < b.created) return 1;
                			    return 0;
                    		 });
                			 done(err,rs);
                    	 });
					}
        		 
        		 ],
                function (err, data) {
                         
                         if(err){
                       	  self.setRes(response,Const.httpCodeInternalServerError, "get room list fail");
                       	  return;
                         }else{
                       	  self.setRes(response,Const.httpCodeSucceed,"get room list OK", data);
                       	  return;
                         }
                              
        		}
                     
        		
        );
    		
    	
    });
    router.get('/test',function(request,response){

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
                       	RoomModel.findRoomBypeopleID(peopleID,function (err,rooms) {
                       		
                       		done(err,rooms);
                       	});
                              
                     },
                     function (rooms,done) {

						RoomModel.findRoomByrooms(rooms,function (err,rooms) {
							done(err,rooms);
						});
						
                     },
                     function (roomList,done) {
                    	 if (roomList.length > 0) {
                    		 var rl = [];
                    		 async.eachSeries(roomList, function(room, next){
                    			 RoomModel.populatePeople(room,function (err,r) {
                    				 rl.push(r)
                    				 next();
                    			 });
                    			 
                    		 }, function complete(err) {
                    			 done(err,rl);
                    		 });
                    	 } else {
                    		done(null,roomList);
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
