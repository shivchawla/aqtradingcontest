import React from 'react';

export default class HomeFrame extends React.Component {
    iframe = () => {
        const iframe = '<iframe src="http://localhost:8000/" style="width: 100vw; height: 100vh; border: none"></iframe>';
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