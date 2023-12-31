import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';
import Impression from 'impression.js';
import cookie from 'react-cookies';
import {reactLocalStorage} from 'reactjs-localstorage';
import {graphColors, metricColor} from '../constants';
import {getStockData} from './requests';

const {researchDomain, env = '', marketPlaceDomain} = require('../localConfig');

const {requestUrl, webSocketUrl} = require('../localConfig');
const bowser = require('bowser/es5');
var MobileDetect = require('mobile-detect'),
    md = new MobileDetect(window.navigator.userAgent);

export const dateFormat = 'Do MMMM YYYY';
const DateHelper = require('../utils/date');

export const getUnixTimeSeries = (data) => {
    return new Promise((resolve, reject) => {
        const benchmarkArray = _.toPairs(data).sort();
        const unixBenchmarkArray = benchmarkArray.map((item, index) => {
            const timeStamp = moment(item[0], 'YYYY-MM-DD').valueOf();
            return [timeStamp, item[1]];
        });
        resolve(unixBenchmarkArray);
    });
};

export const getUnixStockData = (data) => {
    return new Promise((resolve, reject) => {
        getStockData(data)
        .then(response => {
            resolve(getUnixTimeSeries(response.data.priceHistory.values));
        })
    })
}

export const getStockPerformance = (tickerName, detailType='detail', field='priceHistory', startDate = null, endDate = null) => {
    return new Promise((resolve, reject) => {
        getStockData(tickerName, field, detailType, startDate, endDate)
        .then(performance => {
            const data = performance.data.priceHistory;
			if (data.length > 0) { // Check if ticker is valid
                const performanceArray = data.map((item, index) => {
                    return [moment(item.date).valueOf(), item.price]
                });
                resolve(performanceArray);
            } else {
                reject('Invalid Ticker');
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

export const getIntraDayStockPerformance = (tickerName, detailType='detail') => {
	let requiredDate = null;
	requiredDate = DateHelper.getLatestTradingDay().format('YYYY-MM-DD');
	if (DateHelper.isMarketOpen()) {
		requiredDate = DateHelper.getLatestTradingDay().format('YYYY-MM-DD');
	} else {
		const previousTradingDay = DateHelper.getPreviousNonHolidayWeekday(moment());
		requiredDate = DateHelper.getLatestTradingDay(moment(previousTradingDay)).format('YYYY-MM-DD');
	}

	return new Promise((resolve, reject) => {
        getStockData(tickerName, 'intraDay', detailType, requiredDate)
        .then(performance => {
			const data = performance.data.intradayHistory;
			if (data.length > 0) { // Check if ticker is valid
				const formattedData = data.map(item => {
					const stillUtc = moment.utc(item.datetime).toDate();
					const local = moment(stillUtc).local().valueOf();

					return [local, item.close];
				})
				const throttledData = getIntraDayThrottledPerformance(formattedData);
				if (formattedData.length <=20) {
					resolve(sortPerformanceData(formattedData));
				} else {
					resolve(sortPerformanceData(throttledData));
				}
            } else {
                resolve([]);
            }
        })
        .catch(error => {
			console.log(error);
            reject(error);
        });
    });
}

export const sortPerformanceData = data => {
	return _.sortBy(data, item => item[0]);
}

export const getIntraDayThrottledPerformance = (data) => {
	const clonedData = _.map(data, _.cloneDeep);
	const performanceArray = [];
	const lastDataPoint = clonedData[clonedData.length - 1];
	for(let i = 0; i < clonedData.length - 1; i +=5) {
		const item = clonedData[i];
		performanceArray.push(item);
	}

	if (performanceArray[performanceArray.length - 1][0] !== lastDataPoint[0]) {
		performanceArray.push(lastDataPoint);
	}

	return performanceArray;
}

export const getStockStaticPerformance = (tickerName, detailType='detail', field='staticPerformance') => {
	return new Promise((resolve, reject) => {
		getStockData(tickerName, field, detailType)
		.then(performance => {
			const data = _.get(performance, 'data.staticPerformance.detail', {});
			resolve(data);
		})
		.catch(err => reject(err));
	})
}

export const getStockRollingPerformance = (tickerName, detailType='detail', field='rollingPerformance') => {
	return new Promise((resolve, reject) => {
		getStockData(tickerName, field, detailType)
		.then(performance => {
			const data = _.get(performance, 'data.rollingPerformance.detail', {});
			resolve(data);
		})
		.catch(err => reject(err));
	})
}
export const convertToPercentage = value => {
    return Number((100 * value).toFixed(2));
}

// tickers = ['TCS', 'WIPRO', 'LT']
export const generateColorData = (tickers => {
    let obj = {};
    tickers.map((ticker, index) => {
        obj[ticker] = graphColors[index];
    });

    return obj;
});

export const getMetricColor = metricValue => {
    return metricValue < 0 ? metricColor.negative : metricColor.positive;
};

export class Utils{
	static userInfoString = `${env}USERINFO`;
	static loggedInUserinfo = cookie.load(this.userInfoString);
	static webSocket;
	static numAttempts = 0;

	static setLoggedInUserInfo(object){
		this.loggedInUserinfo = object;
	}

	static goToResearchPage = url => {
		window.location.href = `${researchDomain}${url}`;
	}

	static goToMarketPlace = url => {
		window.location.href = `${marketPlaceDomain}${url}`;
	}

	static setShouldUpdateToken(status){
		this.cookieStorageSave('SHOULDUPDATETOKEN', status);
	}

	static getShouldUpdateToken(){
		return cookie.load('SHOULDUPDATETOKEN');
	}

	static getAnnouncementUrl(){
		return "/assets/community/announcement.json";
	}

	static getPolicyTxtUrl(){
		return "/assets/policy/privacy.txt";
	}

	static getHelpUrl(){
		return "/assets/help/data_help.json";
	}

	static getBenchMarkUrl(){
		return "/assets/benchmark/benchmark.json";
	}

	static getTutorialUrl(){
		return "/assets/help/data_tutorial.json";
	}

	static getTncUrl(){
		return "/assets/policy/tnc.txt";
	}

	static goToLoginPage(history, fromUrl, redirect=false){
		if (fromUrl){
			this.localStorageSave('redirectToUrlFromLogin', fromUrl);
			this.cookieStorageSave('redirectToUrlFromLogin', fromUrl);
		}
		if (history){
			!redirect && Utils.logoutUser();
			history.push('/login');
		}
	}

	static checkErrorForTokenExpiry(error, history, fromUrl){
		return new Promise((resolve, reject) => {
			if (error && error.response && error.response.data){
				if(error.response.data.name==='TokenExpiredError' ||
					error.response.data.message==='jwt expired') {
					if (this.loggedInUserinfo.recentTokenUpdateTime
						&& (moment().valueOf() < ((60*1000) + this.loggedInUserinfo.recentTokenUpdateTime)) ){
						return;
					}else{
						this.setShouldUpdateToken(true);
						// window.location.assign(`/tokenUpdate?redirectUrl=${encodeURIComponent(fromUrl)}`);
						history.push(`/tokenUpdate?redirectUrl=${encodeURIComponent(fromUrl)}`);
						reject(false);
					}
				} else if(error.response.data.message==='Invalid User') {
                    Utils.goToLoginPage(history, fromUrl);
                    reject(false);
                } else {
					resolve(true);
					// if (fromUrl && history){
					// 	history.push(fromUrl);
					// }else if (history){
					// 	history.push('/login');
					// }
					// Utils.logoutUser();
				}
			}
		})
	}
	
	static checkForServerError(error, history, fromUrl) {
		return new Promise((resolve, reject) => {
			const errorCode = _.get(error, 'response.data.code', '');
			const statusCode = _.get(error, 'response.data.statusCode', 0);
			if (errorCode === 'server_error' && statusCode === 403) {
				// Utils.goToLoginPage(history, fromUrl);
				history.push('/server_error');
				reject(false);
			} else {
				console.log('No status error');
				resolve(true);
			}
		})
	}

	static getRedirectAfterLoginUrl(){
		// const url = this.getFromLocalStorage('redirectToUrlFromLogin');
		const url = this.getFromCookieStorage('redirectToUrlFromLogin');
		this.cookieStorageSave('redirectToUrlFromLogin', '');
		if (url && url.trim().length > 0){
			return url.trim();
		}else{
			return undefined;
		}
	}

	static logoutUser(){
		this.localStorageSaveObject(this.userInfoString, {});
		if (env === 'localhost') {
			cookie.save(this.userInfoString, {}, {path: '/'});
		} else {
			cookie.save(this.userInfoString, {}, {path: '/', domain: '.adviceqube.com'});
		}
		this.localStorageSaveObject('adviceFilter', {});
		this.localStorageSave('selectedPage', 1);
		this.localStorageSave('selectedTab', 'all');
		this.localStorageSave('redirectToUrlFromLogin', '/dailycontest/stockpredictions');
		this.localStorageSave('selectedAdviceId', null);
		this.localStorageSave('contestId', null);
		this.localStorageSave('contestSelectedPage', 0);
		this.localStorageSave('selectedAdvisorId', null);
		this.localStorageSave('selectedUserId', null);
		this.localStorageSave('selectedUserName', null);
		this.localStorageSave('isSelectedAdvisorAllocated', null);
		this.localStorageSave('selectedUserAllowedInvestments', null);
		this.localStorageSave('selectedUserMaxInvestment', null);
		this.setLoggedInUserInfo({});
	}

	static localStorageSave(key, value){
		reactLocalStorage.set(key, value);
	}

	static getFromLocalStorage(key){
		return reactLocalStorage.get(key);
	}

	static localStorageSaveObject(key, value){
		reactLocalStorage.setObject(key, value);
	}

	static cookieStorageSave(key, value) {
		if (env === 'localhost') {
			cookie.save(key, value, {path: '/'});
		} else {
			cookie.save(key, value, {path: '/', domain: '.adviceqube.com'});
		}
	}

	static getFromCookieStorage(key) {
		return cookie.load(key);
	}

	static getObjectFromLocalStorage(key){
		return reactLocalStorage.getObject(key);
	}	

	static clearLocalStorage() {
		return reactLocalStorage.clear();
	}

	static isLoggedIn() {
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']) {
			return true;
		} else{
			return false;
		}
	}

	static getAuthToken(){
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo && this.loggedInUserinfo['token']){
			return this.loggedInUserinfo['token'];
		}else{
			return "";
		}
	}

	static getAuthTokenHeader(headers){
		let headersLocal = headers;
		if(!headersLocal){
			headersLocal = {};
		}
		if (this.isLoggedIn()){
			headersLocal['aimsquant-token'] = this.getAuthToken();
		}

		return headersLocal;
	}

	static getUserId(){
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo && this.loggedInUserinfo['_id']){
			return this.loggedInUserinfo['_id'];
		}else{
			return "";
		}
	}

	static getUserInfo(){
		this.loggedInUserinfo = cookie.load(this.userInfoString);
		if (this.loggedInUserinfo){
			return this.loggedInUserinfo;
		}else{
			return {};
		}
	}

	static updateUserToken(newToken){
		this.loggedInUserinfo['token'] = newToken;
		this.loggedInUserinfo['recentTokenUpdateTime'] = moment().valueOf();
		// this.localStorageSaveObject(this.userInfoString, this.loggedInUserinfo);
		Utils.cookieStorageSave(this.userInfoString, this.loggedInUserinfo);
	}

	static getLoggedInUserName(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = data.firstName + " " + data.lastName;
		}
		return stringy;
	}

	static getLoggedInUserEmail(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = data.email;
		}
		return stringy;
	}

	static isAdmin() {
		let isAdmin = false;
		const data = this.getUserInfo();
		if (data) {
			isAdmin = _.get(data, 'isAdmin', false);
		}

		return isAdmin;
	}

	static getLoggedInUserInitials(){
		let stringy = "";
		const data = this.getUserInfo();
		if (data){
			stringy = this.getInitials(data.firstName, data.lastName);
		}
		return stringy;
	}

	static getInitials(firstName, lastName){
		let returnString = "";
		if (firstName && firstName.trim().length > 0){
			returnString = returnString + firstName.trim().slice(0, 1).toUpperCase();
		}
		if (lastName && lastName.trim().length > 0){
			returnString = returnString + lastName.trim().slice(0, 1).toUpperCase();
		}
		return returnString;
	}

	static getReactQuillEditorModules(){
		const modules = {
		      toolbar: [
		        [{ 'header': [1, 2, 3, false] }],
		        ['bold', 'italic', 'underline','strike', 'blockquote', 'code-block'],
		        [{'list': 'ordered'}, {'list': 'bullet'}],
		        ['link'],
		        ['clean']
		      ],
		    };
		return modules;
	}

	static formatMoneyValueMaxTwoDecimals(value) {
		if (value && typeof(value) == "number"){
			var x = Math.abs(value/100000) > 1.0 ? value.toFixed(0) : value.toFixed(2);
			var afterPoint = '';
			if(x.indexOf('.') > 0)
			   afterPoint = x.substring(x.indexOf('.'),x.length);
			x = value > 0 ? Math.floor(x) : Math.ceil(x);
			x = x == 0 && value < 0 ? '-' + x.toString() : x.toString(); 
			var lastThree = x.substring(x.length-3);
			var otherNumbers = x.substring(0,x.length-3);
			if(otherNumbers !== '' && otherNumbers !== '-')
				lastThree = ',' + lastThree;

				return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
		} else{
			return value;
		}
	}

	static formatInvestmentValue(value) {
		if (value && typeof(value) == "number"){
			var valueLac = value/100;
			var valueCr = value/10000;
			var roundVal = value - Math.floor(value) > 0; 
			var roundLacs = valueLac - Math.floor(valueLac) > 0;
			var roundCrs = valueCr - Math.floor(valueCr) > 0;

			return valueLac >= 1.0 ?  
				valueCr >= 1.0 ? 
				(roundCrs > 0 ? `${(valueCr).toFixed(2)}Cr` : `${valueCr.toFixed(0)}Cr`) : 
			 	(roundLacs ? `${valueLac.toFixed(2)}L` : `${valueLac.toFixed(0)}L`) : 
				(roundVal ? `${value.toFixed(2)}K` : `${value.toFixed(0)}K`);
		} else{
			return value;
		}
	}

	static formatInvestmentValueNormal(value) {
		if (value && typeof(value) == "number"){
			var valueThousand = value / 1000;
			var valueLac = value / 100000;
			var valueCr = value / 10000000;
			var roundVal = value - Math.floor(value) > 0; 
			var roundThousand = valueThousand - Math.floor(valueThousand) > 0;
			var roundLacs = valueLac - Math.floor(valueLac) > 0;
			var roundCrs = valueCr - Math.floor(valueCr) > 0;

			return valueThousand >= 1.0 
				? 	valueLac >= 1.0 
						? 	valueCr >= 1.0 
								? 	(roundCrs > 0 ? `${(valueCr).toFixed(2)}Cr` : `${valueCr.toFixed(0)}Cr`) 
								: 	(roundLacs ? `${valueLac.toFixed(2)}L` : `${valueLac.toFixed(0)}L`) 
						: 	(roundThousand > 0 ? `${valueThousand.toFixed(2)}K` : `${valueThousand.toFixed(0)}K`)
				: 	(roundVal ? `${value.toFixed(2)}K` : `${value.toFixed(0)}K`);
		} else{
			return value;
		}
	}

	static formatReturnTypeVariable(value) {
		if (value && typeof(value) == "number"){
			return `${(value * 100.0).toFixed(2)}%`; 
		} else{
			return value;
		}
	}

	static openSocketConnection() {
		if ((!this.webSocket || this.webSocket.readyState != WebSocket.OPEN) && this.isLoggedIn()) {
			if (this.webSocket) {
				try{
					this.webSocket.close();
				} catch(err){}
			}

			this.webSocket = new WebSocket(webSocketUrl);
			
			if (this.webSocket && this.webSocket.readyState == WebSocket.CLOSED) {
				// console.log('Server unavailable');
				this.numAttempts++;
				var timeOut = Math.min(2 * Utils.numAttempts * 1000, 20000);
				setTimeout(() => {
					Utils.openSocketConnection()
				}, timeOut);
			}

			this.webSocket.onclose = () => {
				// console.log('ORginal Connection Closed');
				this.numAttempts++;
				var timeOut = Math.min(2 * Utils.numAttempts * 1000, 20000);
				setTimeout(() => {
					Utils.openSocketConnection()
				}, timeOut);
			}

			this.webSocket.onopen = () => {
				// console.log('Connection Established');
				this.numAttempts = 0;
			}
		}
	}

	static closeWebSocket(){
		try{
			this.webSocket.close();
		}catch(err){}
		this.webSocket = undefined;
	}

	static sendWSMessage(msg) {
		if (this.webSocket && this.webSocket.readyState == 1) {
			console.log('Message Sent', msg);
			this.webSocket.send(JSON.stringify(msg));
		}
	}

	static firstLetterUppercase(stringy){
		if (stringy && stringy.length > 0){
			return stringy[0].toUpperCase() + stringy.substring(1);
		}else{
			return '';
		}
	}

	static getStringWithNoSpaces(stringy){
		if (stringy){
			return stringy.replace(/\s+/g, "");
		}else{
			return "";
		}
	}

	static getLowerCasedNoSpaces(stringy){
		if (stringy){
			return this.getStringWithNoSpaces(stringy).toLowerCase();
		}else{	
			return "";
		}
	}

	static saveCommunitySearchString(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['searchString'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static saveCommunityTab(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['tabs'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static saveCommunityCheckBox(stringy){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (!savedData){
			savedData = {};
		}
		savedData['checkboxes'] = stringy;
		this.localStorageSaveObject('COMMUNITYFILTERS', savedData);
	}

	static getCommunitySearchString(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.searchString){
			return savedData.searchString;
		}
		return '';
	}
	static getCommunityTab(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.tabs){
			return savedData.tabs;
		}
		return '';
	}
	static getCommunityCheckBox(){
		let savedData = this.getObjectFromLocalStorage('COMMUNITYFILTERS');
		if (savedData && savedData.checkboxes){
			return savedData.checkboxes;
		}
		return '';
	}

	static computeLatestPerformanceSummary(eodPerformanceSummary, currentPortfolioPnlStats) {
		var obj = Object.assign(eodPerformanceSummary, currentPortfolioPnlStats);

		var netValueLatest = _.get(obj, 'netValue', 0);
		var netValueEOD = _.get(obj, 'netValueEOD', 0);

		var dailyNavChangeEODPct =  _.get(obj, 'dailyNAVChangeEODPct', 0);
		var dailyNavChangeLatestPct = netValueEOD > 0.0 ? (netValueLatest - netValueEOD)/netValueEOD : 0.0;
		var dailyNavChangePct = dailyNavChangeLatestPct || dailyNavChangeEODPct;

		var netValue = netValueLatest || netValueEOD;

		//var annualReturnEOD  = _.get(obj, 'annualReturn', 0);
		//var annualReturn = Math.pow((1+annualReturnEOD),(251/252))*(1+dailyNavChangeLatestPct) - 1.0;
		//var totalReturn = (1 + _.get(obj, 'totalReturn', 0))*(1+dailyNavChangeLatestPct) - 1.0;

		//return Object.assign(obj, {annualReturn: annualReturn, totalReturn: totalReturn, netValue:netValue, dailyNavChangePct: dailyNavChangePct});
		return Object.assign(obj, {netValue:netValue, dailyNavChangePct: dailyNavChangePct});

	}

	static checkForInternet (error, history) {
		if (error.message === 'Network Error') {
			window.location.assign('/errorPage');
		}
	}

	static autoLogin(token, history, redirectUrl, callback) {
		const headers = {
			'aimsquant-token': token
		};
		axios.get(`${requestUrl}/me`, {headers})
        .then(response => {
            Utils.cookieStorageSave(Utils.userInfoString, {...response.data, token});
			Utils.setLoggedInUserInfo({...response.data, token});
			callback();
        })
        .catch(error => {
          this.checkForInternet(error, history);
          if (error.response) {
              if (error.response.status === 400 || error.response.status === 403) {
                  window.location.assign('/forbiddenAccess');
              }
              this.checkErrorForTokenExpiry(error, history, redirectUrl);
          }
          return error;
        });
	}

	static checkToken(token) {
		return token && token !== undefined && token!== null && token.length > 0;
	}

	static isNull(value) {
		return value === null || value === 'null';
	}

	static isLocalStorageItemPresent = (item) => {
		return item !== undefined && item !== 'null' && item !== null;
	}

	static getHostName(url) {
		var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
		if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		return match[2];
		}
		else {
			return null;
		}
	}

	static getLocalStorageBooleanValue(value) {
		if (this.isLocalStorageItemPresent(value)) {
			if (typeof(value)=== 'boolean') {
				return value
			} else {
				if (value.toLowerCase() === 'true') {
					return true;
				}
	
				return false
			}
		}

		return false;
	}

	static isUserAllocated() {
		const isAdmin = this.isAdmin();
		const isLoggedInUserAllocated = _.get(this.getUserInfo(), 'allocationAdvisor', null) !== null;
		const isSelectedAdvisorAllocated = this.getLocalStorageBooleanValue(this.getFromLocalStorage('isSelectedAdvisorAllocated'));
		const isAdvisorSelected = this.isLocalStorageItemPresent(this.getFromLocalStorage('selectedAdvisorId'));
		// If logged user is admin and another 3rd party advisor is selected
		if (isAdmin && isAdvisorSelected) {
			return Boolean(isSelectedAdvisorAllocated);
		} else {
			return Boolean(isLoggedInUserAllocated);
		}
	}
}

export const getBreadCrumbArray = (array = [], item = []) => {
	return [
		{name: 'Home', url: '/home'},
		...array,
		...item
	];
}

export const convertToDecimal = value => {
	if (typeof(value) !== 'number') {
		return value;
	}
	return Number(value.toFixed(2));
}

export const constructErrorMessage = error => {
	const errorCode = _.get(error.response, 'data.errorCode', 'N/A');
	const message = _.get(error.response, 'data.message', 'N/A');
	return(`${errorCode} - ${message}`);
}

export const checkForInternet = (error, history) => {
	if (error.message === 'Network Error') {
		window.location.assign('/errorPage');
	}
};

export const getUnrealizedPnlPct = (unrealizedPnl, avgPrice, shares) => {
	return (
		avgPrice > 0 ? 
			Number(((unrealizedPnl / (shares * avgPrice)) * 100).toFixed(2)) : "-"
	);
};

export const getUnrealizedPnl = (unrealizedPnl, avgPrice) => {
	return (
		avgPrice > 0 ? unrealizedPnl : "-"
	);
};

export const generateRandomString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const sendErrorToBackend = (errorToSend = '', email = '', subject = 'Login Detail', successCallback = null, errorCallback = null, finallyCallback = null) => {
	const feedbackUrl = `${requestUrl}/user/sendFeedback`;
	const browser = bowser.getParser(window.navigator.userAgent);
	const impression = new Impression();
	impression.userTechData = browser.parse();
	let data = {
			...(_.get(impression, 'userTechData.parsedResult', {})),
              mobile: md.mobile(),
              phone:  md.phone(),
			  mobileOs: md.os(),
			  error: errorToSend,
			  currentUrl: window.location.href
		};
	let stringifiedData = JSON.stringify(data);
	axios({
		url: feedbackUrl,
		method: 'POST',
		data: {
			"feedback": stringifiedData,
			"subject": subject,
			"to": "support@adviceqube.com",
			"from": email
		}
	})
	.then(response => {
		successCallback !== null && successCallback();
	})
	.catch(error => {
		errorCallback !== null && errorCallback();
	})
	.finally(() => {
		finallyCallback !== null && finallyCallback();
	})
}

// Utils.openSocketConnection();
// setInterval(function(){Utils.openSocketConnection();}, 10000);

export * from './requests';
export * from './portfolio';
export * from './date';