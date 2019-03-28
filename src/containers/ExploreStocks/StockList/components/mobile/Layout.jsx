import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Section from './Section';

export default class Layout extends React.Component {
    renderCategories = () => {
        const {categories = []} = this.props;

        return (
            <React.Fragment>
                {
                    categories.map((categoryItem, index) => (
                        <SGridItem 
                                item 
                                xs={12}
                                key={index}
                        >
                            <Section 
                                header={_.get(categoryItem, 'category', '')}
                                stocks={_.get(categoryItem, 'stocks', [])}
                            />
                        </SGridItem>
                    ))
                }
            </React.Fragment>
        );
    }

    render() {
        return (
            <Grid container>
                {this.renderCategories()}
            </Grid>
        );
    }
}

const SGridItem = styled(Grid)`
    /* margin: 15px 0; */
`;