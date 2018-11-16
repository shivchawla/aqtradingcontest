/*
* @Author: Shiv Chawla
* @Date:   2018-09-11 20:06:27
* @Last Modified by:   Shiv Chawla
* @Last Modified time: 2018-11-16 14:25:02
*/

import React, {Fragment} from 'react'

import createPortfolio from '../../../assets/CreatePortfolio.svg';
import updateEntry from '../../../assets/UpdateEntry.svg';
import winPrize from '../../../assets/WinPrizes.svg';

export const scoringText = 'The theme of the Stock Prediction Contest is to award best stock pickers with most profitable ideas. For this purpose, our scoring function will only depend on net realized profit on anyday.';


export const faqs = [
    {
        header: 'How do I enter the contest?', 
        content: 'Click “Enter Contest", Add your favorite stocks to buy or sell. Choose target-price/horizon for each predicton. Then click “Submit".'
    },
    {
        header: 'What stocks/universe is allowed?',
        content: 'We only allow stocks that are included in NIFTY-500 index. For selling, stocks with available future contracts are allowed.'
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
        content: 'The contest is an ongoing contest and predictions can be submitted between Market Open (9:30 AM) to Market Close (3:30PM).'
    },
    {
        header: 'Can I submit multiple predictions in the contest?',
        content: 'YES, you can submit upto 10 predictions each day.'
    },
    {
        header: 'Is there any entry fee for contest?',
        content: 'No'
    },
    {
        header: 'How long are the entries evaluated?',
        content: 'The entries are evaluated each day based on predictions ending on that day. The realized profit is used to select the winners.'
    },
    {
        header: 'Do I have to submit predictions daily?',
        content: 'No. You can submit a prediction anyday.'
    },
    {
        header: 'When are winners declared?',
        content: 'Winners are decided at the end of each trading day based on realized profit that day'
    },
    {
        header: 'What’s the fine print?',
        content: (<Fragment>Please check out <a href="https://www.adviceqube.com/dailycontest/rules"><span>Contest Rules</span></a> for complete details and legal policies</Fragment>)

    }
    
];

export const howItWorksContents = [
    {image: createPortfolio, header: 'Pick your stocks', content: 'Select your favorite stocks to Buy or Sell'},
    {image: updateEntry, header: 'Set your prediction', content: 'Choose price-target/horizon for each stock prediction.'},
    {image: winPrize, header: 'Win prizes daily', content: 'Highest realized profit win cash prizes everyday'}
];

export const prizeText = "The top 5 contest participants are awarded Rs.100 everyday. The prizes are disbursed at the end of each week.";

export const requirements = [
    {header: 'Profitability', content: 'Net Profit/Loss on each day must be positive to win prizes.'},
    {header: 'Stock Universe', content: 'You can only buy stocks that are valid NIFTY 500 constituents.'},
    {header: 'Shortable Universe', content: 'You can only sell stocks that have valid futue contracts associated with it.'},
    {header: 'Maximum Predictions', content: 'You can only give a maximum of 10 predictions each day'},
    
];

