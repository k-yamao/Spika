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
        auth    : Number,
        token   : String,
        updated : Number,
        created : Number,
        imageURL: String,
        sex     : String,
        birthDay: String,
        pref    : String,
        city    : String,
        appeal  : String,
        fixedPhrase:String
    });
    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "people", peopleSchema);
    return this.model;
}

PeopleModel.prototype.findPeopleById = function(id,callBack){

    this.model.findOne({ peopleID: new RegExp("^" + id + "$","g") },function (err, people) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,people);
    });
            
}

PeopleModel.prototype.getPeople = function(mail,callBack){

    this.model.findOne({ mail: new RegExp("^" + mail + "$","g") },function (err, people) {
    	
    	console.log(people);
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,people);
    });
            
}

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
                
    },


module["exports"] = new PeopleModel();