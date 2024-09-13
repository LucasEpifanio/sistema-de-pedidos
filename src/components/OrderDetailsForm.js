import React, { useState, useEffect } from 'react';

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



const OrderDetailsForm = ({ closePopup, addMore, finalize, registrationData }) => {
  const [orderData, setOrderData] = useState({
    qtd: '',
    produto: '',
    tipo: '',
    cortar: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('http://localhost/backend/cardapio.php');
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error('Erro ao buscar preços dos produtos:', error);
      }
    };

    fetchPrices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!orderData.produto) newErrors.produto = 'Produto é obrigatório';
    if (orderData.produto === 'Leitão' && !orderData.tipo) newErrors.tipo = 'Tipo de leitão é obrigatório';
    if (orderData.produto === 'Leitão' && !orderData.cortar) newErrors.cortar = 'A escolha Cortar é obrigatório';
    if (!orderData.qtd || isNaN(orderData.qtd) || parseFloat(orderData.qtd) <= 0) newErrors.qtd = 'Quantidade é obrigatória';
    return newErrors;
  };

  const handleAddMore = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      const precoTotal = calculatePrice(prices, orderData.produto, orderData.tipo, parseFloat(orderData.qtd), orderData.cortar);
      const newOrder = {
        ...registrationData,
        ...orderData,
        preco: precoTotal
      };

      addMore(newOrder);
      setOrderItems([...orderItems, newOrder]);
      setOrderData({ qtd: '', produto: '', tipo: '', cortar: '', notas: '' });
      setErrors({});
    } else {
      setErrors(validationErrors);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    finalize();
  };

  return (
    <div className="order-details-form">
      <h3>Detalhes da Encomenda</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Produto</label>
          <select 
            name="produto" 
            value={orderData.produto} 
            onChange={handleChange} 
            required
          >
            <option value="" disabled>Selecione</option>
            {prices.map((item) => (
              <option key={item.id} value={item.prato}>{item.prato}</option>
            ))}
          </select>
          {errors.produto && <span className="error-message">{errors.produto}</span>}
        </div>

        {orderData.produto === 'Leitão' && (
          <>
            <div className="form-group">
              <label>Tipo</label>
              <select 
                name="tipo" 
                value={orderData.tipo} 
                onChange={handleChange} 
                required
              >
                <option value="" disabled>Selecione o tipo</option>
                <option value="Meia_dose">Meia Dose</option>
                <option value="dose">Dose</option>
                <option value="kg">Kg</option>
                <option value="Meio_Kg">Meio Kg</option>
                <option value="leitao_inteiro">Leitão Inteiro </option>
                <option value="meio_leitao">Meio Leitão</option>
              </select>
              {errors.tipo && <span className="error-message">{errors.tipo}</span>}
            </div>

            <div className="form-group">
              <label>Cortar ?</label>
              <select 
                name="cortar" 
                value={orderData.cortar} 
                onChange={handleChange} 
                required
              >
                <option value="" disabled>Selecione</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
              {errors.cortar && <span className="error-message">{errors.cortar}</span>}
            </div>
          </>
        )}

        <div className="form-group">
          <label>Qtd</label>
          <select 
            name="qtd" 
            value={orderData.qtd} 
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
          {errors.qtd && <span className="error-message">{errors.qtd}</span>}
        </div>
        
        <div className="form-group">
          <label>Notas</label>
          <textarea 
            name="notas" 
            value={orderData.notas} 
            onChange={handleChange}
            rows="4" 
            placeholder="Digite suas notas aqui" 
          />
        </div>
        
        <div className="form-actions">
          <button type="cancel" onClick={closePopup}>Cancelar</button>
          <button type="add" onClick={handleAddMore}>Adicionar</button>
          <button type="submit" onClick={(e) => { e.preventDefault(); finalize(); }}>Finalizar Encomenda</button>
        </div>
      </form>

      <div className="order-summary">
        <h4 style={{ marginBottom: '10px', marginTop: '20px'}}>Itens Adicionados</h4>
        <ul>
          {orderItems.map((item, index) => (
            <li key={index} style={{ marginBottom: '10px', marginTop: '10px'}}>
              {item.produto} - Tipo: {item.tipo || '-'} - Quantidade: {item.qtd} - Preço: {item.preco} €
              {item.notas && <span> - Notas: {item.notas}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetailsForm;
