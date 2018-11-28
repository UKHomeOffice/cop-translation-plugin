import * as logger from "../config/winston";
import moment from "moment";

export default class DefaultValueComponentVisitor {

    constructor(jsonPathEvaluator) {
        this.jsonPathEvaluator = jsonPathEvaluator;
    }

    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;
        const key = component.key;
        if (component.defaultValue) {
            const value = component.defaultValue;
            component.defaultValue = this.jsonPathEvaluator.performJsonPathEvaluation({key, value},
                dataResolveContext,
                (value) => {
                    if (component.properties && component.properties['date-format']) {
                        const format = component.properties['date-format'];
                        logger.debug(format);
                        try {
                            value = moment(value).format(format);
                            logger.debug(`Date format property detected....${value}`);
                        } catch (err) {
                            logger.error(`Failed to format date ${err.toString()}`);
                        }
                    }
                    return value;
                });
        }
    }
}
