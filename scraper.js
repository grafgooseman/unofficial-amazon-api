import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const testUrl = "https://www.amazon.ca/WHOOSH-Screen-Cleaner-Premium-Microfiber/dp/B0874X5Q6Z";
const testUrl = "https://www.amazon.ca/Apple-AirPods-Charging-Latest-Model/dp/B07PXGQC1Q/ref=sr_1_4";

const result = await beeRequest(testUrl);
console.log("Bee Request finished, status: ", result[0].status);

console.log(result[0].data);
const html = result[0].data;

// Create a DOM environment
const dom = new JSDOM(html);
const window = dom.window;
const document = window.document;
const bodyElement = document.querySelector('body');

// Remove all script and style elements from the body
const scriptElements = bodyElement.querySelectorAll('script');
const styleElements = bodyElement.querySelectorAll('style');

scriptElements.forEach(elem => elem.parentNode.removeChild(elem));
styleElements.forEach(elem => elem.parentNode.removeChild(elem));

// Get the cleaned HTML of the body
const cleanedBodyHtml = bodyElement.innerHTML;
// console.log(bodyHtml);

await writeHtmlToFile(cleanedBodyHtml);


console.log("End");



// Functions -------------------------------------------------------------------

async function beeRequest(url) {
    try {
        const data = await axios.get('https://app.scrapingbee.com/api/v1', {
            params: {
                'api_key': process.env.BEE_KEY,
                'url': url,
            }
        });
        return [data, null];
    } catch (error) {
        console.error('Error during the request: ', error.message);
        return [null, error];
    }
}

function writeHtmlToFile(bodyHtml) {
    // Define the directory and file name
    const directoryPath = join(__dirname, 'inspectOut');
    const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `inspect-${timeStamp}.html`;
    const filePath = join(directoryPath, fileName);

    // Ensure the directory exists
    mkdirSync(directoryPath, { recursive: true });

    // Write the HTML content to a file
    writeFileSync(filePath, bodyHtml, 'utf8');

}

function getTestHtml(){
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sample HTML Test</title>
        <style>
            /* CSS styles can go here */
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
            }
            h1 {
                color: #333;
            }
            p {
                color: #666;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>This is a Header</h1>
            <nav>
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </nav>
        </header>
    
        <main>
            <section>
                <h2>Section Heading</h2>
                <p>This is a paragraph within a section.</p>
            </section>
    
            <article>
                <h2>Article Heading</h2>
                <p>This is a paragraph within an article.</p>
            </article>
        </main>
    
        <aside>
            <h3>Aside Heading</h3>
            <p>This is a paragraph within an aside.</p>
        </aside>
    
        <footer>
            <p>&copy; 2024 Sample HTML Test</p>
        </footer>
    </body>
    </html>
    `
}