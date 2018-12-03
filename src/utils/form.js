import _ from 'lodash';
export const getFormProps = (name, data = {}) => {
    return {
        name,
        value: _.get(data, `values.${name}`, ''),
        error: _.get(data, `errors.${name}`, ''),
        touched: _.get(data, `touched.${name}`, false)
    };
}

export const validateSchema = (validationSchemaMethod) => {
    return values => {
        const validationSchema = validationSchemaMethod(values);
        try {
        validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
};

export const getErrorsFromValidationError = validationError => {
    const FIRST_ERROR = 0;
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
};