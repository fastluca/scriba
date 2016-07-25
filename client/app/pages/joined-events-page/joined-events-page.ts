import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {EventService} from '../../services/event-services';
import {UserService} from '../../services/user-services';
import {Events} from 'ionic-angular';
import {ListenInterventPage} from '../listen-intervent-page/listen-intervent-page';

import {User} from '../../services/models/user-model';

declare var io: any;

@Component({
  templateUrl: 'build/pages/joined-events-page/joined-events-page.html',
  providers: [EventService, UserService]
})
export class JoinedEventsPage {

  //GETS CURRENT USER
    private localUser;
    private user; 

	private events = [];

  constructor(private evts: Events, private nav: NavController, private es: EventService, private us: UserService) {
    this.updateUser();
    console.log(this.localUser);
    console.log(this.user.observedEvents);
  }
  
  ionViewWillEnter(){
	  this.updateEvents();
    this.updateUser();
  }
  updateUser(){
    this.localUser=JSON.parse(window.localStorage.getItem("user"));
    this.user = new User(this.localUser.name, this.localUser.surname, this.localUser.username, this.localUser.password, this.localUser.email, this.localUser.observedEvents, this.localUser.joinedEvents);    
  }

  updateEvents(){
    let _events = [];

    this.es.getJoinedEvents().map(res=> res.json()).subscribe((data) => {
      data.data.forEach(event =>{
        event.expanded=false;
        
        //FINDS AND MERGES SESSIONS
        let _sessions = [];
        this.es.getSessions(event._id).map(res=>res.json()).subscribe(data=>{
          data.data.forEach(session =>{
            session.expanded=false;
            //FINDS AND MERGES INTERVENTS
            let _intervents = [];
            this.es.getIntervents(session._id).map(res=>res.json()).subscribe(data=>{
              data.data.forEach(intervent =>{
                intervent.expanded=false;
                _intervents.push(intervent);
              });
              session.intervents=_intervents;
            });
            _sessions.push(session);
          });
          event.sessions=_sessions;
        })
        _events.push(event);
      });
      this.events = _events;
    });
  }
  openEvent(eventToOpen){
    this.us.addJoinedEvent(eventToOpen._id).map(res=>res.json()).subscribe(data=>{
      console.log(data);
    });
    this.events.forEach(event => {
      if(event._id==eventToOpen._id){
        console.log(event);
        event.sessions.forEach(session => {
          if(session.status=="ongoing"){
            console.log(session);
            session.intervents.forEach(intervent => {
              if(intervent.status=="ongoing"){
                console.log(intervent);
                this.nav.push(ListenInterventPage,{intervent: intervent})
              }
            });
          }
        });
      }
    });
  }
  delete(event){
    this.us.removeJoinedEvent(event._id).map(res=>res.json()).subscribe(data=>{
      console.log(data);
      if(data.success){
        this.updateUser();
        this.updateEvents();
      }else{
        alert(data.msg);
      }
    });
  }
}


  
  