const { db, pool } = require('../config/dbconnection');


const createUser = async (userPayload, otpPayload) => {
    let client;

    try {
        client = await pool.connect();

        await client.query("BEGIN");

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
            userPayload
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

        const otpParams = [
            createdUser.id,
            ...otpPayload
        ];

        console.log("OTP Purose", otpParams);
        const { rows: otpRows } = await client.query(
            insertOtpQuery,
            otpParams
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
            userUpdateParams
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
            otpUpdateParams
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
    try {

        const query = `INSERT into refresh_tokens (user_id,token_hash,expires_at,revoked) values ($1,$2,$3,$4) RETURNING *`

        const { rows: saveToken } = await db(query, payload);


        return saveToken[0];



    } catch (error) {
        throw error;
    }
}



const findUserByEmail = async (email) => {
    try {
        const text = `
      SELECT id, name, email, is_verified,
             profile_image, auth_provider
      FROM users
      WHERE email = $1
    `;

        return await db(text, [email]);
    } catch (error) {
        console.log("findUserByEmail error", error.message)
    }

}



const createOtp = async (data) => {
    try {
        console.log("data===>", data)
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

        return await db(query, data);
    } catch (error) {
        console.log("createUser error", error.message)
    }

};


const findOTPbyUserId = async (userId, purpose) => {
    console.log("asasda", purpose)
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
        return rows[0]
    } catch (error) {
        console.log("findUserByEmail error", error.message)
    }

}



const updateOTPbyUser = async (
    otpUpdateParams
) => {
    let client;



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
            otpUpdateParams
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



module.exports = {
    createUser,
    findUserByEmail,
    findOTPbyUserId,
    createOtp,
    updateUserVerified,
    saveRefreshToken,
    updateOTPbyUser
}
