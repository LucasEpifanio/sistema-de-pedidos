import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const calculatePrice = (prices, produto, tipo, qtd, cortar) => {
  const price = prices.find(p => p.prato === produto);
  if (!price) return 0;

  // Extrai os preços do prato
  const meiaDosePrice = parseFloat(price.Meia_dose) || 0;
  const dosePrice = parseFloat(price.dose) || 0;
  const kgPrice = parseFloat(price.kg) || 0;
  const meioKgPrice = parseFloat(price.Meio_Kg) || 0;
  const leitaoInteiroPrice = parseFloat(price.leitao_inteiro) || 0;
  const meioLeitaoPrice = parseFloat(price.meio_leitao) || 0;
  const cortarPrice = parseFloat(price.cortar) || 0;

  let totalPrice = 0;

  // Cálculo para o prato "Leitão"
  if (produto === 'Leitão') {
    let tipoPrice = 0;

    switch (tipo) {
      case 'Meia_dose':
        tipoPrice = meiaDosePrice;
        totalPrice = (tipoPrice * Math.floor(qtd) + meiaDosePrice * (qtd % 1)).toFixed(2);
        break;

      case 'dose':
        tipoPrice = dosePrice;
        totalPrice = (tipoPrice * Math.floor(qtd) + dosePrice * (qtd % 1)).toFixed(2);
        break;

      case 'kg':
        tipoPrice = kgPrice;
        if (qtd % 1 === 0) { // Quantidades inteiras
          totalPrice = (tipoPrice * qtd).toFixed(2);
        } else {
          const fullUnits = Math.floor(qtd);
          const fractionalPart = qtd - fullUnits;

          if (fractionalPart === 0.5) {
            totalPrice = (tipoPrice * fullUnits + meioKgPrice).toFixed(2);
          } else {
            totalPrice = (tipoPrice * fullUnits + kgPrice * fractionalPart).toFixed(2);
          }
        }
        break;

      case 'Meio_Kg':
        tipoPrice = meioKgPrice;
        if (qtd % 1 === 0) { // Quantidades inteiras
          totalPrice = (tipoPrice * qtd).toFixed(2);
        } else {
          const fullUnits = Math.floor(qtd);
          const fractionalPart = qtd - fullUnits;

          if (fractionalPart === 0.5) {
            totalPrice = (tipoPrice * fullUnits + meioKgPrice).toFixed(2);
          } else {
            totalPrice = (tipoPrice * fullUnits + meioKgPrice * fractionalPart).toFixed(2);
          }
        }
        break;

      case 'leitao_inteiro':
        tipoPrice = leitaoInteiroPrice;
        if (qtd % 1 === 0) { // Quantidades inteiras
          totalPrice = (tipoPrice * qtd).toFixed(2);
        } else {
          const fullUnits = Math.floor(qtd);
          const fractionalPart = qtd - fullUnits;

          if (fractionalPart === 0.5) {
            totalPrice = (tipoPrice * fullUnits + meioLeitaoPrice).toFixed(2);
          } else {
            totalPrice = (tipoPrice * fullUnits + leitaoInteiroPrice * fractionalPart).toFixed(2);
          }
        }
        break;

      case 'meio_leitao':
        tipoPrice = meioLeitaoPrice;
        if (qtd % 1 === 0) { // Quantidades inteiras
          totalPrice = (tipoPrice * qtd).toFixed(2);
        } else {
          const fullUnits = Math.floor(qtd);
          const fractionalPart = qtd - fullUnits;

          if (fractionalPart === 0.5) {
            totalPrice = (tipoPrice * fullUnits + meioLeitaoPrice).toFixed(2);
          } else {
            totalPrice = (tipoPrice * fullUnits + meioLeitaoPrice * fractionalPart).toFixed(2);
          }
        }
        break;

      default:
        totalPrice = 0;
        break;
    }

    if (cortar === 'Sim') {
      totalPrice = (parseFloat(totalPrice) + cortarPrice).toFixed(2);
    }
  } else {
    // Cálculo para outros pratos
    if (qtd % 1 === 0) { // Quantidades inteiras
      totalPrice = (dosePrice * qtd).toFixed(2);
    } else { // Quantidades fracionárias
      const fullUnits = Math.floor(qtd);
      const fractionalPart = qtd - fullUnits;

      if (fractionalPart === 0.5) {
        totalPrice = ((fullUnits * dosePrice) + meiaDosePrice).toFixed(2);
      } else if (fractionalPart === 0.25) {
        totalPrice = ((fullUnits * dosePrice) + (dosePrice * 0.25)).toFixed(2);
      } else if (fractionalPart === 0.75) {
        totalPrice = ((fullUnits * dosePrice) + (meiaDosePrice + (dosePrice * 0.25))).toFixed(2);
      } else {
        // Para frações não específicas, talvez não tratadas
        totalPrice = ((fullUnits * dosePrice) + (dosePrice / 2)).toFixed(2); // Padrão para outras frações maiores que 0.5
      }
    }
  }

  return totalPrice;
};


const AddProductForm = ({ pedidos, closePopup, addProduct }) => {
  const [formData, setFormData] = useState({
    client: '',
    day: '',
    hour: '',
    product: '',
    quantity: '',
    type: '', // Tipo do produto para "Leitão"
    cortar: '', // Campo "Cortar?" para "Leitão"
    additionalNotes: ''
  });
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [days, setDays] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const uniqueClients = [...new Set(pedidos.map(pedido => pedido.nome))];
    const uniqueDays = [...new Set(pedidos.map(pedido => pedido.dia))];
    setClients(uniqueClients);
    setDays(uniqueDays);

    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost/backend/cardapio.php');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        toast.error('Erro ao buscar produtos.');
      }
    };

    fetchProducts();
  }, [pedidos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
      ...(name === 'product' && value !== 'Leitão' ? { type: '', cortar: '' } : {})
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client) newErrors.client = 'Cliente é obrigatório.';
    if (!formData.day) newErrors.day = 'Dia é obrigatório.';
    if (!formData.hour) newErrors.hour = 'Hora é obrigatória.';
    if (!formData.product) newErrors.product = 'Produto é obrigatório.';
    if (formData.product === 'Leitão' && !formData.type) newErrors.type = 'Tipo de Leitão é obrigatório.';
    if (formData.product === 'Leitão' && !formData.cortar) newErrors.cortar = 'Campo "Cortar" é obrigatório.';
    if (!formData.quantity || isNaN(formData.quantity) || formData.quantity <= 0) newErrors.quantity = 'Quantidade deve ser um número positivo.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      const price = calculatePrice(products, formData.product, formData.type, parseFloat(formData.quantity), formData.cortar);
      const completeFormData = { 
        nome: formData.client, 
        dia: formData.day, 
        hora: formData.hour, 
        produto: formData.product, 
        tipo: formData.product === 'Leitão' ? formData.type : '', 
        cortar: formData.product === 'Leitão' ? formData.cortar : '',
        qtd: formData.quantity, 
        preco: price, 
        notas: formData.additionalNotes 
      };
  
      try {
        const response = await fetch('http://localhost/backend/save_order.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([completeFormData])
        });
  
        const result = await response.json();
  
        if (result.success) {
          addProduct(completeFormData);
          toast.success('Produto adicionado com sucesso!');
          closePopup();
          window.location.reload();
        } else {
          toast.error(`Erro ao adicionar produto: ${result.message}`);
        }
      } catch (error) {
        console.error('Erro ao enviar dados para o backend:', error);
        toast.error('Ocorreu um erro ao adicionar o produto.');
      }
    }
  };

  return (
    <div className="add-product-form">
      <h2>Adicionar Produto</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cliente:</label>
          <select
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecione um cliente</option>
            {clients.map((client, index) => (
              <option key={index} value={client}>
                {client}
              </option>
            ))}
          </select>
          {errors.client && <span className="error-message">{errors.client}</span>}
        </div>

        <div className="form-group">
          <label>Dia:</label>
          <select
            name="day"
            value={formData.day}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecione um dia</option>
            {days.map((day, index) => (
              <option key={index} value={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.day && <span className="error-message">{errors.day}</span>}
        </div>

        <div className="form-group">
          <label>Hora:</label>
          <select
            name="hour"
            value={formData.hour}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecione uma hora</option>
            <option value="8h">8h</option>
            <option value="8h30">8h30</option>
            <option value="9h">9h</option>
            <option value="9h30">9h30</option>
            <option value="10h">10h</option>
            <option value="10h30">10h30</option>
            <option value="11h">11h</option>
            <option value="11h30">11h30</option>
            <option value="12h">12h</option>
            <option value="12h15">12h15</option>
            <option value="12h30">12h30</option>
            <option value="12h45">12h45</option>
            <option value="13h">13h</option>
            <option value="13h15">13h15</option>
            <option value="13h30">13h30</option>
            <option value="13h45">13h45</option>
            <option value="14h">14h</option>
            <option value="14h30">14h30</option>
            <option value="15h">15h</option>
            <option value="15h30">15h30</option>
            <option value="16h">16h</option>
            <option value="16h30">16h30</option>
            <option value="16h45">16h45</option>
            <option value="17h">17h</option>
            <option value="17h15">17h15</option>
            <option value="17h30">17h30</option>
            <option value="17h45">17h45</option>
            <option value="18h">18h</option>
            <option value="18h15">18h15</option>
            <option value="18h30">18h30</option>
            <option value="18h45">18h45</option>
            <option value="19h">19h</option>
            <option value="19h15">19h15</option>
            <option value="19h30">19h30</option>
            <option value="19h45">19h45</option>
            <option value="20h">20h</option>
            <option value="20h15">20h15</option>
            <option value="20h30">20h30</option>
            <option value="20h45">20h45</option>
            <option value="21h">21h</option>
            <option value="OUTRAS">OUTRAS</option>
          </select>
          {errors.hour && <span className="error-message">{errors.hour}</span>}
        </div>

        <div className="form-group">
          <label>Produto:</label>
          <select
            name="product"
            value={formData.product}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecione um produto</option>
            {products.map((product, index) => (
              <option key={index} value={product.prato}>
                {product.prato}
              </option>
            ))}
          </select>
          {errors.product && <span className="error-message">{errors.product}</span>}
        </div>

        {formData.product === 'Leitão' && (
          <>
            <div className="form-group">
              <label>Tipo:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Selecionar tipo</option>
                <option value="Meia_dose">Meia Dose</option>
                <option value="dose">Dose</option>
                <option value="kg">Kg</option>
                <option value="Meio_Kg">Meio Kg</option>
                <option value="leitao_inteiro">Leitão Inteiro</option>
                <option value="meio_leitao">Meio Leitão</option>
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label>Cortar?</label>
              <select
                name="cortar"
                value={formData.cortar}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Selecionar opção</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
              {errors.cortar && <span className="error-message">{errors.cortar}</span>}
            </div>
          </>
        )}

        <div className="form-group">
          <label>Qtd:</label>
          <select
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecione</option>
            <option value="0.25">0,25</option>
            <option value="0.5">0,5</option>
            <option value="1">1</option>
            <option value="1.5">1,5</option>
            <option value="2">2</option>
            <option value="2.5">2,5</option>
            <option value="3">3</option>
            <option value="3.5">3,5</option>
            <option value="4">4</option>
            <option value="4.5">4,5</option>
            <option value="5">5</option>
            <option value="5.5">5,5</option>
            <option value="6">6</option>
          </select>
          {errors.quantity && <span className="error-message">{errors.quantity}</span>}
        </div>

        <div className="form-group">
          <label>Notas Adicionais:</label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows="4" 
            placeholder="Digite suas notas aqui" 
          />
        </div>

        <div className="form-actions">
          <button type="cancel" onClick={closePopup}>Fechar</button>
          <button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
