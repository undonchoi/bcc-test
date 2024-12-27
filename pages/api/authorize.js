import {mobileInfo, MY_URL, newOrderNo, request} from "@/utils/common";

export default async function handler(req, res) {
    const isReal = req.query.MODE === 'R';
    const data = {
        AMOUNT: req.query.AMOUNT ?? '355.00',
        CURRENCY: '398',
        ORDER: req.query.ORDER ?? newOrderNo(),
        DESC: req.query.DESC ?? 'Test',
        MERCHANT: 'FINENEX',
        MERCHANT_NAME: 'TOO FINENEX',
        MERCH_URL: 'https://www.finenex.net',
        COUNTRY: 'KZ',
        BRANDS: 'VISA, Mastercard',
        TERMINAL: isReal ? '90033670' : '88888881',
        MERCH_GMT: '+5',
        TRTYPE: '0',
        BACKREF: 'javascript:history.back()',
        JUST: 'ru',
        MK_TOKEN: 'MERCH',
        NOTIFY_URL: `${MY_URL}/api/authorized`,
        CLIENT_IP: req.socket.remoteAddress ?? '0.0.0.0',
        M_INFO: mobileInfo(1920, 1080, '7', '7475558888'),
    };
    res.status(200).end(await request(data, isReal));
}