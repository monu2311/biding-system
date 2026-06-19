const db= require('../config/dbconnection');


const createUser = async (data) => {
    const query = `
        INSERT INTO users
        (
            name,
            email,
            password,
            is_verified,
            profile_image,
            auth_provider,
            
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *;
    `;

    return await db(query, data);
};

const findUserByEmail = async(email)=>{
    const text = `
      SELECT id, fullname, email, is_verified,
             profile_image, auth_provider
      FROM users
      WHERE email = $1
    `;

    return await db(text,[email]);
}


module.exports ={
    createUser,
    findUserByEmail
}
