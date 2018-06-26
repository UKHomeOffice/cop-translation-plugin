import axios from "axios";

import * as logger from 'winston';


const getStaffDetails = async (email) => {
    try {
        const response = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/staffview?email=eq.${email}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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

const getLocation = async (locationid) => {
    const locationDetails = await axios({
        url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/rf_location?locationid=eq.${locationid}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return locationDetails ? locationDetails.data[0] : null;
};


const getLocationType = async(bflocationtypeid) => {
    const locationType = await axios({
        url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/rf_bflocationtype/${bflocationtypeid}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return locationType ? locationType.data : null;

};

const getShiftDetails = async (email) => {
    try {
        const response = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/shift?email=eq.${email}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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

