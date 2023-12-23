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
type User = {
    id: number;
    username: string;
    rights: number;
    campaign_count : number;
}

const sampleSubmission: Submission = {
    id: 1,
    campaignID: 1,
    submitted_by_username: "User:Example",
    title: "Bangladesh",
    createdAt: new Date().toISOString(),
    language: "en",
    status: "pending"
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
            err = await res.text();
        }
        throw new Error(err);
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
    static async suggestArticles(language: string, query: string, namespace : string = "*"): Promise<string[]> {
        if (query.length < 2) return [];
        const baseURL = `https://${language}.wikipedia.org/w/api.php`;
        const params = new URLSearchParams({
            action: "query",
            list: "prefixsearch",
            origin: "*",
            pssearch: query,
            psnamespace: namespace,
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
    static async getCampaign(id: number, params : any = {}): Promise<Campaign> {
        const qs = new URLSearchParams(params);
        const url = '/api/kitkat/campaign/' + id + '?' + qs.toString();
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
        return sampleSubmission;

    }
    static async getSubmissions(campaignID: number, params : { [key : string] : string}): Promise<Submission[]> {
         const qs = new URLSearchParams({
            campaignID: campaignID.toString(),
            ...params
        });
        const url = '/api/kitkat/submission/' + '?' + qs.toString();
       
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
    static async updateCampaignStatus(campaignID: number, status: CampaignStatus): Promise<Campaign> {
        const updatedCampaign = await fetchWithErrorHandling('/api/kitkat/campaign/' + campaignID + '/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        }).then(res => res.data);
        return updatedCampaign;
    
    }
    static async getResults(campaignID: number): Promise<Submission[]> {
        const url = '/api/kitkat/campaign/' + campaignID + '/result';
        const res = await fetchWithErrorHandling(url)
        return res.data;
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
    static async createDraft({ campaign_id, submitted_by_username, title }: SubmissionRequest): Promise<Submission> {
        const url = '/api/kitkat/submission/draft';
        const res = await fetchWithErrorHandling(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ campaign_id, submitted_by_username, title })
        });
        return res.data;
    }
    static async getDraft(draftID: number): Promise<Submission> {
        const url = '/api/kitkat/submission/draft/' + draftID;
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }

    static async judgeSubmission(submissionID: number, point: number, note?: string): Promise<Submission> {
        const url = '/api/kitkat/submission/' + submissionID + '/judge';
        const res = await fetchWithErrorHandling(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ submission_id : submissionID, vote : point })
        });
        return res.data;
    }



}
class UserServer {
    static fetching = false;
    static async searchUsersByPrefix(language: string = 'bn', prefix: string, callback: (users: WikimediaUser[]) => void ) {
        if (UserServer.fetching){
            return;
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
        console.log(res.query.allusers)
        callback(res.query.allusers);
    }
    static async getUsers() : Promise<User[]> {
        const url = '/api/kitkat/user/';
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async getUser(id : string) : Promise<User> {
        const url = '/api/kitkat/user/' + id;
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async updateUser({id, rights } : User) : Promise<User> {
        const url = '/api/kitkat/user/' + id;
        const res = await fetchWithErrorHandling(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({rights})
        })
        return res.data;
    
    }
}
type LanguageObject = {
    [key: string]: string;
} | null;

class KitKatServer {
    static BaseServer = BaseServer;
    static Wiki = Wiki;
    static Campaign = CampaignServer;
    static Page = PageServer;
    static User = UserServer;
    static RIGHTS = BaseServer.RIGHTS;
    static languages: LanguageObject = {};
    static countries: LanguageObject = {};
    static async init() {
        await BaseServer.init();
        KitKatServer.languages = BaseServer.languages;
        KitKatServer.countries = BaseServer.countries;
    }
    static getWikiList(exclude: string[] = []){
        return BaseServer.getWikiList(exclude);
    }
    static hasAccess(rights : number, permissions : number) {
        return BaseServer.hasAccess(rights, permissions);
    }
    static toggleAccess(rights : number, permissions : number) {
        return BaseServer.toggleAccess(rights, permissions);
    }
    static hasCampaignRight(){
        return BaseServer.hasRight(KitKatServer.RIGHTS.CAMPAIGN);
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