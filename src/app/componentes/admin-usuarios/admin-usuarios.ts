import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { collection, doc, updateDoc} from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { RegisterComponent } from '../register/register';

@Component({
  selector: 'app-admin-usuarios',
  imports: [CommonModule, MatTableModule, MatButtonModule, RegisterComponent],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios {
  private firestore = inject(Firestore);

  usuarios$: Observable<any[]> = collectionData(
    collection(this.firestore, 'usuarios'),
    { idField: 'uid' }
  ) as Observable<any[]>;

  async cambiarEstadoEspecialista(uid: string, aprobado: boolean) {
    const ref = doc(this.firestore, `usuarios/${uid}`);
    await updateDoc(ref, { aprobado });
  }
}
