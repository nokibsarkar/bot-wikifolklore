import jwt_decode from "jwt-decode";
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth';
export const checkToken = (token) => {
    try {
      const decoded = jwt_decode(token);
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