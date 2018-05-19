import axios from "axios/index";
import * as logger from 'winston';


const getStaffDetails = async (email) => {
    try {
        const response = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/staffview?email=eq.${email}`,
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
    } catch (err) {
        logger.error(`Failed to get staff details ${err.toString()}`);
        return null;
    }

};

const getShiftDetails = async(email) => {
    try {
        const response = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/shift?email=eq.${email}`,
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        });
        const details =  response.data ? response.data[0] : null;
        if (details) {
            logger.info(`Shift details found... ${JSON.stringify(details)}`);
        }
        return details
    } catch (err) {
        logger.error(`Failed to get shift details ${err.toString()}`)
        return null;
    }

};

export {
    getStaffDetails,
    getShiftDetails
}

