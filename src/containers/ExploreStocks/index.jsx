import React from 'react';
import _ from 'lodash';
import Route from 'react-router/Route';
import Switch from 'react-router/Switch';
import {withRouter} from 'react-router-dom';
import StockList from './StockList';
import StockDetail from './StockDetail';

class ExploreStocks extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route 
                        exact
                        path={`${this.props.match.path}/list`}
                        component={StockList}
                    />
                    <Route 
                        exact
                        path={`${this.props.match.path}/detail/:symbol`}
                        component={StockDetail}
                    />
                </Switch>
            </div>
        );
    }
}

export default withRouter(ExploreStocks);