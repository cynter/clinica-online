import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { RegisterComponent } from './componentes/register/register';
import { LoginComponent } from './componentes/login/login';
import { Admin } from './componentes/usuarios/admin/admin';
import { authGuard } from './guard/auth-guard';
import { verificadoGuard } from './guard/verificado-guard';
import { adminGuard } from './guard/admin-guard';
import { Especialista } from './componentes/usuarios/especialista/especialista';
import { Paciente } from './componentes/usuarios/paciente/paciente';
import { pacienteGuard } from './guard/paciente-guard';
import { especialistaGuard } from './guard/especialista-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },

    { path: 'admin', component: Admin, canActivate: [authGuard, verificadoGuard, adminGuard] },
    { path: 'especialista', component: Especialista, canActivate: [authGuard, verificadoGuard, especialistaGuard] },
    { path: 'paciente', component: Paciente, canActivate: [authGuard, verificadoGuard, pacienteGuard] },

    { path: 'admin/usuarios', loadComponent: () => import('./componentes/admin/admin').then(m => m.Admin) }
];