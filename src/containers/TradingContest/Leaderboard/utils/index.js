import _ from 'lodash';

export const processOverallLeaderboardData = data => Promise.map(data, leaderItem => {
    const name = _.get(leaderItem, 'name', '');
    const advisorId = _.get(leaderItem, 'advisorId', null);
    const totalEarnings = _.get(leaderItem, 'totalEarnings', 0);
    const dailyEarnings = _.get(leaderItem, 'dailyEarnings', 0);
    const weeklyEarnings = _.get(leaderItem, 'weeklyEarnings', 0);
    const netValue = _.get(leaderItem, 'pnlStats.net.total.portfolio.net.netValue', 0);
    const avgPnl = _.get(leaderItem, 'pnlStats.net.total.portfolio.net.avgPnl', 0);
    const netTotal = _.get(leaderItem, 'portfolioStats.netTotal', 0);
    const totalReturn = ((netTotal - 1000) * 100) / 1000;

    return {
        name,
        advisorId,
        totalEarnings,
        dailyEarnings,
        weeklyEarnings,
        netValue,
        avgPnl,
        totalReturn
    };
})

export const getLeadeboardType = (type = 0) => {
    switch(type) {
        case 0:
            return 'daily';
        case 1:
            return 'weekly';
        case 2:
            return 'overall';
        default:
            return 'daily';
    }
}

export const convertNameToTitleCase = (name) => {
    let nameSections = name.split(' ');
    nameSections = nameSections.map(item => {
        let nItem = item.toLowerCase();
        nItem = nItem.charAt(0).toUpperCase() + nItem.slice(1);

        return nItem;
    });

    return nameSections.join(' ');
}