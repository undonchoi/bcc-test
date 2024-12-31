import jsSHA from "jssha";
import { randomBytes } from "crypto";

// 4899939998491778 04/27 917

export const MY_URL = 'https://bcc-test.yoshop.net:443';
// const MY_URL = 'http://localhost:3000';
const TEST_API_URL = 'https://test3ds.bcc.kz:5445/cgi-bin/cgi_link';
const API_URL = 'https://3dsecure.bcc.kz:5443/cgi-bin/cgi_link';
const TEST_MAC_KEY = '6BB0AC02E47BDF73D98FEB777F3B5294';
const MAC_KEY = '63FE8777F32F87B998A295A942AD58E1';

export function newOrderNo() {
  return (Math.floor(Math.random() * 899999) + 100000).toString()
}

export function mobileInfo(w, h, cc, subscriber) {
  return btoa(JSON.stringify({
    'browserScreenHeight': w,
    'browserScreenWidth': h,
    'mobilePhone': {
      'cc': cc,
      'subscriber': subscriber,
    },
  }));
}

function sign(fields, macKey) {
  const data = fields.map(i => `${i.length}${i}`).join('');
  const shaObj = new jsSHA("SHA-1", "TEXT");
  shaObj.setHMACKey(macKey, "HEX");
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

function logCurlCommand(url, params) {
  let cmd = `curl --location '${url}'`;

  for (let key of params.keys()) {
    cmd += ` \\\n  --data-urlencode '${key}=${params.get(key)}'`;
  }

  console.log(cmd);
}

export async function request(data, isReal) {
  const params = new URLSearchParams();
  let signKeys;

  for (const key in data) {
    params.append(key, data[key]);
  }

  const timestamp = getTimestamp();
  const nonce = getNonce();
  params.append('TIMESTAMP', timestamp);
  params.append('NONCE', nonce);

  switch (data.TRTYPE) {
    case '0':
      signKeys = [
        'AMOUNT',
        'CURRENCY',
        'ORDER',
        'MERCHANT',
        'TERMINAL',
        'COUNTRY',
        'MERCH_GMT',
        'TIMESTAMP',
        'TRTYPE',
        'NONCE'];
      break;
    case '1':
      signKeys = [
        'AMOUNT',
        'CURRENCY',
        'ORDER',
        'MERCHANT',
        'TERMINAL',
        'MERCH_GMT',
        'TIMESTAMP',
        'TRTYPE',
        'NONCE'];
      break;
    case '14':
      signKeys = [
        'ORDER',
        'AMOUNT',
        'AMOUNT',
        'CURRENCY',
        'RRN',
        'INT_REF',
        'TERMINAL',
        'TIMESTAMP',
        'TRTYPE',
        'NONCE'];
      break;
    default:
      throw new Error(`${data.TRTYPE} is not supported`);
  }

  const sig = sign(signKeys.map((key) => {
    if (!params.get(key)) {
      throw new Error(`sign failed: ${key} not found`);
    }

    return params.get(key)
  }), isReal ? MAC_KEY : TEST_MAC_KEY);
  params.append('P_SIGN', sig);
  const url = isReal ? API_URL : TEST_API_URL;
  logCurlCommand(url, params);

  const response = await fetch(url, {
    method: 'POST', body: params, redirect: 'follow',
  });
  return await response.text();
}
