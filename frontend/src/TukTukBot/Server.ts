type nullable = null | undefined;
type nullableString = string | nullable
type homewikiname = nullableString;
type country = nullableString;
type user = nullableString;
type taskID = nullableString;
type category = {
    pageid: number | string,
    title: string,
    subcat: boolean,
};
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
type MissingArticle = {
    pageid: number,
    title: string,
    wikidata: string,
    target : string
}
type categoryArray = Array<category>;
type catID = number | string;
type categoryObject = {
    [key: catID]: category
}
type IResponse = {
    status: number | string,
    data: Object | Array<Object>
}
class TukTukBot {
    static baseURL = new URL(window.location.origin);
    static async addSubCategories(categories: categoryArray) {
        var subcats: categoryArray = []
        for (let cat of categories) {
            console.info("Adding subcategories for", cat.title)
            const url = new URL("api/subcat/" + cat.title, TukTukBot.baseURL);
            const response = await fetch(url.toString());
            const data: IResponse = await response.json();
            subcats = subcats.concat(data.data as categoryArray);
            cat.subcat = false;
        }
        return subcats;
    }
    static async getCategories({country, topic} : {country : country, topic : string}){

        const url = new URL(`api/topic/${topic}/${country}`, TukTukBot.baseURL);
        const response = await fetch(url.toString());
        const responseData: IResponse = await response.json();
        if (responseData.status === "success") {
            const categories = responseData.data as categoryArray;
            return categories
        } else {
            console.log("Error", responseData.data)
        }
        return [] as categoryArray;
    }
    static async submitTask({homewiki, country, categories, topic} : {topic : string, homewiki : homewikiname, country : country,  categories : categoryArray}) {
        // Submit the task
        const url = new URL("api/task", TukTukBot.baseURL);
        const data = {
            homewiki: homewiki,
            categories: categories.map((cat : category) => cat.title),
            country : country,
            topic : topic
        }
        const response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            },
        });
        const responseData: IResponse = await response.json();
        if (responseData.status === "success") {
            const task = responseData.data as {id : number, status: string};
            return task
        } else {
            console.log("Error", responseData.data)
            return null
        }

    }
    static async exportResult(taskID : string | Number, format: string = "json") {
        const url = new URL(`api/task/${taskID}/export/` + format, TukTukBot.baseURL);
        const response = await fetch(url.toString());
        const data = await response.json();
        return data.data;
    }

    static async getTask(taskID: taskID) {
        const url = new URL("api/task/" + taskID, TukTukBot.baseURL);
        console.log(taskID)
        const response = await fetch(url.toString());
        const responseData: IResponse = await response.json();
        if (responseData.status === "success") {
            const task = responseData.data as Task;
            return task
        } else {
            console.log("Error", responseData.data)
            return null
        }
    }
}
export default TukTukBot;
