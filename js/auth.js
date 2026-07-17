import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

export async function login(email, password){

    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}
