/*
* @Author: Shiv Chawla
* @Date:   2018-09-11 20:06:27
* @Last Modified by:   Shiv Chawla
* @Last Modified time: 2018-12-31 17:33:46
*/

import React, {Fragment} from 'react'

import createPortfolio from '../../../assets/CreatePortfolio.svg';
import updateEntry from '../../../assets/UpdateEntry.svg';
import winPrize from '../../../assets/WinPrizes.svg';

export const scoringTextDaily = 'The theme of the Stock Prediction Contest is to award best stock pickers with most profitable ideas. For this purpose, our scoring function will only depend on net realized profit on anyday.';
export const scoringTextWeekly = 'The theme of the Stock Prediction Contest is to award best stock pickers with most profitable ideas. For this purpose, our scoring function will only depend on net realized profit on anyday.';


export const faqs = [
    {
        header: 'How do I enter the contest?', 
        content: 'Click “Enter Contest", Add your favorite stocks to buy or sell. Choose target-price/horizon/stoploss for each predicton. Then click “Higher/Lower".'
    },
    {
        header: 'What stocks/universe is allowed?',
        content: 'We only allow stocks that are included in NIFTY-500 index.'
    },
    {
        header: 'Will you see my Stock Predictions?',
        content: 'We will look at your stock predictions ONLY for evaluation purposes. We will NOT use your stock predictions without explicit consent.'
    },
    {
        header: 'Can I withdraw my entry from the contest?',
        content: 'No. Your predictions will automatically expire after the horizon. You must create new predictions at regular interval to be part of the contest.'
    },
    {
        header: 'Is there any submission deadline?',
        content: 'The contest is an ongoing contest and predictions can be submitted anytime.'
    },
    {
        header: 'Can I submit multiple predictions in the contest?',
        content: 'YES, you can submit as many predictions as you want subject to virtual cash availability.'
    },
    {
        header: 'Is there any entry fee for contest?',
        content: 'No'
    },
    {
        header: 'How long are the entries evaluated?',
        content: 'We have thre tier reward program. For daily prizes, active entries are evaluated each day. Your portfolio performance is considered for weekly and monthly prizes.'
    },
    {
        header: 'Do I have to submit predictions daily?',
        content: 'No. You can submit a prediction anyday/anytime.'
    },
    {
        header: 'When are winners declared?',
        content: 'Daily Winners are decided at the end of each trading day. Weekly/Monthly winners are decided at the end of trading week/month.'
    },
    {
        header: 'What’s the fine print?',
        content: (<Fragment>Please check out <a href="https://www.adviceqube.com/dailycontest/rules"><span>Contest Rules</span></a> for complete details and legal policies</Fragment>)

    }
    
];

export const howItWorksContents = [
    {image: createPortfolio, header: 'Pick your stocks', content: 'Select your favorite stocks to Buy or Sell'},
    {image: updateEntry, header: 'Set your prediction', content: 'Choose price-target/horizon/stop-loss for each stock prediction.'},
    {image: winPrize, header: 'Win prizes every day, week and month', content: 'Win cash prizes worth Rs. 30,000 every month.'}
];

export const prizeTextDaily = "The top 5 contest participants are awarded Rs.100 everyday. The prizes are disbursed at the end of each week.";
export const prizeTextWeekly = "The top 5 contest participants are awarded Rs.100 everyday. The prizes are disbursed at the end of each week.";

export const requirements = [
    {header: 'Stock Universe', content: 'You can only buy/sell stocks that are valid NIFTY 500 constituents.'},
    {header: "Investment Amount", content: "Investment amount can only be a subset of 10K, 25K, 50K, 75K or 1Lac"},
    {header: 'Profitability', content: 'Net Profit/Loss must be positive to win prizes.'},
    {header: 'Maximum Predictions', content: 'You can make as many predictions given availability of virtual cash.'},
    {header: 'Predictions Per Security', content: 'You can only give a maximum of 3 predictions per security. Only 1 prediction per security/horizon combination.'}
];

