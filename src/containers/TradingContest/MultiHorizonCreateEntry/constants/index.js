export const maxPredictionLimit = 3;

export const buySellActionButtonsStyles = theme => {
    return ({
        buyButtonActive: {
            backgroundColor: '#3EF79B',
            color: '#fff',
            border: 'none',
            '&:hover': {
                backgroundColor: '#3EF79B'
            }
        },
        sellButtonActive: {
            backgroundColor: '#FE6662',
            color: '#fff',
            border: 'none',
            '&:hover': {
                backgroundColor: '#FE6662'
            }
        },
        inActiveButton: {
            backgroundColor: '#fff',
            border: '1px solid #D5D5D5',
            '&:hover': {
                backgroundColor: '#fff'
            }
        },
        button: {
            boxShadow: 'none',
            fontWeight: 400,
            fontSize: '14px',
            minWidth: '54px',
            minHeight: '30px',
            padding: '4px 8px',
            width: '54px',
            '&:hover': {
                backgroundColor: 'undefined'
            }
        }
    });
}