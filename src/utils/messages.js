const generateMessage = (message, username = '') => ({
    username,
    message,
    createdAt: new Date().getTime()
});

module.exports = {
    generateMessage
}