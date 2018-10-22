import styled from 'styled-components';
import {primaryColor} from '../../../constants';

export const NavLink = styled.h3`
    cursor: pointer;
    font-size: 16px;
    color: ${props => props.active ? primaryColor : '#595959'};
    margin-right: 20px;
    font-weight: 400;
    padding: 0 15px;
    padding-bottom: 7px;
    border-bottom: 2px solid ${props => props.active ? primaryColor : 'transparent'};
    transition: all 0.3s ease-in-out;

    &:hover {
        color: ${primaryColor};
        border-color: ${primaryColor};
    }
`;
