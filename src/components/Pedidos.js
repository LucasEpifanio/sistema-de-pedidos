import React, { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { utils, write } from "xlsx";
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx';

const Pedidos = ({ pedidos, onEdit, onDelete }) => {
  const [editingPedidoId, setEditingPedidoId] = useState(null);
  const [formData, setFormData] = useState({});
  const [filterCliente, setFilterCliente] = useState("");
  const [filterPrato, setFilterPrato] = useState("");
  const [filterHora, setFilterHora] = useState("");
  const [basePrices, setBasePrices] = useState({});
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Fetch prices from API
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          "http://localhost/backend/cardapio.php"
        );
        const data = await response.json();
        const prices = {};
        data.forEach((item) => {
          prices[item.prato.toLowerCase()] = {
            dose: parseFloat(item.dose || 0),
            meia_dose: parseFloat(item.Meia_dose || 0),
            kg: parseFloat(item.kg || 0),
            Meio_Kg: parseFloat(item.Meio_Kg || 0),
            leitao_inteiro: parseFloat(item.leitao_inteiro || 0),
            meio_leitao: parseFloat(item.meio_leitao || 0),
            cortar: parseFloat(item.cortar || 0),
          };
        });
        setBasePrices(prices);
      } catch (error) {
        toast.error("Ocorreu um erro ao carregar os preços dos pratos.");
      }
    };

    fetchPrices();
  }, []);

  const handleEditClick = (pedido) => {
    setEditingPedidoId(pedido.id);
    setFormData({ ...pedido });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Recalcula o preço automaticamente ao mudar qtd ou tipo
    if (name === "qtd" || name === "tipo") {
      const newQtd = name === "qtd" ? value : formData.qtd;
      const newTipo = name === "tipo" ? value : formData.tipo;
      recalculatePrice(newQtd, newTipo);
    }
  };

  const recalculatePrice = (qtd, tipo) => {
    const quantidade = parseFloat(qtd || 0);
    const prato = formData.produto.toLowerCase();
    const precoBase = basePrices[prato] || {};

    let precoTipo = 0;
    let totalPrice = 0;

    if (prato === "leitão") {
      // Preços específicos para leitão
      precoTipo = precoBase[tipo.toLowerCase()] || 0;
      totalPrice = (quantidade * precoTipo).toFixed(2);
    } else {
      // Preços para outros pratos
      const dosePrice = precoBase.dose || 0;
      const meiaDosePrice = precoBase.meia_dose || 0;

      if (quantidade % 1 === 0) {
        // Quantidades inteiras
        totalPrice = (dosePrice * quantidade).toFixed(2);
      } else {
        // Quantidades fracionárias
        const fullUnits = Math.floor(quantidade);
        const fractionalPart = quantidade - fullUnits;

        if (fractionalPart === 0.5) {
          totalPrice = (fullUnits * dosePrice + meiaDosePrice).toFixed(2);
        } else if (fractionalPart === 0.25) {
          totalPrice = (fullUnits * dosePrice + dosePrice * 0.25).toFixed(2);
        } else if (fractionalPart === 0.75) {
          totalPrice = (
            fullUnits * dosePrice +
            (meiaDosePrice + dosePrice * 0.25)
          ).toFixed(2);
        } else {
          // Para frações não específicas, talvez não tratadas
          totalPrice = (fullUnits * dosePrice + dosePrice / 2).toFixed(2); // Padrão para outras frações maiores que 0.5
        }
      }
    }

    setFormData((prevData) => ({ ...prevData, preco: totalPrice }));
  };

  const handleSaveClick = async () => {
    try {
      await onEdit(formData);
      setEditingPedidoId(null);
      setFormData({});
    } catch (error) {
      toast.error("Ocorreu um erro ao atualizar o pedido.");
    }
  };

  const handleCancelClick = () => {
    setEditingPedidoId(null);
    setFormData({});
  };

  const filteredPedidos = useMemo(() => {
    return pedidos
      .filter((pedido) => {
        return (
          (!filterCliente || pedido.nome === filterCliente) &&
          (!filterPrato || pedido.produto === filterPrato) &&
          (!filterHora || pedido.hora === filterHora)
        );
      })
      .sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena por nome do cliente
  }, [pedidos, filterCliente, filterPrato, filterHora]);

  const clientes = useMemo(() => {
    const clientesFiltrados = [...new Set(pedidos.map((p) => p.nome))];
    if (filterPrato || filterHora) {
      return clientesFiltrados
        .filter((cliente) =>
          pedidos.some(
            (p) =>
              (filterPrato ? p.produto === filterPrato : true) &&
              (filterHora ? p.hora === filterHora : true) &&
              p.nome === cliente
          )
        )
        .sort((a, b) => a.localeCompare(b));
    }
    return clientesFiltrados.sort((a, b) => a.localeCompare(b));
  }, [pedidos, filterPrato, filterHora]);

  const pratos = useMemo(() => {
    const pratosFiltrados = filteredPedidos.map((p) => p.produto);
    return [...new Set(pratosFiltrados)].sort((a, b) => a.localeCompare(b));
  }, [filteredPedidos]);

  const horas = useMemo(() => {
    const horasFiltradas = filteredPedidos.map((p) => p.hora);
    return [...new Set(horasFiltradas)].sort((a, b) => {
      const [h1, m1] = a.split(":").map(Number);
      const [h2, m2] = b.split(":").map(Number);
      return h1 !== h2 ? h1 - h2 : m1 - m2;
    });
  }, [filteredPedidos]);

  const totalValues = useMemo(() => {
    return filteredPedidos.reduce(
      (acc, pedido) => {
        acc.totalQuantidade += parseFloat(pedido.qtd);
        acc.totalPreco += parseFloat(pedido.preco);
        return acc;
      },
      { totalQuantidade: 0, totalPreco: 0 }
    );
  }, [filteredPedidos]);

  const updateFilters = (type, value) => {
    if (type === "cliente") {
      setFilterCliente(value);
      setFilterPrato("");
      setFilterHora("");
    } else if (type === "prato") {
      setFilterPrato(value);
    } else if (type === "hora") {
      setFilterHora(value);
    }
  };

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Impressão de Pedidos</title>
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
          <h1>Pedidos do Dia ${filteredPedidos[0]?.dia || ""}</h1>
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Qtd</th>
                <th>Prato</th>
                <th>Tipo</th>
                <th>Cortar</th>
                <th>Notas</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPedidos
                .map(
                  (pedido) => `
                <tr>
                  <td>${pedido.hora}</td>
                  <td>${pedido.nome}</td>
                  <td>${pedido.qtd}</td>
                  <td>${pedido.produto}</td>
                  <td>${pedido.tipo || "-"}</td>
                  <td>${pedido.cortar || "-"}</td>
                  <td>${pedido.notas || "-"}</td>
                  <td>${pedido.preco} €</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7"><strong>Preço Total:</strong></td>
                <td colspan="1" style="text-align: center;"><strong>${totalValues.totalPreco.toFixed(
                  2
                )} €</strong></td>
              </tr>
            </tfoot>
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
  const handleDownloadExcel = () => {
    const ws = utils.json_to_sheet(filteredPedidos, {
      header: [
        "dia", "hora", "nome", "qtd", "produto", "tipo", "cortar", "notas", "preco"
      ],
      skipHeader: false
    });
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Pedidos");
  
    const wbout = write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "pedidos.xlsx");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
};

const handleFileUpload = () => {
  if (!file) {
    toast.warning('Por favor, selecione um arquivo.');
      return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Enviar dados para o servidor PHP
      const response = await fetch('http://localhost/backend/save-pedidos.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
      });
      
      const result = await response.json();
      if (result.status === 'success') {
          toast.success('Dados importados com sucesso!');
      } else {
          toast.error('Erro ao importar dados.');
      }
      window.location.reload();
  };

  reader.readAsArrayBuffer(file);
};

  return (
    <div className="pedidos">
      <div
        style={{
          position: "absolute",
          top: "30px",
          right: "95px",
          marginTop: "7rem",
          display: "flex",
          gap: "10px",
        }}
        className="filters"
      >
        <select
          className="filter"
          onChange={(e) => updateFilters("cliente", e.target.value)}
          value={filterCliente}
        >
          <option value="">Todos os Clientes</option>
          {clientes.map((cliente) => (
            <option key={cliente} value={cliente}>
              {cliente}
            </option>
          ))}
        </select>
        <select
          className="filter"
          onChange={(e) => updateFilters("prato", e.target.value)}
          value={filterPrato}
        >
          <option value="">Todos os Pratos</option>
          {pratos.map((prato) => (
            <option key={prato} value={prato}>
              {prato}
            </option>
          ))}
        </select>
        <select
          className="filter"
          onChange={(e) => updateFilters("hora", e.target.value)}
          value={filterHora}
        >
          <option value="">Todas as Horas</option>
          {horas.map((hora) => (
            <option key={hora} value={hora}>
              {hora}
            </option>
          ))}
        </select>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Qtd</th>
              <th>Prato</th>
              <th>Tipo</th>
              <th>Cortar</th>
              <th>Notas</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.map((pedido) => (
              <tr key={pedido.id}>
                {editingPedidoId === pedido.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        name="dia"
                        value={formData.dia || ""}
                        onChange={handleChange}
                        className="input-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="hora"
                        value={formData.hora || ""}
                        onChange={handleChange}
                        className="input-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome || ""}
                        onChange={handleChange}
                        className="input-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="qtd"
                        value={formData.qtd || ""}
                        onChange={handleChange}
                        className="input-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="produto"
                        value={formData.produto || ""}
                        onChange={handleChange}
                        className="input-sm readonly-field"
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="tipo"
                        value={formData.tipo || ""}
                        onChange={handleChange}
                        className="input-sm readonly-field"
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="cortar"
                        value={formData.cortar || ""}
                        onChange={handleChange}
                        className="input-sm readonly-field"
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="notas"
                        value={formData.notas || ""}
                        onChange={handleChange}
                        className="input-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="preco"
                        value={formData.preco || ""}
                        onChange={handleChange}
                        className="input-sm"
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={handleSaveClick}
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                            border: "none",
                            padding: "6px 12px",
                          }}
                          className="btn-save"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={handleCancelClick}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            cursor: "pointer",
                            border: "none",
                            padding: "6px 12px",
                          }}
                          className="btn-cancel"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{pedido.dia}</td>
                    <td>{pedido.hora}</td>
                    <td>{pedido.nome}</td>
                    <td>{pedido.qtd}</td>
                    <td>{pedido.produto}</td>
                    <td>{pedido.tipo || "-"}</td>
                    <td>{pedido.cortar || "-"}</td>
                    <td>{pedido.notas || "-"}</td>
                    <td>{pedido.preco} €</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => handleEditClick(pedido)}
                          className="btn-edit"
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                            border: "none",
                            padding: "6px 12px",
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(pedido.id)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            cursor: "pointer",
                            border: "none",
                            padding: "6px 12px",
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <table className="table-footer">
          <tfoot>
            <tr>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <td>
                  <strong>Preço Total:</strong>
                </td>
                <td style={{ textAlign: "center" }}>
                  <strong style={{ paddingRight: "10px" }}>
                    {totalValues.totalPreco.toFixed(2)} €{" "}
                  </strong>
                </td>
              </div>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="footer" style={{ textAlign: "center", gap: "10px" }}>
        <button onClick={handlePrint}>Imprimir</button>
         <button onClick={handleDownloadExcel}>Download Excel</button>
         <label for='selecao-arquivo' style={{padding:"10px", background:"#151515", color:"#fff", cursor:"pointer", fontSize:"14px"}}>Selecionar um arquivo</label>
         <input id='selecao-arquivo' style={{display:"none"}} type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <button onClick={handleFileUpload} style={{background:"#151515"}}>Importar Planilha</button>
      </div>
    </div>
  );
};

export default Pedidos;
