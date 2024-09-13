import React from "react";

const Contador = ({ pedidos }) => {
  // Agrupar pedidos por prato, dia e tipo, e calcular totais
  const groupPedidosByPratoDiaETipo = () => {
    return pedidos.reduce((acc, pedido) => {
      const key = `${pedido.produto}-${pedido.dia}-${pedido.tipo || 'Sem Tipo'}`;
      
      if (!acc[key]) {
        acc[key] = {
          prato: pedido.produto,
          dia: pedido.dia,
          tipo: pedido.tipo || '-',
          qtd: 0,
        };
      }
      acc[key].qtd += parseFloat(pedido.qtd) || 0;
      return acc;
    }, {});
  };

  // Processar dados dos pedidos agrupados para o formato do Contador
  const processPedidosData = () => {
    const groupedPedidos = groupPedidosByPratoDiaETipo();

    return Object.values(groupedPedidos).map((pedido) => {
      let qtd = pedido.qtd;
      let dose = 0;
      let half = 0;
      let quarter = 0;

      if (pedido.prato.toLowerCase() !== 'leitão') {
        // Calcular quantidade em dose, 1/2 e 1/4 apenas se o prato não for leitão
        dose = Math.floor(qtd);
        const remainder = qtd - dose;
        half = Math.floor(remainder / 0.5);
        quarter = Math.floor((remainder % 0.5) / 0.25);
      }

      return {
        prato: pedido.prato,
        dia: pedido.dia,
        tipo: pedido.tipo,
        qtd: qtd,
        dose: dose,
        "1/2": half,
        "1/4": quarter,
      };
    });
  };

  // Função para imprimir a tabela
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
          <title>Impressão do Contador</title>
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
          <h1>Contador Geral</h1>
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Prato</th>
                <th>Tipo</th>
                <th>Qtd Total</th>
                <th>Dose</th>
                <th>1/2</th>
                <th>1/4</th>
              </tr>
            </thead>
            <tbody>
              ${processPedidosData().map(item => `
                <tr>
                  <td>${item.dia}</td>
                  <td>${item.prato}</td>
                  <td>${item.tipo}</td>
                  <td>${item.qtd.toFixed(2)}</td>
                  <td>${item.prato.toLowerCase() === 'leitão' ? '-' : item.dose}</td>
                  <td>${item.prato.toLowerCase() === 'leitão' ? '-' : item["1/2"]}</td>
                  <td>${item.prato.toLowerCase() === 'leitão' ? '-' : item["1/4"]}</td>
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
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Prato</th>
              <th>Tipo</th>
              <th>Qtd Total</th>
              <th>Dose</th>
              <th>1/2</th>
              <th>1/4</th>
            </tr>
          </thead>
          <tbody>
            {processPedidosData().map((item, index) => (
              <tr key={index}>
                <td>{item.dia}</td>
                <td>{item.prato}</td>
                <td>{item.tipo}</td>
                <td>{item.qtd.toFixed(2)}</td>
                <td>{item.prato.toLowerCase() === 'leitão' ? '-' : item.dose}</td>
                <td>{item.prato.toLowerCase() === 'leitão' ? '-' : item["1/2"]}</td>
                <td>{item.prato.toLowerCase() === 'leitão' ? '-' : item["1/4"]}</td>
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

export default Contador;
