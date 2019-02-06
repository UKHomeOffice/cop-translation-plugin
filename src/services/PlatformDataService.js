import axios from "axios";

import * as logger from "../config/winston";

export default class PlatformDataService {
    constructor(){
        this.getStaffDetails = this.getStaffDetails.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.getLocationType = this.getLocationType.bind(this);
        this.getShiftDetails = this.getShiftDetails.bind(this);
    }

    async getStaffDetails(email, headers) {
        try {
            const response = await axios({
                url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/rpc/staffdetails`,
                data: {
                  'argstaffemail': email
                },
                method: 'POST',
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

    async getLocation (locationid, headers)  {
        const locationDetails = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/rf_location?locationid=eq.${locationid}`,
            method: 'GET',
            headers: headers
        });
        return locationDetails ? locationDetails.data[0] : null;
    };


    async getLocationType (bflocationtypeid, headers) {
        const locationType = await axios({
            url: `${process.env.PLATFORM_DATA_URL}/api/platform-data/rf_bflocationtype?bflocationtypeid=eq.${bflocationtypeid}`,
            method: 'GET',
            headers: headers
        });
        return locationType && locationType.data ? locationType.data[0] : null;

    };

    async getShiftDetails (email, headers)  {
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


}
