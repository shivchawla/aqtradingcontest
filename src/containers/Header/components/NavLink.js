import styled from 'styled-components';

const borderColor = 'teal';
// const borderColor = '#03a7ad';

export const NavLink = styled.h3`
    cursor: pointer;
    font-size: 14px;
    color: ${props => props.active ? borderColor : '#595959'};
    margin-right: 20px;
    font-weight: ${props => props.active ? 700 : 400};
    padding: 0 15px;
    padding-bottom: 7px;
    border-bottom: 2px solid ${props => props.active ? borderColor : 'transparent'};
    transition: all 0.3s ease-in-out;

    &:hover {
        color: ${borderColor};
        border-color: ${borderColor};
    }
`;
