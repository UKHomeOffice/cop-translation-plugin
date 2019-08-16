import  logger from "../config/winston";

export default class ContentComponentVisitor {

    constructor(jsonPathEvaluator, dataDecryptor) {
        this.jsonPathEvaluator = jsonPathEvaluator;
        this.dataDecryptor = dataDecryptor;
    }

    visit(formComponent) {
        const component = formComponent.component;
        const dataResolveContext = formComponent.dataContext;
        const value = component.html;
        const key = component.key;
        const processContent = (value) => {
            if (formComponent.isEncrypted()) {
                logger.info(`Encrypted field detected ${key}`);
                try {
                    value = this.dataDecryptor.decrypt('hardcodedBusinessKey', Buffer.from(value, 'base64'));
                } catch (err) {
                    logger.error(`Failed to decrypt value  ${err.toString()}...returning encrypted value`);
                }
            }
            if (formComponent.isImage()) {
                value = value ?
                    `data:image/${formComponent.imageType()};base64,${value.toString('base64')}` :
                    `data:image/png;base64,${ContentComponentVisitor.defaultImg}`;
            }
            return value ? value.toString('base64') : undefined;
        };

        component.html = this.jsonPathEvaluator.performJsonPathEvaluation({key, value},
            dataResolveContext,
            //processContent
            );
    }
}

ContentComponentVisitor.defaultImg = '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';

