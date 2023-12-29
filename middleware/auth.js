import jwt from 'jsonwebtoken';
import config from 'config';

const jwtVerify = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) 
        {
            return res.status(401).send('Access denied. No token provided.');
        }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user; //user data stored in req.user
        next();
    } catch (err) {
            res.status(400).send('Invalid token.');
        }
}

export default jwtVerify;