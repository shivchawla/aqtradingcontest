import React from 'react';
const {homeUrl = 'https://static.adviceqube.com/'} = require('../../localConfig');

export default class HomeFrame extends React.Component {
    iframe = () => {
        const iframe = `<iframe src=${homeUrl} style="width: 100vw; height: 100vh; border: none"></iframe>`;
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