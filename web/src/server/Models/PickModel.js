var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var PeopleModel = require('./PeopleModel');
var Settings = require("../lib/Settings");

var PickModel = function(){
    
};

PickModel.prototype.model = null;

PickModel.prototype.init = function(){

    // Defining a schema
    var pickSchema = new mongoose.Schema({
    	pickID: { type: String, index: true },
    	peopleID: String,
    	peoplePickID: String,
        updated : Number,
        created : Number
    });
    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "pick", pickSchema);
    
    return this.model;
}

/**
 * ピックIDでピック情報を取得する
 * @param id
 * @param callBack
 */
PickModel.prototype.findPickById = function(id,callBack){

    this.model.findOne({ pickID: new RegExp("^" + id + "$","g") },function (err, pick) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,pick);
    });
            
}


/**
 * ピープルIDからピック情報を取得する
 * @param token
 * @param callBack
 */
PickModel.prototype.findPickByPeopleID = function(peopleID,callBack){

    this.model.find({ peopleID: new RegExp("^" + peopleID + "$","g") },function (err, pick) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,pick);
    });
            
}

/**
 * ピープルピックIDからピック情報を取得する
 * @param token
 * @param callBack
 */
PickModel.prototype.findPickByPeoplePickID = function(peoplePickID,callBack){

    this.model.find({ peoplePickID: new RegExp("^" + peoplePickID + "$","g") },function (err, pick) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,pick);
    });
            
}


/**
 * ピック情報をあれば更新、なければ登録する
 * @param token
 * @param callBack
 */
PickModel.prototype.upsertPick = function(peopleID, peoplePickID, callBack){

    this.model.update({ peopleID: peopleID, peoplePickID: peoplePickID },{ peopleID: peopleID, peoplePickID: peoplePickID, updated: Util.now(), created: Util.now() }, {upsert: true}, function (err, pick) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,pick);
    });
            
}

/**
 * ピックしてるカウントを取得
 * @param mail
 * @param callBack
 */
PickModel.prototype.getPickCount = function(peopleID,callBack){
	this.model.where({ 'peopleID': peopleID }).count(function (err, count) {
		if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,count);
	});
}

/**
 * ピックされてるカウントを取得
 * @param mail
 * @param callBack
 */
PickModel.prototype.getPickerCount = function(peoplePickID,callBack){

	this.model.where({ 'peoplePickID': peoplePickID }).count(function (err, count) {
		if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,count);
	});
          
}
PickModel.prototype.populatePick = function(picks,callBack){
	
	if(!_.isArray(picks)){
        
		picks = [picks];
        
    }
    
	
    // collect ids
    var ids = [];
    // ピックしたピープルID
    picks.forEach(function(row){
        ids.push(row.peoplePickID); 
    });
    
    if(ids.length > 0){
    
    	PeopleModel.findPeopleInternalPeopleId(ids,function(err,peopleResult){
            
            var resultAry = [];
            
            _.forEach(picks,function(pickElement, pickIndex, pickEntity){
                
                var obj = pickElement.toObject();
                
                _.forEach(peopleResult,function(peopleElement, peopleIndex){
                    
                    // replace user to userObj
                    if(pickElement.peoplePickID.toString() == peopleElement.peopleID.toString()){
                        obj.people = peopleElement.toObject();
                    }

                }); 
                resultAry.push(obj);
            });
            callBack(err,resultAry);
                                   
        });
        
    }else{
        callBack(null,picks);
    }
    
}
module["exports"] = new PickModel();