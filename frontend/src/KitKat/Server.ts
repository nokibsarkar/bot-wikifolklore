import BaseServer from "../Server";
const LANGUAGE_KEY = "tk-lang"
const COUNTRY_KEY = "tk-country"
type APIResponseSingle<T> = {
    success: true;
    data: T;
    detail?: string;
}
type APIResponseMultiple<T> = {
    success: true;
    data: T[];
    detail?: string;
}
type PageInfo = Submission;
type PageInfoRequest = {
    language: string;
    title: string;
    submitted_by_username: string;
    consideredAfter?: string;
    submissionId: number
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
type CampaignStatus = "under_approval" | "scheduled" | "rejected" | "active" | "judging" | "ended" | "cancelled";
type SubmissionStatus = "pending" | "approved" | "rejected";
type Campaign = {
    id: number;
    name: string;
    description: string;
    image: string;
    link: string;
    startDate: string;
    endDate: string;
    active: boolean;
    language: string;
    rules: string[];
    status: CampaignStatus;
};
type SubmissionRequest = {
    campaign_id: number;
    submitted_by_username: string;
    title: string;
};
type Submission = {
    id: number;
    campaignID: number;
    submitted_by_username: string;
    title: string;
    createdAt: string;
    language: string;
    status: SubmissionStatus;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    rejectedReason?: string;
    note?: string;
}

type WikimediaUser = {
    userid: number;
    name: string;
    id?: number;
    centralids: {
        CentralAuth: number;
        local: number;
    };
}
const sampleCampaign: Campaign = {
    id: 1,
    name: "Sample Campaign",
    description: "This is a sample campaign",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/71/Wikipedia_Asian_Month_Logo.svg",
    link: "https://en.wikipedia.org/wiki/Kit_Kat",
    startDate: "2021-10-01",
    endDate: "2021-10-31",
    active: true,
    language: "en",
    rules: [
        "No vandalism",
        "No spam",
    ],
    status: "active",
}
const sampleUsernames = [
    'User:Example',
    'User:Example2',
    'User:Example3',
]

const sampleSubmission: Submission = {
    id: 1,
    campaignID: 1,
    submitted_by_username: "User:Example",
    title: "Bangladesh",
    createdAt: new Date().toISOString(),
    language: "en",
    status: "pending"
}
const fetchWithErrorHandling= async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if(res.ok){
        const data = await res.json();
        if(data.success) return data;
        console.log(data);
        throw new Error(data.detail);
    } else {
        throw new Error(res.statusText);
    }
};
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
        const response: WikiTextParseResponse = await fetch(url).then(res => res.json());
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
    static async getCampaigns({status, language } : {status? : CampaignStatus[], language? : string}): Promise<Campaign[]> {
        const query = new URLSearchParams({});
        if(status)
            for(const s of status)
                query.append('status', s);
        
        if(language)
            query.append('language', language);
        
        const url = '/api/kitkat/campaign/' + '?' + query.toString();
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async getCampaign(id: number): Promise<Campaign> {
        const url = '/api/kitkat/campaign/' + id;
        const res = await fetchWithErrorHandling(url)
        const campaign = res.data;
        if(typeof campaign.rules === 'string') campaign.rules = campaign.rules.split('\n');
        return res.data;
    }
    static async submitArticle(req: SubmissionRequest): Promise<Submission> {
        const url = '/api/kitkat/submission/';
        const res = await fetchWithErrorHandling(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        });
        console.log(res)
        return sampleSubmission;

    }
    static async getSubmissions(campaignID: number): Promise<Submission[]> {
         const params = new URLSearchParams({
            campaignID: campaignID.toString()
        });
        const url = '/api/kitkat/submission/' + '?' + params.toString();
       
        const res = await fetchWithErrorHandling(url)
        const submissions = res.data;
        const submissionCount = submissions.length;
        var previousSubmission = null;
        for(let i = 0; i < submissionCount; i++) {
            const submission = submissions[i];
            if(previousSubmission){
                submission.prev = previousSubmission.id;
                previousSubmission.next = submission.id;
            }
            previousSubmission = submission;
        }
        return submissions;
    }
    static async getJury(campaignID: number): Promise<string[]> {
        const url = '/api/kitkat/campaign/' + campaignID + '/jury';
        const res = await fetchWithErrorHandling(url)
        return res.data.map((user: any) => user.username);
    }
    static async createCampaign(campaign: Campaign): Promise<Campaign> {
        const newCampaign = await fetchWithErrorHandling('/api/kitkat/campaign/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaign)
        })
        return newCampaign.data;
    }
    static async updateCampaign(campaign: Campaign): Promise<Campaign> {
        const updatedCampaign = await fetchWithErrorHandling('/api/kitkat/campaign/' + campaign.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaign)
        }).then(res => res.data);
        return updatedCampaign;
    }
}
class PageServer {
    static async getPageInfo({ language, submitted_by_username, title, submissionId }: PageInfoRequest): Promise<PageInfo> {
        return PageServer.getSubmission(submissionId)
    }
    static async getSubmission(submissionID: number): Promise<Submission> {
        const url = '/api/kitkat/submission/' + submissionID;
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }

    static async judgeSubmission(submissionID: number, point: number, note?: string): Promise<Submission> {
        return sampleSubmission;
    }



}
class UserServer {
    static fetching = false;
    static async searchUsersByPrefix(language: string = 'bn', prefix: string, previous: WikimediaUser[]): Promise<WikimediaUser[]> {
        if (UserServer.fetching){
            return previous;
        }
        const params = new URLSearchParams({
            action: "query",
            list: "allusers",
            auprefix: prefix,
            format: "json",
            utf8: "1",
            aulimit: "10",
            origin: "*"
        });
        const url = `https://${language}.wikipedia.org/w/api.php?${params.toString()}`;
        UserServer.fetching = true;
        const res = await fetch(url).then(res => res.json());
        UserServer.fetching = false;
        return res.query.allusers;
    }
}

class KitKatServer {
    static BaseServer = BaseServer;
    static Wiki = Wiki;
    static Campaign = CampaignServer;
    static Page = PageServer;
    static User = UserServer;
    static languages: Object | null = {};
    static countries: Object | null = {};
    static async init() {
        await BaseServer.init();
        KitKatServer.languages = BaseServer.languages;
        KitKatServer.countries = BaseServer.countries;
    }
    static getParameter(key: string): string | null {
        const url = new URL(window.location.href);
        return url.searchParams.get(key);
    }

    static addCSS(url: string) {
        const id = url.replace(/[^a-zA-Z0-9]/g, "");
        if (document.getElementById(id)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.id = id;
        link.href = url;
        document.head.appendChild(link);
    }
    static addJS(url: string) {
        const id = url.replace(/[^a-zA-Z0-9]/g, "");
        if (document.getElementById(id)) return;
        const script = document.createElement("script");
        script.id = id;
        script.src = url;
        document.head.appendChild(script);
    }
    async init() {
        await BaseServer.init()
    }
    static addWikiStyle() {
        KitKatServer.addCSS("https://en.wikipedia.org/w/load.php?lang=en&modules=ext.cite.styles%7Cext.echo.styles.badge%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Cjquery.makeCollapsible.styles%7Coojs-ui.styles.icons-alerts%7Cskins.vector.styles.legacy%7Cwikibase.client.init&only=styles&skin=vector");
    }
}
export default KitKatServer;