import {Component, Input, OnInit} from '@angular/core';
import {Credentials} from '../credentials';
import {AuthenticationService} from '../authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials: Credentials;
  error: string;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.credentials = {} as Credentials;
  }

  login() {
    this.authenticationService.login(this.credentials)
      .subscribe(
        data => {
          console.log('Login successful');
          this.router.navigateByUrl('/');
        },
        error => {
          console.error('Error: ' + error);
          this.error = 'Login failed';
        }
      );
  }
}
