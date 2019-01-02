import React from 'react';
import styled from 'styled-components';
import ActionIcon from '../../containers/TradingContest/Misc/ActionIcons';
import {horizontalBox} from '../../constants';

export default (props) => {
    const {title = 'Title', onClose = () => {}} = props;

    return (
        <div 
                style={{
                    ...horizontalBox, 
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to right, rgb(84, 67, 240), rgb(51, 90, 240))',
                    position: 'absolute',
                    width: '100%',
                    zIndex: 10
                }}
        >
            <DialogHeader style={{marginLeft: '10px'}}>{title}</DialogHeader>
            <ActionIcon 
                onClick={onClose} 
                color='#fff'
                type="close"
            />
        </div>
    );
}

const DialogHeader = styled.h3`
    color: #fff;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    margin-left: 20px;
`;