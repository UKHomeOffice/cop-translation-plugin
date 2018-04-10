import axios from "axios/index";

const getUserDetails = async (email, headers) => {
    const response = await axios({
        url: `${process.env.REFERENCE_DATA_URL}/api/reference-data/staffattributes?_join=inner:person:staffattributes.personid:$eq:person.personid&staffattributes.email=${email}`,
        method: 'GET',
        headers: headers
    });
    return response.data ? response.data[0] : null;
};

export {
    getUserDetails
}