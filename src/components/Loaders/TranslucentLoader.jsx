import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class TranslucentLoader extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {width = '100%', height = '100%', style={}} = this.props;

        return (
            <LoaderContainer width={width} height={height} style={style}>
                <CircularProgress />
            </LoaderContainer>
        );
    }
}

const LoaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    width: ${props => props.width || '100%'};
    height: ${props => props.height || '100%'};
    z-index: 1000;
    border-radius: 4px;
`;