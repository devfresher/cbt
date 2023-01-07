import User from "../models/user.js"

export const getOneUser = async (userId) => {
    const user = await User.findById(userId)
    if (!user) throw {
        status: "error",
        error: {
            code: 404,
            message: "User not found"
        }
    }

    return user
}