import axios from "../utilities/axios";

import  logger from "../config/winston";

export default class PlatformDataService {

    constructor(config) {
       this.config = config;

    }


    async getStaffDetails(email, headers) {
        try {
            const response = await axios({
                url: `${this.config.services.operationalData.url}/rpc/staffdetails`,
                data: {
                  'argstaffemail': email
                },
                method: 'POST',
                headers: headers
            });
            const details = response.data ? response.data[0] : null;
            if (details) {
                logger.info(`Staff details found`, details);
            }
            return details
        } catch (err) {
            logger.error(`Failed to get staff details`, err);
            return null;
        }

    }

    async getLocation (locationid, headers)  {
        const locationDetails = await axios({
            url: `${this.config.services.referenceData.url}/location?id=eq.${locationid}`,
            method: 'GET',
            headers: headers
        });
        return locationDetails ? locationDetails.data.data[0] : null;
    }


    async getLocationType (bflocationtypeid, headers) {
        const locationType = await axios({
            url: `${this.config.services.referenceData.url}/bflocationtype?id=eq.${bflocationtypeid}`,
            method: 'GET',
            headers: headers
        });
        const returnValue = locationType && locationType.data ? locationType.data.data[0] : null;
        return returnValue;
    }

    async getShiftDetails (email, headers)  {
        try {
            const response = await axios({
                url: `${this.config.services.operationalData.url}/shift?email=eq.${encodeURIComponent(email)}`,
                method: 'GET',
                headers: headers
            });
            const shiftDetails = response.data ? response.data[0] : null;
            logger.info(`Shift details found`, shiftDetails);
            return shiftDetails;
        } catch (err) {
            logger.error(`Failed to get shift details `, err);
            return null;
        }

    }


}
