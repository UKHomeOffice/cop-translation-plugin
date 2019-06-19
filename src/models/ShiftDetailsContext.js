import  logger from "../config/winston";

class ShiftDetailsContext {
    constructor(shift, location, locationtype) {
        this.createQueryParameter = this.createQueryParameter.bind(this);
        if (shift) {
            Object.keys(shift).forEach(key => {
                this[key] = shift[key];
            });
        }
        if (location) {
            this.currentlocationname = location.locationname;
            this.currentlocationunlocodeid = location.unlocodeid;
            this.currentlocationdescription = location.description;
            this.currentlocationgeolat = location.geolat;
            this.currentlocationgeolong = location.getlong;
        }

        if (locationtype) {
            this.portclassificationquery = this.createQueryParameter(locationtype)
        }
    }

    createQueryParameter(locationtype) {
        const query =  `&seaport=eq.${locationtype.seaport}&railterminal=eq.${locationtype.railterminal}` +
            `&airport=eq.${locationtype.airport}&postexchange=eq.${locationtype.postexchange}&fixedtransport=eq.${locationtype.fixedtransport}`
            + `&bordercrossing=eq.${locationtype.bordercrossing}&roadterminal=eq.${locationtype.roadterminal}`;

        logger.info(`query create for location type`, {query: query});

        return query;
    }
}


export default ShiftDetailsContext;
