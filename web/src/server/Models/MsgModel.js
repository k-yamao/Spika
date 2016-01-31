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
        roomID  : { type: String, index: true },
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

    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "msg", msgSchema);
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

MsgModel.prototype.populateMessages = function(msgs,callBack){
    
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
    
    	PeopleModel.findUsersbyInternalId(ids,function(err,peopleResult){
            
            var resultAry = [];
            
            _.forEach(msgs,function(msgElement,msgIndex,msgsEntity){
                
                var obj = msgElement.toObject();
                
                _.forEach(userResult,function(userElement,userIndex){
                    
                    // replace user to userObj
                    if(msgElement.user.toString() == userElement._id.toString()){
                        obj.user = userElement.toObject();
                    }

                }); 
                
                var seenByAry = [];
                
                // replace seenby.user to userObj
                _.forEach(msgElement.seenBy,function(seenByRow){
                    
                    _.forEach(userResult,function(userElement,userIndex){
                        
                        // replace user to userObj
                        if(seenByRow.user.toString() == userElement._id.toString()){
                            
                            seenByAry.push({
                                user:userElement,
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

    
module["exports"] = new MsgModel();