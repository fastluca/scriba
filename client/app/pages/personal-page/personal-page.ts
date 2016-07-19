import {Component} from '@angular/core'
import {HomePage} from '../home-page/home-page';
import {AboutPage} from '../about-page/about-page';
import {ContactPage} from '../contact-page/contact-page';
import {Modal, NavController, MenuController, Events} from 'ionic-angular';
import {UserService} from '../../services/user-services';
import {User} from '../../services/models/user-model';
import {TabsPage} from '../tabs/tabs';
import {UserDataPage} from '../modals/user-update/userData-modal';
import {LoginPage} from '../modals/login/login-modal';
import {PersonalEventsPage} from '../personal-events-page/personal-events-page';

@Component({
  templateUrl: 'build/pages/personal-page/personal-page.html',
  providers: [UserService]
})

export class PersonalPage {
  private user: User;
  private rootPage = HomePage;
  private PersonalEventsPage = PersonalEventsPage;
  private EventsPage = HomePage;//CAMBIARE CREANDONE UNA NUOVA
  private AboutPage = AboutPage;
  private ContactPage = ContactPage;

  constructor(private evts: Events, private nav: NavController, private us: UserService,  private menu: MenuController) {
    this.user = new User("","","","","");
  }
  ionViewWillEnter(){
	  this.getUserData();
  }
  getUserData(){
    this.us.getUserData().map(res => res.json()).subscribe( data => {
      if(data.success){
        this.user = new User(data.data.name, data.data.surname, data.data.username, data.data.password, data.data.email);
        window.localStorage.setItem("user", JSON.stringify(this.user));
      }else{
        this.nav.setRoot(TabsPage);
        let modal = Modal.create(LoginPage);
        this.nav.present(modal);
      }
    })
  }
  userData(){
    this.evts.subscribe('reloadUserData',() => {
      this.getUserData();
    });
    let modal = Modal.create(UserDataPage, {user: this.user});
    this.nav.present(modal);
  }

  logout(){
    this.us.logout();
    this.nav.setRoot(TabsPage);
  }

  openPage(page) {
    // Reset the nav controller to have just this page
    // we wouldn't want the back button to show in this scenario
    this.rootPage = page;
    
    // close the menu when clicking a link from the menu
    this.menu.close();
  }
}
