import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import {
  PacklistArquivoParsed,
  PacklistDto,
  PacklistMapeamento,
  PendingPacklist,
} from '../models/solicitacao-orcamento.models';
import { PacklistApiService } from '../services/packlist-api.service';

type WizardStep = 'idle' | 'preview' | 'mapeamento' | 'confirmacao' | 'pendente';

@Component({
  selector: 'app-packlist-assistente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .pl-wrap { margin-top: 4px; }
    /* Drop zone */
    .pl-drop { border: 2px dashed var(--color-border); border-radius: 10px; padding: 28px 20px; text-align: center; cursor: pointer; transition: .2s; background: var(--color-bg); }
    .pl-drop:hover, .pl-drop.drag-over { border-color: var(--color-primary); background: rgba(102,126,234,.05); }
    .pl-drop p { margin: 6px 0 0; font-size: 12px; color: var(--color-text-muted); }
    .pl-drop.disabled { opacity: .55; pointer-events: none; cursor: default; }
    /* Alerta merge */
    .pl-merge-alert { background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 10px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
    .pl-merge-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #92400e; }
    .pl-merge-desc { font-size: 13px; color: #78350f; line-height: 1.5; margin: 0; }
    .pl-merge-file { display: flex; align-items: center; gap: 8px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 7px; padding: 8px 12px; font-size: 13px; font-weight: 600; color: #92400e; }
    .pl-merge-what { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 7px; padding: 10px 14px; font-size: 12px; color: #9a3412; line-height: 1.6; }
    .pl-merge-what strong { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #c2410c; margin-bottom: 4px; }
    .pl-merge-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    /* Wizard box */
    .pl-wizard { border: 1.5px solid var(--color-border); border-radius: 10px; background: var(--color-surface); overflow: hidden; }
    .pl-wizard-header { background: var(--color-bg); border-bottom: 1px solid var(--color-border); padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
    .pl-wizard-header span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--color-text-muted); }
    .pl-step-dots { display: flex; gap: 6px; margin-left: auto; }
    .pl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); }
    .pl-dot.active { background: var(--color-primary, #6366f1); }
    .pl-dot.done { background: #22c55e; }
    .pl-wizard-body { padding: 16px; }
    /* Prévia da tabela */
    .pl-preview-table { width: 100%; border-collapse: collapse; font-size: 12px; overflow-x: auto; display: block; max-height: 200px; }
    .pl-preview-table th { background: var(--color-bg); padding: 6px 10px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; white-space: nowrap; }
    .pl-preview-table td { padding: 5px 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
    .pl-preview-table tr:last-child td { border-bottom: none; }
    /* Mapeamento */
    .pl-map-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
    .pl-map-row:last-child { border-bottom: none; }
    .pl-map-label { width: 110px; font-size: 13px; font-weight: 700; display: flex; flex-direction: column; gap: 2px; }
    .pl-map-label small { font-size: 10px; font-weight: 400; color: var(--color-text-muted); }
    .pl-map-row select { flex: 1; padding: 7px 10px; border: 2px solid var(--color-border); border-radius: 8px; font-size: 13px; background: var(--color-surface); color: var(--color-text); }
    .pl-map-row select:focus { outline: none; border-color: var(--color-primary); }
    /* Confirmação */
    .pl-confirm-info { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 14px; }
    .pl-confirm-info .kv { display: flex; flex-direction: column; gap: 2px; }
    .pl-confirm-info .kv label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--color-text-muted); }
    .pl-confirm-info .kv span { font-size: 13px; font-weight: 600; }
    .pl-confirm-table { width: 100%; border-collapse: collapse; font-size: 12px; display: block; overflow-x: auto; max-height: 200px; }
    .pl-confirm-table th { background: var(--color-bg); padding: 6px 10px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; }
    .pl-confirm-table td { padding: 5px 10px; border-bottom: 1px solid var(--color-border); }
    .pl-confirm-table tr:last-child td { border-bottom: none; }
    .pl-col-mapped { background: rgba(34,197,94,.08); font-weight: 600; color: #15803d; }
    /* Badge mapeado (verde) */
    .pl-badge { display: flex; flex-direction: column; gap: 6px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px 14px; }
    .pl-badge-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #15803d; flex-wrap: wrap; }
    .pl-badge-row button { background: none; border: none; cursor: pointer; font-size: 13px; color: #6b7280; padding: 0 2px; }
    .pl-badge-row button:hover { color: #ef4444; }
    .pl-badge-cols { font-size: 11px; color: #166534; }
    /* Badge sem mapeamento (âmbar) */
    .pl-badge-merge { display: flex; flex-direction: column; gap: 8px; background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 8px; padding: 10px 14px; }
    .pl-badge-merge-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #92400e; flex-wrap: wrap; }
    .pl-badge-merge-row button { background: none; border: none; cursor: pointer; font-size: 13px; color: #6b7280; padding: 0 2px; }
    .pl-badge-merge-row button:hover { color: #ef4444; }
    .pl-badge-merge-info { font-size: 11px; color: #78350f; line-height: 1.5; }
    /* Ações wizard */
    .pl-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
    .pl-btn { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 2px solid transparent; transition: .15s; }
    .pl-btn[disabled] { opacity: .55; cursor: not-allowed; }
    .pl-btn-primary { background: var(--color-primary, #6366f1); color: #fff; border-color: var(--color-primary, #6366f1); }
    .pl-btn-primary:hover:not([disabled]) { opacity: .88; }
    .pl-btn-warning { background: #f59e0b; color: #fff; border-color: #f59e0b; }
    .pl-btn-warning:hover:not([disabled]) { opacity: .88; }
    .pl-btn-secondary { background: transparent; color: var(--color-text); border-color: var(--color-border); }
    .pl-btn-secondary:hover:not([disabled]) { background: var(--color-bg); }
    /* Badge pendente (azul — configurado, aguarda salvar) */
    .pl-badge-pendente { display: flex; flex-direction: column; gap: 6px; background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 8px; padding: 10px 14px; }
    .pl-badge-pendente-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1d4ed8; flex-wrap: wrap; }
    .pl-badge-pendente-row button { background: none; border: none; cursor: pointer; font-size: 13px; color: #6b7280; padding: 0 2px; }
    .pl-badge-pendente-row button:hover { color: #ef4444; }
    .pl-badge-pendente-info { font-size: 11px; color: #1e40af; }
  `],
  template: `
<div class="pl-wrap">

  <!-- ── Carregando estado inicial ── -->
  <div *ngIf="loading" style="font-size:13px;color:var(--color-text-muted);padding:10px 0">
    Carregando packlist...
  </div>

  <ng-container *ngIf="!loading">

    <!-- ── Estado: arquivo com mapeamento salvo (verde) ── -->
    <ng-container *ngIf="step === 'idle' && resultadoAtual && !resultadoAtual.temCelulasMescladas">
      <div class="pl-badge">
        <div class="pl-badge-row">
          <span>📦</span>
          <strong>{{ resultadoAtual.nomeArquivo }}</strong>
          <span style="font-weight:400;color:#166534">— {{ resultadoAtual.totalLinhas }} {{ resultadoAtual.totalLinhas === 1 ? 'item' : 'itens' }} importados</span>
          <button (click)="downloadOriginal()" title="Baixar arquivo original">⬇️</button>
          <button (click)="remapear()" title="Refazer mapeamento">✏️</button>
          <button (click)="remover()" title="Remover packlist">✕</button>
        </div>
        <div class="pl-badge-cols" *ngIf="temMapeamentoDto(resultadoAtual)">
          Colunas mapeadas:
          <ng-container *ngIf="resultadoAtual.colunaNCM"> NCM → <em>{{ resultadoAtual.colunaNCM }}</em></ng-container>
          <ng-container *ngIf="resultadoAtual.colunaDescricao"> &nbsp;·&nbsp; Descrição → <em>{{ resultadoAtual.colunaDescricao }}</em></ng-container>
          <ng-container *ngIf="resultadoAtual.colunaPreco"> &nbsp;·&nbsp; Preço → <em>{{ resultadoAtual.colunaPreco }}</em></ng-container>
        </div>
      </div>
    </ng-container>

    <!-- ── Estado: arquivo salvo sem mapeamento (células mescladas) (âmbar) ── -->
    <ng-container *ngIf="step === 'idle' && resultadoAtual?.temCelulasMescladas">
      <div class="pl-badge-merge">
        <div class="pl-badge-merge-row">
          <span>⚠️</span>
          <strong>{{ resultadoAtual!.nomeArquivo }}</strong>
          <span style="font-weight:400">— salvo sem mapeamento</span>
          <button (click)="downloadOriginal()" title="Baixar arquivo original">⬇️</button>
          <button (click)="remover()" title="Remover e subir outro arquivo">✕</button>
        </div>
        <div class="pl-badge-merge-info">
          Este arquivo contém <strong>células mescladas</strong> e não pode ser lido como tabela pela aplicação.
          O arquivo está salvo e disponível para download no processo, mas <strong>não serão importados dados para cálculos</strong>.
          Para habilitar o mapeamento, corrija o arquivo (desfaça os merges) e suba novamente.
        </div>
      </div>
    </ng-container>

    <!-- ── Estado: idle sem packlist ── -->
    <ng-container *ngIf="step === 'idle' && !resultadoAtual">
      <!-- Alerta de merge com opções (mostrado sobre a drop zone) -->
      <div class="pl-merge-alert" *ngIf="mergeArquivoNome">
        <div class="pl-merge-title">⚠️ Arquivo com células mescladas detectado</div>

        <div class="pl-merge-file">
          📄 {{ mergeArquivoNome }}
        </div>

        <p class="pl-merge-desc">
          Este arquivo contém <strong>células mescladas</strong> (merge de células no Excel), o que impede a aplicação
          de ler a tabela de forma uniforme e realizar o mapeamento de colunas (NCM, Descrição, Preço).
        </p>

        <div class="pl-merge-what">
          <strong>O que acontecerá se você salvar assim:</strong>
          ✅ O arquivo será salvo e ficará disponível para download em todas as telas do processo (Solicitação, Custo do Despachante).<br>
          ❌ Os dados não serão importados para tabela — não haverá mapeamento de NCM, Descrição ou Preço.<br>
          💡 Para habilitar o mapeamento, abra o arquivo, desfaça todos os merges e suba novamente.
        </div>

        <div class="pl-merge-actions">
          <button class="pl-btn pl-btn-warning"
            [disabled]="uploadState === 'uploading'"
            (click)="salvarSemMapeamento()">
            <ng-container *ngIf="uploadState === 'uploading'">⏳ Salvando...</ng-container>
            <ng-container *ngIf="uploadState !== 'uploading'">💾 Salvar arquivo mesmo assim (só download)</ng-container>
          </button>
          <button class="pl-btn pl-btn-secondary" [disabled]="uploadState === 'uploading'" (click)="cancelarMerge()">
            Cancelar — escolher outro arquivo
          </button>
        </div>
      </div>

      <!-- Drop zone (visível apenas quando não tem alerta de merge ativo) -->
      <div class="pl-drop" *ngIf="!mergeArquivoNome"
        [class.drag-over]="dragOver"
        (dragover)="$event.preventDefault(); dragOver=true"
        (dragleave)="dragOver=false"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        <input #fileInput type="file" accept=".csv,.xlsx,.xls" style="display:none"
          (change)="onFileChange($event)" />
        <div style="font-size:28px">📂</div>
        <strong style="font-size:14px">Clique ou arraste o arquivo de packlist</strong>
        <p>Formatos aceitos: .csv, .xlsx &nbsp;·&nbsp; Máx. 10 MB</p>
      </div>
    </ng-container>

    <!-- ── Estado: pendente (configurado, aguardando salvar solicitação) ── -->
    <ng-container *ngIf="step === 'pendente'">
      <div *ngIf="uploadState === 'uploading'" class="pl-badge-pendente">
        <div class="pl-badge-pendente-row"><span>⏳</span><span>Salvando packlist...</span></div>
      </div>
      <div *ngIf="uploadState !== 'uploading'" class="pl-badge-pendente">
        <div class="pl-badge-pendente-row">
          <span>📦</span>
          <strong>{{ pendenteBlobNome() }}</strong>
          <span style="font-weight:400;color:#1e40af">— será salvo junto com a solicitação</span>
          <button (click)="cancelarPendente()" title="Cancelar">✕</button>
        </div>
        <div class="pl-badge-pendente-info" *ngIf="temMapeamento(mapeamento)">
          Colunas: <ng-container *ngIf="mapeamento.colunaNCM">NCM → <em>{{ mapeamento.colunaNCM }}</em></ng-container>
          <ng-container *ngIf="mapeamento.colunaDescricao">&nbsp;·&nbsp; Descrição → <em>{{ mapeamento.colunaDescricao }}</em></ng-container>
          <ng-container *ngIf="mapeamento.colunaPreco">&nbsp;·&nbsp; Preço → <em>{{ mapeamento.colunaPreco }}</em></ng-container>
        </div>
        <div class="pl-badge-pendente-info" *ngIf="mergeArquivoNome && !temMapeamento(mapeamento)">
          Arquivo com células mescladas — salvo apenas para download.
        </div>
      </div>
    </ng-container>

    <!-- ── Wizard de mapeamento ── -->
    <div class="pl-wizard" *ngIf="step !== 'idle' && step !== 'pendente'">
      <div class="pl-wizard-header">
        <span>Assistente de mapeamento</span>
        <div class="pl-step-dots">
          <div class="pl-dot" [class.active]="step==='preview'" [class.done]="isStepDone('preview')"></div>
          <div class="pl-dot" [class.active]="step==='mapeamento'" [class.done]="isStepDone('mapeamento')"></div>
          <div class="pl-dot" [class.active]="step==='confirmacao'" [class.done]="isStepDone('confirmacao')"></div>
        </div>
      </div>

      <div class="pl-wizard-body">

        <!-- Passo 1: Prévia -->
        <ng-container *ngIf="step === 'preview' && arquivo">
          <p style="font-size:13px;margin:0 0 12px">
            <strong>{{ arquivo.nomeArquivo }}</strong> &nbsp;·&nbsp;
            {{ arquivo.linhas.length }} linhas detectadas &nbsp;·&nbsp;
            {{ arquivo.colunas.length }} colunas
          </p>
          <div style="overflow-x:auto;border:1px solid var(--color-border);border-radius:8px">
            <table class="pl-preview-table">
              <thead>
                <tr><th *ngFor="let col of arquivo.colunas">{{ col }}</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of arquivo.linhas.slice(0,5)">
                  <td *ngFor="let col of arquivo.colunas" [title]="row[col] ?? ''">{{ row[col] ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style="font-size:11px;color:var(--color-text-muted);margin:8px 0 0">
            Exibindo as primeiras {{ arquivo.linhas.length > 5 ? 5 : arquivo.linhas.length }} linhas de {{ arquivo.linhas.length }}.
          </p>
          <div class="pl-actions">
            <button class="pl-btn pl-btn-primary" (click)="step = 'mapeamento'">Próximo →</button>
            <button class="pl-btn pl-btn-secondary" (click)="cancelarWizard()">Cancelar</button>
          </div>
        </ng-container>

        <!-- Passo 2: Mapeamento -->
        <ng-container *ngIf="step === 'mapeamento' && arquivo">
          <p style="font-size:13px;margin:0 0 14px;color:var(--color-text-muted)">
            Indique qual coluna do arquivo corresponde a cada campo. Todos são opcionais.
          </p>
          <div>
            <div class="pl-map-row">
              <div class="pl-map-label">NCM <small>Código NCM</small></div>
              <select [(ngModel)]="mapeamento.colunaNCM">
                <option value="">— Não mapear —</option>
                <option *ngFor="let c of arquivo.colunas" [value]="c">{{ c }}</option>
              </select>
            </div>
            <div class="pl-map-row">
              <div class="pl-map-label">Descrição <small>Nome do produto</small></div>
              <select [(ngModel)]="mapeamento.colunaDescricao">
                <option value="">— Não mapear —</option>
                <option *ngFor="let c of arquivo.colunas" [value]="c">{{ c }}</option>
              </select>
            </div>
            <div class="pl-map-row">
              <div class="pl-map-label">Preço <small>Valor unitário</small></div>
              <select [(ngModel)]="mapeamento.colunaPreco">
                <option value="">— Não mapear —</option>
                <option *ngFor="let c of arquivo.colunas" [value]="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <p *ngIf="!temMapeamento(mapeamento)" style="font-size:12px;color:#f59e0b;margin:10px 0 0">
            ⚠️ Nenhum campo mapeado. O packlist será salvo com todas as colunas originais, mas sem referência de dados para cálculos.
          </p>
          <div class="pl-actions">
            <button class="pl-btn pl-btn-primary" (click)="step = 'confirmacao'">Próximo →</button>
            <button class="pl-btn pl-btn-secondary" (click)="step = 'preview'">← Voltar</button>
            <button class="pl-btn pl-btn-secondary" (click)="cancelarWizard()">Cancelar</button>
          </div>
        </ng-container>

        <!-- Passo 3: Confirmação -->
        <ng-container *ngIf="step === 'confirmacao' && arquivo">
          <div class="pl-confirm-info">
            <div class="kv"><label>Arquivo</label><span>{{ arquivo.nomeArquivo }}</span></div>
            <div class="kv"><label>Total de linhas</label><span>{{ arquivo.linhas.length }}</span></div>
            <div class="kv"><label>NCM</label><span>{{ mapeamento.colunaNCM || '—' }}</span></div>
            <div class="kv"><label>Descrição</label><span>{{ mapeamento.colunaDescricao || '—' }}</span></div>
            <div class="kv"><label>Preço</label><span>{{ mapeamento.colunaPreco || '—' }}</span></div>
          </div>
          <div style="overflow-x:auto;border:1px solid var(--color-border);border-radius:8px">
            <table class="pl-confirm-table">
              <thead>
                <tr>
                  <th *ngFor="let col of arquivo.colunas" [class.pl-col-mapped]="isColMapped(col)">
                    {{ col }}<ng-container *ngIf="isColMapped(col)"> ✓</ng-container>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of arquivo.linhas.slice(0,5)">
                  <td *ngFor="let col of arquivo.colunas" [class.pl-col-mapped]="isColMapped(col)">{{ row[col] ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style="font-size:11px;color:var(--color-text-muted);margin:8px 0 0">
            {{ arquivo.linhas.length }} {{ arquivo.linhas.length === 1 ? 'linha será importada' : 'linhas serão importadas' }}
          </p>
          <div class="pl-actions">
            <button class="pl-btn pl-btn-primary"
              [disabled]="uploadState === 'uploading'"
              (click)="confirmar()">
              <ng-container *ngIf="uploadState === 'uploading'">⏳ Salvando...</ng-container>
              <ng-container *ngIf="uploadState !== 'uploading'">✓ Confirmar e salvar</ng-container>
            </button>
            <button class="pl-btn pl-btn-secondary" [disabled]="uploadState === 'uploading'" (click)="step = 'mapeamento'">← Voltar</button>
            <button class="pl-btn pl-btn-secondary" [disabled]="uploadState === 'uploading'" (click)="cancelarWizard()">Cancelar</button>
          </div>
        </ng-container>

      </div>
    </div>

  </ng-container>

</div>
  `
})
export class PacklistAssistenteComponent implements OnChanges {
  @Input()  solicitacaoId = '';
  @Output() mapeado  = new EventEmitter<PacklistDto>();
  @Output() pendente = new EventEmitter<PendingPacklist>();

  loading     = false;
  uploadState: 'idle' | 'uploading' = 'idle';
  step: WizardStep = 'idle';
  dragOver    = false;

  mergeArquivoNome = '';
  mergeArquivoBlob: Blob | null = null;

  arquivo:     PacklistArquivoParsed | null = null;
  mapeamento:  PacklistMapeamento = {};
  arquivoBlob: Blob | null = null;

  resultadoAtual: PacklistDto | null = null;

  constructor(private packlistSvc: PacklistApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['solicitacaoId']) {
      this.resultadoAtual = null;
      this.step           = 'idle';
      this.arquivo        = null;
      this.mapeamento     = {};
      this.mergeArquivoNome = '';
      this.mergeArquivoBlob = null;

      if (!this.solicitacaoId) {
        this.loading = false;
        return;
      }

      const cached = this.packlistSvc.getBySolicitacao(this.solicitacaoId);
      if (cached !== undefined) {
        this.resultadoAtual = cached;
        this.loading = false;
      } else {
        this.loading = true;
        void this.packlistSvc.loadBySolicitacao(this.solicitacaoId).then(dto => {
          this.resultadoAtual = dto;
          this.loading = false;
        });
      }
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    input.value = '';
    void this.processarArquivo(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    void this.processarArquivo(file);
  }

  private async processarArquivo(file: File): Promise<void> {
    this.mergeArquivoNome = '';
    this.mergeArquivoBlob = null;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. O limite é de 10 MB.');
      return;
    }

    const buffer = await file.arrayBuffer();
    const wb     = XLSX.read(buffer, { type: 'array', cellDates: true });
    const sheet  = wb.Sheets[wb.SheetNames[0]];

    if (ext !== 'csv' && sheet['!merges'] && sheet['!merges'].length > 0) {
      this.mergeArquivoNome = file.name;
      this.mergeArquivoBlob = new Blob([buffer], { type: file.type });
      return;
    }

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rawData.length < 2) return;

    const colunas: string[] = (rawData[0] as any[]).map((c, i) =>
      c != null && String(c).trim() !== '' ? String(c).trim() : `Coluna ${i + 1}`
    );
    const linhas = rawData.slice(1).map(row => {
      const obj: Record<string, any> = {};
      colunas.forEach((col, i) => { obj[col] = (row as any[])[i] ?? ''; });
      return obj;
    }).filter(row => Object.values(row).some(v => v !== ''));

    this.arquivo     = { nomeArquivo: file.name, extensao: ext === 'csv' ? 'csv' : 'xlsx', colunas, linhas, temCelulasMescladas: false };
    this.mapeamento  = {};
    this.arquivoBlob = new Blob([buffer], { type: file.type });
    this.step        = 'preview';
  }

  async salvarSemMapeamento(): Promise<void> {
    if (!this.mergeArquivoNome || !this.mergeArquivoBlob) return;

    if (!this.solicitacaoId) {
      this.pendente.emit({
        blob: this.mergeArquivoBlob,
        nomeArquivo: this.mergeArquivoNome,
        colunaNCM: null,
        colunaDescricao: null,
        colunaPreco: null,
        temCelulasMescladas: true,
        totalLinhas: 0
      });
      this.step = 'pendente';
      return;
    }

    this.uploadState = 'uploading';
    try {
      const f = new File([this.mergeArquivoBlob], this.mergeArquivoNome);
      await this.packlistSvc.upload(f, Number(this.solicitacaoId));
      const dto = await this.packlistSvc.loadBySolicitacao(this.solicitacaoId);
      this.resultadoAtual  = dto;
      this.mergeArquivoNome = '';
      this.mergeArquivoBlob = null;
      if (dto) this.mapeado.emit(dto);
    } finally {
      this.uploadState = 'idle';
    }
  }

  cancelarMerge(): void {
    this.mergeArquivoNome = '';
    this.mergeArquivoBlob = null;
  }

  async confirmar(): Promise<void> {
    if (!this.arquivo || !this.arquivoBlob) return;

    if (!this.solicitacaoId) {
      this.pendente.emit({
        blob: this.arquivoBlob,
        nomeArquivo: this.arquivo.nomeArquivo,
        colunaNCM: this.mapeamento.colunaNCM || null,
        colunaDescricao: this.mapeamento.colunaDescricao || null,
        colunaPreco: this.mapeamento.colunaPreco || null,
        temCelulasMescladas: false,
        totalLinhas: this.arquivo.linhas.length
      });
      this.step = 'pendente';
      return;
    }

    this.uploadState = 'uploading';
    try {
      const file       = new File([this.arquivoBlob], this.arquivo.nomeArquivo);
      const uploadResp = await this.packlistSvc.upload(file, Number(this.solicitacaoId));
      const dto        = await this.packlistSvc.saveMapeamento(
        uploadResp.packlistId,
        this.mapeamento.colunaNCM    || null,
        this.mapeamento.colunaDescricao || null,
        this.mapeamento.colunaPreco  || null
      );
      this.resultadoAtual = dto;
      this.step           = 'idle';
      this.arquivo        = null;
      this.mapeado.emit(dto);
    } finally {
      this.uploadState = 'idle';
    }
  }

  cancelarWizard(): void {
    this.step       = 'idle';
    this.arquivo    = null;
    this.mapeamento = {};
  }

  cancelarPendente(): void {
    this.step             = 'idle';
    this.arquivo          = null;
    this.mapeamento       = {};
    this.mergeArquivoNome = '';
    this.mergeArquivoBlob = null;
    this.arquivoBlob      = null;
  }

  pendenteBlobNome(): string {
    return this.arquivo?.nomeArquivo || this.mergeArquivoNome || '';
  }

  remapear(): void {
    this.resultadoAtual = null;
    this.step           = 'idle';
    this.arquivo        = null;
    this.mapeamento     = {};
  }

  async remover(): Promise<void> {
    if (!this.resultadoAtual) return;
    try {
      await this.packlistSvc.delete(this.resultadoAtual.id);
      this.packlistSvc.invalidate(this.solicitacaoId);
    } catch { /* ApiClientService já exibe o toast de erro */ }
    this.resultadoAtual  = null;
    this.arquivo         = null;
    this.mapeamento      = {};
    this.mergeArquivoNome = '';
    this.mergeArquivoBlob = null;
  }

  downloadOriginal(): void {
    if (!this.resultadoAtual) return;
    this.packlistSvc.downloadArquivo(this.resultadoAtual.id, this.resultadoAtual.nomeArquivo);
  }

  isStepDone(s: WizardStep): boolean {
    const order: WizardStep[] = ['preview', 'mapeamento', 'confirmacao'];
    return order.indexOf(this.step) > order.indexOf(s);
  }

  isColMapped(col: string): boolean {
    return col === this.mapeamento.colunaNCM
      || col === this.mapeamento.colunaDescricao
      || col === this.mapeamento.colunaPreco;
  }

  temMapeamento(m: PacklistMapeamento): boolean {
    return !!(m.colunaNCM || m.colunaDescricao || m.colunaPreco);
  }

  temMapeamentoDto(dto: PacklistDto): boolean {
    return !!(dto.colunaNCM || dto.colunaDescricao || dto.colunaPreco);
  }
}
