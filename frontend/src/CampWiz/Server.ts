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
            err = error;
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
            return response.query.prefixsearch
            .filter((entry: any) => namespace === "*" || entry.ns == namespace)
            .map((entry: any) => entry.title);
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
        
        const url = '/api/campwiz/campaign/' + '?' + query.toString();
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async getCampaign(id: number, params : any = {}): Promise<Campaign> {
        const qs = new URLSearchParams(params);
        const url = '/api/campwiz/campaign/' + id + '?' + qs.toString();
        const res = await fetchWithErrorHandling(url)
        const campaign = res.data;
        if(typeof campaign.rules === 'string') campaign.rules = campaign.rules.split('\n');
        return res.data;
    }
    static async submitArticle(req: SubmissionRequest): Promise<Submission> {
        const url = '/api/campwiz/submission/';
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
        const url = '/api/campwiz/submission/' + '?' + qs.toString();
       
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
        const url = '/api/campwiz/campaign/' + campaignID + '/jury';
        const res = await fetchWithErrorHandling(url)
        return res.data.map((user: any) => user.username);
    }
    static async createCampaign(campaign: Campaign): Promise<Campaign> {
        const newCampaign = await fetchWithErrorHandling('/api/campwiz/campaign/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaign)
        })
        return newCampaign.data;
    }
    static async updateCampaign(campaign: Campaign): Promise<Campaign> {
        const updatedCampaign = await fetchWithErrorHandling('/api/campwiz/campaign/' + campaign.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaign)
        }).then(res => res.data);
        return updatedCampaign;
    }
    static async updateCampaignStatus(campaignID: number, status: CampaignStatus): Promise<Campaign> {
        const updatedCampaign = await fetchWithErrorHandling('/api/campwiz/campaign/' + campaignID + '/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        }).then(res => res.data);
        return updatedCampaign;
    
    }
    static async getResults(campaignID: number): Promise<Submission[]> {
        const url = '/api/campwiz/campaign/' + campaignID + '/result';
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async deleteSubmission(submissionID: number): Promise<Submission> {
        const url = '/api/campwiz/submission/' + submissionID;
        const res = await fetchWithErrorHandling(url, {
            method: 'DELETE'
        })
        return res.data;
    }
    static async getTimeline(groupBy : string, campaignID: number = 0): Promise<any[]> {
        const params = new URLSearchParams({
            group_by : groupBy,
            campaign_id : campaignID.toString()
        });
        const url = '/api/campwiz/campaign/timeline?' + params.toString();
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
}
class PageServer {
    static async getPageInfo({ language, submitted_by_username, title, submissionId }: PageInfoRequest): Promise<PageInfo> {
        return PageServer.getSubmission(submissionId)
    }
    static async getSubmission(submissionID: number): Promise<Submission> {
        const url = '/api/campwiz/submission/' + submissionID;
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async createDraft({ campaign_id, submitted_by_username, title }: SubmissionRequest): Promise<Submission> {
        const url = '/api/campwiz/submission/draft';
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
        const url = '/api/campwiz/submission/draft/' + draftID;
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }

    static async judgeSubmission(submissionID: number, point: number, note?: string): Promise<Submission> {
        const url = '/api/campwiz/submission/' + submissionID + '/judge';
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
        const url = '/api/campwiz/user/';
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async getUser(id : string) : Promise<User> {
        const url = '/api/campwiz/user/' + id;
        const res = await fetchWithErrorHandling(url)
        return res.data;
    }
    static async updateUser({id, rights } : User) : Promise<User> {
        const url = '/api/campwiz/user/' + id;
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

type StatTask = {
    
}
type Statistics = {
    id : string | number;
    submissions : Submission[];
    total_points : number;
    total_submissions : number;
    total_newly_created : number;
    total_expanded : number;
}

class CampWizServer {
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
        CampWizServer.languages = BaseServer.languages;
        CampWizServer.countries = BaseServer.countries;
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
        return BaseServer.hasRight(CampWizServer.RIGHTS.CAMPAIGN);
    }
    static getParameter(key: string): string | null {
        const url = new URL(window.location.href);
        return url.searchParams.get(key);
    }
    static async getConfig(){
        const searchParams = new URLSearchParams({
            "action": "query",
            "format": "json",
            "prop": "revisions",
            "titles": "User:Tiven2240/nkbToolConfig.json",
            "formatversion": "2",
            "rvprop": "content|contentmodel",
            "rvslots": "main",
            "rvlimit": "1",
            "rvcontentformat-main": "application/json",
            "origin" : "*"
        });
        const url = 'https://meta.wikimedia.org/w/api.php?' + searchParams.toString();
        const res = await fetch(url);
        const res_1 = await res.json();
        const res_2 = res_1.query.pages[0].revisions[0].slots.main.content;
        return JSON.parse(res_2);
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
    };
    async getStats(type : string, params : any = {}) : Promise<Statistics> {
        
        const Statistics : Statistics = {"id":1,"submissions":[],"total_points":10,"total_submissions":1,"total_newly_created":1,"total_expanded":0}
        return Statistics;
    }
    async init() {
        await BaseServer.init()
    }
    static addWikiStyle() {
        CampWizServer.addCSS("https://en.wikipedia.org/w/load.php?lang=en&modules=ext.cite.styles%7Cext.echo.styles.badge%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Cjquery.makeCollapsible.styles%7Coojs-ui.styles.icons-alerts%7Cskins.vector.styles.legacy%7Cwikibase.client.init&only=styles&skin=vector");
    }
}
export default CampWizServer;
