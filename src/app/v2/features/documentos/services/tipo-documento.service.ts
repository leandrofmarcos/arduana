import { Injectable } from '@angular/core';
import { readV2, addV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../core/helpers/storage-v2.helper';
import { TipoDocumento } from '../models/documento.models';

const TIPOS_DOCUMENTO_SEED: Omit<TipoDocumento, 'id' | 'ativo'>[] = [
  { nome: 'Bill of Lading',                 codigo: 'BL',       categoria: 'Embarque' },
  { nome: 'Invoice',                        codigo: 'INVOICE',  categoria: 'Fiscal'   },
  { nome: 'Packing List',                   codigo: 'PACKLIST', categoria: 'Embarque' },
  { nome: 'DI - Declaração de Importação',  codigo: 'DI',       categoria: 'Aduana'   },
  { nome: 'LI - Licença de Importação',     codigo: 'LI',       categoria: 'Aduana'   },
  { nome: 'Certificado de Origem',          codigo: 'CO',       categoria: 'Fiscal'   },
  { nome: 'Comprovante de Pagamento',       codigo: 'PGTO',     categoria: 'Fiscal'   },
  { nome: 'Contrato',                       codigo: 'CONTRATO', categoria: 'Contrato' },
  { nome: 'Outros',                         codigo: 'OUTROS',   categoria: 'Outro'    },
];

@Injectable({ providedIn: 'root' })
export class TipoDocumentoService {

  initSeed(): void {
    const existing = readV2<TipoDocumento>(keysV2.tiposDocumento);
    if (existing.length === 0) {
      TIPOS_DOCUMENTO_SEED.forEach(s =>
        addV2<TipoDocumento>(keysV2.tiposDocumento, { ...s, ativo: true } as TipoDocumento)
      );
    }
  }

  getAll(): TipoDocumento[] {
    return readV2<TipoDocumento>(keysV2.tiposDocumento)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  getAtivos(): TipoDocumento[] {
    return this.getAll().filter(t => t.ativo);
  }

  getById(id: string): TipoDocumento | undefined {
    return readV2<TipoDocumento>(keysV2.tiposDocumento).find(t => t.id === id);
  }

  create(data: Omit<TipoDocumento, 'id'>): TipoDocumento {
    const item: TipoDocumento = { ...data, id: generateV2Id() } as TipoDocumento;
    addV2<TipoDocumento>(keysV2.tiposDocumento, item);
    return item;
  }

  update(item: TipoDocumento): void {
    updateV2<TipoDocumento>(keysV2.tiposDocumento, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.tiposDocumento, id);
  }
}
