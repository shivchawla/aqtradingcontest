import React from 'react';
const {dailyContestHomeUrl = 'https://static.adviceqube.com'} = require('../../localConfig');

export default class DailyContestHomeFrame extends React.Component {
    iframe = () => {
        const iframe = `<iframe src=${dailyContestHomeUrl} style="width: 100vw; height: 100vh; border: none"></iframe>`;
        return {
            __html: iframe
          }
    }
    render() {
        return (
            <div style={{width: '100vw', height: '100vh'}}>
                <div 
                    dangerouslySetInnerHTML={this.iframe()} 
                    style={{width: '100vw', height: '100vh'}}
                />
            </div>
        );
    }
}