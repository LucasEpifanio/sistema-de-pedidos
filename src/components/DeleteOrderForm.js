import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeleteOrderForm = ({ pedidos, closePopup, deleteOrder }) => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [days, setDays] = useState([]);
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const uniqueClients = [...new Set(pedidos.map((pedido) => pedido.nome))];
    const uniqueDays = [...new Set(pedidos.map((pedido) => pedido.dia))];
    setClients(uniqueClients);
    setDays(uniqueDays);
  }, [pedidos]);

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
  };

  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDay) newErrors.day = "Dia é obrigatório.";
    if (!selectedClient) newErrors.client = "Cliente é obrigatório.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = async () => {
    if (validateForm()) {
      try {
        const response = await fetch(
          "http://localhost/backend/delete_order.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dia: selectedDay, cliente: selectedClient }),
          }
        );

        const result = await response.json();

        if (result.success) {
          deleteOrder(selectedDay, selectedClient);
          closePopup();
        } else {
          toast.error(`Erro ao eliminar encomenda: ${result.message}`);
        }
      } catch (error) {
        console.error("Erro ao enviar dados para o backend:", error);
        toast.error("Ocorreu um erro ao eliminar a encomenda.");
      }
    }
  };

  return (
    <div className="delete-order-form">
      <h3>Eliminar Encomenda</h3>
      <div className="form-group">
        <label>Dia:</label>
        <select value={selectedDay} onChange={handleDayChange} required>
          <option value="" disabled>
            Selecione um dia
          </option>
          {days.map((day, index) => (
            <option key={index} value={day}>
              {day}
            </option>
          ))}
        </select>
        {errors.day && <span className="error-message">{errors.day}</span>}
      </div>

      <div className="form-group">
        <label>Cliente:</label>
        <select value={selectedClient} onChange={handleClientChange} required>
          <option value="" disabled>
            Selecione um cliente
          </option>
          <option value="Todos">Todos</option>
          {clients.map((client, index) => (
            <option key={index} value={client}>
              {client}
            </option>
          ))}
        </select>
        {errors.client && (
          <span className="error-message">{errors.client}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="cancel" onClick={closePopup}>
          Cancelar
        </button>
        <button type="submit" onClick={handleDelete}>
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default DeleteOrderForm;
