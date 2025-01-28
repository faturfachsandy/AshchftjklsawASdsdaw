import fs from "fs";
import puppeteer from "puppeteer";

//command for scrap 'node getCctvSession.js yuda' or 'node getCctvSession.js fatur'

const scrappData = async () => {
    try {
        console.info('=== MEMBUKA BROWSER');

        //choosing browser between yuda and fatur 
        const args = process.argv;
        let dirBrowser = '';
        if (args[2] === 'yuda') {
            dirBrowser = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        }else if (args[2] === 'fatur') {
            dirBrowser = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        }else {
            dirBrowser = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        }

        const browser = await puppeteer.launch({
            headless: false,
            executablePath: dirBrowser
            //use this for yuda version '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            //use this for fatur version 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        });
    
        const webDiskominfo = await browser.newPage();
        
        await webDiskominfo.setCacheEnabled();
    
        webDiskominfo.setDefaultNavigationTimeout(0);

        console.info('=== MEMBUKA WEB DISKOMINFO');

        await webDiskominfo.goto("https://backend.samagov.id/api/cctv/IbwQX8ZFsBvYrB-30XJyD/stream");
        //alternative "https://backend.samagov.id/api/cctv/IbwQX8ZFsBvYrB-30XJyD/stream"
        //old https://diskominfo.samarindakota.go.id/media/cctv/simpang-lembuswana

        console.info('=== MENDAPATKAN SOURCE VIDEO');
    
        const cctvSource = await webDiskominfo.evaluate(() =>{
            const videoPlayer = document.getElementById('video_stream')
    
            if (videoPlayer) {
                return videoPlayer.getAttribute('src')
            }
    
            return '';
        });

        let session = 'xxx';

        if (cctvSource) {
            const cutting = cctvSource.split('?');

            const queryParams = new URLSearchParams(cutting[1]);

            session = queryParams.get('session');
        }

        console.info(`# SESSION : ${session}`);

        console.info('=== MENUTUP BROWSER');
    
        await browser.close();
    
        console.log('=== SIMPAN KE FILE TXT / MULAI');
    
        const fileTXT = 'cctvSamarindaSession.txt'
    
        fs.writeFile(fileTXT, session, (err) => {
            if (err) {
                throw err
            }
        })
        console.log('=== SIMPAN KE FILE TXT / SELESAI');
    } catch (error) {
        console.error('Error during scrappData execution:', error);
    }
}

scrappData();