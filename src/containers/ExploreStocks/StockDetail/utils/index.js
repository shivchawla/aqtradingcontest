import _ from 'lodash';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';

export const processFinancials = data => {
    const financials = _.get(data, 'Financials', {});
    const financialAttributes = Object.keys(financials);

    let requiredFinancialData = {};
    financialAttributes.forEach(attribute => {
        requiredFinancialData = {
            ...requiredFinancialData,
            [attribute]: getFinancialObj(financials, attribute)
        }
    });

    return requiredFinancialData;
};

export const getFinancialObj = (financials, key = 'Balance_Sheet') => {
    const dataObj = _.get(financials, `${key}`, {});
    // Getting the quarterly and yearly data
    const quarterly = _.get(dataObj, 'quarterly', {});
    const yearly = _.get(dataObj, 'yearly', {});

    // Getting all the keys from quarterly and yearly object, which are basically dates
    const quarterlyKeys = Object.keys(quarterly);
    const yearlyKeys = Object.keys(yearly);
    
    /**
     * Getting the yearly and quarterly data which has change in it. In the following format
     * [{label, value, change}]    
     */

    const yearlyChangeData = extractData(yearly, yearlyKeys);
    const quarterlyChangeData = extractData(quarterly, quarterlyKeys);

    return { yearly: yearlyChangeData, quarterly: quarterlyChangeData };
};

export const extractData = (data, keys = []) => {
    /**
     * Sorting the dates in ascending order
     */
    const sortedKeys = keys.sort((a, b) => {
        return moment(a, dateFormat).isSameOrBefore(moment(b, dateFormat)) ? 1 : -1;
    });

    /**
     * Contains the result data
     */
    let resultData = {};
    try {
        sortedKeys.forEach((date, index) => {
            const dataObj = data[date];
            let groupedData = {};
            Object.keys(dataObj).forEach(attribute => {
                const changePercntage = data[sortedKeys[index + 1]][attribute] === null 
                    ? null
                    : (data[date][attribute] - data[sortedKeys[index + 1]][attribute]) / data[sortedKeys[index + 1]][attribute]
                groupedData = {
                    ...groupedData,
                    [attribute]: {
                        label: `${attribute}`,
                        value: data[date][attribute],
                        change: sortedKeys[index + 1] !== undefined
                            ?   changePercntage
                            :   null
                    }
                };
            });
            resultData = {
                ...resultData,
                [date]: groupedData
            }
        });
    } catch (e) {
        // console.log(e);
    }
    
    return resultData;
};

export const processStaticPerformance = (data, field = 'returns.annualreturn', tickerName = 'Ticker') => {
    const performance = _.get(data, 'yearly', {});

    let performanceKeys = Object.keys(performance);
    const dateTenYearsBack = moment().subtract(10, 'years').format('YYYY');
    performanceKeys = performanceKeys.map(key => moment(key, 'YYYY'));
    performanceKeys = performanceKeys.filter(key => {
        return key.isSameOrAfter(moment(dateTenYearsBack, 'YYYY'));
    });
    
    performanceKeys = performanceKeys.sort((a, b) => {return moment(a).isBefore(b) ? -1 : 1});
    const currentData = [];
    const currentTimelineData = [];
    performanceKeys.map(key => {
        let metricValue = _.get(performance, `${moment(key).format('YYYY')}.${field}`, 0) || 0;
        const metricValuePercentage = Number((metricValue * 100).toFixed(2));
        currentData.push(metricValuePercentage);
        currentTimelineData.push({
            timeline: moment(key).format('YYYY'),
            value: metricValuePercentage
        });
    });

    return [{
        name: tickerName,
        data: currentData,
        timelineData: currentTimelineData,
        categories: currentTimelineData.map(item => item.timeline)
    }];
};

export const processStaticPerformanceMonthly = (data, field = 'returns.annualreturn', tickerName = 'Ticker') => {
    const monthFormat = 'YYYY_M';
    const monthlyPerformance = _.get(data, 'monthly', {});

    const monthlyKeys = Object.keys(monthlyPerformance);
    const dateOneYearBack = moment().subtract(1, 'years');
    let monthsOneYearFromNow = monthlyKeys.filter(dateKey => moment(dateKey, monthFormat).isSameOrAfter(dateOneYearBack));
    monthsOneYearFromNow = sortDates(monthsOneYearFromNow, monthFormat);

    const currentData = [];
    const currentTimelineData = [];

    monthsOneYearFromNow.map(monthKey => {
        let metricValue = _.get(monthlyPerformance, `${monthKey}.${field}`, 0) || 0;
        const metricValuePercentage = Number((metricValue * 100).toFixed(2));
        currentData.push(metricValuePercentage);
        currentTimelineData.push({
            timeline: monthKey,
            value: metricValuePercentage
        });
    });    

    return [{
        name: tickerName,
        data: currentData,
        timelineData: currentTimelineData,
        categories: currentTimelineData.map(item => item.timeline)
    }];
}

export const sortDates = (dates, format) => {
    return dates.sort((a, b) => (
        moment(a, format).isSameOrAfter(moment(b, format)) ? 1 : -1
    ));
}

export const processRollingPerformance = (performance, field = 'returns.annualreturn', tickerName = 'Ticker', yearly = true) => {
    let performanceKeys = Object.keys(performance);
    const timelineData = [];
    let timelines = []
    if (yearly) {
        timelines = ['ytd', '1y', '2y', '5y']
    } else {
        timelines = ['wtd', '1wk', 'mtd', '1m', '2m', '3m', '6m'];
    }    

    timelines = timelines.filter(timelineItem => {
        const timelineIndex = performanceKeys.indexOf(timelineItem);
        return timelineIndex >= 0;
    });
    timelines.map(key => {
        const metricValue = _.get(performance, `[${key}].${field}`, 0);
        const metricPercentage = Number((metricValue * 100).toFixed(2));
        timelineData.push(metricPercentage);
    });

    return {
        chartData: [
            {
                name: tickerName,
                data: timelineData
            }
        ],
        timelines: timelines.map(item => item.toUpperCase())
    };
}

