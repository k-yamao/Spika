	var express = require('express');
var router = express.Router();
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
var BoardModel = require("../Models/BoardModel");

var BoardHandler = function(){
    
}

_.extend(BoardHandler.prototype,RequestHandlerBase.prototype);

BoardHandler.prototype.attach = function(router){
        
    var self = this;

    /**
     * @api {get} /board/list/
     * @apiName Get board 
     * @apiGroup WebAPI
     * @apiDescription Get last 50 board 

     * @apiParam {String} lastboardID boardID of last message already shown. To get last 50 message put this param 0
     * @apiParam {String} peopleID ID of board
     * @apiParam {String} deleteFlag
     *
     *     
     * @apiSuccessExample Success-Response:
{

{
    "code": 1,
    "data": [
        {
            "__v": 0,
            "_id": "55d2d194caf997b543836fc8",
            "created": 1439879572232,
            "message": "",
            "roomID": "test",
            "type": 1001,
            "user": {
                "userID": "test",
                "name": "test",
                "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                "token": "UI6yHxeyZnXOZ1EgT6g5ftwD",
                "created": 1439878817506,
                "_id": "55d2cea1caf997b543836fb2",
                "__v": 0
            },
            "userID": "test",
            "seenBy": [
                {
                    "user": {
                        "userID": "test2",
                        "name": "test2",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "YMsHeg3KEQIhtvt46W5fgnaf",
                        "created": 1439878824411,
                        "_id": "55d2cea8caf997b543836fb6",
                        "__v": 0
                    },
                    "at": 1439879572353
                },
                {
                    "user": {
                        "userID": "test3",
                        "name": "tset3",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "TahnOaC6JzldCh6gAmJs3jMC",
                        "created": 1439878820142,
                        "_id": "55d2cea4caf997b543836fb4",
                        "__v": 0
                    },
                    "at": 1439879572361
                }
            ]
        },
        ...
    ]
}
     */
    
    /**
     * ボードIDでボードを削除する
     */
    router.get('/delete/:boardID',function(request,response){

    	var boardID = request.params.boardID;
    	
    	// ボードIDチェック
        if(Utils.isEmpty(boardID)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error boardID", request.params);
            return;
        }
        
        // ボードを削除する
    	BoardModel.removeBoard(boardID, function (err) {
    		if(err){
        		self.setRes(response,Const.httpCodeFileNotFound,"remove board fail", boardID);
            	return;
            	
            } else {
            	self.setRes(response,Const.httpCodeSucceed,"remove board success", boardID);
            	return;
            }            
        });
    	
        
    });
    router.get('/list',function(request,response){
        var condition = {
       		deleted    : 0,
        };
        
        // リミットとオフセットのデフォルト
        var limit  = Const.pagingLimit;
        var offset = 0;
        
        
        // ラストボードIDチェック
        if(!Utils.isEmpty(request.query.boardID)){
        	condition.lastBoardID = request.query.boardID;
        }
        
        // ピープルIDチェック
        if(!Utils.isEmpty(request.query.peopleID)){
        	condition.peopleID = request.query.peopleID;
        }
        
        // リミットが存在した場合のチェック
        if(!Utils.isEmpty(request.query.limit)){
        	limit  = parseInt(request.query.limit);
        }
        
        // オフセットが存在した場合のチェック
        if(!Utils.isEmpty(request.query.offset)){
        	offset = parseInt(request.query.offset);;
        }


        // 都道府県
        if(!Utils.isEmpty(request.query.pref)){
        	condition.pref = request.query.pref;
        }
        
        // 都市
        if(!Utils.isEmpty(request.query.city)){
        	condition.city = request.query.city;
        }
        
        // 性別
        if(!Utils.isEmpty(request.query.sex)){
        	condition.sex = request.query.sex;
        }

        // 削除フラグ
        if(!Utils.isEmpty(request.query.del)){
        	condition.del = request.query.del;
        }
        
        
        // 年齢幅
        if(!Utils.isEmpty(request.query.age)){
        	var age = Utils.ageCast(request.query.age);
        	condition.birthDay = {
        			$gte: age[0],	
        			$lte: age[1]
        	}
        }
        async.waterfall([
        
            function (done) {

                BoardModel.findBoards(condition, offset, limit, function (err,boards) {
                	
                    done(err,boards);
                });
            },
            function (boards,done) {
            	
                BoardModel.addBoardPeople(boards,function (err,boards) {
                    
                    done(err,boards);
                });
                
            }
        ],
            function (err, boards) {
                
                if(err){
                	self.setRes(response,Const.httpCodeInternalServerError,"board list fail", err);
                
                }else{
                    
                    self.setRes(response,Const.httpCodeSucceed,"board list ok", boards);
                    
                }
                     
            }
            
        );
        
    });
    
    router.post('/',function(request,response){
    	
    	// 投稿内容
    	var desc       = request.body.desc;
    	var boardIDTo  = request.body.boardIDTo;
    	var peopleID   = request.body.peopleID;
    	var peopleIDTo = request.body.peopleIDTo;
    	var inline     = request.body.inline;
    	var nicnameTo  = request.body.nicnameTo;
    	
    	
    	
    	// 投稿内容チェック
        if(Utils.isEmpty(desc)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error desc", request.body);
            return;
        }
		// ピープルID必須チェック
        if(Utils.isEmpty(peopleID)){
        	self.setRes(response, Const.httpCodeBadRequest, "input error peopleID", request.body);
            return;
        }
        
        // カウンターからボードIDを取得する
    	CounterModel.getNewId("boards", function (err, counter) {
    		
    		if(err){            			 
   			 	self.setRes(response,Const.httpCodeInternalServerError,"board fail peopleID seq", err);
   		 	} else {		
   		 		
   		 	
	   		 	// Defining a schema
	   		     var newBoard = new DatabaseManager.boardModel({
	   		     	 boardID   : counter.seq,
	   		         people    : null,
	   		         peopleID  : peopleID,
	   		         boardIDTo : boardIDTo,
	   		         peopleTo  : null,
	   		         peopleIDTo: peopleIDTo,
	   		         nicnameTo : nicnameTo,
	   		         inline    : inline,
	   		         desc      : desc,
	   		         sex       : null,
	   		         pref      : null,
	   		         city      : null,
	   		         birthDay  : null,
	   		         created   : Utils.now(),
	   		         updated   : Utils.now(),
	   		         deleted   : 0
	   		     });
	   		     
	   		     PeopleModel.findPeopleById(peopleID,function(err,people){

	   		    	if(err){ 
	   		    		self.setRes(response,Const.httpCodeFileNotFound,"board fail peopleID none", err);
	   		    	} else {
	   		    		newBoard.people   = people._id;
	   		    		newBoard.peopleID = people.peopleID;
	   		    		newBoard.sex      = people.sex
	   		    		newBoard.pref     = people.pref;
	   		    		newBoard.city     = people.city;
	   		    		newBoard.birthDay = people.birthDay;
		   		    	newBoard.save(function(err,board){
						    if(err) throw err;
						    self.setRes(response,Const.httpCodeSucceed,"new board ok", board);
						});
	   		    	}
	   		     });
   		 		
   		 	}
        
    	});
        
    	
    });

}

new BoardHandler().attach(router);
module["exports"] = router;
