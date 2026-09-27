const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user._admin)
        {
            return res.status(403).json({ message: "Not authorized for this action."})
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};