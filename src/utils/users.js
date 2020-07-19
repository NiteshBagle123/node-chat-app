const users = [];

// addUser
const addUser = ({ id, username, room }) => {
    // validate data
    if(!username || !room) {
        return {
            error: 'User name and room is required'
        }
    }

    // clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // check for existing user
    const existingUser = users.find(user => user.room === room && user.username === username);
    if(existingUser){
        return {
            error: 'User name is in use'
        }
    }

    // store user
    const user = { id, username, room };
    users.push(user);

    return { user }
}

// removeUser
const removeUser = id => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
};

// getUser
const getUserById = id =>  users.find(user => user.id === id) || {};

// getUsersInRoom
const getUserByRoom = room => users.find(user => user.room === room) || [];

module.exports = {
    addUser,
    removeUser,
    getUserById,
    getUserByRoom
};



