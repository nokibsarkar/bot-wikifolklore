import BaseServer from "../Server.ts";
type Country = string
type ID = number
type Article = {
    id : ID;
    title : string;
    wikidata : string;
    target : string
}
type Category = {
    id : ID;
    title : string;
    subcat?: boolean
}

type APIResponseSingle<T> = {
    success : true;
    data : T;
    detail? : string;
}
type APIResponseMultiple<T> = {
    success : true;
    data : T[];
    detail? : string;
}
type User = {
    id : number;
    username : string;
    rights : number;
    created_at : string;
    article_count : number;
    category_count : number;
    task_count : number;
}
type TaskCreate = {
    home_wiki : string;
    target_wiki : string;
    country : Country;
    topic_id : string;
    categories : Category[],
    topic_data : Category[] 
}
type Task = {
    id: number,
    status: string,
    homewiki: string,
    categories: Array<string>,
    user: string,
    country: string,
    article_count: number
    category_count : number
    category_done : number
    last_category : string
}
type TaskResultFormat = "json" | "wikitext" | "csv"
type TaskResult = string | Article[]
type CountryEntry = {
    id : string;
    label : string;
    title : string;
}
type TopicCreate = {
    title : string;
    country : Country;
    categories : Category[];
}

type Topic = {
    id : string;
    title : string;
    country : Country;
    categories? : Category[];
}
const LANGUAGE_KEY = "tk-lang"
const COUNTRY_KEY = "tk-country"
type Permission = number;
const PERMISSIONS : {[key : string] : Permission} = {
    TASK : 1 << 0,
    STATS : 1 << 1,
    CATEGORY : 1 << 2,
    TOPIC : 1 << 3,
    GRANT : 1 << 4,
    REVOKE : 1 << 5,
};
class FnF {
    static baseURL = new URL(window.location.origin);
    static languages : Object | null = null;
    static countries : Object | null= null;
    static RIGHTS = PERMISSIONS;
    static BaseServer = BaseServer;
    static async init(){
        if(!FnF.languages || !FnF.countries){
            if(!localStorage.getItem(LANGUAGE_KEY) || !localStorage.getItem(COUNTRY_KEY)){
                console.log("Fetching languages and countries")
                localStorage.setItem(COUNTRY_KEY, JSON.stringify(await fetch("/api/country").then(res => res.json()).then(res => res.data)))
                localStorage.setItem(LANGUAGE_KEY, JSON.stringify(await fetch("/api/language").then(res => res.json()).then(res => res.data)))
            }
            FnF.languages = JSON.parse(localStorage.getItem(LANGUAGE_KEY) || "{}");
            FnF.countries = JSON.parse(localStorage.getItem(COUNTRY_KEY) || "{}");
        }
        
    }
    static hasAccess(rights : Permission, permission : Permission){
        return (rights & permission) == permission;
    }
    static async addSubCategories(categories: Category[]) {
        var subcats : Category[] = []
        for (let cat of categories) {
            console.info("Adding subcategories for", cat.title)
            const url = new URL("api/subcat/" + cat.title, FnF.baseURL);
            const response = await fetch(url.toString());
            const data: APIResponseMultiple<Category> = await response.json();
            subcats = subcats.concat(data.data);
            cat.subcat = false;
        }
        return subcats;
    }
    static async getCategories({country, topic} : {country : Country, topic : string}){
        const url = new URL(`api/topic/${topic.split("/")[0]}/${country}/categories`, FnF.baseURL);
        const response = await fetch(url.toString());
        const responseData: APIResponseMultiple<Category> = await response.json();
        if (responseData.success) {
            return responseData.data
        } else {
            console.log("Error", responseData.data)
            return [] as Category[];
        }
    }
    static async submitTask(data : TaskCreate) {
        // Submit the task
        const url = new URL("api/task", FnF.baseURL);
        const response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            },
        });
        const responseData: APIResponseSingle<Task> = await response.json();
        if (responseData.success) {
            return responseData.data;
        } else {
            console.log("Error", responseData.data)
            return null
        }

    }
    static async fetchCountries(topic : string){
        const url = new URL("api/topic/" + topic + "/country", FnF.baseURL);
        const response = await fetch(url.toString());
        const responseData: APIResponseMultiple<CountryEntry> = await response.json();
        if (responseData.success) {
            const rawData = responseData.data;
            const countries = rawData.map((country) => {
                return {
                    id : country.id.split("/")[1],
                    label : country.title
                }
            })
            return countries
        } else {
            console.log("Error", responseData.data)
            return [] as Country[];
        }
    }
    static async exportResult(taskID : Number, format: TaskResultFormat = "json") {
        const url = new URL(`api/task/${taskID}/export/` + format, FnF.baseURL);
        const response = await fetch(url.toString());
        const data : APIResponseSingle<TaskResult> = await response.json();
        
        return data.data;
    }
    static async getTask(taskID: number) {
        const url = new URL("api/task/" + taskID, FnF.baseURL);
        // console.log(taskID)
        const response = await fetch(url.toString());
        const responseData: APIResponseSingle<Task> = await response.json();
        if (responseData.success) {
            return responseData.data;
        } else {
            console.log("Error", responseData.data)
            return null
        }
    }
    static async getTasks() {
        const url = new URL("api/task", FnF.baseURL);
        // console.log(taskID)
        const response = await fetch(url.toString());
        const responseData: APIResponseMultiple<Task> = await response.json();
        if (responseData.success) {
            return responseData.data;
        } else {
            console.log("Error", responseData.data)
            return null
        }
    }
    static async getMe(){
        const url = new URL("api/user/me", FnF.baseURL);
        // console.log(taskID)
        const response = await fetch(url.toString());
        const responseData: APIResponseSingle<User> = await response.json();
        if (responseData.success) {
            return responseData.data;
        } else {
            console.log("Error", responseData.data)
            return null
        }
    }
    static async getCountryMap(){
        const url = new URL("api/country", FnF.baseURL);
        const countries = await fetch(url).then(res => res.json())
        return countries.data
    }
    static searchCategory(callback : (data : Category[]) => void, setSearching : (searching : boolean) => void){
        let q = "";
        let queued = false;
        const interval = 1000;
        async function _search() {
            if(q == "") return callback([]);
            const url = new URL("https://en.wikipedia.org/w/api.php");
            const params = new URLSearchParams({
                "action": "query",
                "format": "json",
                "list": "prefixsearch",
                "formatversion": "2",
                "pssearch": q,
                "pslimit": "10",
                "psnamespace": "14",
                "origin": "*"
            })
            url.search = params.toString();
            const response = await fetch(url.toString());
            const data = await response.json();
            const categories = data.query.prefixsearch.map((cat : any) => {
                return {
                    id : cat.pageid,
                    title : cat.title
                }
            })
            queued = false;
            setSearching(false);
            return callback(categories);
        }
        return function(e : KeyboardEvent){
            setSearching(true)
            q = (e?.target as HTMLInputElement)?.value;
            if(queued == false){
                // Nothing is queued
                queued = true;
                setTimeout(_search, interval)
                console.log("Queued")
                
            } else {
                // Something is already queued
                console.log("Already queued")
            }
        }

    }
    static async createTopic(topic : TopicCreate){
        const url = new URL("api/topic/", FnF.baseURL);
        const response : APIResponseSingle<Topic> = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(topic),
            headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.json());
        console.log(response)
        return response.data;
    }
    static async getTopic(topicID : string){
        const url = new URL("api/topic/" + topicID, FnF.baseURL);
        const response : APIResponseSingle<Topic> = await fetch(url.toString()).then(res => res.json());
        return response.data;
    }
    static async updateTopic({id, categories} : Topic){
        const url = new URL("api/topic/" + id, FnF.baseURL);
        const response : APIResponseSingle<Topic> = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify({categories}),
            headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.json());
        return response.data;
    }
    static async updateMe({username, rights} : User){
        const url = new URL("api/user/me", FnF.baseURL);
        const response : APIResponseSingle<User> = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify({username, rights}),
            headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.json());
        return response.data;
    }
    static async getUsers(){
        const url = new URL("api/user/", FnF.baseURL);
        const response : APIResponseMultiple<User> = await fetch(url.toString()).then(res => res.json());
        return response.data;
    }
    static toggleAccess(rights : number, permission : number){
        return rights & permission ? rights & ~permission : rights | permission;
    }
    static async getUser(id : number){
        const url = new URL("api/user/" + id, FnF.baseURL);
        const response : APIResponseSingle<User> = await fetch(url.toString()).then(res => res.json());
        return response.data;
    }
    static async updateUser({id, username, rights} : User){
        const url = new URL("api/user/" + id, FnF.baseURL);
        const response : APIResponseSingle<User> = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify({username, rights}),
            headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.json());
        return response.data;
    }
    static async deleteTopic(id : string){
        const url = new URL("api/topic/" + id, FnF.baseURL);
        const response : APIResponseSingle<Topic> = await fetch(url.toString(), {
            method: "DELETE",
        }).then(res => res.json());
        return response.data;
    }
}
export default FnF;
