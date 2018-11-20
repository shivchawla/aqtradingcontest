import React from 'react';
import {Helmet} from 'react-helmet';

export const DailyContestCreateMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: Predict | Stock Prediction Contest</title>
            <meta name="description" content="Make stock predictions and win prizes"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, Stock market, Share Market, NSE stocks, returns, gain, India, Prediction, trading, contest, predict"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const DailyContestLeaderboardMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: Leaderboard | Stock Prediction Contest</title>
            <meta name="description" content="Leaderboard of stock prediction contest"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, Stock market, Share Market, NSE stocks, returns, gain, India, Leaderboard, trading, contest, predictions"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const DailyContestTopPicksMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: Top Picks | Stock Prediction Contest</title>
            <meta name="description" content="Top picks of stock prediction contest"/>
            <meta name="keywords" content="www.adviceqube.com, Equity, Stock market, Share Market, NSE stocks, returns, gain, India, toppicks, trading, contest, predict, predictions"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const DailyContestmyPicksMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: My Picks | Stock Prediction Contest</title>
            <meta name="description" content="Your predictions for stock prediction contest"/>
            <meta name="keywords" content="www.adviceqube.com, Equity, Stock market, Share Market, NSE stocks, returns, gain, India, trading, contest, predict, predictions"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const DailyContestHomeMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: Stock Prediction Contest</title>
            <meta name="description" content="Stock predictions contest for trading enthusiast"/>
            <meta name="keywords" content="www.adviceqube.com, Equity, Stock market, Share Market, NSE stocks, returns, gain, India, trading, contest, predict, predictions"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}
