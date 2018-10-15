import axios from "axios";

import * as logger from 'winston';


const getStaffDetails = async (email, headers) => {
    try {
        const response = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/staffview?email=eq.${encodeURIComponent(email)}`,
            method: 'GET',
            headers: headers
        });
        const details = response.data ? response.data[0] : null;
        if (details) {
            logger.info(`Staff details found... ${JSON.stringify(details)}`);
        }
        return details
    } catch (err) {
        logger.error(`Failed to get staff details ${err.toString()}`);
        return null;
    }

};

const getLocation = async (locationid, headers) => {
    const locationDetails = await axios({
        url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/rf_location?locationid=eq.${locationid}`,
        method: 'GET',
        headers: headers
    });
    return locationDetails ? locationDetails.data[0] : null;
};


const getLocationType = async(bflocationtypeid, headers) => {
    const locationType = await axios({
        url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/rf_bflocationtype?bflocationtypeid=eq.${bflocationtypeid}`,
        method: 'GET',
        headers: headers
    });
    return locationType && locationType.data ? locationType.data[0] : null;

};

const getShiftDetails = async (email, headers) => {
    try {
        const response = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/shift?email=eq.${encodeURIComponent(email)}`,
            method: 'GET',
            headers: headers
        });
        const shiftDetails = response.data ? response.data[0] : null;
        logger.info(`Shift details ${JSON.stringify(shiftDetails)}`);
        return shiftDetails;
    } catch (err) {
        logger.error(`Failed to get shift details ${err.toString()}`);
        return null;
    }

};

export {
    getStaffDetails,
    getShiftDetails,
    getLocation,
    getLocationType
}

