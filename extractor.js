import { readFile } from 'fs/promises';
import { JSDOM } from 'jsdom';

const testHtmlFiles = [
    'inspect-test-amazon.html',
    'inspect-apple.html'
];


console.log('Extractor');

for (const file of testHtmlFiles) {
    const resultJson = {};

    // const html = await loadHtmlFromFile('inspect-test-amazon.html');
    const html = await loadHtmlFromFile(file);

    const dom = new JSDOM(html);
    const window = dom.window;
    const document = window.document;


    // Call the main function to perform the extractions
    Object.assign(resultJson, extractProductTitle(document));
    Object.assign(resultJson, extractBrandInfo(document));
    Object.assign(resultJson, extractAverageRating(document));
    Object.assign(resultJson, extractRatingsCount(document));
    Object.assign(resultJson, extractPrice(document));
    Object.assign(resultJson, checkAmazonChoice(document));
    Object.assign(resultJson, extractBoughtRecently(document));
    Object.assign(resultJson, { productDetails: extractProductDetails(document) });
    Object.assign(resultJson, { bulletPoints: extractBulletPoints(document) });
    Object.assign(resultJson, { amazonProductDetails: extractAmazonProductDetails(document) });

    console.log(`\n\n\n--${file}------------------------`);
    console.log(resultJson);
}




// Functions -------------------------------------------------------------------

async function loadHtmlFromFile(filename) {
    try {
        const htmlContent = await readFile(filename, 'utf8');

        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        return document.documentElement.outerHTML;
    } catch (error) {
        console.error('Failed to load HTML file:', error);
        throw error;
    }
}

function extractProductDetails(document) {
    const details = {};
    const rows = document.querySelectorAll("table.a-normal.a-spacing-micro tbody tr");

    if (!rows.length) {
        return { productDetails: null };
    }

    rows.forEach(row => {
        const key = row.querySelector("td.a-span3 span").textContent.trim();
        const value = row.querySelector("td.a-span9 span").textContent.trim();
        details[key] = value;
    });
    return details;
}

function extractBulletPoints(document) {
    const bullets = [];
    const bulletPoints = document.querySelectorAll("#feature-bullets ul.a-unordered-list.a-vertical.a-spacing-mini li span.a-list-item");

    if (!bulletPoints.length) {
        return { bulletPoints: null };
    }

    bulletPoints.forEach(bullet => {
        bullets.push(bullet.textContent.trim());
    });
    return bullets;
}

function extractAmazonProductDetails(document) {
    const details = [];
    let detailItems = {};


    // Return here
    // Finish this extraction and make it an express server. Small fron end.
    try {
        detailItems = document.querySelectorAll("#detailBullets_feature_div .a-unordered-list.a-nostyle.a-vertical.a-spacing-none.detail-bullet-list > li");
    } catch (error) {
        console.log('Error in extractAmazonProductDetails:', error.message);
        return { amazonProductDetails: null };
    }
    // detailItems = document.querySelectorAll("#detailBullets_feature_div .a-unordered-list.a-nostyle.a-vertical.a-spacing-none.detail-bullet-list > li");

    if (!detailItems.length) {
        console.log('No details found');
        return { amazonProductDetails: null };
    }

    detailItems.forEach(item => {
        const key = item.querySelector(".a-text-bold").textContent.replace(/[\s:‏‎]+$/g, '').trim();  // Clean up trailing colons and spaces
        const rawValue = item.textContent.replace(/[\s\S]*:/, '').trim();  // Remove everything before and including the colon to get the value
        const value = rawValue.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(); // Clean up newlines and reduce multiple spaces to a single space
        details.push({ key, value });
    });
    return details;
}

// Function to extract the product title
function extractProductTitle(document) {
    const productTitle = document.querySelector("#productTitle");
    if (productTitle) {
        return { title: productTitle.textContent.trim() };
    }
    return { title: null };
}

// Function to extract the brand information
function extractBrandInfo(document) {
    const brandLink = document.querySelector("#bylineInfo");
    if (brandLink) {
        return {
            brand: brandLink.textContent.trim(),
            brandLink: brandLink.href
        };
    }
    return { brand: null, brandLink: null };
}

// Function to extract the average rating
function extractAverageRating(document) {
    const rating = document.querySelector(".a-icon-star");
    if (rating) {
        const ratingText = rating.textContent.trim();
        const matches = ratingText.match(/([\d\.]+) out of 5 stars/);
        if (matches) {
            return { averageRating: parseFloat(matches[1]) };
        }
    }
    return { averageRating: null };
}

// Function to extract the number of ratings
function extractRatingsCount(document) {
    const ratingsCountElement = document.querySelector("#acrCustomerReviewText");
    if (ratingsCountElement) {
        const ratingsCountText = ratingsCountElement.textContent.trim();
        const numericRatings = ratingsCountText.replace(/[^\d]/g, '');
        return { ratingsCount: parseInt(numericRatings, 10) };
    }
    return { ratingsCount: null };
}

// Function to extract the price
function extractPrice(document) {
    // Selecting multiple possible price elements to account for different page structures
    const priceElements = document.querySelectorAll(".a-price .a-offscreen, .apexPriceToPay .a-offscreen, .priceToPay .a-offscreen");
    for (const priceElement of priceElements) {
        const priceText = priceElement.textContent.trim();
        // Improved regex to handle various currency formats more robustly
        const priceMatch = priceText.match(/^([^\d]+)?(\d+[\.,]?\d*)/);
        if (priceMatch) {
            return {
                currency: priceMatch[1] ? priceMatch[1].trim() : null,
                priceNumber: parseFloat(priceMatch[2].replace(',', '.')),
                price: priceText
            };
        }
    }
    return { currency: null, priceNumber: null, price: null };
}


// Function to check for Amazon's Choice badge
function checkAmazonChoice(document) {
    const amazonChoice = document.querySelector(".ac-badge-text-primary");
    return { amazonChoice: !!amazonChoice };
}

// Function to extract recently bought information
function extractBoughtRecently(document) {
    const boughtRecentlyElement = document.querySelector("#socialProofingAsinFaceout_feature_div .social-proofing-faceout-title-text span");
    if (boughtRecentlyElement) {
        return { boughtRecently: boughtRecentlyElement.textContent.trim() };
    }
    return { boughtRecently: null };
}
