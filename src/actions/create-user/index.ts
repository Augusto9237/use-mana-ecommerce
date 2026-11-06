'use server';
import { auth } from "@/lib/auth";

type CreateUserParams = {
    email: string;
    password: string;
    name: string;
    role?: "user" | "admin" | ("user" | "admin")[] | undefined
};

export async function createUser({ email, password, name, role }: CreateUserParams) {
    try {
        const newUser = await auth.api.createUser({
            body: {
                email: email, // required, The email of the user.
                password: password, // required, The password of the user.
                name: name, // required, The name of the user.
                role: role, // A string or array of strings representing the roles to apply to the new user.
            }
        })

        return {
            success: true,
            data: newUser
        }

    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            error: error
        }
    }
}