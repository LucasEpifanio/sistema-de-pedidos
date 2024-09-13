import React, { useState } from 'react';

const RegisterForm = ({ closePopup, openDetailsPopup, pedidos }) => {
  const [formData, setFormData] = useState({
    nome: '',
    dia: '',
    hora: ''
  });

  const [nomeError, setNomeError] = useState('');

  // Certifique-se de que pedidos é um array
  const pedidosArray = Array.isArray(pedidos) ? pedidos : [];

  // Obtém a lista de nomes já existentes
  const nomesExistentes = new Set(pedidosArray.map(pedido => pedido.nome.toLowerCase()));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifica a exclusividade do nome
    if (nomesExistentes.has(formData.nome.toLowerCase())) {
      setNomeError('Este nome já existe na lista de pedidos.');
      return; // Não prossegue com a submissão se houver erro
    }

    setNomeError(''); // Limpa o erro se o nome é único
    openDetailsPopup(formData); // Passa os dados do formulário para o próximo formulário
  };

  return (
    <div className="register-form">
      <h2>Registar Encomenda</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome</label>
          <input 
            type="text" 
            name="nome" 
            value={formData.nome} 
            onChange={handleChange} 
            required 
          />
          {nomeError && <p className="error-message">{nomeError}</p>}
        </div>
        <div className="form-group">
          <label>Dia</label>
          <select 
            name="dia" 
            value={formData.dia} 
            onChange={handleChange} 
            required
          >
            <option value="" disabled>Selecione</option>
            <option>1 Ano Novo</option>
            <option>Páscoa</option>
            <option>24 Véspera de Natal</option>
            <option>25 Natal</option>
            <option>31 Véspera de Ano Novo</option>
          </select>
        </div>
        <div className="form-group">
          <label>Hora</label>
          <select 
            name="hora" 
            value={formData.hora} 
            onChange={handleChange} 
            required
          >
            <option value="" disabled>Selecione</option>
            <option>8h</option>
            <option>8h30</option>
            <option>9h</option>
            <option>9h30</option>
            <option>10h</option>
            <option>10h30</option>
            <option>11h</option>
            <option>11h30</option>
            <option>12h</option>
            <option>12h15</option>
            <option>12h30</option>
            <option>12h45</option>
            <option>13h</option>
            <option>13h15</option>
            <option>13h30</option>
            <option>13h45</option>
            <option>14h</option>
            <option>14h30</option>
            <option>15h</option>
            <option>15h30</option>
            <option>16h</option>
            <option>16h30</option>
            <option>16h45</option>
            <option>17h</option>
            <option>17h15</option>
            <option>17h30</option>
            <option>17h45</option>
            <option>18h</option>
            <option>18h15</option>
            <option>18h30</option>
            <option>18h45</option>
            <option>19h</option>
            <option>19h15</option>
            <option>19h30</option>
            <option>19h45</option>
            <option>20h</option>
            <option>20h15</option>
            <option>20h30</option>
            <option>20h45</option>
            <option>21h</option>
            <option>OUTRAS</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="cancel" onClick={closePopup}>Cancelar</button>
          <button type="submit">Seguinte</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
