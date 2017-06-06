import { Injectable } from "@angular/core/core";
import { Http } from "@angular/http/http";
@Injectable()
export class NewsService {
    constructor(private http: Http) {
    }

    getNewsSources() {
        this.http.get('https://newsapi.org/v1/sources');
    }
}