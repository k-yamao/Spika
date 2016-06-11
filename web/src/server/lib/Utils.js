var _ = require('lodash');

var Utils = {
    
    randomString: function(len, charSet) {
    
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randomString = '';
        
        for (var i = 0; i < len; i++) {
        	var randomPoz = Math.floor(Math.random() * charSet.length);
        	randomString += charSet.substring(randomPoz,randomPoz+1);
        }
                
        return randomString;
    },
    isEmpty: function(variable){
        
        if(_.isUndefined(variable))
            return true;
            
        if(_.isNull(variable))
            return true;
            
        if(_.isString(variable) && _.isEmpty(variable))
            return true;
            
        return false;
        
    },
    localizeString: function(str){
        
        return str;
    },
    now: function(){
        return Math.floor(Date.now());
    },
    stripPrivacyParams: function(user){
        delete user.token;
        return user;
    },
    stripPrivacyParamsFromArray: function(users){
        
        var result = [];
        var self = this;
        
        _.forEach(users,function(user){
            
            result.push(self.stripPrivacyParams(user));
            
        });
        
        
        return result;
    },
    isOverlapCheck : function(array, value) {
		for (var i =0, len = array.length; i < len; i++) {
		    if (value == array[i]) {
		      // 存在したらtrueを返す
		      return true;
		    }
		}
		return false;
	},
	/**
	 * 表示側の配列：[
	 * 		  "0歳 - 12歳"
	 * 		,"13歳 - 15歳"
	 *      ,"16歳 - 18歳"
	 *      ,"19歳 - 22歳"
	 *      ,"23歳 - 30歳"
	 *      ,"31歳 - 40歳"
	 *      ,"41歳 - 50歳"
	 *      ,"51歳 - 60歳"
	 *      ,"61歳 - 70歳"
	 *      ,"71歳 - 80歳"
	 *      ,"81歳 - 90歳"
	 *      ];
	 * 例）2016年05月08日のとき
	 * 0：[20030508,20160508]、1：[20000508,20030508]・・・
	 * 
	 * 0：20030508 < birthDay && 20160508 >= birthDay
	 * 1：20030508 < birthDay && 20030508 >= birthDay
	 */
    ageCast : function(ageParam) {
    	var age1 = null;  
    	var age2 = null;
    	ageParam = parseInt(ageParam);
    	
    	switch (ageParam){
    	  case 0:
    		  age1 = 13;
    		  age2 = 0;
    	    break;
    	  case 1:
    		  age1 = 16;
    		  age2 = 13;
    	    break;
    	  case 2:
    		  age1 = 19;
    		  age2 = 16;
    	    break;
    	  case 3:
    		  age1 = 23;
    		  age2 = 19;
      	    break;
    	  case 4:
    		  age1 = 31;
    		  age2 = 23;
      	    break;
    	  case 5:
    		  age1 = 41;
    		  age2 = 31;
      	    break;
    	  case 6:
    		  age1 = 51;
    		  age2 = 41;
      	    break;
    	  case 7:
    		  age1 = 61;
    		  age2 = 51;
      	    break;
    	  case 8:
    		  age1 = 71;
    		  age2 = 61;
        	break;
    	  case 9:
    		  age1 = 81;
    		  age2 = 71;
    	  case 10:
    		  age1 = 91;
    		  age2 = 81;
        	break;
    	}
    	
         var nowDate = new Date();
         var yearNow = nowDate.getFullYear();
         var monthNow = nowDate.getMonth() + 1;
         var dateNow = nowDate.getDate();
         
         var y1  = yearNow-age1;
         var y2  = yearNow-age2;
         var m   =  monthNow;
         var d   =  dateNow;
         var ymd = []; 
         
         ymd[0] = y1 + this.zeroPudding(m) + this.zeroPudding(d);
         ymd[1] = y2 + this.zeroPudding(m) + this.zeroPudding(d);
         console.log(age1);
         
         return ymd;
         
	},
	//ゼロサプレス
	zeroSuppress : function ( val ) {
		return val.replace( /^0+([0-9]+)/, "$1" );
	},
	//ゼロパディング
	zeroPudding : function ( val ) {
		return ( "0" + val ).slice( -2 )
	}
}

module["exports"] = Utils;