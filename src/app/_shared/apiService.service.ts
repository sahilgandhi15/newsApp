import { Inject, Injectable, EventEmitter } from '@angular/core';
import { Response, URLSearchParams, Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { DatePipe } from '@angular/common';

@Injectable()
export class ApiService {
  public showSpinner: boolean;
  private spinnerCounter = 0;
  private readonly apiBaseUrl: string;
  private readonly appId: number;
  private defaultParams;
  public spinnerChange: EventEmitter<any>;

  constructor(
    @Inject(APP_CONFIG) config: AppConfig,
    private _http: Http,
    private authService: AuthenticationService,
    private datePipe: DatePipe,
    private auth: Auth
  ) {
    this.apiBaseUrl = config.apiEndpoint;
    this.appId = config.appId;
    this.spinnerChange = new EventEmitter<any>();

    this.defaultParams = this.auth.authenticated() ? {
      __globalLanguageId: 1,
      __globalAppId: this.appId,
      __globalUserId: this.auth.userId,
      __globalAppTypeId: 1,
      __globalBusinessEntityId: 1,
      __globalModuleId: 3,
      __globalSessionId: this.auth.sessionId,
      uuid: this.auth.uuId,
      authToken: this.auth.token
    } : undefined;
  }


  private convertParams(params: any): URLSearchParams {
    const urlParams = new URLSearchParams();

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        urlParams.append(key, params[key]);
      }
    }
    return urlParams;
  }

  /**
   * Generic GET method for all API calls
   * @param url The URL from which to request the data.
   * @param params Parameters to pass along with the request.
   * Keep in mind - keys of Json object should match actual parameters for stored proc.
   * Request will be your JSON object which will have parameters and values you need to pass for API call
   *
   * @example
   * this.apiService.getApiCall("api/COTI/Deal/ChangeRequest/List", {
            saleId: 1313,
            DepartmentId: 1
        });
   */
  public getApiCall(url: string, params?: any): Observable<any> {
    const _params = this.auth.authenticated() ?
      Object.assign({}, this.defaultParams) : undefined;

    if (params) {
      for (let index = 0; index < Object.keys(params).length; index++) {
        let v = params[Object.keys(params)[index]];

        // For dates API expects certain format
        if (v instanceof Date) {
          v = this.datePipe.transform(v, 'yyyy/MM/dd');
        }

        _params[Object.keys(params)[index]] = v;
      }
    }

    return this.get(this.getApiUrl(url), _params)
      .map((res: Response) => res.json());
  }

  /**
   * Generic POST method for all API calls
   * @param url The URL from which to request the data.
   * @param params Parameters to pass along with the request.
   * Keep in mind - keys of Json object should match actual parameters for stored proc.
   * Request will be your JSON object which will have parameters and values you need to pass for API call
   *
   * @example
   * this.apiService.postApiCall("api/COTI/Deal/ChangeRequest/Add", {
            saleId: 1313,
            DepartmentId: 1

        });
   */
  public postApiCall(url: string, params?: any) {
    const _params = this.auth.authenticated() ?
      Object.assign({}, this.defaultParams) : undefined;

    if (params) {
      for (let index = 0; index < Object.keys(params).length; index++) {
        _params[Object.keys(params)[index]] = params[Object.keys(params)[index]]
      }
    }

    return this.post(this.getApiUrl(url), null, _params)
      .map((res: Response) => res.json());
  }

  public getApiUrl(url?: string): string {
    return this.apiBaseUrl + '' + url;
  }

  public get(url: string, params?: any, displaySpinner?: boolean) {
    this.showSpinner = true;
    if (displaySpinner) {
      this.displaySpinner(url);
    }
    this.spinnerChange.emit(true);

    // for caching issue solution in IE and FF
    const rnd = Math.floor((1 + Math.random()) * 0x10000000).toString(36);

    if (params == null) {
      params = {};
    }
    params.r = rnd;

    const headers = new Headers();
    headers.append('Authorization', this.auth.token);
    return this._http.get(url, { search: this.convertParams(params) /**, headers: headers */ })
      .map(response => {
        this.spinnerChange.emit(false);
        return this.handleResponse(response, false, displaySpinner);
      }).retryWhen((error) => this.restartSubjectCall(error, displaySpinner));
  }

  public post(url: string, params?: any, data?: any, mapJson?: boolean, displaySpinner?: boolean) {
    if (displaySpinner) {
      this.displaySpinner(url);
    }
    const options = {
      search: params instanceof URLSearchParams ? params : this.convertParams(params),
      headers: new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        // 'Authorization': this.auth.token
      })
    };

    return this._http.post(url, JSON.stringify(data), options)
      .map(response => this.handleResponse(response, mapJson, displaySpinner))
      .retryWhen((error) => this.restartSubjectCall(error, displaySpinner));
  }

  delete(url: string, id: any, displaySpinner) {
    return this._http.delete(url + '/' + id.toString()).map(response => {
      return this.handleResponse(response, false, displaySpinner);
    })
  }

  restartSubjectCall(errors, displaySpinner): Observable<any> {
    return errors.switchMap(err => {
      if (displaySpinner) {
        this.hideSpinner('restartSubjectCall');
      }

      if (err.status === 401) {
        window.location.href = '/login';
      } else if (err.status === 403) {
        return Observable.throw(err);
      } else {
        return Observable.throw(err);
      }
    });
  }

  handleResponse(response: Response, mapJson: boolean, displaySpinner: boolean) {
    if (displaySpinner) {
      this.hideSpinner(response.url);
    }

    if (mapJson) {
      return response.json();
    } else {
      return <Response>response;
    }
  }

  displaySpinner(caller: string) {
    // this.spinnerCounter++;
    this.showSpinner = true;
  }

  hideSpinner(caller: string) {
    // if (this.spinnerCounter > 0) {
    //   this.spinnerCounter--;
    // }

    // if (this.spinnerCounter === 0) {
    //   this.showSpinner = false;
    // }

    this.showSpinner = false;

  }

  forceHideSpinner() {
    this.spinnerCounter = 0;
    this.hideSpinner('forceHideSpinner');
  }
}
