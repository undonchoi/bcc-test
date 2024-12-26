export default async function handler(req, res) {
    console.log(await req.json());
    res.status(200).json({message: 'OK'});
}