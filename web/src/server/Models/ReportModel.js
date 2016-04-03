var mongoose = require('mongoose');
var _ = require('lodash');
var Const = require('../const.js');
var async = require('async');
var Util = require('../lib/Utils');
var Settings = require("../lib/Settings");

var ReportModel = function(){
    
};

ReportModel.prototype.model = null;

ReportModel.prototype.init = function(){

    // Defining a schema
    var reportSchema = new mongoose.Schema({
    	reportID      : { type: String, index: true },
    	reportPeopleID: String,
    	boardID       : String,
    	boardID       : String,
    	desc          : String,
    	type          : String,
        updated       : Number,
        created       : Number
    });
    this.model = mongoose.model(Settings.options.dbCollectionPrefix + "report", reportSchema);
    return this.model;
}

/**
 * レポートIDでレポート情報を取得する
 * @param id
 * @param callBack
 */
ReportModel.prototype.findReportById = function(id,callBack){

    this.model.findOne({ reportID: new RegExp("^" + id + "$","g") },function (err, report) {
    	
    	if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,report);
    });
            
}

/**
 * レポート情報一覧を取得する
 * @param token
 * @param callBack
 */
ReportModel.prototype.findReport = function(condition, offset, limit, callBack){
    	
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

/**
 * レポートのカウントを取得
 * @param mail
 * @param callBack
 */
ReportModel.prototype.getReportCount = function(peopleID,callBack){
	this.model.where({ 'peopleID': peopleID }).count(function (err, count) {
		if (err) 
            console.error(err);
        
        if(callBack)
            callBack(err,count);
	});
}

module["exports"] = new ReportModel();