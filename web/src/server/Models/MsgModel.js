var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var PeopleModel = require('./PeopleModel');
var Settings = require("../lib/Settings");

var MsgModel = function(){
    
};

MsgModel.prototype.model = null;

MsgModel.prototype.init = function(){

    // Defining a schema
    var msgSchema = new mongoose.Schema({
        people  : { type: mongoose.Schema.Types.ObjectId, index: true },
        peopleID: { type: String, index: true },
        localID : { type: String, index: true },
        roomID  : { type: String, index: true },
        status  : Number,
        type    : Number,
        msg     : String,
        image   : String,
        file    : {
            file: {
                id: mongoose.Schema.Types.ObjectId,
	            name: String,
	            size: Number,
	            mimeType: String
            },
            thumb: {
                id: mongoose.Schema.Types.ObjectId,
	            name: String,
	            size: Number,
	            mimeType: String
            }
        },
        seenBy:[],
        location: {
	            lat: Number,
	            lng: Number
        },
        deleted: Number,
        created: Number
    });

    // add instance methods
    msgSchema.methods.addSeenBy = function (people,callBack) {
        
        var seenBy = this.seenBy;
        var self = this;

        var listOfPeople = [];
        
        _.forEach(seenBy,function(seenObj){
               
            listOfPeople.push(seenObj.people);
            
        });
                    
        if(_.indexOf(listOfPeople,people._id) == -1){

            seenBy.push({people:people._id,at:Util.now()});
            
            this.update({
                seenBy: seenBy
            },{},function(err,peopleResult){
            
                if(callBack)
                    callBack(err,self);              
            
            });
    
            
        }

    }

    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "msgs", msgSchema);
    return this.model;
        
}

MsgModel.prototype.findMessagebyId = function(id,callBack){

    this.model.findOne({ _id: id },function (err, people) {

        if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,user)
        
        
    });
            
}
/**
 * ピープルIDから重複を削除したルームIDを返す
 * @param peopleID
 * @param callBack
 */
MsgModel.prototype.findMsgRoomID = function(peopleID,callBack){

    this.model.find({ peopleID : peopleID }).distinct('roomID', function (err, roomIDs) {

    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,roomIDs)
        
    });
            
}
/**
 * ピープルIDからルームID、作成日、メッセージを返す
 * @param peopleID
 * @param callBack
 */
MsgModel.prototype.findMsgRoomIDCreatedMsg = function(roomID,callBack){

    this.model.findOne({ roomID : roomID, msg: {'$ne':'join'} },{peopleID : 1, roomID : 1, msg : 1, status : 1, created : 1}, {sort:{created: -1}}, function (err, msg) {

    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,msg);
        
    });
            
}

MsgModel.prototype.findAllMessages = function(roomID,lastMsgID,callBack){

    var self = this;

    this.model.findOne({ _id: lastMsgID },function (err, message) {

        if (err) callBack(err,null)
        
        var query = {
            roomID:roomID
        };
        
        if(message) {
            var lastCreated = message.created;
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

MsgModel.prototype.findMessages = function(roomID,lastMsgID,limit,callBack){
            
    if(lastMsgID != 0){
        
        var self = this;
        
        this.model.findOne({ _id: lastMsgID },function (err, msg) {

            if (err) return console.error(err);
            
            var lastCreated = msg.created;
            
            var query = self.model.find({
                roomID:roomID,
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
        
        var query = this.model.find({roomID:roomID}).sort({'created': 'desc'}).limit(limit);        
    
        query.exec(function(err,data){
            
            if (err) return console.error(err);
            
            if(callBack)
                callBack(err,data)
            
        });
    
    
    }

}


MsgModel.prototype.populateMsgs = function(msgs,callBack){

	
	
	if(!_.isArray(msgs)){
        
    	msgs = [msgs];
        
    }
    
	
    // collect ids
    var ids = [];
    
    msgs.forEach(function(row){
        
        // get users for seeny too
        _.forEach(row.seenBy,function(row2){
            ids.push(row2.people); 
        });
        
        ids.push(row.people); 
        
    });
    
    if(ids.length > 0){
    
    	PeopleModel.findPeopleInternalId(ids,function(err,peopleResult){
            
            var resultAry = [];
            
            _.forEach(msgs,function(msgElement,msgIndex,msgsEntity){
                
                var obj = msgElement.toObject();
                
                _.forEach(peopleResult,function(peopleElement,userIndex){
                    
                    // replace user to userObj
                    if(msgElement.people.toString() == peopleElement._id.toString()){
                        obj.people = peopleElement.toObject();
                    }

                }); 
                
                var seenByAry = [];
                
                // replace seenby.user to userObj
                _.forEach(msgElement.seenBy,function(seenByRow){
                    
                    _.forEach(peopleResult,function(peopleElement,peopleIndex){
                        
                        // replace user to userObj
                        if(seenByRow.people.toString() == peopleElement._id.toString()){
                            
                            seenByAry.push({
                                people:peopleElement,
                                at:seenByRow.at 
                            });
                            
                        }

                    });
                                                    
                });
                
                obj.seenBy = seenByAry;
                    
                resultAry.push(obj);
                
            });
            
                              
            callBack(err,resultAry);
                                   
        });
        
    }else{
        callBack(null,msgs);
    }
    
}
MsgModel.prototype.updateMsgsStatus = function(roomID, peopleID, callBack){
	
    this.model.update({ roomID: roomID, peopleID: {'$ne':peopleID}, status: 0 },{ status: 1 }, { multi: true }, function (err, numberAffected, raw) {

    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,numberAffected);
    });
}
    
module["exports"] = new MsgModel();