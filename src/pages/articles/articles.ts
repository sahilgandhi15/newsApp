import { NewsService } from './../../app/_shared/newsService.service';
import { Component, OnInit, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-articles',
    templateUrl: 'articles.html'
})
export class ArticlesPage implements OnInit {
    sourceName: any;
    source: string = '';
    myData: any;
    constructor(public navCtrl: NavController, private newsService: NewsService, public navParams: NavParams) {

    }

    ngOnInit(): void {
        this.source = this.navParams.get('mySource');
        this.sourceName = this.navParams.get('mySourceName');
        this.getArticles();
    }

    getArticles() {
        // tslint:disable-next-line:no-unused-variable
        let r = this.newsService.getNewsArticles(this.source, 'top')
            .subscribe((data: any) => {
                console.log(data);
                this.myData = JSON.parse(data._body).articles;
            })
    }


}
