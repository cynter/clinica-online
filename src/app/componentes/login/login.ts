import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, signInWithEmailAndPassword, signOut, User, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private afAuth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  public loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  tipoSeleccionado: 'paciente' | 'especialista' | 'admin' | null = null;

  autofill(tipo: 'paciente' | 'especialista' | 'admin') {
    this.tipoSeleccionado = tipo;
    let email = '';
    let password = '';
    switch (tipo) {
      case 'paciente':
        email = 'samisaavedra96@hotmail.com';
        password = 'samisaav';
        break;
      case 'especialista':
        email = 'cynteran27@gmail.com';
        password = '123456';
        break;
      case 'admin':
        email = 'samisaavedra96@gmail.com';
        password = 'samisaav';
        break;
    }
    this.form.get('email')?.setValue(email);
    this.form.get('password')?.setValue(password);
  }

  async login() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    const { email, password } = this.form.value;

    try {
      const cred = await signInWithEmailAndPassword(this.afAuth, email!, password!);
      const user = cred.user;

      if (!user) throw new Error('Usuario no encontrado');

      await user.reload();

      if (!user.emailVerified) {
        await this.afAuth.signOut();
        this.snackBar.open('Por favor, verifica tu correo antes de ingresar.', 'Cerrar', { duration: 3000 });
        this.loading = false;
        return;
      }

      // Esperar un poco antes de acceder a Firestore
      await new Promise(resolve => setTimeout(resolve, 300));

      // Obtener info adicional desde Firestore
      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        this.snackBar.open('No se encontraron datos adicionales del usuario.', 'Cerrar', { duration: 3000 });
        this.loading = false;
        return;
      }

      const data = userSnap.data() as any;
      const rol = data.rol;
      const aprobado = data.aprobado;

      if (rol === 'especialista' && !aprobado) {
        await this.afAuth.signOut();
        this.snackBar.open('Tu cuenta aún no ha sido aprobada por un administrador.', 'Cerrar', { duration: 3000 });
        this.loading = false;
        return;
      }

      // Esperar a que Firebase Auth emita el usuario actualizado
      await firstValueFrom(authState(this.afAuth));

      // Ya están listas las señales, ahora sí navegar
      this.snackBar.open('Login exitoso', 'Cerrar', { duration: 2000 });

      // Redireccionar según rol
      //setTimeout(() => {
      if (rol === 'paciente') {
        this.router.navigate(['/paciente']);
      } else if (rol === 'especialista') {
        this.router.navigate(['/especialista']);
      } else if (rol === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']); // fallback
      }
      //}, 0);

    } catch (err) {
      console.error(err);
      this.snackBar.open('Error en el login: ' + (err as Error).message, 'Cerrar', { duration: 2000 });
    } finally {
      this.loading = false;
    }
  }
}