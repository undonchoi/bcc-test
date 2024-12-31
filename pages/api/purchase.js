import { mobileInfo, MY_URL, newOrderNo, request } from "@/utils/common";

export default async function handler(req, res) {
  const isReal = req.query.MODE === 'R';
  const data = {
    AMOUNT: req.query.AMOUNT ?? '355.00',
    CURRENCY: '398',
    ORDER: req.query.ORDER ?? newOrderNo(),
    MERCH_RN_ID: '',
    DESC: req.query.DESC ?? 'Test',
    MERCHANT: 'FINENEX',
    MERCHANT_NAME: 'TOO FINENEX',
    TERMINAL: isReal ? '90033670' : '88888881',
    MERCH_GMT: '+5',
    TRTYPE: '1',
    BACKREF: `${MY_URL}/api/purchase${isReal ? '?MODE=R' : ''}`,
    JUST: 'ru',
    MK_TOKEN: 'MERCH',
    NOTIFY_URL: `${MY_URL}/api/purchased`,
    CLIENT_IP: '0.0.0.0', // req.socket.remoteAddress 그대로 사용하니 폰 브라우저에 문제가 되었음
    M_INFO: mobileInfo(req.query.WIDTH ?? 1920, req.query.HEIGHT ?? 1080,
      req.query.CC ?? '', req.query.PHONE ?? ''),
  };
  res.status(200).end(await request(data, isReal));
}