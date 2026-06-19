const authRepositories = require('../repositories/auth.repositories');
const bcrypt = require('bcrypt');

const registerUser = async (userData) => {

    const checkUser = await authRepositories.findUserByEmail(userData.email);

    if (checkUser) {
        throw new Error("User already created.")
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);


    return await authRepositories.createUser([
        userData.name,
        userData.email,
        hashedPassword,
        false,
        userData.profile_image,
        userData.auth_provider
    ]);

}



module.exports = {
    registerUser
}