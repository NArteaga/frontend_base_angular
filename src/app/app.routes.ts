import { Routes } from '@angular/router';
import { LoginLayout } from '@layouts/login/login.component';
import { MainLayout } from '@layouts/main/main.component';
import { LoginPage } from '@pages/login/login.component';
import { authGuard } from '@guard/auth.guard';
import { NotFoundPage } from '@pages/404/404.component';
import { HomePage } from '@pages/home/home.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: LoginLayout,
    children: [
      { path: 'login', component: LoginPage },
    ]
  },
  {
    path: 'app',
    component: MainLayout,
    children: [
      { path: 'home', component: HomePage },
      { path: '404', component: NotFoundPage },
      { path: '**', redirectTo: '404', pathMatch: 'full' },
    ],
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'auth/login', pathMatch: 'full' }
];
