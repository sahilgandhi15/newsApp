import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
const apiKey: string = '5cc768d9a7fd44ffa6bb7b2418ba3676';

@Injectable()
export class NewsService {
    constructor(private http: Http) {
    }

    getNewsSources() {
        return this.http.get('https://newsapi.org/v1/sources');
    }

    getNewsArticles(source?: string, sortBy?: string) {
        let url = 'https://newsapi.org/v1/articles?source=' + source + '&apiKey=' + apiKey;
        return this.http.get(url);
    }
}