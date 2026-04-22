import { TestBed } from '@angular/core/testing';
import { PacklistParserService } from './packlist-parser.service';

describe('PacklistParserService - XLSX', () => {
  let service: PacklistParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacklistParserService);
  });

  it('deve fazer parse de arquivo XLSX sem stack overflow', async () => {
    // Criar arquivo XLSX de teste
    const blob = new Blob(
      [
        'PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x12\x00\x00\x00[Content_Types].xml'
      ],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );
    
    const file = new File([blob], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Deve aceitar arquivo XLSX sem erro
    expect(() => {
      service.parseFile(file);
    }).not.toThrow();
  });

  it('deve validar mapeamento de campos', () => {
    const validConfig = {
      headerLine: 1,
      fieldMapping: {
        volumes: 'A',
        peso: 'B',
        cbm: 'C',
        descricao: 'D'
      }
    };

    const result = service.validateMapping(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('deve rejeitar mapeamento com colunas duplicadas', () => {
    const invalidConfig = {
      headerLine: 1,
      fieldMapping: {
        volumes: 'A',
        peso: 'A',  // duplicado!
        cbm: 'C',
        descricao: 'D'
      }
    };

    const result = service.validateMapping(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
