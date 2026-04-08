import { Injectable } from '@angular/core';
import { readV2, addV2, deleteV2, generateV2Id, keysV2 } from '../../../core/helpers/storage-v2.helper';
import { Documento, DocumentoVinculo, DocumentoComVinculo, TipoDocumento } from '../models/documento.models';

@Injectable({ providedIn: 'root' })
export class DocumentoService {

  /** Reads a File, converts to base64, stores as Documento and creates a DocumentoVinculo */
  async uploadEVincular(
    file: File,
    tipoDocumentoId: string,
    usuarioUploadId: string,
    entidade: string,
    entidadeId: string,
    papel?: string,
    observacao?: string
  ): Promise<{ documento: Documento; vinculo: DocumentoVinculo }> {
    const base64 = await this.fileToBase64(file);
    const extensao = (file.name.split('.').pop() ?? '').toLowerCase();

    const docData: Omit<Documento, 'id'> = {
      tipoDocumentoId,
      usuarioUploadId,
      nomeOriginal: file.name,
      nomeSalvo: `${generateV2Id()}.${extensao}`,
      caminhoArquivo: base64,
      extensao,
      contentType: file.type || this.guessMimeType(extensao),
      tamanhoBytes: file.size,
      dataUpload: new Date().toISOString(),
      observacao
    };

    const documento: Documento = { ...docData, id: generateV2Id() };
    addV2<Documento>(keysV2.documentos, documento);
    const vinculo = this.vincular(documento.id, entidade, entidadeId, papel);
    return { documento, vinculo };
  }

  vincular(documentoId: string, entidade: string, entidadeId: string, papel?: string): DocumentoVinculo {
    const v: DocumentoVinculo = {
      id: generateV2Id(),
      documentoId,
      entidade,
      entidadeId,
      papel,
      dataVinculo: new Date().toISOString()
    };
    addV2<DocumentoVinculo>(keysV2.documentoVinculos, v);
    return v;
  }

  desvincular(vinculoId: string): void {
    deleteV2(keysV2.documentoVinculos, vinculoId);
  }

  removeDocumento(documentoId: string): void {
    // Remove all vinculos first, then remove the document
    readV2<DocumentoVinculo>(keysV2.documentoVinculos)
      .filter(v => v.documentoId === documentoId)
      .forEach(v => deleteV2(keysV2.documentoVinculos, v.id));
    deleteV2(keysV2.documentos, documentoId);
  }

  /** Returns documents linked to a given entity, enriched with TipoDocumento info */
  getDocumentosByEntidade(entidade: string, entidadeId: string): DocumentoComVinculo[] {
    const vinculos = readV2<DocumentoVinculo>(keysV2.documentoVinculos)
      .filter(v => v.entidade === entidade && v.entidadeId === entidadeId);
    const allDocs = readV2<Documento>(keysV2.documentos);
    const allTipos = readV2<TipoDocumento>(keysV2.tiposDocumento);

    return vinculos
      .map(v => {
        const doc = allDocs.find(d => d.id === v.documentoId);
        if (!doc) return null;
        const tipo = allTipos.find(t => t.id === doc.tipoDocumentoId);
        return {
          ...doc,
          vinculoId: v.id,
          tipoDocumentoNome:     tipo?.nome       ?? '—',
          tipoDocumentoCodigo:   tipo?.codigo     ?? '—',
          tipoDocumentoCategoria: tipo?.categoria ?? 'Outro'
        } as DocumentoComVinculo;
      })
      .filter(Boolean) as DocumentoComVinculo[];
  }

  getAll(): Documento[] {
    return readV2<Documento>(keysV2.documentos)
      .sort((a, b) => b.dataUpload.localeCompare(a.dataUpload));
  }

  getById(id: string): Documento | undefined {
    return readV2<Documento>(keysV2.documentos).find(d => d.id === id);
  }

  baixar(doc: Documento): void {
    const anchor = document.createElement('a');
    anchor.href = doc.caminhoArquivo;
    anchor.download = doc.nomeOriginal;
    anchor.click();
  }

  isImagem(doc: Documento): boolean {
    return ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'].includes(doc.contentType)
      || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(doc.extensao);
  }

  isPdf(doc: Documento): boolean {
    return doc.contentType === 'application/pdf' || doc.extensao === 'pdf';
  }

  formatarTamanho(bytes: number): string {
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
    });
  }

  private guessMimeType(ext: string): string {
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', webp: 'image/webp',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
      csv: 'text/csv',
    };
    return map[ext] ?? 'application/octet-stream';
  }
}
