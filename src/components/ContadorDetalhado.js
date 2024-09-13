import React, { useState, useMemo } from 'react';

const ContadorDetalhado = ({ pedidos }) => {
  const [filterCliente, setFilterCliente] = useState('');

  // Processar dados dos pedidos para se adequar ao formato do Contador e ordenar pelo nome
  const processPedidosData = () => {
    return pedidos
      .filter(pedido => {
        // Aplicar o filtro de cliente
        return !filterCliente || pedido.nome === filterCliente;
      })
      .map(pedido => {
        const qtd = parseFloat(pedido.qtd); // Garantir que qtd é um número

        let dose = '-';
        let half = '-';
        let quarter = '-';
        
        if (pedido.produto.toLowerCase() !== 'leitão') {
          dose = Math.floor(qtd); // Parte inteira da quantidade
          const remainder = qtd - dose; // Parte decimal da quantidade
          half = Math.floor(remainder / 0.5); // Contagem de 1/2
          quarter = Math.floor((remainder % 0.5) / 0.25); // Contagem de 1/4
        }

        return {
          id: pedido.id,
          dia: pedido.dia,
          nome: pedido.nome,
          prato: pedido.produto,
          qtd: qtd,
          dose: dose,
          '1/2': half,
          '1/4': quarter,
          tipo: pedido.tipo || '-',
          cortar: pedido.cortar || '-' // Adiciona o campo cortar
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome)); // Ordenar os pedidos pelo nome
  };

  // Extrair e ordenar as opções únicas para o filtro de clientes
  const clientes = useMemo(() => {
    return [...new Set(pedidos.map(pedido => pedido.nome))].sort((a, b) => a.localeCompare(b));
  }, [pedidos]);

  const handlePrint = () => {
    // Cria um iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
  
    const doc = iframe.contentWindow.document;
  
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Impressão do Contador Detalhado</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Contador Detalhado</h1>
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Nome</th>
                <th>Prato</th>
                <th>Tipo</th>
                <th>Cortar</th>
                <th>Qtd</th>
                <th>Dose</th>
                <th>1/2</th>
                <th>1/4</th> 
              </tr>
            </thead>
            <tbody>
              ${processPedidosData().map(item => `
                <tr>
                  <td>${item.dia}</td>
                  <td>${item.nome}</td>
                  <td>${item.prato}</td>
                  <td>${item.tipo}</td>
                  <td>${item.cortar}</td> 
                  <td>${item.qtd.toFixed(2)}</td>
                  <td>${item.dose}</td>
                  <td>${item['1/2']}</td>
                  <td>${item['1/4']}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.print();
            window.onafterprint = function() {
              window.parent.document.body.removeChild(window.document.querySelector('iframe'));
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="contador">
      <div style={{ position: 'absolute', top: '30px', right: '95px', marginTop: '7rem', display: 'flex', gap: '10px' }} className="filters">
        <select
          className="filter"
          onChange={(e) => setFilterCliente(e.target.value)}
          value={filterCliente}
        >
          <option value="">Todos os Clientes</option>
          {clientes.map(cliente => (
            <option key={cliente} value={cliente}>{cliente}</option>
          ))}
        </select>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Nome</th>
              <th>Prato</th>
              <th>Tipo</th> 
              <th>Cortar</th> 
              <th>Qtd</th>
              <th>Dose</th>
              <th>1/2</th>
              <th>1/4</th>
            </tr>
          </thead>
          <tbody>
            {processPedidosData().map(item => (
              <tr key={item.id}>
                <td>{item.dia}</td>
                <td>{item.nome}</td>
                <td>{item.prato}</td>
                <td>{item.tipo}</td> 
                <td>{item.cortar}</td> 
                <td>{item.qtd.toFixed(2)}</td>
                <td>{item.dose}</td>
                <td>{item['1/2']}</td>
                <td>{item['1/4']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="footer">
        <button onClick={handlePrint}>Imprimir</button>
      </div>
    </div>
  );
};

export default ContadorDetalhado;
