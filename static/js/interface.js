var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Interface {
    constructor({ homewiki = null, country = null, user = null, taskID = null, categories = [] }) {
        this.homewiki = null;
        this.country = null;
        this.user = null;
        this.taskID = null;
        this.autoCategorieIDs = new Set();
        this.autoCategories = [];
        this.manualCategories = [];
        this.manualCategoryObject = {};
        this.baseURL = new URL(window.location.origin);
        this.homewiki = homewiki;
        this.country = country;
        this.user = user;
        this.taskID = taskID;
        for (let category of categories) {
            this.manualCategoryObject[category.pageid] = category;
            this.manualCategories.push(category);
        }
        {
            this.homeWikiInput = document.getElementById("homewiki");
            this.countryInput = document.getElementById("country");
            this.userInput = document.getElementById("user");
            this.taskIDInput = document.getElementById("taskID");
            this.categoryList = document.getElementById("categoryList");
            this.categoryInput = document.getElementById("categoryInput");
            this.newCategoryButton = document.getElementById("newCategoryButton");
            this.topicInput = document.getElementById("topic");
            this.submitButton = document.getElementById("submit");
            this.loaderIcon = document.getElementById("loader");
            this.resultTable = document.getElementById("resultTable");
            this.resultBody = document.getElementById("result");
            this.csvLink = document.getElementById("csvLink");
            this.wikitextButton = document.getElementById("wikiTextButton");
        }
        this.newCategoryButton.onclick = (e) => {
            var _a, _b, _c;
            if ((_a = this.categoryInput) === null || _a === void 0 ? void 0 : _a.value) {
                e.preventDefault();
                const newCategory = {
                    pageid: Math.round(-Number.MAX_SAFE_INTEGER * Math.random()).toString(),
                    title: (_c = (_b = this.categoryInput) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : '',
                    subcat: true
                };
                this._addCategories([newCategory]);
                this.categoryInput.value = "";
            }
            this.render();
        };
        this.submitButton.onclick = (e) => {
            e.preventDefault();
            this.submitTask();
        };
        this.countryInput.onchange = () => {
            var _a;
            this.country = (_a = this.countryInput) === null || _a === void 0 ? void 0 : _a.value;
            this.getCategories();
        };
        // this.homeWikiInput.onchange = () => {
        //     this.homewiki = this.homeWikiInput?.value;
        //     this.getCategories();
        // }
        this.render();
    }
    _addCategories(categories) {
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
    addSubCategories(categories) {
        return __awaiter(this, void 0, void 0, function* () {
            var subcats = [];
            for (let cat of categories) {
                const url = new URL("api/subcat/" + cat.title, this.baseURL);
                const response = yield fetch(url.toString());
                const data = yield response.json();
                subcats = subcats.concat(data.data);
                cat.subcat = false;
            }
            console.log(subcats);
            this._addCategories(subcats);
            this.render();
        });
    }
    removeCategories(categories) {
        categories.forEach((category) => {
            if (this.manualCategoryObject[category.pageid]) {
                delete this.manualCategoryObject[category.pageid];
                this.manualCategories = this.manualCategories.filter((cat) => {
                    return cat.pageid !== category.pageid;
                });
            }
        });
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
                    };
                    listItem.appendChild(removeButton);
                    if (category.subcat) {
                        const subCatButton = document.createElement("button");
                        subCatButton.innerHTML = "Add Subcategories";
                        subCatButton.type = "button";
                        subCatButton.onclick = () => {
                            this.addSubCategories([category]);
                        };
                        listItem.appendChild(subCatButton);
                    }
                }
            }
        }
    }
    getCategories() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const country = (_a = this.countryInput) === null || _a === void 0 ? void 0 : _a.value;
            const user = (_b = this.userInput) === null || _b === void 0 ? void 0 : _b.value;
            const topic = (_c = this.topicInput) === null || _c === void 0 ? void 0 : _c.value;
            const url = new URL(`api/topic/${topic}/${country}`, this.baseURL);
            const response = yield fetch(url.toString());
            const responseData = yield response.json();
            if (responseData.status === "success") {
                const categories = responseData.data;
                this.manualCategories = [];
                this.manualCategoryObject = {};
                this._addCategories(categories);
                this.render();
            }
            else {
                console.log("Error", responseData.data);
            }
        });
    }
    submitTask() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loaderIcon) {
                (_a = this.resultTable) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
                this.loaderIcon.classList.remove("hidden");
            }
            // Submit the task
            const url = new URL("api/task", this.baseURL);
            const data = {
                homewiki: this.homewiki,
                categories: this.manualCategories.map((cat) => cat.title),
                user: this.user,
                country: (_b = this.countryInput) === null || _b === void 0 ? void 0 : _b.value,
            };
            const response = yield fetch(url.toString(), {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const responseData = yield response.json();
            if (responseData.status === "success") {
                const task = responseData.data;
                this.taskID = task.id.toString();
                setTimeout(() => {
                    this.checkTask();
                }, 1000);
            }
        });
    }
    exportResult(format = "json") {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(`api/task/${this.taskID}/export/` + format, this.baseURL);
            const response = yield fetch(url.toString());
            const data = yield response.json();
            return data.data;
        });
    }
    exportCSV(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const csvData = yield this.exportResult("csv");
            const blob = new Blob([csvData], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "result.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    }
    exportWikiText(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            console.log(this);
            console.log("Exporting wikitext");
            const wikitext = yield this.exportResult("wikitext");
            console.log(wikitext);
        });
    }
    checkTask() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL("api/task/" + this.taskID, this.baseURL);
            const response = yield fetch(url.toString());
            const responseData = yield response.json();
            if (responseData.status === "success") {
                const task = responseData.data;
                if (task.status === "done") {
                    const result = yield this.exportResult('json');
                    if (this.csvLink) {
                        this.csvLink.onclick = this.exportCSV.bind(this);
                    }
                    if (this.wikitextButton) {
                        this.wikitextButton.onclick = this.exportWikiText.bind(this);
                    }
                    const pages = result;
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
                `;
                        }
                        this.resultBody.innerHTML = content;
                        (_a = this.resultTable) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
                        (_b = this.loaderIcon) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
                    }
                }
                else {
                    (_c = this.resultTable) === null || _c === void 0 ? void 0 : _c.classList.add("hidden");
                    (_d = this.loaderIcon) === null || _d === void 0 ? void 0 : _d.classList.remove("hidden");
                    setTimeout(() => {
                        this.checkTask();
                    }, 1000);
                }
            }
        });
    }
}
