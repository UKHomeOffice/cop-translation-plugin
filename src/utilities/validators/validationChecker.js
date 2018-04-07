import { ERROR_STATUS } from '../../utilities/constants';

const areRequired = (req, params) => {
  params.forEach((param) => {
    req.assert(param, `${param} is required`).notEmpty();
  });
};


const isBoolean = (req, param) => {
  if (typeof req.param(param) === 'undefined' || req.param(param) === null) {
    req.assert(param, ERROR_STATUS.INVALID_PARAMETER).isBoolean();

  }
};


export default {
  areRequired,
  isBoolean,
};
