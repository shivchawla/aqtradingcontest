import _ from 'lodash';
export const getFormProps = (name, data = {}) => {
    return {
        name,
        value: _.get(data, `values.${name}`, ''),
        error: _.get(data, `errors.${name}`, ''),
        touched: _.get(data, `touched.${name}`, false)
    };
}