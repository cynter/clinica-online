import { Component, inject, Signal, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule, Router } from '@angular/router';

import { Auth, createUserWithEmailAndPassword, sendEmailVerification, User } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';

import { v4 as uuidv4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private storage = inject(Storage);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  public loading = false;

  fileName1: string = '';
  fileName2: string = '';

  tipoUsuario = signal<'paciente' | 'especialista' | 'admin' | null>(null);

  especialidades: string[] = [
    'Cardiología',
    'Dermatología',
    'Pediatría',
    'Traumatología',
    'Clínica Médica',
    'Oftalmología'
  ];

  mostrarOtraEspecialidad = false;

  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    edad: ['', [Validators.required, Validators.min(0)]],
    dni: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    obraSocial: [''],           // solo para paciente
    especialidad: [''],         // solo para especialista
    imagen1: [null, Validators.required], // ahora obligatorio para todos
    imagen2: [null],
  });

  onTipoChange(tipo: 'paciente' | 'especialista' | 'admin') {
    this.tipoUsuario.set(tipo);
    if (tipo !== 'especialista') {
      this.mostrarOtraEspecialidad = false;
      this.form.get('especialidad')?.setValue('');
    }
  }

  onEspecialidadChange(value: string) {
    this.mostrarOtraEspecialidad = value === 'otra';
    if (value !== 'otra') {
      this.form.get('especialidad')?.setValue(value);
    } else {
      this.form.get('especialidad')?.setValue('');
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    const { email, password } = this.form.value;

    try {
      const userCred = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCred.user;

      const uid = userCred.user?.uid;
      if (!uid) throw new Error('No UID');

      // Subida de imágenes (mínimo una)
      const img1File = this.form.value.imagen1;
      const img2File = this.tipoUsuario() === 'paciente' ? this.form.value.imagen2 : null;

      const upload = async (file: File, name: string): Promise<string> => {
        const path = `usuarios/${uid}/${name}-${uuidv4()}`;
        const storageRef = ref(this.storage, path);
        await uploadBytes(storageRef, file);
        this.loading = false;
        return await getDownloadURL(storageRef);
      };

      const img1Url = img1File ? await upload(img1File, 'img1') : '';
      const img2Url = img2File ? await upload(img2File, 'img2') : '';

      // Guardar datos adicionales en Firestore
      const tipo = this.tipoUsuario();
      const data: any = {
        uid,
        nombre: this.form.value.nombre,
        apellido: this.form.value.apellido,
        edad: this.form.value.edad,
        dni: this.form.value.dni,
        email: this.form.value.email,
        rol: tipo,
        aprobado: tipo === 'especialista' ? false : true,
        obraSocial: tipo === 'paciente' ? this.form.value.obraSocial : null,
        especialidad: tipo === 'especialista' ? this.form.value.especialidad : null,
        imagen1: img1Url,
        imagen2: tipo === 'paciente' ? img2Url || null : null,
      };

      await setDoc(doc(this.firestore, 'usuarios', uid), data);

      await sendEmailVerification(user);
      this.snackBar.open('Registro exitoso. Por favor verifica tu correo.', 'Cerrar', { duration: 3000 });

      this.router.navigate(['/home']);

    } catch (err) {
      console.error(err);
      this.snackBar.open('Error en el registro: ' + (err as Error).message, 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onFileChange(e: Event, field: 'imagen1' | 'imagen2') {
    const file = (e.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.form.get(field)?.setValue(file);
      if (field === 'imagen1') {
        this.fileName1 = file.name;
      } else if (field === 'imagen2') {
        this.fileName2 = file.name;
      }
    }
  }
}
