import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { collection, doc, updateDoc, where, query } from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface Usuario {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
  aprobado: boolean;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  private firestore = inject(Firestore);
  // Observable con datos de especialistas no aprobados
  especialistas$: Observable<Usuario[]> = collectionData(
    query(
      collection(this.firestore, 'usuarios'),
      where('rol', '==', 'especialista'),
      where('aprobado', '==', false)
    ),
    { idField: 'uid' }
  ) as Observable<Usuario[]>;

  // Señal segura para la vista
  especialistas = toSignal(this.especialistas$, { initialValue: [] });

  aprobar(uid: string) {
    const ref = doc(this.firestore, `usuarios/${uid}`);
    updateDoc(ref, { aprobado: true });
  }
}
