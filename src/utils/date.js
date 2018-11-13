/*
* @Author: Shiv Chawla
* @Date:   2018-03-31 19:38:33
* @Last Modified by:   Shiv Chawla
* @Last Modified time: 2018-11-08 19:14:28
*/
"use strict";
const moment = require('moment-timezone');
const indiaTimeZone = "Asia/Kolkata";
const localTimeZone = moment.tz.guess();

const holidays = [
    "2018-08-22",
    "2018-09-13",
    "2018-09-20",
    "2018-10-02",
    "2018-10-18",
    "2018-11-07",
    "2018-11-08",
    "2018-11-23",
    "2018-12-25"
].map(item => moment(item).tz(indiaTimeZone));

function _isBeforeMarketClose() {
	return moment().isBefore(exports.getMarketClose());
}

function _isAfterMarketOpen() {
	return moment().isAfter(exports.getMarketOpen());
}

module.exports.getMarketOpen = function() {
	var cd = moment().tz(indiaTimeZone).format("YYYY-MM-DD");
	return moment.tz(`${cd} 09:30:00`, indiaTimeZone).tz(localTimeZone);
}

module.exports.getMarketClose = function() {
	var cd = moment().tz(indiaTimeZone).format("YYYY-MM-DD");
	return moment.tz(`${cd} 23:30:00`, indiaTimeZone).tz(localTimeZone);
}

module.exports.getMarketOpenHour = function() {
	return exports.getMarketOpen().get('hour');
}

module.exports.getMarketOpenMinute = function(){
	return exports.getMarketOpen().get('minute');
}

module.exports.getMarketCloseHour = function() {
	return exports.getMarketClose().get('hour');
}

module.exports.getMarketCloseMinute = function(){
	return exports.getMarketClose().get('minute');
}

module.exports.compareDates = function(date1, date2) {
	var t1 = module.exports.getDate(date1).getTime();
	var t2 = module.exports.getDate(date2).getTime();

	return (t1 < t2) ? -1 : (t1 == t2) ? 0 : 1;
};

//Return dateTime formatted to Current Date and Time as 5:30AM IST 
//Applies offset before formatting
module.exports.getLocalDate = function(dateTime, offset) {
	
	//Get time as supplied	
	var _d = dateTime ? new Date(dateTime) : new Date();

	if (offset){
		//Introduce offset
		_d.setHours(_d.getHours() - offset);
	}

	//Get datetime in IST time zone
	var _dtLocalStr = _d.toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
	
	//extract date in IST time zone
	var _dLocalStr = _dtLocalStr.split(",")[0]; //date in India
	var ymd = _dLocalStr.split("/").map(item => parseInt(item));

	//Create UTC date with offset Indian date and time as 12:30 PM (this can be mdinight too)
	//THe output in Indian machines will make it to IST 6 PM
	var _od = new Date(ymd[2], ymd[0]-1, ymd[1]);

	var offsetTZ = _od.getTimezoneOffset();
	if(offsetTZ != 0) {
		//offset on Indian machines in -330 minutes
		//add 330 minutes on local machines
		_od.setMinutes(_od.getMinutes() - offsetTZ); 
	}
	
	return _od;
};

//Return dateTime formatted to Current Date and Time as 00:00:00 IST
module.exports.getDate = function(dateTime) {

	return moment((dateTime ? moment(dateTime) : moment()).format("YYYY-MM-DD")).tz(indiaTimeZone).toDate();
	//return module.exports.getLocalDate(dateTime, 0);
};

//Return dateTime formatted to Current Date and Time as 5:30AM IST
module.exports.getCurrentDate = function() {
	
	return module.exports.getDate(null);
};

module.exports.getCurrentMonthEnd = function() {
};

function _getLastMonday(date) {
	var daysPassedSinceLastMonday = date.getDay() - 1;
	daysPassedSinceLastMonday = daysPassedSinceLastMonday  < 0 ? 6 : daysPassedSinceLastMonday; 
	date.setDate(date.getDate() - daysPassedSinceLastMonday);
	return module.exports.getDate(date)
}

module.exports.getFirstMonday = function(offset) {
	//["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var currentDate = module.exports.getCurrentDate();

	if (offset == "1W" || offset == "1w") {
		var lastMonday = _getLastMonday(currentDate);
		var nextDate = lastMonday;
		nextDate.setDate(nextDate.getDate() + 7);
		return nextDate;
	} else if(offset == "2W" || offset == "2w") {
		var lastMonday = _getLastMonday(currentDate);
		var nextDate = lastMonday;
		nextDate.setDate(nextDate.getDate() + 14);
		return nextDate;
	} else if(offset == "1M" || offset == "1m") {
		var firstDateNextMonth = module.exports.getDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
		return module.exports.getLatestWeekday(firstDateNextMonth);
	} else if(offset == "3M" || offset == "3m" || offset == "1Q" || offset == "1q") {
        var firstDateAfterThreeMonths = module.exports.getDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1));
		return module.exports.getLatestWeekday(firstDateAfterThreeMonths);
	} 

	return currentDate;
};

module.exports.getLatestWeekday = function(date) {
	date = !date ? module.exports.getCurrentDate() : date;

	var day = date.getDay();
	if (!(day == 0 || day == 6)){
		return module.exports.getDate(date);
	} else {
		return module.exports.getNextWeekday(date);
	}
}

module.exports.getNextWeekday = function(date) {
	date = !date ? module.exports.getCurrentDate() : date;
	var day = date.getDay();

	if (day == 6) { //Saturday
		date.setDate(date.getDate() + 2);
	} else if (day == 5) { //Friday
		date.setDate(date.getDate() + 3);
	} else {
		date.setDate(date.getDate() + 1);
	}

	return module.exports.getDate(date);
};


module.exports.getPreviousWeekday = function(date) {
	date = !date ? module.exports.getCurrentDate() : date;
	//subtract one day
	date.setDate(date.getDate() - 1);
	var day = date.getDay();

	if (day == 6) { //Saturday
		date.setDate(date.getDate() - 1);
	} else if (day == 0) { //Sunday
		date.setDate(date.getDate() - 2);
	} 

	return module.exports.getDate(date);
};

module.exports.isWeekend = function(date) {
	date = !date ? module.exports.getCurrentDate() : date;
	return date.getDay() == 0 || date.getDay() == 6;
};

module.exports.previousNonHolidayWeekday = function(date, today=false) {
	var nextWeekday = today ? module.exports.getDate(date) : module.exports.getPreviousWeekday(date);
	
	let isWeekend = module.exports.isWeekend(nextWeekday);
	let isHoliday = !isWeekend ? module.exports.isHoliday(nextWeekday) : true;
	
	return isHoliday ? module.exports.previousNonHolidayWeekday(nextWeekday) : nextWeekday;
};

module.exports.nextNonHolidayWeekday = function(date, today=false) {
	var nextWeekday = today ? module.exports.getDate(date) : module.exports.getNextWeekday(date);
	
	let isWeekend = module.exports.isWeekend(nextWeekday);
	let isHoliday = !isWeekend ? module.exports.isHoliday(nextWeekday) : true;

	return isHoliday ? module.exports.nextNonHolidayWeekday(nextWeekday) : nextWeekday;
};

module.exports.isHoliday = function(date) {
	date = !date ? module.exports.getCurrentDate() : exports.getDate(date);
	return holidays.findIndex(item => {return item.isSame(moment(date))}) !== -1;
};

module.exports.getHolidays = function() {
	return holidays;
};

module.exports.getMarketCloseDateTime = function(date) {
	var d = moment.tz(date, indiaTimeZone).format("YYYY-MM-DD"); 
	return moment.tz(d, localTimeZone).set({hour: exports.getMarketCloseHour(), minute: exports.getMarketCloseMinute(), second: 0, millisecond: 0});
};

module.exports.getMarketOpenDateTime = function(date) {
	var d = moment.tz(date, indiaTimeZone).format("YYYY-MM-DD"); 
	return moment.tz(d, indiaTimeZone).tz(localTimeZone).set({hour: exports.getMarketOpenHour(), minute: exports.getMarketOpenMinute(), second: 0, millisecond: 0});
};

module.exports.isMarketTrading = function() {
	if (!exports.isHoliday()) {
		return _isAfterMarketOpen() && _isBeforeMarketClose();
	}
};
