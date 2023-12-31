import React from 'react';
import _ from 'lodash';
import Loading from 'react-loading-bar';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import Header from '../../containers/Header';
import Footer from '../../containers/Footer';
import 'react-loading-bar/dist/index.css';

class AqDesktopLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSegment: this.props.defaultSelected || 0
        };
    }

    render() {
        const {loading = false, hideFooter = false, style = {}} = this.props;

        return (
            <Grid 
                    container 
                    justify="flex-start"
                    style={{
                        minHeight: 'calc(100vh - 80px)',
                        paddingTop: global.screen.width > 600 ? 0 : '10px',
                        backgroundColor: '#fff',
                        ...style
                    }}
            >
                <Grid item xs={12}>
                    <Header activeIndex={1} />
                    <div className="main-loader">
                        <Loading
                            show={loading}
                            color="teal"
                            showSpinner={false}
                        />
                    </div>
                </Grid>
                <ColContainer item xs={12}>
                    {
                        !loading &&
                        this.props.children
                    }
                    {
                        !loading && !hideFooter &&
                        <Footer style={{marginTop: '110px'}}/>
                    }
                </ColContainer>
            </Grid>
        );
    }
}

export default withRouter(AqDesktopLayout);

const ColContainer = styled(Grid)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
`;
