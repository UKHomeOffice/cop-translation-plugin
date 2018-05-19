const res = (err, {formName, form}, res) => {
    if (err) {
        return res.status(err.code).json(err.message);
    }
    if (!form) {
        return res.status(404).json({'message': `form ${formName} does not exist`});
    } else {
        return res.status(200).json(form);
    }
};

const healthRes = (err, data, res) => {
    if (err) {
        return res.status(err.code).json(err.message);
    }
    return res.status(200).json(data);
};

export default {
    res,
    healthRes
};
