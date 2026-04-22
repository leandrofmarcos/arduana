export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  contato: string;
  templatePacklistId?: string; // ID do template de packlist associado
}
