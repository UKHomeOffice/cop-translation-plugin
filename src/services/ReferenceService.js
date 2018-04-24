import axios from "axios/index";
import * as logger from 'winston';

const getUserDetails = async (email, headers) => {
    const response = await axios({
        url: `${process.env.REFERENCE_DATA_URL}/api/reference-data/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=${email}`,
        method: 'GET',
        headers: headers
    });
    const details =  response.data ? response.data[0] : null;
    if (details) {
        logger.info("User details found");
    }
    return details
};

export {
    getUserDetails
}