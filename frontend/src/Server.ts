import { setUser } from "@sentry/react"

import jwt_decode from "jwt-decode";
type Permission = number;
const LANGUAGE_KEY = "tk-lang"
const COUNTRY_KEY = "tk-country";
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth';
const HIDDEN_USERNAME = "USERNAME HIDDEN";
type UserToken = {
    exp: number;
    username: string;
    id: number;
    rights: number;
}

const checkToken = (token: string) => {
    try {
        const decoded: UserToken = jwt_decode(token);
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
type Feedback = {
    uiScore: number;
    performanceScore : number;
    whyBetterFeedback : string;
    newFeatureFeedbac : string;
}
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if(res.ok){
        const data = await res.json();
        if(data.success) return data;
        throw new Error(data.detail);
    } else {
        var err = null;
        try {
            const data = await res.json();
            err = data.detail
        } catch (error) {
            err = error;
        }
        throw new Error(err);
    }
};
const deleteCookie = (name: string) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
type LanguageObject = {
    [key: string]: string;
} | null;
type Option = {id : string; label : string};
const PERMISSIONS: { [key: string]: Permission } = {
    TASK: 1 << 0,
    STATS: 1 << 1,
    CATEGORY: 1 << 2,
    TOPIC: 1 << 3,
    GRANT: 1 << 4,
    CAMPAIGN : 1 << 5
};
class BaseServer {
    static RIGHTS = PERMISSIONS;
    static languages: LanguageObject = null;
    static countries: LanguageObject = null;
    static async init() {
        if (!BaseServer.languages || !BaseServer.countries) {
            const localStorageCountries = localStorage.getItem(COUNTRY_KEY);
            const localStorageLanguages = localStorage.getItem(LANGUAGE_KEY);
            if (!localStorageCountries || !localStorageLanguages || localStorageCountries === "undefined" || localStorageLanguages === "undefined") {
                console.log("Fetching languages and countries")
                const countries = await fetch("/api/country").then(res => res.json()).then(res => res.data);
                const languages = await fetch("/api/language").then(res => res.json()).then(res => res.data);
                localStorage.setItem(LANGUAGE_KEY, JSON.stringify(languages));
                localStorage.setItem(COUNTRY_KEY, JSON.stringify(countries));
            }
            BaseServer.languages = JSON.parse(localStorage.getItem(LANGUAGE_KEY) || "{}");
            BaseServer.countries = JSON.parse(localStorage.getItem(COUNTRY_KEY) || "{}");
        }
    }
    static getCurrentTime(days: number = 0) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }
    static loginnedUser() {
        const authCookie = document.cookie.split('; ').find(row => row.startsWith(AUTH_COOKIE_NAME));
        if (authCookie) {
            const token = authCookie.split('=')[1];
            const decoded = checkToken(token);
            setUser({
                username: decoded?.username,
                id: decoded?.id
            });
            return decoded;
        } else
            setUser(null);
    }
    static isUsernameHidden() {
        const user = BaseServer.loginnedUser();
        return user && user.username == HIDDEN_USERNAME;
    }
    static hasAccess(rights: Permission, permission: Permission) {
        return (rights & permission) == permission;
    }
    static hasRight(permission: Permission){
        const user = BaseServer.loginnedUser();
        return user && BaseServer.hasAccess(user.rights, permission);
    }
    static toggleAccess(rights : number, permission : number){
        return rights & permission ? rights & ~permission : rights | permission;
    }
    static getWikiList(exclude: string[] = []): Option[] {
        const languages = [];
        for (const key in BaseServer.languages) {
            if (exclude.includes(key)) continue;
            const value = BaseServer.languages[key];
            languages.push({ id: key, label: `${value} (${key})` });
        }
        languages.sort((a, b) => a.label.localeCompare(b.label));
        return languages;
    }
    static async sendFeedback(feedback : Feedback){
        return await fetchWithErrorHandling("/api/feedback", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(feedback)
        });

    }
    static logout() {
        deleteCookie(AUTH_COOKIE_NAME);
        localStorage.removeItem(LANGUAGE_KEY);
        localStorage.removeItem(COUNTRY_KEY);
        document.location.href = "/login/?callback=" + encodeURIComponent(document.location.href);

    }
}
export default BaseServer;
