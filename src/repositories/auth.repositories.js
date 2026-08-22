const { db, pool } = require('../config/dbconnection');


const createUser = async (userPayload, otpPayload) => {
    let client;

    try {
        client = await pool.connect();

        await client.query("BEGIN");
        const { name, email, password, is_verified, auth_provider } = userPayload;
        const { secureOtp, purpose, expireAt, verified } = otpPayload;

        const insertUserQuery = `
            INSERT INTO users (
                name,
                email,
                password,
                is_verified,
                auth_provider
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const { rows } = await client.query(
            insertUserQuery,
            [
                name, email, password, is_verified, auth_provider
            ]
        );

        const createdUser = rows[0];

        const insertOtpQuery = `
            INSERT INTO otp_verifications (
                user_id,
                otp_code,
                purpose,
                expires_at,
                verified
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const { rows: otpRows } = await client.query(
            insertOtpQuery,
            [createdUser.id, secureOtp, purpose, expireAt, verified]
        );

        const createdOtp = otpRows[0];

        await client.query("COMMIT");

        return {
            createdUser,
            createdOtp
        };
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

const updateUserVerified = async (userUpdateParams,
    otpUpdateParams
) => {
    let client;
    const { is_verified, id } = userUpdateParams;
    const { verified, id: OTPID, purpose } = otpUpdateParams

    try {

        client = await pool.connect();

        await client.query("BEGIN");

        //is_verified user
        const { rows: updatedUsers } = await client.query(
            `
        UPDATE users
        SET is_verified = $1
        WHERE id = $2
        AND is_verified = false
        RETURNING *
        `,
            [is_verified, id]
        );

        //verified the otp table 
        const { rows: updatedOTP } = await client.query(
            `
     

        UPDATE otp_verifications
        SET verified = $1
        WHERE id = $2
        AND purpose = $3
        AND verified = false
        RETURNING *
        `,
            [verified, OTPID, purpose]
        );

        await client.query("COMMIT");


        return {
            updatedUSERRes: updatedUsers[0],
            updatedOTPRes: updatedOTP[0]
        }

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }


};


const saveRefreshToken = async (payload) => {
   
        const {id,user_id,token_hash,expires_at,revoked} = payload
        const query = `INSERT into refresh_tokens (id,user_id,token_hash,expires_at,revoked) values ($1,$2,$3,$4,$5) RETURNING *`

        const { rows: saveToken } = await db(query, [id,user_id,token_hash,expires_at,revoked]);


        return saveToken[0];
}

const updateRefreshToken = async (payload) => {
   
        const {id,token_hash,expires_at,revoked} = payload
        const query =
         `
            UPDATE refresh_tokens 
            SET  token_hash  = $1,
            expires_at = $2,
            revoked  = $3
            where id = $4
            RETURNING *

         `

        const { rows: updateToken } = await db(query, [token_hash,expires_at,revoked,id]);


        return updateToken[0];
}

const findRefreshTokenEmail = async(user_id,id)=>{     
        const result = await pool.query(
            'SELECT * FROM refresh_tokens WHERE id = $1 && user_id = $2',
            [id,user_id]
        );
    return result.rows[0] || null;
}

const findRefreshTokenById = async (id, userId) => {
    const { rows } = await pool.query(
        `SELECT * FROM refresh_tokens 
         WHERE id = $1 AND user_id = $2 AND revoked = false`,
        [id, userId]
    );
    return rows[0] || null;
};

const DeleteRefreshTokenId = async(id)=>{     
        const result = await pool.query(
            'Delete FROM refresh_tokens WHERE id = $1',
            [id]
        );
    return result.rows[0] || null;
}


const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;

}


const findUserWithPasswordByEmail = async (email) => {
    const text = `
        SELECT id, name, email, password, is_verified, auth_provider
        FROM users
        WHERE email = $1
    `;
    const { rows } = await pool.query(text, [email]);
    return rows[0] || null;
};



const createOtp = async (data) => {
    try {
        const {user_id,otp_code,purpose,expires_at,verified} = data
        const query = `
        INSERT INTO otp_verifications
        (
            user_id,
            otp_code,
            purpose,
            expires_at,
            verified
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *;
    `;

        return await db(query, [user_id,otp_code,purpose,expires_at,verified]);
    } catch (error) {
        console.log("createUser error", error.message)
    }

};


const findOTPbyUserId = async (userId, purpose) => {
    // console.log("asasda", purpose)
    try {
        const text = `
        SELECT *
        FROM otp_verifications
        WHERE user_id = $1
        AND purpose = $2
        AND verified = false
        ORDER BY created_at DESC
        LIMIT 1
        `;

        const { rows } = await db(text, [userId, purpose]);
        return rows[0] || null
    } catch (error) {
        console.log("findUserByEmail error", error.message)
    }

}



const updateOTPbyUser = async (
    otpUpdateParams
) => {
    let client;


    const { otp_code, expires_at, id, purpose } = otpUpdateParams;
    try {

        client = await pool.connect();

        await client.query("BEGIN");

        //is_verified user

        const { rows: updatedOTP } = await client.query(
            `
        UPDATE otp_verifications
            SET
                otp_code = $1,
                expires_at = $2
            WHERE id = $3
                AND purpose = $4
                AND verified = false
            RETURNING *;
        `,
            [otp_code, expires_at, id, purpose]
        );

        await client.query("COMMIT");



        return {

            updatedOTPRes: updatedOTP[0]
        }

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }


};

const findUserById = async (id) => {
    const { rows } = await pool.query(
        `SELECT id, name, email, is_verified, auth_provider 
         FROM users WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
};




module.exports = {
    createUser,
    findUserByEmail,
    findOTPbyUserId,
    createOtp,
    updateUserVerified,
    saveRefreshToken,
    updateOTPbyUser,
    findUserWithPasswordByEmail,
    findRefreshTokenEmail,
    DeleteRefreshTokenId,
    updateRefreshToken,
    findRefreshTokenById,
    findUserById
}
