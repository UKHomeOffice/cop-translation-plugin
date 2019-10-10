import axios from "../utilities/axios";

import  logger from "../config/winston";

export default class PlatformDataService {

    constructor(config) {
       this.config = config;

    }


    async getStaffDetails(email, headers) {
        try {
            const response = await axios({
                url: `${this.config.services.operationalData.url}/v1/rpc/staffdetails`,
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
            url: `${this.config.services.referenceData.url}/v1/entities/location?id=eq.${locationid}`,
            method: 'GET',
            headers: headers
        });
        return locationDetails ? locationDetails.data.data[0] : null;
    }


    async getLocationType (bflocationtypeid, headers) {
        const locationType = await axios({
            url: `${this.config.services.referenceData.url}/v1/entities/bflocationtype?id=eq.${bflocationtypeid}`,
            method: 'GET',
            headers: headers
        });
        const returnValue = locationType && locationType.data ? locationType.data.data[0] : null;
        return returnValue;
    }

    async getShiftDetails (email, headers)  {
        try {
            const response = await axios({
                url: `${this.config.services.operationalData.url}/v1/shift?email=eq.${email}`,
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

    async getIntegrityLeadEmails(branchId, headers)  {
        try {
            const response = await axios({
                url: `${this.config.services.operationalData.url}/v1/view_rolemembers?select=email&rolelabel=eq.bfint,&branchid=eq.${branchId}`,
                method: 'GET',
                headers: headers
            });
            const integrityLeadEmails = response.data ? response.data.map(val => val.email) : null;
            logger.info(`Integrity lead emails found`, integrityLeadEmails);
            return integrityLeadEmails;
        } catch (err) {
            logger.error('Failed to get integrity lead emails ', err);
            return null;
        }
    }

    async getExtendedStaffDetails(staffId, headers)  {
        try {
            const response = await axios({
                url: `${this.config.services.operationalData.url}/v1/rpc/extendedstaffdetails`,
                method: 'POST',
                headers: headers,
                data: {
                    argstaffid: staffId
                }
            });
            const extendedStaffDetails = response.data ? response.data[0] : null;
            logger.info(`Extended staff details found`, extendedStaffDetails);
            return extendedStaffDetails;
        } catch (err) {
            logger.error('Failed to get extended staff details ', err);
            return null;
        }
    }


}
