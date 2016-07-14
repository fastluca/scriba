import { Component } from '@angular/core';
import {NgForm} from '@angular/forms';
import {NavController, NavParams, Modal, Alert} from 'ionic-angular';
import {EventService} from '../../services/event-services';
import {Events} from 'ionic-angular';

//IMPORT MODELS
import {User} from '../../services/models/user-model';

//IMPORT PAGES - MODALS
import {NewSessionPage} from '../modals/session/session-modal';
import {SessionPage} from '../session-page/session-page';

@Component({
  templateUrl: 'build/pages/event-page/event-page.html',
  providers: [EventService]
})
export class EventPage {
  //GETS CURRENT USER
  private localUser=JSON.parse(window.localStorage.getItem("user"));
  private user= new User(this.localUser.name, this.localUser.surname, this.localUser.username, this.localUser.password, this.localUser.email);    

  //SETS PASSED EVENT
  private updating = false;
  private event;
  private newData;

  //SETS EVENT SESSIONS
  private sessions = [];

  constructor(private nav: NavController, private np: NavParams, private es: EventService, private evts: Events) {
    this.event=this.np.get('event');
    this.newData={title:this.event.title, date: this.event.date, location: this.event.location};
  }

  ionViewWillEnter(){
	  this.updateSessions(this.event._id);
  }

  updateSessions(eventID){//CAMBIARE IN GET PERSONAL EVENTS
    let _sessions = [];

    this.es.getSessions(eventID).map(res=> res.json()).subscribe((data) => {
      console.log(data);
      data.data.forEach(session =>{
            session.expanded=false;
            
            //FINDS AND MERGES INTERVENTS
            let _intervents = [];
            this.es.getIntervents(session._id).map(res=>res.json()).subscribe(data=>{
              data.data.forEach(intervent =>{
                _intervents.push(intervent);
              session.intervents=_intervents;
              })
            });
            _sessions.push(session);
            this.sessions=_sessions;
          })
      });
  }
  submit(){
    this.newData._id=this.event._id;
    this.es.updateEvent(this.newData).map(res=>res.json()).subscribe(data=>{
      console.log(data);
      if(data.success){
        this.nav.pop()
      }else{
        alert(data.msg)
      }
    })
  }
  reset(){
    this.newData={title:this.event.title, date: this.event.date, location: this.event.location};
    this.updating=false;
  }

  newSession(){
    this.evts.subscribe('reloadEventPage',() => {
      console.log("Update Sessions and remove session and intervent fetch from personal events page");
      this.updateSessions(this.event._id);
    });
    let modal = Modal.create(NewSessionPage, {eventID: this.event._id});
    this.nav.present(modal);
  }

  openSession(sessionToOpen){
    this.nav.push(SessionPage,{
        session: sessionToOpen,
    });
  }

  deleteSession(session){
    if(this.sessions.length==1){
      alert("Impossibile eliminare la sessione. Deve essere sempre presente almeno una Sessione per un Evento!")
    }else{
      let confirm = Alert.create({
        title: 'Cancellare questo Intervento?',
        message: 'Se cancelli questa sessione saranno eliminati tutti gli interventi al suo interno e non sarà più possibile ripristinarla!',
        buttons: [
          {
            text: 'Cancella',
            handler: () => {
              console.log('Cancellala');
              this.es.deleteSession(session._id).map(res=>res.json()).subscribe(data=>{
                if (data.success) {
                  this.updateSessions(this.event._id);
                }else{
                  alert(data.msg)
                }
              });
            }
          },
          {
            text: 'Mantieni'
          }
        ]
      });
      this.nav.present(confirm);
    }
  }
  close() {
      this.nav.pop();
  }
}