var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var Settings = require("../lib/Settings");

var PeopleModel = function(){
    
};

PeopleModel.prototype.model = null;

PeopleModel.prototype.init = function(){

    // Defining a schema
    var peopleSchema = new mongoose.Schema({
    	peopleID: { type: String, index: true },
    	mail    : String,
    	password: String,
        nicname : String,
        token   : String,
        imageURL: String,
        sex     : String,
        birthDay: String,
        pref    : String,
        city    : String,
        appeal  : String,
        phrase  : String,
        boards  : [],
        auth    : Number,
        loging  : Number,
        updated : Number,
        created : Number
    });
    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "people", peopleSchema);
    return this.model;
}

/**
 * ピープルIDでピープル情報を取得する
 * @param id
 * @param callBack
 */
PeopleModel.prototype.findPeopleById = function(id,callBack){

    this.model.findOne({ peopleID: new RegExp("^" + id + "$","g") },function (err, people) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,people);
    });
            
}

/**
 * トークンからピープル情報を取得する
 * @param token
 * @param callBack
 */
PeopleModel.prototype.findPeopleByToken = function(token,callBack){

    this.model.findOne({ token: new RegExp("^" + token + "$","g") },function (err, people) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,people);
    });
            
}
/**
 * メールからピープル情報を取得する
 * @param mail
 * @param callBack
 */
PeopleModel.prototype.getPeople = function(mail,callBack){

    this.model.findOne({ mail: new RegExp("^" + mail + "$","g") },function (err, people) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,people);
    });
            
}

/**
 * ピープルオブジェクトも取得
 * @param aryId
 * @param callBack
 */
PeopleModel.prototype.findPeopleInternalPeopleId = function(aryId,callBack){
        
        var conditions = [];
        aryId.forEach(function(id){
            
            conditions.push({
                peopleID : id
            });
            
        });        
        var query = this.model.find({
            $or : conditions
        }).sort({'created': 1});        
        
        query.exec(function(err,data){
            
            if (err)
                console.error(err);
            
            if(callBack)
                callBack(err,data)
            
        });                
                
}

/**
 * ピープルオブジェクトも取得
 * @param aryId
 * @param callBack
 */
PeopleModel.prototype.findPeopleInternalId = function(aryId,callBack){
        
        var conditions = [];
        aryId.forEach(function(id){
            
            conditions.push({
                _id : id
            });
            
        });
        
        var query = this.model.find({
            $or : conditions
        }).sort({'created': 1});        
        
        query.exec(function(err,data){
            
            if (err)
                console.error(err);
            
            if(callBack)
                callBack(err,data)
            
        });                
                
}

/**
 * ピープルIDでピープルオブジェクトを削除
 * @param aryId
 * @param callBack
 */
PeopleModel.prototype.removePeople = function(peopleID,callBack){
        
	this.model.remove({ peopleID: peopleID},function (err) {
            callBack(err);
    });
            
}


module["exports"] = new PeopleModel();