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
        return moment(a, dateFormat).isSameOrBefore(moment(b, dateFormat)) ? -1 : 1;
    });

    /**
     * Contains the result data
     */
    let resultData = {};
    
    sortedKeys.forEach((date, index) => {
        const dataObj = data[date];
        let groupedData = {};
        Object.keys(dataObj).forEach(attribute => {
            groupedData = {
                ...groupedData,
                [attribute]: {
                    label: `${attribute}`,
                    value: data[date][attribute],
                    change: sortedKeys[index - 1] !== undefined
                        ?   data[date][attribute] - data[sortedKeys[index -1]][attribute]
                        :   null
                }
            };
        });
        resultData = {
            ...resultData,
            [date]: groupedData
        }
    });

    return resultData;
};

export const processStaticPerformance = (data, field = 'returns.totalreturn') => {
    const performance = _.get(data, 'monthly', {});

    let performanceKeys = Object.keys(performance);
        const dateOneyYearBack = moment().subtract(1, 'y').subtract(1, 'M');
        performanceKeys = performanceKeys.map(key => moment(key, 'YYYY_M'));
        performanceKeys = performanceKeys.filter(item => 
            moment(item, 'YYYY_M').isSameOrAfter(dateOneyYearBack)
        );
        performanceKeys = performanceKeys.sort((a, b) => {return moment(a).isBefore(b) ?-1:1});
        const currentData = [];
        const currentTimelineData = [];

        performanceKeys.map(key => {
            let metricValue = (_.get(performance, `${[moment(key).format('YYYY_M')]}.${field}`, 0) || 0);
            if (field === 'returns.monthlyreturn') {
                const annualreturn = (_.get(performance, `${[moment(key).format('YYYY_M')]}.returns.annualreturn`, 0) || 0);
                metricValue = Math.exp(Math.log(1 + annualreturn) / 12) - 1;
            }
            const metricValuePercentage = Number((metricValue * 100).toFixed(2));
            currentData.push(metricValuePercentage);
            currentTimelineData.push({
                timeline: key,
                value: metricValuePercentage
            });
        });

        return [{
            name: '',
            data: currentData,
            timelineData: currentTimelineData
        }];
};

export const processRollingPerformance = (performance, field = 'returns.totalreturn') => {
    let performanceKeys = Object.keys(performance);
    const timelineData = [];
    let timelines = ['wtd', '1wk', 'mtd', '1m', '2m', '3m', '6m', 'ytd', '1y', 'inception']
    

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
                name: `Contest Entry`,
                data: timelineData
            }
        ],
        timelines: timelines.map(item => item.toUpperCase())
    };
}

