import {MY_URL, request} from "@/utils/common";

export default async function handler(req, res) {
    if (!req.query.AMOUNT || !req.query.ORDER || !req.query.RRN || !req.query.INT_REF) {
        throw new Error('Missing parameters');
    }

    const data = {
        ORG_AMOUNT: req.query.AMOUNT,
        AMOUNT: req.query.AMOUNT,
        CURRENCY: '398',
        ORDER: req.query.ORDER,
        MERCH_RN_ID: '',
        RRN: req.query.RRN,
        INT_REF: req.query.INT_REF,
        TERMINAL: '88888881',
        MERCH_GMT: '+5',
        TRTYPE: '14',
        BACKREF: 'javascript:history.back()',
        JUST: 'ru',
        NOTIFY_URL: `${MY_URL}/api/refunded`,
    }
    const isReal = req.query.MODE === 'R';
    res.status(200).end(await request(data, isReal));
}