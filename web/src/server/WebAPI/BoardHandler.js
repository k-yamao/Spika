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
     */
    
    router.get('/list',function(request,response){
        var condition = {
       		deleted    : 0,
        };
        
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
        	condition.limit = request.query.limit;
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

        async.waterfall([
        
            function (done) {

                BoardModel.findBoards(condition, Const.pagingLimit, function (err,boards) {
                	
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
                    
                    self.setRes(response,Const.responsecodeSucceed,"board list ok", boards);
                    
                }
                     
            }
            
        );
        
    });
    
    router.post('/',function(request,response){
    	
    	// 投稿内容
    	var desc     = request.body.desc;
    	var peopleID = request.body.peopleID;
    	
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
	   		     	 boardID : counter.seq,
	   		         people  : null,
	   		         peopleID: peopleID,
	   		         desc    : desc,
	   		         created : Utils.now(),
	   		         updated : Utils.now(),
	   		         deleted : 0
	   		     });
	   		     
	   		     PeopleModel.findPeopleById(peopleID,function(err,people){

	   		    	if(err){ 
	   		    		self.setRes(response,Const.httpCodeFileNotFound,"board fail peopleID none", err);
	   		    	} else {
	   		    		newBoard.people = people._id
	   		    		newBoard.peopleID = people.peopleID

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
