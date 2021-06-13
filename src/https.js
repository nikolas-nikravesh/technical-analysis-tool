const axios = require('axios');

async function get(url) {
    let response = null;
    let data = null;
    try {
		response = await axios.get(url);
		data = response.data;
	} catch (error) {
		console.error(error);
	} finally {
        console.log(`GET: ${response.status} ${response.statusText}`);
        return data;
    }
}

module.exports = { get };