const isValidAmazonProductURL = (url) => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;

        if(hostname.includes('amazon.com') || hostname.includes('amazon.') || hostname.includes('amazon')) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

module.exports = isValidAmazonProductURL;