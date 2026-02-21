const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    try {
        await page.goto('http://localhost:3000/recruiter/signin', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));

        const html = await page.evaluate(() => {
            return document.getElementById('root') ? document.getElementById('root').innerHTML : 'No root';
        });
        fs.writeFileSync('test_output.html', html);
        console.log('Saved to test_output.html');

    } catch (e) {
        console.error('Error:', e.message);
    }
    await browser.close();
})();
