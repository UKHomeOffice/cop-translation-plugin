import JsonPathEvaluator from "../../src/form/JsonPathEvaluator";
import chai from 'chai';

describe('JSON Path Evaluator', () => {
    const jsonPathEvaluator = new JsonPathEvaluator();
    const expect = chai.expect;

    it('can process value with intercept function', () => {

        const key = 'fieldA';
        const value = '{$.processContext.myVariable.name}';
        const dataContext = {
            processContext: {
                myVariable: {
                    name: 'hello'
                }
            }
        };
        const result = jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext, (value) => {
            return value + ' with name';
        });
        expect(result).to.equal('hello with name');

    });
    it ('can process multiple expression in one field', () => {
        const key = 'fieldA';
        const value = '{$.processContext.myVariable.name} {$.processContext.anotherVariable.value}';
        const dataContext = {
            processContext: {
                myVariable: {
                    name: 'hello'
                },
                anotherVariable: {
                    value: 'goodbye'
                }
            }
        };
        const result = jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);
        expect(result).to.equal('hello goodbye');

    });
    it('can process value with no intercept function', () => {

        const key = 'fieldA';
        const value = '{$.processContext.myVariable.name}';
        const dataContext = {
            processContext: {
                myVariable: {
                    name: 'hello'
                }
            }
        };

        const result = jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);
        expect(result).to.equal('hello');

    });
    it('can process value with formio {{substitution}}', () => {

        const key = 'fieldA';
        const value = '{{data.value}}';
        const dataContext = {
            processContext: {
                myVariable: {
                    name: 'hello'
                }
            }
        };

        const result = jsonPathEvaluator.performJsonPathEvaluation({key, value}, dataContext);
        expect(result).to.equal('{{data.value}}');

    });
});

