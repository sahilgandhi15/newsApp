import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()
export class NewsService {
    constructor(private http: Http) {
    }

    getNewsSources() {
        return this.http.get('https://newsapi.org/v1/sources');
    }
}