
// Extracts and returns the price from a list of possible elements.
const extractPrice = (...elements) => {
    for (const element of elements) {
        const priceText = element.text().trim();
    
        if(priceText) {
          const cleanPrice = priceText.replace(/[^\d.]/g, '');
    
          let firstPrice; 
    
          if (cleanPrice) {
            firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
          } 
    
          return firstPrice || cleanPrice;
        }
      }
    
    return '';
}

// Extracts and returns the currency symbol from an element.
const extractCurrency = (element) => {
    const currencyText = element.text().trim().slice(0, 1);
    return currencyText ? currencyText : "";
}

// Extracts description from two possible elements from amazon
const extractDescription = ($) => {
    // these are possible elements holding description of the product
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    // Add more selectors here if needed
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_ , element) => $(element).text().trim())
        .get()
        .join("\n");
      return textContent;
    }
  }

  // If no matching elements were found, return an empty string
  return "";
}

const getHighestPrice = (priceList) => {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

const getLowestPrice = (priceList) => {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

const getAveragePrice = (priceList) => {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

module.exports = {
    extractPrice,
    extractCurrency,
    extractDescription,
    getHighestPrice,
    getLowestPrice,
    getAveragePrice,
};