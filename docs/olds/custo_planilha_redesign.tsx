import React, { useState } from 'react';
import { Save, X, Calculator, DollarSign, Package, TrendingUp } from 'lucide-react';

export default function CustoPlanilhaRedesign() {
  const [premissas, setPremissas] = useState({
    fob: 0,
    freteInter: 0,
    seguro: 0,
    taxaUsd: 5,
    ncm: '',
    pesoLiquido: 0,
    quantProdutos: 0
  });

  const [despesas, setDespesas] = useState({
    taxaUtilizacao: 0,
    despachante: 0,
    armazenagem: 0
  });

  const handlePremissaChange = (field, value) => {
    setPremissas(prev => ({ ...prev, [field]: value }));
  };

  const handleDespesaChange = (field, value) => {
    setDespesas(prev => ({ ...prev, [field]: value }));
  };

  const calcularTotal = () => {
    const cifUsd = premissas.fob + premissas.freteInter + premissas.seguro;
    const cifBrl = cifUsd * premissas.taxaUsd;
    const totalDespesas = despesas.taxaUtilizacao + despesas.despachante + despesas.armazenagem;
    return { cifUsd, cifBrl, totalDespesas, custoTotal: cifBrl + totalDespesas };
  };

  const totais = calcularTotal();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--color-bg, #f3f4f6)',
      padding: '24px',
      fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'
    }}>
      <style>{`
        :root {
          --color-primary: #667eea;
          --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --color-text: #111827;
          --color-muted: #6b7280;
          --color-bg: #f3f4f6;
          --color-surface: #ffffff;
          --color-border: #e5e7eb;
          --color-success: #48bb78;
        }

        .header-card {
          background: var(--gradient-primary);
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }

        .info-chips {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .chip {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border: 1px solid var(--color-border);
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--color-border);
        }

        .section-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--gradient-primary);
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 700;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
        }

        .input {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 14px;
          color: var(--color-text);
          transition: all 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table thead {
          background: var(--color-bg);
        }

        .table th {
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
          border-bottom: 2px solid var(--color-border);
        }

        .table td {
          padding: 12px;
          border-bottom: 1px solid var(--color-border);
          font-size: 14px;
        }

        .table tbody tr:hover {
          background: var(--color-bg);
        }

        .table input {
          width: 100%;
        }

        .summary-card {
          background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
          border: 2px solid var(--color-primary);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .summary-item {
          text-align: center;
        }

        .summary-label {
          font-size: 12px;
          color: var(--color-muted);
          margin-bottom: 4px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-primary);
        }

        .summary-value.large {
          font-size: 28px;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
        }

        .btn-primary {
          background: var(--gradient-primary);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover {
          background: var(--color-bg);
        }

        .category-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: var(--color-bg);
          color: var(--color-muted);
        }
      `}</style>

      <div className="header-card">
        <h1 className="header-title">
          <Calculator size={28} />
          Planilha de Custo
        </h1>
        <p className="header-subtitle">
          Fase do despachante: premissas e despesas estimadas
        </p>
        <div className="info-chips">
          <div className="chip">
            <Package size={16} />
            <strong>Processo:</strong> hdgfhdfghdfhdfghd
          </div>
          <div className="chip">
            <strong>Cliente:</strong> sadasDA
          </div>
          <div className="chip">
            <strong>Despachante:</strong> Alpha Despachos
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">
          <span className="section-number">1</span>
          Premissas da Operação
        </h3>
        <div className="form-grid">
          <div className="field">
            <label>FOB (USD)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={premissas.fob}
              onChange={(e) => handlePremissaChange('fob', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label>Frete Internacional (USD)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={premissas.freteInter}
              onChange={(e) => handlePremissaChange('freteInter', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label>Seguro (USD)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={premissas.seguro}
              onChange={(e) => handlePremissaChange('seguro', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label>Taxa USD/BRL</label>
            <input
              type="number"
              step="0.0001"
              className="input"
              value={premissas.taxaUsd}
              onChange={(e) => handlePremissaChange('taxaUsd', parseFloat(e.target.value) || 0)}
              placeholder="5.0000"
            />
          </div>
          <div className="field">
            <label>NCM</label>
            <input
              type="text"
              className="input"
              value={premissas.ncm}
              onChange={(e) => handlePremissaChange('ncm', e.target.value)}
              placeholder="8423"
            />
          </div>
          <div className="field">
            <label>Peso Líquido (kg)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={premissas.pesoLiquido}
              onChange={(e) => handlePremissaChange('pesoLiquido', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label>Quantidade de Produtos</label>
            <input
              type="number"
              step="1"
              className="input"
              value={premissas.quantProdutos}
              onChange={(e) => handlePremissaChange('quantProdutos', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">
          <span className="section-number">2</span>
          Despesas no Desembaraço
        </h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Item</th>
                <th style={{ width: '200px' }}>Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="category-badge">Taxas</span></td>
                <td>Taxa de utilização</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={despesas.taxaUtilizacao}
                    onChange={(e) => handleDespesaChange('taxaUtilizacao', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </td>
              </tr>
              <tr>
                <td><span className="category-badge">Serviços</span></td>
                <td>Despachante</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={despesas.despachante}
                    onChange={(e) => handleDespesaChange('despachante', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </td>
              </tr>
              <tr>
                <td><span className="category-badge">Logística</span></td>
                <td>Armazenagem</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={despesas.armazenagem}
                    onChange={(e) => handleDespesaChange('armazenagem', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card summary-card">
        <h3 className="section-title">
          <TrendingUp size={20} />
          Resumo de Custos
        </h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">CIF (USD)</div>
            <div className="summary-value">${totais.cifUsd.toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">CIF (BRL)</div>
            <div className="summary-value">R$ {totais.cifBrl.toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Despesas</div>
            <div className="summary-value">R$ {totais.totalDespesas.toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Custo Total</div>
            <div className="summary-value large">R$ {totais.custoTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-secondary">
          <X size={18} />
          Cancelar
        </button>
        <button className="btn btn-primary">
          <Save size={18} />
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}