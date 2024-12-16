export default async function handler(req, res) {
    console.log(req);
    res.status(200).json({message: 'OK'});
}