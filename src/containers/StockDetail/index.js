import React from 'react';
import Media from 'react-media';
import LayoutMobile from './components/mobile/Layout';
import LayoutDesktop from './components/desktop/Layout';

export default class StockDetail extends React.Component {
    render() {
        const props = {
            symbol: _.get(this.props, 'symbol', '')
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <LayoutMobile {...props}/>}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <LayoutDesktop {...props} />}
                />
            </React.Fragment>
        );
    }
}