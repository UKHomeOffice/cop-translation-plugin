import JSONPath from 'jsonpath';
import * as logger from "../config/winston";

export default class JsonPathEvaluator {

    constructor() {
        this.performJsonPathEvaluation = this.performJsonPathEvaluation.bind(this);
    }

    performJsonPathEvaluation({key, value}, dataContext, intercept = (value) => {return value;}) {
        if (JsonPathEvaluator.regExp.test(value)) {
            const updatedValue = value.replaceAll(JsonPathEvaluator.regExp, (match, capture) => {
                let val = JSONPath.value(dataContext, capture);
                logger.debug("JSON path '%s' detected for '%s' with parsed value '%s'", capture, key, (val ? val : "no match"));
                return intercept(val);
            });
            return (updatedValue === 'null' || updatedValue === 'undefined') ? null : updatedValue;
        } else {
            return value;
        }
    }

}
String.prototype.replaceAll = function (search, replacement) {
    const target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
JsonPathEvaluator.regExp = new RegExp('\\{(.+?)\\}');
