import ListGeneratorServer from './FnF/Server';

import jwt_decode from "jwt-decode";
type Permission = number;
const LANGUAGE_KEY = "tk-lang"
const COUNTRY_KEY = "tk-country";
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth';
const checkToken = (token: string) => {
    try {
        const decoded: { exp: number; } = jwt_decode(token);
        // check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.log("Token expired");
            return null;
        }
        return decoded;
    } catch (e) {
        console.log(e);
        return null;
    }
}
const deleteCookie = (name : string) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
const PERMISSIONS: { [key: string]: Permission } = {
    TASK: 1 << 0,
    STATS: 1 << 1,
    CATEGORY: 1 << 2,
    TOPIC: 1 << 3,
    GRANT: 1 << 4,
    REVOKE: 1 << 5,
};
class BaseServer {
    static RIGHTS = PERMISSIONS;
    static loginnedUser() {
        const authCookie = document.cookie.split('; ').find(row => row.startsWith(AUTH_COOKIE_NAME));
        if (authCookie) {
            const token = authCookie.split('=')[1];
            const decoded = checkToken(token);
            return decoded;
        }
    }
    static hasAccess(rights: Permission, permission: Permission) {
        return (rights & permission) == permission;
    }
    static logout() {
        deleteCookie(AUTH_COOKIE_NAME);
        localStorage.removeItem(LANGUAGE_KEY);
        localStorage.removeItem(COUNTRY_KEY);
        document.location.href = "/";
    }
}
export default BaseServer;