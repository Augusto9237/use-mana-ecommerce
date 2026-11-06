import { auth } from "@/lib/auth";

export const newUser = await auth.api.createUser({
    body: {
        email: "user@example.com", // required, The email of the user.
        password: "some-secure-password", // required, The password of the user.
        name: "James Smith", // required, The name of the user.
        role: "user", // A string or array of strings representing the roles to apply to the new user.
        data: { customField: "customValue" }, // Extra fields for the user. Including custom additional fields.
    },
});