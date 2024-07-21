const fs = require('fs-extra');

const readHTMLcontent = async (path) => {
    try {
        console.log(path);
        const data = await fs.readFile(path, 'utf8');
        return data;
    } catch (error) {
        console.log(error);
        return `An error occured while sending email ${error}`;
    }
}

module.exports = {readHTMLcontent};