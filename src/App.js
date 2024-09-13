import React, { useState, useEffect } from 'react';
import Tabs from './components/Tabs';
import Pedidos from './components/Pedidos';
import Cardapio from './components/Cardapio';
import Contador from './components/Contador';
import ContadorDetalhado from './components/ContadorDetalhado'; // Importa o novo componente
import RegisterForm from './components/RegisterForm';
import OrderDetailsForm from './components/OrderDetailsForm';
import AddProductForm from './components/AddProductForm';
import DeleteOrderForm from './components/DeleteOrderForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [currentOrderItems, setCurrentOrderItems] = useState([]);
  const [registrationData, setRegistrationData] = useState({});
  const [alerted, setAlerted] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await fetch('http://localhost/backend/get_pedidos.php');
      const result = await response.json();
      if (result.success) {
        setPedidos(result.pedidos);
      } else {
        toast.error(`Erro ao buscar pedidos: ${result.message}`);
      }
    } catch (error) {
      toast.error('Erro ao buscar pedidos.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePopup = (content, data) => {
    setPopupContent(content);
    setRegistrationData(data || {});
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupContent('');
    setRegistrationData({});
    setAlerted(false);
  };

  const openDetailsPopup = (data) => {
    handlePopup('OrderDetails', data);
  };

  const addMore = (item) => {
    setCurrentOrderItems((prevItems) => [...prevItems, item]);
    if (!alerted) {
      toast.success('Item adicionado ao pedido. Pronto para adicionar mais.');
      setAlerted(true);
    }
  };

  const finalize = async () => {
    try {
      const response = await fetch('http://localhost/backend/save_order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentOrderItems)
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentOrderItems([]);
        toast.success('Encomenda finalizada!');
        await fetchPedidos();
      } else {
        toast.error(`Erro ao finalizar encomenda: ${result.message}`);
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao finalizar a encomenda.');
    }

    closePopup();
    setAlerted(false);
  };

  const addProduct = (newProduct) => {
    setPedidos((prevPedidos) => {
      const clientePedidos = prevPedidos.filter(pedido => pedido.nome === newProduct.nome);
      const lastClientePedidoIndex = prevPedidos.lastIndexOf(clientePedidos[clientePedidos.length - 1]);

      return [
        ...prevPedidos.slice(0, lastClientePedidoIndex + 1),
        newProduct,
        ...prevPedidos.slice(lastClientePedidoIndex + 1)
      ];
    });
  };

  const deleteOrder = (day, client) => {
    // Verifica se "Todos" foi selecionado em cliente ou dia
    if (client === 'Todos') {
      if (day === 'Todos') {
        // Remove todos os pedidos
        setPedidos([]);
      } else {
        // Remove todos os pedidos para o dia selecionado
        setPedidos(pedidos.filter(pedido => pedido.dia !== day));
      }
    } else {
      if (day === 'Todos') {
        // Remove todos os pedidos para o cliente selecionado
        setPedidos(pedidos.filter(pedido => pedido.nome !== client));
      } else {
        // Remove o pedido específico
        setPedidos(pedidos.filter(pedido => !(pedido.dia === day && pedido.nome === client)));
      }
    }
  
    toast.success('Encomenda(s) eliminada(s) com sucesso!');
  };

  const handleDelete = async (pedidoId) => {
    try {
      const response = await fetch('http://localhost/backend/delete_pedido.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: pedidoId })
      });
  
      const result = await response.json();
      
      if (result.success) {
        setPedidos(pedidos.filter(pedido => pedido.id !== pedidoId));
        toast.success('Pedido eliminado com sucesso!');
      } else {
        toast.error(`Erro ao eliminar pedido: ${result.message}`);
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao eliminar o pedido.');
    }
  };  

  const handleEdit = async (updatedPedido) => {
    try {
      const response = await fetch('http://localhost/backend/update_pedido.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPedido),
      });

      const result = await response.json();

      if (result.success) {
        setPedidos((prevPedidos) =>
          prevPedidos.map((pedido) =>
            pedido.id === updatedPedido.id ? { ...pedido, ...updatedPedido } : pedido
          )
        );
        toast.success('Pedido atualizado com sucesso!');
      } else {
        toast.error(`Erro ao atualizar pedido: ${result.message}`);
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao atualizar o pedido.');
    }
  };

  return (
    <div className="App">
      <div className="navbar">
        <div className="logo">Cozinha do Ave</div>
      </div>
      <div className="menu">
        <div className="menu-button">
          <button onClick={() => handlePopup('Registrar', pedidos)}>Registrar</button>
          <button onClick={() => handlePopup('Adicionar', pedidos)}>Adicionar</button>
          <button onClick={() => handlePopup('Eliminar')}>Eliminar</button>
        </div>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            {popupContent === 'Registrar' && (
              <RegisterForm 
                closePopup={closePopup} 
                openDetailsPopup={openDetailsPopup} 
                pedidos={pedidos} 
              />
            )}
            {popupContent === 'OrderDetails' && (
              <OrderDetailsForm
                closePopup={closePopup}
                addMore={addMore}
                finalize={finalize}
                registrationData={registrationData}
              />
            )}
            {popupContent === 'Adicionar' && (
              <AddProductForm
                pedidos={pedidos}
                closePopup={closePopup}
                addProduct={addProduct}
              />
            )}
            {popupContent === 'Eliminar' && (
              <DeleteOrderForm
                pedidos={pedidos}
                closePopup={closePopup}
                deleteOrder={deleteOrder}
              />
            )}
            {popupContent !== 'Registrar' && popupContent !== 'OrderDetails' && popupContent !== 'Adicionar' && popupContent !== 'Eliminar' && (
              <>
                <h2>{popupContent}</h2>
                <button onClick={closePopup}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="tabs-main">
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
        {activeTab === 'pedidos' && <Pedidos pedidos={pedidos} onDelete={handleDelete} onEdit={handleEdit} />}
        {activeTab === 'cardapio' && <Cardapio />}
        {activeTab === 'contador' && <Contador pedidos={pedidos} />}
        {activeTab === 'contadordetalhado' && <ContadorDetalhado pedidos={pedidos} />} {/* Adiciona o novo componente */}
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default App;
