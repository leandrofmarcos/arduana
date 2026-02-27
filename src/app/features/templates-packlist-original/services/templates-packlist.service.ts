import { Injectable } from '@angular/core';
import { TemplatePacklist, TemplatePacklistListItem } from '../models/templates-packlist.models';

@Injectable({ providedIn: 'root' })
export class TemplatesPacklistService {
  private readonly STORAGE_KEY = 'templates_packlist';

  getAll(): TemplatePacklistListItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      console.log('📋 TemplatesPacklistService.getAll() - Raw storage data:', data);
      
      if (!data) {
        console.log('⚠️ Nenhum template encontrado no storage');
        return [];
      }
      
      const templates: TemplatePacklist[] = JSON.parse(data);
      console.log(`✅ ${templates.length} template(s) carregado(s):`, templates.map(t => ({ id: t.id, nome: t.nome })));
      
      return templates.map(t => ({
        id: t.id,
        nome: t.nome,
        descricao: t.descricao,
        nomeArquivo: t.nomeArquivo,
        dataCriacao: new Date(t.dataCriacao),
        dataAtualizacao: new Date(t.dataAtualizacao)
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar templates:', error);
      return [];
    }
  }

  getById(id: string): TemplatePacklist | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      const templates: TemplatePacklist[] = JSON.parse(data);
      const template = templates.find(t => t.id === id);
      
      if (template) {
        template.dataCriacao = new Date(template.dataCriacao);
        template.dataAtualizacao = new Date(template.dataAtualizacao);
      }
      
      return template || null;
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      return null;
    }
  }

  save(template: TemplatePacklist): TemplatePacklist {
    try {
      const allTemplates = this.getAllTemplates();
      const existingIndex = allTemplates.findIndex(t => t.id === template.id);
      
      template.dataAtualizacao = new Date();
      if (!template.id || template.id === '') {
        template.id = this.generateId();
        template.dataCriacao = new Date();
      }
      
      if (existingIndex >= 0) {
        console.log('🔄 Atualizando template existente:', template.id);
        allTemplates[existingIndex] = template;
      } else {
        console.log('➕ Adicionando novo template:', template.id);
        allTemplates.push(template);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allTemplates));
      console.log('💾 Template salvo com sucesso no storage:', template.id, template.nome);
      console.log('📊 Total de templates após salvar:', allTemplates.length);
      
      // Verificar se foi salvo corretamente
      const saved = localStorage.getItem(this.STORAGE_KEY);
      console.log('🔍 Verificação pós-save - Storage contém:', saved ? JSON.parse(saved).length + ' templates' : 'vazio');
      
      return template;
    } catch (error) {
      console.error('❌ Erro ao salvar template:', error);
      throw error;
    }
  }

  delete(id: string): boolean {
    try {
      const allTemplates = this.getAllTemplates();
      const index = allTemplates.findIndex(t => t.id === id);
      
      if (index >= 0) {
        allTemplates.splice(index, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allTemplates));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }

  private getAllTemplates(): TemplatePacklist[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
