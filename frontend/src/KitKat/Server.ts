import BaseServer from "../Server";
type WikiTextParseResponse = {
    parse: {
        title: string;
        pageid: number;
        text: {
        "*": string;
        };
    };
}
class KitKatServer {
    static BaseServer = BaseServer;
    static init(){
    }
    static async getParsedWikiText(title: string): Promise<string> {
        const baseURL = "https://en.wikipedia.org/w/api.php";
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
}
export default KitKatServer;