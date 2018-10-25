import * as React from 'react';
import Media from 'react-media';
import styled from 'styled-components';
import _ from 'lodash';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {horizontalBox} from '../../../../constants';
import {sectorData} from '../constants';


export default class StockFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterData: [],
        }
    }

    getSectors = () => new Promise((resolve) => {
        let uniqueSectors = _.uniq(sectorData.map(item => item.Sector));
        // Removing sectors that are blank
        uniqueSectors = uniqueSectors.filter(sector => sector.length > 0);
        resolve (uniqueSectors.map(sector => {
            const uniqueSectorData = _.uniqWith(sectorData.filter(item => item.Sector === sector), _.isEqual);
            const industries = uniqueSectorData.map(item => {
                return {
                    industry: item.Industry,
                    sector,
                    checked: false
                }
            });

            return {sector, industries, checked: -1}
        }));
    }) 

    renderSectors = () => {
        let data = this.state.filterData;
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);
        if (sector !== null && sector.length > 0) {
            data = data.filter(item => item.sector === sector);
        }
        const mobileStyle = global.screen.width <= 600
            ?   {
                    height: global.screen.width > 600 ? '100%' : global.screen.height - 100,
                    overflow: 'hidden',
                    overflowY: 'scroll'
                }
            :   null;

        return (
            <Grid 
                    item
                    xs={12} 
                    style={{
                        width: '100%',
                       ...mobileStyle
                    }}
            >
                {
                    data.map((sector, index) => {
                        return (
                            <ExpansionPanel>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                    <Grid 
                                            item xs={12} 
                                            style={{
                                                ...horizontalBox, 
                                                justifyContent: 'flex-start',
                                                width: '180px'
                                            }}
                                    >
                                        <Checkbox 
                                            checked={sector.checked === 1}
                                            indeterminate = {sector.checked === 0}
                                            onChange={() => this.handleSectorClick(sector)}
                                            style={{marginRight: '5px'}}
                                        />
                                        <CheckboxLabel>{sector.sector}</CheckboxLabel>
                                    </Grid>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <SectorItem 
                                                    key={index} 
                                                    sector={sector} 
                                                    onChange={this.handleIndustryClick}
                                            />
                                        </Grid>
                                    </Grid>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        )
                    })
                }
                <Grid container style={{height: '100px'}}></Grid>
            </Grid> 
        );
    }

    getIndividualSectorsAndIndustries = (filterData) => {
        const selectedSectors = filterData.filter(item => item.checked >= 0);
        const sectors = selectedSectors.map(item => item.sector);
        let industries = [];
        filterData.map(sector => {
            const selectedIndustries = sector.industries.filter(item => item.checked === true);
            const industryNames = selectedIndustries.map(item => item.industry);
            industries = [...industries, ...industryNames];
        });

        return {sectors, industries};
    }

    handleSectorClick = sector => {
        const sectorName = _.get(sector, 'sector', '');
        const filterData = [...this.state.filterData];
        const sectorIndex = _.findIndex(filterData, item => item.sector === sectorName);
        if(sectorIndex !== -1) {
            const targetSector = filterData[sectorIndex];
            targetSector.checked = targetSector.checked === 0 // intermediate
                    ? 1 // checked
                    : targetSector.checked === 1 // checked
                        ? -1 // un-checked
                        : 1; // checked
            // Update all the industries of that particular sector
            targetSector.industries.map(item => {
                item.checked = targetSector.checked === 1;
            });
            this.setState({filterData: [...[], ...filterData]}, () => this.forceUpdate());
            this.props.onFilterChange(this.getIndividualSectorsAndIndustries(filterData));
        }
    }

    // returns
    // 0: if some of the industries are selected
    // 1: if all of the industries are selected
    // -1: if none of the industries are selected
    checkForActiveIndustries = (sector) => {
        const filterData = [...this.state.filterData];
        const targetSectorIdx = _.findIndex(filterData, item => item.sector === sector);
        if (targetSectorIdx !== -1) {
            const targetSector = filterData[targetSectorIdx];
            let activeIndustriesCount = 0;
            targetSector.industries.map(item => {
                item.checked === true && activeIndustriesCount++;
            })
            return activeIndustriesCount === 0
                    ? -1
                    : activeIndustriesCount < targetSector.industries.length
                        ? 0
                        : 1
        } else {
            return -1;
        }
    }

    handleIndustryClick = (event, industry, sector) => {
        const checked = event.target.checked;
        const filterData = [...this.state.filterData];
        const targetSectorIndex = _.findIndex(filterData, item => item.sector === sector);
        if (targetSectorIndex !== -1) {
            const targetSector = filterData[targetSectorIndex];
            const targetIndustryIndex = _.findIndex(targetSector.industries, item => item.industry === industry);
            if (targetIndustryIndex !== -1) {
                targetSector.industries[targetIndustryIndex].checked = checked;
                // setting the checkbox select status based on the number of industries selected for that sector
                targetSector.checked = this.checkForActiveIndustries(sector);
                this.setState({filterData}, () => this.forceUpdate());
                this.props.onFilterChange(this.getIndividualSectorsAndIndustries(filterData));
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextState.filterData, this.state.filterData) || !_.isEqual(nextProps.filters, this.props.filters)) {
            return true;
        }

        return false;
    }

    handleAllSectorsChange = value => {
        const filterData = [...this.state.filterData];
        filterData.map(item => {
            item.checked = value ? 1 : -1;
            item.industries.map(industryItem => {
                industryItem.checked = value;
            });
        });
        this.setState({filterData}, () => this.forceUpdate());
        this.props.onFilterChange(this.getIndividualSectorsAndIndustries(filterData));
    }

    componentWillMount() {
        this.getSectors()
        .then(data => this.setState({filterData: data}));
    }

    render() {
        console.log('Stock Filter Updated');
        return(
            <Grid container>
                <Media 
                    query="(max-width: 600px)"
                    render={() => 
                        <Grid 
                                item xs={12} 
                                style={{...horizontalBox, height: '60px', marginLeft: '10px', justifyContent: 'flex-start'}}
                        >
                            <Checkbox 
                                    style={{fontSize: '18px', fontWeight: 700}}
                                    onChange={e => this.handleAllSectorsChange(e.target.checked)}
                                    checked={
                                        this.state.filterData.filter(item => item.checked === 1).length === this.state.filterData.length
                                    }
                            />
                            <CheckboxLabel>Sectors</CheckboxLabel>  
                        </Grid>
                    }
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => 
                        <Grid item xs={12}>
                            <h3 
                                style={{
                                    fontSize: '22px', 
                                    fontWeight: 500,
                                    margin: '10px 0px',
                                    marginLeft: '20px'
                                }}
                            >
                                Filter Stocks
                            </h3>
                        </Grid>
                    }
                />
                {this.renderSectors()}
            </Grid>
        );
    }
}

const SectorItem = ({sector, onChange}) => {
    return (
        <IndustryItemGroup 
            industries={sector.industries} 
            onChange={onChange} />
        )
}

const IndustryItemGroup = ({industries, onChange}) => {
    return (
        <Grid item xs={12}>
            {
                industries.map((item, index) => (
                    <IndustryItem 
                        key={index} 
                        checked={item.checked} 
                        text={item.industry}
                        onChange={onChange}
                        sector={item.sector}
                    />
                ))
            }
        </Grid>
    );
}

class IndustryItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || (!_.isEqual(nextState, this.state))) {
            return true;
        }

        return false;
    }

    render() {
        console.log('Industry Item Rendered');
        const {checked, text, onChange, sector} = this.props;

        return (
            <Grid container>
                <Grid item xs={12} style={{...horizontalBox, marginBottom: '10px', justifyContent: 'flex-start'}}>
                    <Checkbox 
                            checked={checked} 
                            onChange={value => onChange(value, text, sector)}
                            style={{
                                margin: '0', 
                                marginLeft: '20px', 
                                marginBottom: '5px', 
                                fontWeight: 400,
                                fontSize: global.screen.width > 600 ? '13px' : '15px'
                            }}
                    />
                    <CheckboxLabel>{text}</CheckboxLabel>
                </Grid>
            </Grid>
        );
    }
}

const CheckboxLabel = styled.h3`
    font-size: 14px;
    color: #444;
    text-align: start;
    font-weight: 500
`;