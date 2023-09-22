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
type MissingArticle = {
    pageid: number,
    title: string,
    wikidata: string,
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
interface IinitialInterface {
    homewiki?: homewikiname;
    country?: country;
    user?: user;
    taskID?: taskID;
    categories?: categoryArray;
}
class Interface {
    homewiki?: homewikiname = null;
    country?: country = null;
    user?: user = null;
    taskID?: taskID = null;
    autoCategorieIDs: Set<catID> = new Set();
    autoCategories: categoryArray = [];
    manualCategories: Array<category> = [];
    manualCategoryObject: categoryObject = {};


    homeWikiInput?: HTMLSelectElement;
    countryInput?: HTMLSelectElement;
    userInput?: HTMLInputElement;
    taskIDInput?: HTMLInputElement;
    categoryList?: HTMLOListElement;
    categoryInput?: HTMLInputElement;
    newCategoryButton?: HTMLButtonElement;
    topicInput?: HTMLInputElement;
    loaderIcon?: HTMLImageElement;
    resultTable?: HTMLTableElement;
    resultBody?: HTMLTableSectionElement;
    submitButton?: HTMLButtonElement;
    csvLink?: HTMLButtonElement;
    wikitextButton ?: HTMLButtonElement;
    articleCount?: HTMLHeadingElement;

    baseURL = new URL(window.location.origin);
    constructor({
        homewiki = null,
        country = null,
        user = null,
        taskID = null,
        categories = []
    }: IinitialInterface) {
        this.homewiki = homewiki;
        this.country = country;
        this.user = user;
        this.taskID = taskID;
        for (let category of categories) {
            this.manualCategoryObject[category.pageid] = category;
            this.manualCategories.push(category);

        }
        {
            this.homeWikiInput = document.getElementById("homewiki") as HTMLSelectElement;
            this.countryInput = document.getElementById("country") as HTMLSelectElement;
            this.userInput = document.getElementById("user") as HTMLInputElement;
            this.taskIDInput = document.getElementById("taskID") as HTMLInputElement;
            this.categoryList = document.getElementById("categoryList") as HTMLOListElement;
            this.categoryInput = document.getElementById("categoryInput") as HTMLInputElement;
            this.newCategoryButton = document.getElementById("newCategoryButton") as HTMLButtonElement;
            this.topicInput = document.getElementById("topic") as HTMLInputElement;
            this.submitButton = document.getElementById("submit") as HTMLButtonElement;
            this.loaderIcon = document.getElementById("loader") as HTMLImageElement;
            this.resultTable = document.getElementById("resultTable") as HTMLTableElement;
            this.resultBody = document.getElementById("result") as HTMLTableSectionElement;
            this.csvLink = document.getElementById("csvLink") as HTMLButtonElement;
            this.wikitextButton = document.getElementById("wikiTextButton") as HTMLButtonElement;
            this.articleCount = document.getElementById("articleCount") as HTMLHeadingElement;
        }



        this.newCategoryButton.onclick = (e) => {
            if (this.categoryInput?.value) {
                e.preventDefault();
                const newCategory: category = {
                    pageid: Math.round(- Number.MAX_SAFE_INTEGER * Math.random()).toString(),
                    title: this.categoryInput?.value ?? '',
                    subcat: true
                };
                this._addCategories([newCategory]);
                this.categoryInput.value = "";
            }
            this.render();
        }
        this.submitButton.onclick = (e) => {
            e.preventDefault();
            this.submitTask();
        }
        this.countryInput.onchange = () => {
            this.country = this.countryInput?.value;
            this.getCategories();
        }
        // this.homeWikiInput.onchange = () => {
        //     this.homewiki = this.homeWikiInput?.value;
        //     this.getCategories();
        // }
        this.render();
    }
    _addCategories(categories: categoryArray) {
        for (let cat of categories) {
            if (this.autoCategorieIDs.has(cat.pageid)) {
                continue;
            }
            if (this.manualCategoryObject[cat.pageid] !== undefined) {
                continue;
            }
            this.manualCategoryObject[cat.pageid] = cat;
            this.manualCategories.push(cat);
        }
    }
    async addSubCategories(categories: categoryArray) {
        var subcats: categoryArray = []
        for (let cat of categories) {
            const url = new URL("api/subcat/" + cat.title, this.baseURL);
            const response = await fetch(url.toString());
            const data: IResponse = await response.json();
            subcats = subcats.concat(data.data as categoryArray);
            cat.subcat = false;
        }
        console.log(subcats)
        this._addCategories(subcats);
        this.render();
    }
    removeCategories(categories: categoryArray) {
        categories.forEach((category) => {
            if (this.manualCategoryObject[category.pageid]) {
                delete this.manualCategoryObject[category.pageid];
                this.manualCategories = this.manualCategories.filter((cat) => {
                    return cat.pageid !== category.pageid;
                });
            }
        }
        )
    }
    render() {
        if (this.homewiki && this.homeWikiInput) {
            this.homeWikiInput.value = this.homewiki;
        }
        if (this.country && this.countryInput) {
            this.countryInput.value = this.country;
        }
        if (this.user && this.userInput) {
            this.userInput.value = this.user;
        }
        if (this.taskID && this.taskIDInput) {
            this.taskIDInput.value = this.taskID;
        }
        // if(this.autoCategories.length > 0){
        //     categoryList.innerHTML = "";
        //     for(let category of this.autoCategories){
        //         const listItem = document.createElement("li");
        //         listItem.innerHTML = category.title;
        //         categoryList.appendChild(listItem);
        //         const removeButton = document.createElement("button");
        //         removeButton.innerHTML = "Remove";
        //         removeButton.onclick = () => {
        //             this.removeCategories([category]);
        //             this.render();
        //         }
        //         listItem.appendChild(removeButton);
        //     }
        // }

        if (this.categoryList) {
            this.categoryList.innerHTML = "";
            if (this.manualCategories.length > 0) {
                for (let category of this.manualCategories) {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = category.title + " ";
                    this.categoryList.appendChild(listItem);
                    const removeButton = document.createElement("button");
                    removeButton.innerHTML = "Remove";
                    removeButton.type = "button";
                    removeButton.onclick = () => {
                        this.removeCategories([category]);
                        this.render();
                    }
                    listItem.appendChild(removeButton);
                    if (category.subcat) {
                        const subCatButton = document.createElement("button");
                        subCatButton.innerHTML = "Add Subcategories";
                        subCatButton.type = "button";
                        subCatButton.onclick = () => {
                            this.addSubCategories([category]);
                        }
                        listItem.appendChild(subCatButton);
                    }
                }
            }
        }

    }
    async getCategories() {
        const country = this.countryInput?.value;
        const user = this.userInput?.value;
        const topic = this.topicInput?.value;
        const url = new URL(`api/topic/${topic}/${country}`, this.baseURL);
        const response = await fetch(url.toString());
        const responseData: IResponse = await response.json();
        if (responseData.status === "success") {
            const categories = responseData.data as categoryArray;
            this.manualCategories = [];
            this.manualCategoryObject = {};
            this._addCategories(categories);
            this.render();
        } else {
            console.log("Error", responseData.data)
        }
    }
    async submitTask() {
        if (this.loaderIcon) {
            this.resultTable?.classList.add("hidden")
            this.loaderIcon.classList.remove("hidden");
        }
        // Submit the task
        const url = new URL("api/task", this.baseURL);
        const data = {
            homewiki: this.homewiki,
            categories: this.manualCategories.map((cat) => cat.title),
            user: this.user,
            country : this.countryInput?.value,
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
            this.taskID = task.id.toString();
            setTimeout(() => {
                this.checkTask();
            }, 1000);
        }

    }
    async exportResult(format: string = "json") {
        const url = new URL(`api/task/${this.taskID}/export/` + format, this.baseURL);
        const response = await fetch(url.toString());
        const data = await response.json();
        return data.data;
    }
    async exportCSV(event : Event){
            event.preventDefault();
            const csvData = await this.exportResult("csv") as string
            const blob = new Blob([csvData], {type: "text/csv"});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "result.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
        
    }
    async exportWikiText(event : Event){
        event.preventDefault();
        console.log(this)
        console.log("Exporting wikitext")
        const wikitext = await this.exportResult("wikitext") as string
        console.log(wikitext)

        
    }
    async checkTask() {
        const url = new URL("api/task/" + this.taskID, this.baseURL);
        const response = await fetch(url.toString());
        const responseData: IResponse = await response.json();
        if (responseData.status === "success") {
            const task = responseData.data as {id : number, status: string, article_count: number};
            if(this.articleCount)
                    this.articleCount.innerHTML = "Total Articles : " + task.article_count;
            if (task.status === "done") {
                const result = await this.exportResult('json');
                if(this.csvLink){
                    this.csvLink.onclick = this.exportCSV.bind(this)
                }
                if(this.wikitextButton){
                    this.wikitextButton.onclick = this.exportWikiText.bind(this)
                }
                const pages : Array<MissingArticle> = result;
                if (this.resultBody) {
                    var content = "";
                    var serial = 1;
                    for (let page of pages) {
                        content += `
                <tr data-pageid="${page.pageid}">
                    <td>${serial++}</td>
                    <td>${page.title}</td>
                    <td></td>
                    <td></td>
                </tr>
                `

                    }
                    this.resultBody.innerHTML = content;
                    this.resultTable?.classList.remove("hidden");
                    this.loaderIcon?.classList.add("hidden")
                }
            } else {
                this.resultTable?.classList.add("hidden");
                this.loaderIcon?.classList.remove("hidden")
                setTimeout(() => {
                    this.checkTask();
                }, 2000);
            }
            
        }
    }
}