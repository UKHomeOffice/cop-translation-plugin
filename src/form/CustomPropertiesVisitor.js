import logger from "../config/winston";
export default class CustomPropertiesVisitor {

    visit(formComponent) {
        const component = formComponent.component;
        if (component.properties) {
            logger.debug(`Applying custom properties to component`)
            Object.keys(component.properties).forEach((key) => {
                const propertyValue = component.properties[key];
                logger.debug(`Adding '${key}' with value '${propertyValue}' to select component [${component.name}]`);
                component[key] = propertyValue;
            });
        }
    }
}
