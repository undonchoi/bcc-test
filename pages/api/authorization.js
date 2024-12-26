import jsSHA from "jssha";
import {randomBytes} from 'crypto';

// 4899939998491778 04/27 917

const MY_URL = 'https://bcc-test.yoshop.net:443';
// const MY_URL = 'http://localhost:3000';
const API_URL = 'https://test3ds.bcc.kz:5445/cgi-bin/cgi_link';
const MAC_KEY = '6BB0AC02E47BDF73D98FEB777F3B5294';
const CURRENCY = '398';
const TERMINAL = '88888881';
const MERCHANT = 'finenex';
const MERCH_NAME = 'TOO "FINENEX"';
const MERCH_URL = 'https://www.finenex.net';
const COUNTRY = 'KZ';
const BRANDS = 'VISA, Mastercard';
const MERCH_GMT = '+5';
const LANG = 'ru';

function sign(...fields) {
    const data = fields.map(i => `${i.length}${i}`).join('');
    const shaObj = new jsSHA("SHA-1", "TEXT");
    shaObj.setHMACKey(MAC_KEY, "HEX");
    shaObj.update(data);
    const signed = shaObj.getHMAC("HEX").toUpperCase();
    console.log(`sign: ${data} => ${signed}`)
    return signed;
}

function getTimestamp() {
    const now = new Date();
    return now.getUTCFullYear().toString().padStart(4, '0') +
        (now.getUTCMonth() + 1).toString().padStart(2, '0') +
        now.getUTCDate().toString().padStart(2, '0') +
        now.getUTCHours().toString().padStart(2, '0') +
        now.getUTCMinutes().toString().padStart(2, '0') +
        now.getUTCSeconds().toString().padStart(2, '0');
}

function getNonce() {
    return randomBytes(16).toString('hex').toUpperCase();
}

function logCurlCommand(params) {
    let cmd = `curl --location '${API_URL}'`;

    for (let key of params.keys()) {
        cmd += ` \\\n  --data-urlencode '${key}=${params.get(key)}'`;
    }

    console.log(cmd);
}

async function request({amount, order, description, clientIp}) {
    const TR_TYPE = '0';
    const timestamp = getTimestamp();
    const nonce = getNonce();
    const signature = sign(amount, CURRENCY, order, MERCHANT, TERMINAL, COUNTRY, MERCH_GMT, timestamp, TR_TYPE, nonce);
    const mobileInfo = btoa(JSON.stringify({
        'browserScreenHeight': '1920',
        'browserScreenWidth': '1080',
        'mobilePhone': {
            'cc': '7',
            'subscriber': '7475558888'
        }
    }));

    const params = new URLSearchParams();
    params.append('AMOUNT', amount);
    params.append('CURRENCY', CURRENCY);
    params.append('ORDER', order);
    params.append('DESC', description);
    params.append('MERCHANT', MERCHANT);
    params.append('MERCH_NAME', MERCH_NAME);
    params.append('MERCH_URL', MERCH_URL);
    params.append('COUNTRY', COUNTRY);
    params.append('BRANDS', BRANDS);
    params.append('TERMINAL', TERMINAL);
    params.append('TIMESTAMP', timestamp);
    params.append('MERCH_GMT', `+${MERCH_GMT}`);
    params.append('TRTYPE', TR_TYPE);
    params.append('BACKREF', `${MY_URL}/api/purchase`);
    params.append('JUST', LANG);
    params.append('NONCE', nonce);
    params.append('P_SIGN', signature);
    params.append('MK_TOKEN', 'MERCH');
    params.append('NOTIFY_URL', `${MY_URL}/api/notify`);
    params.append('CLIENT_IP', clientIp);
    params.append('M_INFO', mobileInfo);
    logCurlCommand(params);

    const response = await fetch(API_URL, {
        method: 'POST', body: params, redirect: 'follow'
    });
    return await response.text();
}

export default async function handler(req, res) {
    console.log(`remote address: ${req.socket.remoteAddress}`);
    res.status(200).end(await request({
        amount: req.query.amount ?? '50.00',
        order: req.query.order ?? (Math.floor(Math.random() * 999999) + 1000000).toString(),
        description: req.query.description ?? 'Test',
        clientIp: req.socket.remoteAddress ?? '127.0.0.1'
    }));
}