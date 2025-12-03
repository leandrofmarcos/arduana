import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ANEXO_REPOSITORY } from '../../core/repository.tokens';
import { AnexoRepository } from '../../domain/anexo.repository';
import { Anexo } from '../../domain/anexo.models';

@Injectable({ providedIn: 'root' })
export class AnexosService {
  private repo = inject<AnexoRepository>(ANEXO_REPOSITORY);

  list$(): Observable<Anexo[]> {
    const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || '';
    return this.repo.list$(id);
  }

  addFile(file: File){
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.repo.add({ processoId: '', nome: file.name, mime: file.type || 'application/octet-stream', tamanho: file.size, dataBase64: base64 });
    };
    reader.readAsDataURL(file);
  }

  remove(id: string){ this.repo.remove(id); }
}