import axios from "axios/index";
import * as logger from 'winston';


const getStaffDetails = async (email) => {
    const response = await axios({
        url: `${process.env.PLATFORM_DATA_URL}/staffview?email=eq.${email}`,
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
    });
    const details =  response.data ? response.data[0] : null;
    if (details) {
        logger.info(`Staff details found... ${JSON.stringify(details)}`);
    }
    return details
};

export {
    getStaffDetails
}

