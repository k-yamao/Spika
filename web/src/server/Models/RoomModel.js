var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var PeopleModel = require('./PeopleModel');
var Settings = require("../lib/Settings");

var RoomModel = function(){
    
};

RoomModel.prototype.model = null;

RoomModel.prototype.init = function(){

    // Defining a schema
    var msgSchema = new mongoose.Schema({
    	roomID  : { type: String, index: true },
    	people  : { type: mongoose.Schema.Types.ObjectId, index: true },
        peopleID: { type: String, index: true },
        title   : Number,
        imageURL: String,
        deleted: Number,
        created: Number
    });

    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "rooms", msgSchema);
    return this.model;
        
}


//ルームIDでルームを削除
RoomModel.prototype.removeRoom = function(roomID,callBack){

    this.model.remove({ roomID: roomID },function (err) {
    	callBack(err)
    });
            
}

RoomModel.prototype.findRoomById = function(id,callBack){

    this.model.findOne({ _id: id },function (err, people) {

        if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,people)
        
        
    });
            
}

/**
 * roomIDの情報を全て取得する
 * @param roomID
 * @param callBack
 */
RoomModel.prototype.findRoomByroomID = function(roomID,callBack){

    this.model.find({ roomID: roomID },function (err, rooms) {

        if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,rooms)

    });
      
}

/**
 * peopleIDからroomの情報を全て取得する
 * @param roomID
 * @param callBack
 */
RoomModel.prototype.findRoomBypeopleID = function(peopleID,callBack){

    this.model.find({ peopleID: peopleID },{},{sort:{created: -1},limit:100},function (err, rooms) {
    	//this.model.find({ peopleID: peopleID },{},{sort:{created: desc}}, function (err, rooms) {
        if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,rooms)

    });
      
}


/**
 * roomIDの情報を全て取得する
 * @param roomID
 * @param callBack
 */
RoomModel.prototype.findRoomPeople = function(roomID,room,callBack){
	var r = {};
    this.model.find({ roomID: roomID },function (err, rooms) {

    	var r  = {
        		roomID : 	room.roomID,	
        		peopleID : 	room.peopleID,
        		peoples  : 	rooms
        };
        if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,r)

    });
      
}

/**
 * roomリストからroom情報を全て取得する 
 * @param roomID
 * @param callBack
 */
RoomModel.prototype.findRoomByrooms = function(rooms, callBack){
	
	var rooms = rooms;
    if(!_.isArray(rooms)){
    	rooms = [rooms];
    }
	
	var conditions = [];
	rooms.forEach(function(room){

		conditions.push({
            roomID : room.roomID
        });
        
    });
    
    var query = this.model.find({
        $or : conditions
    }).sort({'created': 1});        
    
    
    // ルームリスト
    var roomList = [];
    
    query.exec(function(err,data){
        
    	
    	async.each(rooms, function(room, next1){
    	
    		var r  = {
            		roomID : 	room.roomID,	
            		peopleID : 	room.peopleID,
            		msg      : 	"",
            		created  : 	0,
            		peoples  : 	[]
            };
    		
	    	async.each(data, function(dr, next2){
	    	
	    		
	    		if (room.roomID == dr.roomID) {
	    		
	    			r.peoples.push(dr);
	    		}    		
	    		
	    		next2();
	    	}, function complete(err) {
	    		
	    	});
    		roomList.push(r);
	    	next1();
    	}, function complete(err) {
    		if (err)
                console.error(err);
            
            if(callBack)
                callBack(err,roomList)
    	});
        
        
    });                
}


RoomModel.prototype.findAllRoom = function(peopleID,lastRoomID,callBack){

    var self = this;

    this.model.findOne({ _id: lastRoomID },function (err, room) {

        if (err) callBack(err,null)
        
        var query = {
        	peopleID:peopleID
        };
        
        if(message) {
            var lastCreated = room.created;
            query.created = {$gt:lastCreated};
        }        
        
        var query = self.model.find(query).sort({'created': 'desc'});        
        
        query.exec(function(err,data){
            
            if (err)
                console.error(err);
            
            if(callBack)
                callBack(err,data)
            
        });                
            
    
    });

}

RoomModel.prototype.findRooms = function(peopleID,lastRoomID,limit,callBack){
            
    if(lastMsgID != 0){
        
        var self = this;
        
        this.model.findOne({ _id: lastRoomID },function (err, room) {

            if (err) return console.error(err);
            
            var lastCreated = room.created;
            
            var query = self.model.find({
            	peopleID:peopleID,
                created:{$lt:lastCreated}
            }).sort({'created': 'desc'}).limit(limit);        
            
            query.exec(function(err,data){
                
                if (err)
                    console.error(err);
                
                if(callBack)
                    callBack(err,data)
                
            });                
                
        
        });
        
    }else{
        
        var query = this.model.find({peopleID:peopleID}).sort({'created': 'desc'}).limit(limit);        
    
        query.exec(function(err,data){
            
            if (err) return console.error(err);
            
            if(callBack)
                callBack(err,data)
            
        });
    
    
    }

}

RoomModel.prototype.populatePeople = function(room,callBack){
	var peoples = room.peoples;
    if(!_.isArray(peoples)){
    	peoples = [peoples];
    }
    
    // collect ids
    var ids = [];
    
    peoples.forEach(function(row){

    	ids.push(row.peopleID); 
        
    });

    if(ids.length > 0){
    
    	PeopleModel.findPeopleInternalPeopleId(ids,function(err,peopleResult){
    		room.peoples = peopleResult;
                              
            callBack(err,room);
        });
        
    }else{
        callBack("err",[]);
    }
    
}


    
module["exports"] = new RoomModel();