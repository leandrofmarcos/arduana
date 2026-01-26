import { Injectable } from '@angular/core';
import { TemplatePacklist, TemplatePacklistListItem } from '../models/templates-packlist.models';

@Injectable({ providedIn: 'root' })
export class TemplatesPacklistService {
  private readonly STORAGE_KEY = 'templates_packlist';

  getAll(): TemplatePacklistListItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const templates: TemplatePacklist[] = JSON.parse(data);
      return templates.map(t => ({
        id: t.id,
        nome: t.nome,
        descricao: t.descricao,
        nomeArquivo: t.nomeArquivo,
        fileContent: t.fileContent,
        dataCriacao: new Date(t.dataCriacao)
      }));
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
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
      const templates = this.getAll();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      template.dataAtualizacao = new Date();
      if (!template.id) {
        template.id = this.generateId();
        template.dataCriacao = new Date();
      }
      
      const allTemplates = this.getAllTemplates();
      if (existingIndex >= 0) {
        allTemplates[existingIndex] = template;
      } else {
        allTemplates.push(template);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allTemplates));
      return template;
    } catch (error) {
      console.error('Erro ao salvar template:', error);
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
