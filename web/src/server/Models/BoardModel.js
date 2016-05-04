var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var PeopleModel = require('./PeopleModel');
var Settings = require("../lib/Settings");
var Utils = require("../lib/Utils");
var BoardModel = function(){
    
};

BoardModel.prototype.model = null;

BoardModel.prototype.init = function(){

    // Defining a schema
    var boardSchema = new mongoose.Schema({
    	boardID    : { type: String, index: true },
        people     : { type: mongoose.Schema.Types.ObjectId, ref: 'People' },
        peopleID   : { type: String, index: true },
        boardIDTo  : { type: String},
        peopleTo   : { type: mongoose.Schema.Types.ObjectId, ref: 'People' },
        peopleIDTo : { type: String},
        nicnameTo  : String,
        inline     : String,
        roomID     : { type: String, index: true },
        title      : String,
        desc       : String,
        created    : Number,
        updated    : Number,
        deleted    : Number
    });
 
    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "board", boardSchema);
    return this.model;
        
}

// ボードIDでボードを取得
BoardModel.prototype.findBoardbyId = function(id,callBack){

    this.model.findOne({ boardID: id },function (err, board) {

        if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,board)
        
    });
            
}

//ボードIDでボードを削除
BoardModel.prototype.removeBoard = function(boardID,callBack){

    this.model.remove({ boardID: boardID },function (err) {
    	callBack(err)
    });
            
}

/**
 * 掲示板を取得
 * @param condition
 * @param limit
 * @param callBack
 */
BoardModel.prototype.findBoards = function(condition, offset, limit, callBack){
            
    if(!Utils.isEmpty(condition.lastBoardID)){
        
        var self = this;
        
        // ボードIDから作成日を取得
        this.model.findOne({ boardID: condition.lastBoardID },function (err, board) {

            if (err) return console.error(err);
            // 作成日を取得
            var lastCreated = board.created;
            
            // ラストIDよりふるいデータ
            condition = {
            		deleted : condition.deleted,
            		created : {$lt:lastCreated}
            };
            var query = null;
            if (offset > 0) {
            	query = self.model.find(condition).sort({'created': 'desc'}).skip(offset).limit(limit);
            } else {
            	query = self.model.find(condition).sort({'created': 'desc'}).limit(limit);
            }
                    
            
            query.exec(function(err,data){
                
                if (err)
                    console.error(err);
                
                if(callBack)
                    callBack(err,data)
                
            });                
                
        
        });
        
    }else{

    	
    	var query = null;
        if (offset > 0) {
        	query = this.model.find(condition).sort({'created': 'desc'}).skip(offset).limit(limit);
        } else {
        	query = this.model.find(condition).sort({'created': 'desc'}).limit(limit); 
        }
        query.exec(function(err,data){
            if (err) return console.error(err);
            if(callBack)
                callBack(err,data)
        });   
    }

}
/**
 * ボードのピープル情報を追加
 * @param board
 * @param callBack
 */
BoardModel.prototype.addBoardPeople = function(boards,callBack){
	 
    if(!_.isArray(boards)){
        
    	boards = [boards];
        
    }
    
    var ids = [];
    
    boards.forEach(function(row){
        
        ids.push(row.people); 
        
    });
    
    if(ids.length > 0){
    
    	PeopleModel.findPeopleInternalId(ids,function(err,peopleResult){
            
            var resultAry = [];
            
            _.forEach(boards,function(boardElement,boardIndex,boardEntity){
                
                var obj = boardElement.toObject();
                
                _.forEach(peopleResult,function(peopleElement,peopleIndex){
                    
                    // replace user to userObj
                    if(boardElement.people.toString() == peopleElement._id.toString()){
                        obj.people = peopleElement.toObject();
                    }
                });
                
                resultAry.push(obj);
                
            });
                              
            callBack(err,resultAry);
                                   
        });
        
    }else{
        callBack(null,boards);
    }
}
BoardModel.prototype.getBoardCount = function(peopleID,callBack){
	
	this.model.count({ peopleID: peopleID },function (err, count) {
    	callBack(err, count)
    });
            
	
};



module["exports"] = new BoardModel();