import BaseServer from "../Server";
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
type PageInfo = {
    totalWords : number; // UTF-8
    totalBytes : number; // UTF-8
    addedBytes : number; // UTF-8
    addedWords : number; // UTF-8
    createdAt : string; // ISO 8601
    createdBy : string; // User name
    additionConsideredAfter : string; // ISO 8601
}
type PageInfoRequest = {
    language : string;
    title : string;
    submitter : string;
    consideredAfter? : string;
}
type WikiTextParseResponse = {
    parse: {
        title: string;
        pageid: number;
        text: {
            "*": string;
        };
    };
}
type Campaign = {
    id: number;
    name: string;
    description: string;
    image: string;
    link: string;
    start: string;
    end: string;
    active: boolean;
    language: string;
};
type SubmissionRequest = {
    campaignID : number;
    submitter : string;
    title : string;
};
type Submission = {
    submissionID : number;
    campaignID : number;
    submitter : string;
    title : string;
    createdAt : string;
    language : string;
    status : "pending" | "approved" | "rejected";
    approvedAt? : string;
    approvedBy? : string;
    rejectedAt? : string;
    rejectedBy? : string;
    rejectedReason? : string;
    note? : string;
}
const sampleCampaign: Campaign = {
    id: 1,
    name: "Sample Campaign",
    description: "This is a sample campaign",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/KitKat_4_Finger_%28cropped%29.jpg/800px-KitKat_4_Finger_%28cropped%29.jpg",
    link: "https://en.wikipedia.org/wiki/Kit_Kat",
    start: "2021-10-01",
    end: "2021-10-31",
    active: true,
    language: "en"

}
const samplePageInfo : PageInfo = {
    totalWords: 100,
    totalBytes: 1000,
    createdAt: "2021-10-01",
    createdBy : "User:Example",
    additionConsideredAfter: "2021-10-01",
    addedBytes: 100,
    addedWords: 10
}
class Wiki {
    static requestPool = Promise.resolve();
    static requestInterval = 500;
    static frequentRequestQueued = false;
    static async getParsedWikiText(language: string, title: string): Promise<string> {
        const baseURL = `https://${language}.wikipedia.org/w/api.php`;
        const params = new URLSearchParams({
            action: "parse",
            page: title,
            format: "json",
            utf8: "1",
            contentmodel: "wikitext",
            prop: "text",
            origin: "*"
        });
        const url = `${baseURL}?${params.toString()}`;
        const response : WikiTextParseResponse = await fetch(url).then(res => res.json());
        return response.parse.text["*"];
    }
    static async suggestArticles(language: string, query: string): Promise<string[]> {
        if (query.length < 3) return [];
        const baseURL = `https://${language}.wikipedia.org/w/api.php`;
        const params = new URLSearchParams({
            action: "query",
            list: "prefixsearch",
            origin: "*",
            pssearch: query,
            format: "json",
            utf8: "1",
            pslimit: "10"
        });
        const url = `${baseURL}?${params.toString()}`;
        if (!Wiki.frequentRequestQueued) {
            Wiki.frequentRequestQueued = true;
            setTimeout(() => {
                Wiki.frequentRequestQueued = false;
            }, Wiki.requestInterval);
            const response = await fetch(url).then(res => res.json());
            return response.query.prefixsearch.map((entry: any) => entry.title);
        }
        return []
    }
}
class CampaignServer {
    static async getCampaigns(): Promise<Campaign[]> {
        return [sampleCampaign];
    }
    static async getCampaign(id: number): Promise<Campaign> {
        return sampleCampaign;
    }
    static async submitArticle(req : SubmissionRequest) : Promise<Submission> {
        return {
            submissionID: 1,
            campaignID: req.campaignID,
            submitter: req.submitter,
            title: req.title,
            createdAt: new Date().toISOString(),
            language: "en",
            status: "pending"
        }

    }
}
class PageServer {
    static async getPageInfo({language, submitter, title} : PageInfoRequest): Promise<PageInfo> {
        return samplePageInfo;
    }

}
class KitKatServer {
    static BaseServer = BaseServer;
    static Wiki = Wiki;
    static Campaign = CampaignServer;
    static Page = PageServer;
    static init() {
    }
    static getParameter(key: string): string | null {
        const url = new URL(window.location.href);
        return url.searchParams.get(key);
    }
    
}
export default KitKatServer;