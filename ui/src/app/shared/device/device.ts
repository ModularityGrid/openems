import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';

import { Websocket } from '../shared';
import { ConfigImpl } from './config';
import { CurrentDataAndSummary } from './currentdata';
import { DefaultMessages } from '../service/defaultmessages';
import { DefaultTypes } from '../service/defaulttypes';
import { Utils } from '../service/utils';
import { Role, ROLES } from '../type/role';

export class Log {
  timestamp: number;
  time: string = "";
  level: string;
  color: string = "black";
  source: string;
  message: string;
}

export class Device {

  constructor(
    public readonly name: string,
    public readonly comment: string,
    public readonly producttype: string,
    public readonly role: Role,
    public online: boolean,
    private replyStreams: { [id: string]: Subject<DefaultMessages.Reply> },
    private websocket: Websocket
  ) {
    // prepare stream/obersable for currentData
    let currentDataStream = replyStreams["currentData"] = new Subject<DefaultMessages.CurrentDataReply>();
    this.currentData = currentDataStream
      .map(message => message.currentData)
      .combineLatest(this.config, (currentData, config) => new CurrentDataAndSummary(currentData, config));
  }

  // holds current data
  public currentData: Observable<CurrentDataAndSummary>;

  // holds device configuration; gets new configuration on first subscribe
  public config: Observable<ConfigImpl> = Observable
    .create((observer: Observer<ConfigImpl>) => {
      // send query
      let message = DefaultMessages.configQuery();
      let messageId = message.id[0];
      this.replyStreams[messageId] = new Subject<DefaultMessages.Reply>();
      this.send(message);
      // wait for reply
      this.replyStreams[messageId].first().subscribe(reply => {
        let config = (<DefaultMessages.ConfigQueryReply>reply).config;
        let configImpl = new ConfigImpl(config)
        observer.next(configImpl);
      });
      // TODO add timeout
    }).publishReplay(1).refCount();

  public event = new Subject<Notification>();
  public address: string;
  public log = new Subject<Log>();

  //public historykWh = new BehaviorSubject<any[]>(null);
  private state: 'active' | 'inactive' | 'test' | 'installed-on-stock' | '' = '';
  private subscribeCurrentDataChannels: DefaultTypes.ChannelAddresses = {};

  /**
   * Sends a message to websocket
   */
  public send(value: any): void {
    this.websocket.send(this, value);
  }

  /**
   * Subscribe to current data of specified channels
   */
  public subscribeCurrentData(channels: DefaultTypes.ChannelAddresses): Observable<CurrentDataAndSummary> {
    // send subscribe
    let message = DefaultMessages.currentDataSubscribe(channels);
    this.send(message);
    this.subscribeCurrentDataChannels = channels;
    // TODO timeout
    return this.currentData;
  }

  /**
   * Unsubscribe from current data
   */
  public unsubscribeCurrentData() {
    this.subscribeCurrentData({});
  }

  /**
   * Query data
   */
  // TODO: kWh: this.getkWhResult(this.getImportantChannels())
  public historicDataQuery(fromDate: moment.Moment, toDate: moment.Moment, channels: DefaultTypes.ChannelAddresses): Promise<DefaultTypes.HistoricData> {
    // send query
    let timezone = new Date().getTimezoneOffset() * 60;
    let message = DefaultMessages.historicDataQuery(fromDate, toDate, timezone, channels);
    let messageId = message.id[0];
    this.replyStreams[messageId] = new Subject<DefaultMessages.Reply>();
    this.send(message);
    // wait for reply
    return new Promise((resolve, reject) => {
      this.replyStreams[messageId].first().subscribe(reply => {
        let historicData = (<DefaultMessages.HistoricDataReply>reply).historicData;
        this.replyStreams[messageId].unsubscribe();
        delete this.replyStreams[messageId];
        resolve(historicData);
      });
    })
  }

  public setOnline(online: boolean) {
    this.online = online;
  }





  // // create query object
  // let obj = {
  //   mode: "history",
  //   fromDate: fromDate.format("YYYY-MM-DD"),
  //   toDate: toDate.format("YYYY-MM-DD"),
  //   timezone: new Date().getTimezoneOffset() * 60,
  //   channels: channels
  // };
  // // send query and receive requestId
  // let requestId = this.send({ query: obj });
  // // prepare result
  // let ngUnsubscribe: Subject<void> = new Subject<void>();
  // let result = new Subject<QueryReply>();
  // // timeout after 10 seconds
  // setTimeout(() => {
  //   result.error("Query timeout");
  //   result.complete();
  // }, 10000);
  // wait for queryreply with this requestId
  // this.replyStream.takeUntil(ngUnsubscribe).subscribe(queryreply => {
  //   if (queryreply.requestId == requestId) {
  //     ngUnsubscribe.next();
  //     ngUnsubscribe.complete();
  //     result.next(queryreply);
  //     result.complete();
  //   }
  // });
  // return result;




  /**
   * Subscribe to log
   */
  public subscribeLog(key: "all" | "info" | "warning" | "error") {
    this.send({
      subscribe: {
        log: key
      }
    });
  }

  /**
   * Unsubscribe from channels
   */
  public unsubscribeLog() {
    this.send({
      subscribe: {
        log: ""
      }
    });
  }


  /*
   * log
   */
  // if ("log" in message) {
  //   let log = message.log;
  //   this.log.next(log);
  // }


  //let kWh = null;
  // history data
  // if (message.queryreply != null) {
  //   if ("data" in message.queryreply && message.queryreply.data != null) {
  //     data = message.queryreply.data;
  //     for (let datum of data) {
  //       let sum = this.calculateSummary(datum.channels);
  //       datum["summary"] = sum;
  //     }
  //   }
  //   // kWh data
  //   if ("kWh" in message.queryreply) {
  //     kWh = message.queryreply.kWh;
  //   }
  // }
  //this.historykWh.next(kWh);
  // }
}