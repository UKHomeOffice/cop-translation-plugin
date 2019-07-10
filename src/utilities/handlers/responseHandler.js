import logger from "../../config/winston";

const errorStatusCode = (code) => code || 500;

const res = (err, {formName, form}, res) => {
    if (err) {
        return res.status(errorStatusCode(err.code)).json(err.message);
    }
    if (!form) {
        return res.status(404).json({'message': `form ${formName} does not exist`});
    } else {
        return res.status(200).json(form);
    }
};

const healthRes = (err, data, res) => {
    if (err) {
        return res.status(errorStatusCode(err.code)).json(err.message);
    }
    return res.status(200).json(data);
};

export default {
    res,
    healthRes
};
