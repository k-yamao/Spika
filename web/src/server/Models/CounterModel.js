var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var Settings = require("../lib/Settings");

var CounterModel = function(){
   
};

CounterModel.prototype.model = null;

CounterModel.prototype.init = function(){

	// Counterスキーマを定義
	// Counterは_idで複数個管理できる。
	var counterSchema = new mongoose.Schema({
	 countID: Number,
	 seq: Number
	});
	
    this.model = mongoose.model(Settings.options.dbCollectionPrefix + 'counters', counterSchema);
    return this.model;
}

CounterModel.prototype.getNewId = function(callBack){
	this.model.findOneAndUpdate(
		    {}, //Query
		    { $inc: {seq: 1 } }, //update document
		    { new: true, upsert: true }, //options
		    function (err, counter) {

		        if (err) 
		            console.error(err);
		        
		        if(callBack)
		            callBack(err,counter);
		        
		    });
}

module["exports"] = new CounterModel();
    
    
    


