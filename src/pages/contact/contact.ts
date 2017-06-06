import { NewsService } from './../../app/_shared/newsService.service';
import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage implements OnInit {
  myData: any;
  constructor(public navCtrl: NavController, private newsService: NewsService) {

  }

  ngOnInit(): void {
    this.getSources();
  }

  getSources() {
    // tslint:disable-next-line:no-unused-variable
    let r = this.newsService.getNewsSources()
      .subscribe((data: any) => {
        console.log(data);
        this.myData = JSON.parse(data._body).sources;
      })
  }

}
