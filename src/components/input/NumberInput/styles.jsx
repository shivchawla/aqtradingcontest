import purple from '@material-ui/core/colors/purple';

export default theme => ({
    bootstrapInput: {
        borderRadius: 4,
        background: theme.palette.light,
        border: '1px solid #ced4da',
        fontSize: 16,
        padding: '10px 12px',
        color: '#676767',
        width: '60px',
        margin: '0 2px'
    },
    bootstrapRoot: {
        backgroundColor: purple[500],
    }
}); 