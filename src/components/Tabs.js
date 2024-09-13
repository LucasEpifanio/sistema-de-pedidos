import React from 'react';

const Tabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      <button
        className={activeTab === 'pedidos' ? 'active' : ''}
        onClick={() => onTabChange('pedidos')}
      >
        Pedidos
      </button>
      <button
        className={activeTab === 'cardapio' ? 'active' : ''}
        onClick={() => onTabChange('cardapio')}
      >
        Cardápio
      </button>
      <button
        className={activeTab === 'contador' ? 'active' : ''}
        onClick={() => onTabChange('contador')}
      >
        Contador Geral
      </button>
      <button
        className={activeTab === 'contadordetalhado' ? 'active' : ''}
        onClick={() => onTabChange('contadordetalhado')}
      >
        Contador Detalhado
      </button>
    </div>
  );
};

export default Tabs;
