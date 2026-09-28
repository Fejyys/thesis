const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    let user = req.user;
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (!user._admin)
    {
        return res.status(403).json({ message: "Not authorized for this action."})
    }
        next();
};