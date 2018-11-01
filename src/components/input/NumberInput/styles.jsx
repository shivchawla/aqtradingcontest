import purple from '@material-ui/core/colors/purple';
import {metricColor} from '../../../constants';

const baseInputStyle = {
    borderRadius: 4,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 12px',
    color: 'red',
    width: '100px',
    margin: '0 2px',
    fontWeight: 500
}
export default theme => ({
    bootstrapInputNeutral: {
        ...baseInputStyle,
        color: '#4B4A4A',
        background: theme.palette.light,
    },
    bootstrapInputPositive: {
        ...baseInputStyle,
        color: metricColor.positive,
        background: theme.palette.light,
    },
    bootstrapInputNegative: {
        ...baseInputStyle,
        color: metricColor.negative,
        background: theme.palette.light,
    },
    bootstrapRoot: {
        backgroundColor: purple[500],
    }
}); 