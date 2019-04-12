import * as React from 'react';
import Header from '../../../Header';
import withRouter from 'react-router-dom/withRouter';
import {withStyles} from '@material-ui/core/styles';
import Loading from 'react-loading-bar';
import {loadingColor, verticalBox} from '../../../../constants';

const styles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
}

class AppLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parentPath: '/', 
            sideMenuOpen: true, 
            isLoggedIn: false,
            contactUsModalVisible: false
        };
    }

    componentWillMount() {
        this.onRouteChanged(this.props.location.pathname);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            this.onRouteChanged(this.props.location.pathname);
        }
    }

    onRouteChanged = location => {
        const locationArray = location.split('/');
        locationArray.splice(0, 1);
        const parentPath = locationArray.length > 0 ? locationArray[0] : '/'; 
        this.setState({parentPath});
    }

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                <Loading
                    show={this.props.loading}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                {
                    !this.props.loading &&
                    <div className={classes.root}>
                        <Header activeIndex={this.props.activeNav || 1} />
                        <div 
                                style={{
                                    height: 'calc(100vh - 64px)',
                                    ...this.props.style
                                    // ...verticalBox,
                                    // justifyContent: 'center',
                                    // alignItems: 'center',
                                    // paddingLeft: '20px',
                                }}
                        >
                            {this.props.content}
                        </div>
                    </div>
                }
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(withRouter(AppLayout));

const headerStyle = {
    background: '#fff',
    borderBottom: '1px solid #e1e1e1', 
    width: '100%',
    height:'64px',
    padding:'0 0 0 30px'

};

const headerColor = {
    color: '#595959',
    fontSize: '16px'
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
}

const contentLayoutStyle = {
    width:'95%',
    margin:'0 auto',
};
