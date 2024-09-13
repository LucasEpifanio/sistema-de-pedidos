import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cardapio = () => {
  const [cardapio, setCardapio] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetch('http://localhost/backend/cardapio.php')
      .then((response) => response.json())
      .then((data) => setCardapio(data))
      .catch((error) => console.error('Error fetching cardapio:', error));
  }, []);

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setFormData({ ...item });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveClick = async () => {
    const formattedData = {
      id: editingItemId,
      prato: formData.prato || null,
      Meia_dose: formData.Meia_dose ? formData.Meia_dose.replace(',', '.') : null,
      dose: formData.dose ? formData.dose.replace(',', '.') : null,
      kg: formData.kg ? formData.kg.replace(',', '.') : null,
      Meio_Kg: formData.Meio_Kg ? formData.Meio_Kg.replace(',', '.') : null,
      leitao_inteiro: formData.leitao_inteiro ? formData.leitao_inteiro.replace(',', '.') : null,
      meio_leitao: formData.meio_leitao ? formData.meio_leitao.replace(',', '.') : null,
      cortar: formData.cortar ? formData.cortar.replace(',', '.') : null,
    };

    try {
      const response = await fetch('http://localhost/backend/update_cardapio.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (result.success) {
        setCardapio((prevCardapio) =>
          prevCardapio.map((item) =>
            item.id === formattedData.id ? { ...item, ...formattedData } : item
          )
        );
        setEditingItemId(null);
        setFormData({});
        toast.success('Prato do cardápio atualizado com sucesso!');
      } else {
        toast.error(`Erro ao atualizar prato: ${result.message}`);
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao atualizar o prato.');
    }
  };

  const handleCancelClick = () => {
    setEditingItemId(null);
    setFormData({});
    setIsAdding(false);
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await fetch('http://localhost/backend/delete_cardapio.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (result.success) {
        setCardapio((prevCardapio) => prevCardapio.filter((item) => item.id !== id));
        toast.success('Prato do cardápio excluído com sucesso!');
      } else {
        toast.error(`Erro ao excluir o prato: ${result.message}`);
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao excluir o prato.');
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setFormData({});
  };

  const handleAddSaveClick = async () => {
    const formattedData = {
      prato: formData.prato || null,
      Meia_dose: formData.Meia_dose ? formData.Meia_dose.replace(',', '.') : null,
      dose: formData.dose ? formData.dose.replace(',', '.') : null,
      kg: formData.kg ? formData.kg.replace(',', '.') : null,
      Meio_Kg: formData.Meio_Kg ? formData.Meio_Kg.replace(',', '.') : null,
      leitao_inteiro: formData.leitao_inteiro ? formData.leitao_inteiro.replace(',', '.') : null,
      meio_leitao: formData.meio_leitao ? formData.meio_leitao.replace(',', '.') : null,
      cortar: formData.cortar ? formData.cortar.replace(',', '.') : null,
    };

    try {
      const response = await fetch('http://localhost/backend/add_cardapio.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (result.success) {
        setCardapio((prevCardapio) => [...prevCardapio, { ...formattedData, id: result.id }]);
        setIsAdding(false);
        setFormData({});
        toast.success('Novo prato adicionado com sucesso!');
      } else {
        toast.error(`Erro ao adicionar o novo prato: ${result.message}`);
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao adicionar o prato.');
    }
  };


  const handlePrint = () => {
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
          .dose-column {
            width: 78px; /* Ajuste a largura conforme necessário */
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
        <body>
          <h1>Cardápio</h1>
          <table>
            <thead>
              <tr>
                <th>Prato</th>
                <th>1/2 Doses</th>
                <th class="dose-column">Dose</th>
                <th>Kg</th>
                <th>Leitão Cortado</th>
                <th>Leitão Inteiro Direito</th>
                <th>Meio Leitão Direito</th>
                <th>Cortar</th>
              </tr>
            </thead>
            <tbody>
              ${cardapio.map(item => `
                <tr>
                  <td>${item.prato}</td>
                  <td class="dose-column">${item.Meia_dose ? `${item.Meia_dose} €` : ''}</td>
                 <td class="dose-column">${item.dose ? `${item.dose} €` : ''}</td>
                  <td class="dose-column">${item.kg ? `${item.kg} €` : ''}</td>
                  <td class="dose-column">${item.Meio_Kg ? `${item.Meio_Kg} €` : ''}</td>
                  <td class="dose-column">${item.leitao_inteiro ? `${item.leitao_inteiro} €` : ''}</td>
                  <td class="dose-column">${item.meio_leitao ? `${item.meio_leitao} €` : ''}</td>
                  <td class="dose-column">${item.cortar ? `${item.cortar} €` : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.print();
            window.onafterprint = function() {
              document.body.removeChild(document.querySelector('iframe'));
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="cardapio">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Prato</th>
              <th>1/2 Doses</th>
              <th>Dose</th>
              <th>Kg</th>
              <th>Leitão Cortado</th>
              <th>Leitão Inteiro Direito</th>
              <th>Meio Leitão Direito</th>
              <th>Cortar</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cardapio.map((item) => (
              <tr key={item.id}>
                {editingItemId === item.id ? (
                  <>
                    <td><input type="text" name="prato" value={formData.prato || ''} onChange={handleChange} className="input-sm" /></td>
                    <td><input type="text" name="Meia_dose" value={formData.Meia_dose || ''} onChange={handleChange} className="input-sm" /></td>
                    <td><input type="text" name="dose" value={formData.dose || ''} onChange={handleChange} className="input-sm" /></td>
                    <td><input type="text" name="kg" value={formData.kg || ''} onChange={handleChange} className="input-sm" /></td>
                    <td><input type="text" name="Meio_Kg" value={formData.Meio_Kg || ''} onChange={handleChange} className="input-sm" /></td>
                    <td><input type="text" name="leitao_inteiro" value={formData.leitao_inteiro || ''} onChange={handleChange} className="input-sm" /></td>
                    <td><input type="text" name="meio_leitao" value={formData.meio_leitao || ''} onChange={handleChange} className="input-sm" /></td>
                    <td><input type="text" name="cortar" value={formData.cortar || ''} onChange={handleChange} className="input-sm" /></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={handleSaveClick} style={{ backgroundColor:'#007bff', color:'white', cursor:'pointer', border: 'none', padding: '6px 12px' }}>Salvar</button>
                        <button onClick={handleCancelClick} style={{ backgroundColor:'#dc3545', color:'white', cursor:'pointer', border: 'none', padding: '6px 12px' }}>Cancelar</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.prato}</td>
                    <td>{item.Meia_dose ? `${item.Meia_dose} €` : ''}</td>
                    <td>{item.dose ? `${item.dose} €` : ''}</td>
                    <td>{item.kg ? `${item.kg} €` : ''}</td>
                    <td>{item.Meio_Kg ? `${item.Meio_Kg} €` : ''}</td>
                    <td>{item.leitao_inteiro ? `${item.leitao_inteiro} €` : ''}</td>
                    <td>{item.meio_leitao ? `${item.meio_leitao} €` : ''}</td>
                    <td>{item.cortar ? `${item.cortar} €` : ''}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={() => handleEditClick(item)} style={{ backgroundColor:'#007bff', color:'white', cursor:'pointer', border: 'none', padding: '6px 12px' }}>Editar</button>
                        <button onClick={() => handleDeleteClick(item.id)} style={{ backgroundColor:'#dc3545', color:'white', cursor:'pointer', border: 'none', padding: '6px 12px' }}>Excluir</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {isAdding && (
              <tr>
                <td><input type="text" name="prato" value={formData.prato || ''} onChange={handleChange} className="input-sm" /></td>
                <td><input type="text" name="Meia_dose" value={formData.Meia_dose || ''} onChange={handleChange} className="input-sm" /></td>
                <td><input type="text" name="dose" value={formData.dose || ''} onChange={handleChange} className="input-sm" /></td>
                <td><input type="text" name="kg" value={formData.kg || ''} onChange={handleChange} className="input-sm" /></td>
                <td><input type="text" name="Meio_Kg" value={formData.Meio_Kg || ''} onChange={handleChange} className="input-sm" /></td>
                <td><input type="text" name="leitao_inteiro" value={formData.leitao_inteiro || ''} onChange={handleChange} className="input-sm" /></td>
                <td><input type="text" name="meio_leitao" value={formData.meio_leitao || ''} onChange={handleChange} className="input-sm" /></td>
                <td><input type="text" name="cortar" value={formData.cortar || ''} onChange={handleChange} className="input-sm" /></td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button onClick={handleAddSaveClick} style={{ backgroundColor:'#007bff', color:'white', cursor:'pointer', border: 'none', padding: '6px 12px' }}>Salvar</button>
                    <button onClick={handleCancelClick} style={{ backgroundColor:'#dc3545', color:'white', cursor:'pointer', border: 'none', padding: '6px 12px' }}>Cancelar</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="footer" style={{ display: 'flex', justifyContent:'flex-end', gap:'10px' }}>
        <button onClick={handleAddClick} style={{ backgroundColor:'#28a745', color:'white', cursor:'pointer', border: 'none', padding: '8px 12px' }}>Adicionar Prato</button>
        <button onClick={handlePrint}>Imprimir</button>
      </div>
    </div>
  );
};

export default Cardapio;