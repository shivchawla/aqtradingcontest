import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Section from './Section';

export default class Layout extends React.Component {
    render() {
        return (
            <Grid container>
                <SGridItem item xs={12}>
                    <Section header='High Return Stocks' />
                </SGridItem>
                <SGridItem item xs={12}>
                    <Section header='High Return Stocks' />
                </SGridItem>
                <SGridItem item xs={12}>
                    <Section header='High Return Stocks' />
                </SGridItem>
            </Grid>
        );
    }
}

const SGridItem = styled(Grid)`
    /* margin: 15px 0; */
`;