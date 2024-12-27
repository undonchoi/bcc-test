import {mobileInfo, MY_URL, newOrderNo, request} from "@/utils/common";

export default async function handler(req, res) {
    const data = {
        AMOUNT: req.query.AMOUNT ?? '50.00',
        CURRENCY: '398',
        ORDER: req.query.ORDER ?? newOrderNo(),
        MERCH_RN_ID: '',
        DESC: req.query.DESC ?? 'Test',
        MERCHANT: 'finenex',
        MERCHANT_NAME: 'TOO "FINENEX"',
        TERMINAL: '88888881',
        MERCH_GMT: '+5',
        TRTYPE: '1',
        BACKREF: 'javascript:history.back()',
        JUST: 'ru',
        MK_TOKEN: 'MERCH',
        NOTIFY_URL: `${MY_URL}/api/notify`,
        CLIENT_IP: req.socket.remoteAddress ?? '0.0.0.0',
        M_INFO: mobileInfo(1920, 1080, '7', '7475558888'),
    };
    const isReal = req.query.MODE === 'R';
    res.status(200).end(await request(data, isReal));
}