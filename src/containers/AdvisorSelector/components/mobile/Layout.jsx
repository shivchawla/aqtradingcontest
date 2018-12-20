import React from 'react';
import Grid from '@material-ui/core/Grid';
import AqLayout from '../../../../components/ui/AqLayout';
import SearchInput from '../../../TradingContest/SearchStocks/components/SearchInput';
import AdvisorList from './AdvisorList';

let searchInputTimeout = null;

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchInput: ''
        }
    }

    handleSearchInput = e => {
        const searchQuery = e.target.value;
        clearTimeout(searchInputTimeout);
        searchInputTimeout = setTimeout(() => {
            this.setState({searchInput: searchQuery}, () => {
                this.props.fetchAdvisors(this.state.searchInput, 0);
            });
        }, 300);
    }

    render() {
        const {advisors = []} = this.props;

        return (
            <AqLayout pageTitle='Select Advisor'>
                <Grid container>
                    <Grid item xs={12} style={{padding: '0 10px'}}>
                        <SearchInput 
                            style={{width: '100%', marginTop: '20px'}}
                            label="Search Stocks"
                            type="search"
                            margin="normal"
                            variant="outlined"
                            onChange={this.handleSearchInput}
                        />
                    </Grid>
                    <Grid item xs={12} style={{padding: '0 10px'}}>
                        <AdvisorList advisors={advisors}/>
                    </Grid>
                </Grid>
            </AqLayout>
        );
    }
}