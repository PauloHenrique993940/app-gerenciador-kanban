import React, {
  useState,
  useEffect,
  useCallback,
  type MouseEventHandler,
  type DragEventHandler,
} from 'react';
// Importação simulada de ícones do Lucide-React (assumindo que estão disponíveis no ambiente)
import {
  Plus,
  Settings,
  Sun,
  Moon,
  Trash2,
  X,
  Search,
  Filter,
} from 'lucide-react';

// --- SEÇÃO 1: TIPAGEM DE DADOS (INTERFACES) ---

/**
 * @interface IList
 * Define a estrutura de uma Lista (Coluna) no Kanban.
 */
interface IList {
  id: string;
  title: string;
  colorVar: string; // Variável CSS para a cor da lista
  order: number;
}

/**
 * @interface ICard
 * Define a estrutura de um Cartão (Tarefa) no Kanban.
 */
interface ICard {
  id: string;
  listId: string;
  title: string;
  description: string;
  createdAt: number; // Timestamp
}

/**
 * @interface IKanbanState
 * Define o estado global do aplicativo Kanban.
 */
interface IKanbanState {
  lists: IList[];
  cards: ICard[];
  theme: 'light' | 'dark';
  searchTerm: string;
}

/**
 * @interface IKanbanStore
 * Define o tipo de retorno do hook `useKanbanStore`, combinando o estado e as ações.
 */
interface IKanbanStore extends IKanbanState {
  setCardList: (cardId: string, newListId: string) => void;
  addCard: (listId: string, title: string, description: string) => void;
  updateCard: (
    cardId: string,
    newTitle: string,
    newDescription: string
  ) => void;
  deleteCard: (cardId: string) => void;
  addList: (title: string) => void;
  toggleTheme: () => void;
  reorderCards: (
    sourceListId: string | null, // Ignorado no D&D nativo simples, mas mantido na assinatura
    cardId: string,
    targetListId: string
  ) => void;
  setSearchTerm: (term: string) => void;
}

// --- SEÇÃO 2: DADOS INICIAIS E UTILS TIPADOS ---

const INITIAL_LISTS: IList[] = [
  // Nota: As cores foram substituídas por nomes de variáveis CSS para o tema
  { id: 'list-1', title: 'A Fazer', colorVar: '--color-list-red', order: 0 },
  {
    id: 'list-2',
    title: 'Em Progresso',
    colorVar: '--color-list-blue',
    order: 1,
  },
  {
    id: 'list-3',
    title: 'Concluído',
    colorVar: '--color-list-green',
    order: 2,
  },
];

const INITIAL_CARDS: ICard[] = [
  {
    id: 'card-1',
    listId: 'list-1',
    title: 'Criar Arquitetura do Projeto',
    description:
      'Definir o layout do Board e os componentes principais (Lista, Cartão, Modal).',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'card-2',
    listId: 'list-1',
    title: 'Implementar Persistência',
    description:
      'Configurar o salvamento e carregamento dos dados no localStorage.',
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'card-3',
    listId: 'list-2',
    title: 'Desenvolver Drag & Drop',
    description: 'Aplicar a lógica de D&D para mover cartões entre as colunas.',
    createdAt: Date.now() - 600000,
  },
  {
    id: 'card-4',
    listId: 'list-3',
    title: 'Configurar Tema Escuro/Claro',
    description: 'Criar o seletor de tema e aplicar estilos responsivos.',
    createdAt: Date.now() - 7200000,
  },
];

// Chave do localStorage
const STORAGE_KEY = 'kanban-board-state';

// Função utilitária para buscar o estado inicial
const getInitialState = (): IKanbanState => {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
      // Cast explícito para o tipo esperado
      return JSON.parse(storedState) as IKanbanState;
    }
  } catch (error) {
    console.error('Erro ao carregar estado do localStorage:', error);
  }
  return {
    lists: INITIAL_LISTS,
    cards: INITIAL_CARDS,
    theme: 'light', // Padrão
    searchTerm: '',
  };
};

// --- SEÇÃO 3: LÓGICA DO ESTADO (ZUSTAND SIMULADO) E PERSISTÊNCIA TIPADA ---

// Este hook simula o store central (Zustand) para todo o aplicativo.
const useKanbanStore = (): IKanbanStore => {
  // useState tipado
  const [state, setState] = useState<IKanbanState>(getInitialState);

  // Efeito para persistir o estado sempre que ele mudar e aplicar o tema
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.className = state.theme; // Aplica a classe de tema (light/dark)
  }, [state]);

  const setCardList = useCallback((cardId: string, newListId: string): void => {
    setState((prevState) => ({
      ...prevState,
      cards: prevState.cards.map((card) =>
        card.id === cardId ? { ...card, listId: newListId } : card
      ),
    }));
  }, []);

  const addCard = useCallback(
    (listId: string, title: string, description: string): void => {
      const newCard: ICard = {
        id: `card-${Date.now()}`,
        listId,
        title,
        description,
        createdAt: Date.now(),
      };
      setState((prevState) => ({
        ...prevState,
        cards: [...prevState.cards, newCard],
      }));
    },
    []
  );

  const updateCard = useCallback(
    (cardId: string, newTitle: string, newDescription: string): void => {
      setState((prevState) => ({
        ...prevState,
        cards: prevState.cards.map((card) =>
          card.id === cardId
            ? { ...card, title: newTitle, description: newDescription }
            : card
        ),
      }));
    },
    []
  );

  const deleteCard = useCallback((cardId: string): void => {
    setState((prevState) => ({
      ...prevState,
      cards: prevState.cards.filter((card) => card.id !== cardId),
    }));
  }, []);

  const addList = useCallback(
    (title: string): void => {
      const newList: IList = {
        id: `list-${Date.now()}`,
        title,
        colorVar: '--color-list-yellow',
        order: state.lists.length,
      };
      setState((prevState) => ({
        ...prevState,
        lists: [...prevState.lists, newList],
      }));
    },
    [state.lists.length]
  );

  const toggleTheme = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      theme: prevState.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setSearchTerm = useCallback((term: string): void => {
    setState((prevState) => ({
      ...prevState,
      searchTerm: term,
    }));
  }, []);

  const reorderCards = useCallback(
    (
      sourceListId: string | null,
      cardId: string,
      targetListId: string
    ): void => {
      // Nota: No D&D nativo simples, sourceListId não é usado aqui, mas setCardList faz a atualização
      setCardList(cardId, targetListId);
    },
    [setCardList]
  );

  return {
    ...state,
    setCardList,
    addCard,
    updateCard,
    deleteCard,
    addList,
    toggleTheme,
    reorderCards,
    setSearchTerm,
  };
};

// --- SEÇÃO 4: COMPONENTES REUTILIZÁVEIS TIPADOS ---

// Propriedades para o Componente Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  // O restante das props são repassadas via React.ButtonHTMLAttributes
}

// Componente: Button (Botão Simples)
const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  return (
    <button className={`button-base button-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Propriedades para o Componente CardComponent
interface CardComponentProps {
  card: ICard;
  onEditClick: (card: ICard) => void;
  onDelete: (cardId: string) => void;
  listColorVar: string;
}

// Componente: CardComponent (Exibição de Cartão na Lista)
const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onEditClick,
  onDelete,
  listColorVar,
}) => {
  const formattedDate = new Date(card.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  // Tipagem para evento DragStart
  const handleDragStart: DragEventHandler<HTMLDivElement> = (e) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLDivElement).classList.add('dragging-opacity');
  };

  // Tipagem para evento DragEnd
  const handleDragEnd: DragEventHandler<HTMLDivElement> = (e) => {
    (e.currentTarget as HTMLDivElement).classList.remove('dragging-opacity');
  };

  return (
    <div
      className="card-component"
      style={{ borderLeftColor: `var(${listColorVar})` }}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEditClick(card)}
    >
      <div className="card-header">
        <h3 className="card-title">{card.title}</h3>
        <Button
          variant="ghost"
          className="card-delete-btn"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
        >
          <Trash2 className="icon-sm color-red-400" />
        </Button>
      </div>
      <p className="card-description">{card.description}</p>
      <span className="card-date" style={{ color: `var(${listColorVar})` }}>
        {formattedDate}
      </span>
    </div>
  );
};

// Propriedades para o Componente CardModal
interface CardModalProps {
  card: ICard;
  onClose: () => void;
  onSave: (cardId: string, newTitle: string, newDescription: string) => void;
  onDelete: (cardId: string) => void;
}

// Componente: CardModal (Modal de Edição de Cartão)
const CardModal: React.FC<CardModalProps> = ({
  card,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState<string>(card.title);
  const [description, setDescription] = useState<string>(card.description);

  // Tipagem para evento de formulário
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(card.id, title, description);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Evita fechar ao clicar dentro
      >
        <div className="modal-header">
          <h2 className="modal-title">Editar Cartão</h2>
          <Button variant="ghost" onClick={onClose} className="modal-close-btn">
            <X className="icon-sm" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div>
            <label htmlFor="title" className="form-label">
              Título
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="form-label">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="form-input form-textarea"
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <Button type="submit">Salvar Alterações</Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(card.id);
                onClose();
              }}
            >
              <Trash2 className="icon-sm" /> Excluir
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SEÇÃO 5: COMPONENTES DE PÁGINA TIPADOS (LISTA E BOARD) ---

// Propriedades para o Componente ListView
interface ListViewProps {
  list: IList;
  cards: ICard[];
  addCard: IKanbanStore['addCard'];
  reorderCards: IKanbanStore['reorderCards'];
  onEditCard: (card: ICard) => void;
  deleteCard: IKanbanStore['deleteCard'];
}

// Componente: ListView (Coluna/Lista do Kanban)
const ListView: React.FC<ListViewProps> = ({
  list,
  cards,
  addCard,
  reorderCards,
  onEditCard,
  deleteCard,
}) => {
  const [newCardTitle, setNewCardTitle] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Tipagem para evento de formulário
  const handleAddCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      addCard(list.id, newCardTitle.trim(), 'Adicione uma descrição aqui.');
      setNewCardTitle('');
      setIsAdding(false);
    }
  };

  // Tipagem para evento DragOver
  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); // Necessário para permitir o drop
    (e.currentTarget as HTMLDivElement).classList.add('drag-over-list');
    e.dataTransfer.dropEffect = 'move';
  };

  // Tipagem para evento DragLeave
  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    (e.currentTarget as HTMLDivElement).classList.remove('drag-over-list');
  };

  // Tipagem para evento Drop
  const handleDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).classList.remove('drag-over-list');
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      // sourceListId é null porque o D&D nativo simples não nos dá o ID da lista de origem facilmente
      reorderCards(null, cardId, list.id);
    }
  };

  return (
    <div
      className="list-view"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="list-header">
        <h2 className="list-title">
          <span
            className="list-color-dot"
            style={{ backgroundColor: `var(${list.colorVar})` }}
          ></span>
          {list.title}
          <span className="list-count">({cards.length})</span>
        </h2>
        <Button
          variant="ghost"
          className="list-add-btn"
          onClick={() => setIsAdding((prev) => !prev)}
        >
          <Plus className="icon-sm" />
        </Button>
      </div>

      <div className="list-cards-container custom-scrollbar">
        {cards
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              listColorVar={list.colorVar}
              onEditClick={onEditCard}
              onDelete={deleteCard}
            />
          ))}
      </div>

      {isAdding && (
        <form onSubmit={handleAddCard} className="new-card-form">
          <input
            type="text"
            placeholder="Título do novo cartão..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            className="form-input new-card-input"
            autoFocus
          />
          <div className="new-card-actions">
            <Button type="submit">Adicionar</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAdding(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

// Propriedades para o Componente BoardView
interface BoardViewProps {
  store: IKanbanStore;
}

// Componente: BoardView (Quadro Principal)
const BoardView: React.FC<BoardViewProps> = ({ store }) => {
  const {
    lists,
    cards,
    reorderCards,
    addList,
    searchTerm,
    setSearchTerm,
    updateCard, // Adicionei para usar no modal
    deleteCard, // Adicionei para usar no modal
    addCard, // Adicionei para passar para ListView
  } = store;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // selectedCard pode ser ICard ou null
  const [selectedCard, setSelectedCard] = useState<ICard | null>(null);
  const [newListTitle, setNewListTitle] = useState<string>('');

  const handleEditCard = (card: ICard): void => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  // Tipagem para evento de input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const filteredCards: ICard[] = cards.filter(
    (card) =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddList = (): void => {
    if (newListTitle.trim()) {
      addList(newListTitle.trim());
      setNewListTitle('');
    }
  };

  return (
    <div className="board-view">
      {/* Search and Filters Bar */}
      <header className="board-header">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar cartões por título ou descrição..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-input search-input"
          />
        </div>
        <div className="header-actions">
          <Button variant="secondary" className="header-filter-btn">
            <Filter className="icon-sm" /> Filtros
          </Button>
          <input
            type="text"
            placeholder="Nova Lista"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            className="form-input new-list-input"
          />
          <Button onClick={handleAddList} disabled={!newListTitle.trim()}>
            <Plus className="icon-sm" /> Lista
          </Button>
        </div>
      </header>

      {/* Kanban Columns Container */}
      <main className="kanban-columns-container custom-scrollbar">
        <div className="kanban-columns-wrapper">
          {lists
            .sort((a, b) => a.order - b.order) // Ordena as listas
            .map((list) => (
              <ListView
                key={list.id}
                list={list}
                cards={filteredCards.filter((card) => card.listId === list.id)}
                addCard={addCard}
                reorderCards={reorderCards}
                onEditCard={handleEditCard}
                deleteCard={deleteCard}
              />
            ))}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setIsModalOpen(false)}
          onSave={updateCard}
          onDelete={deleteCard}
        />
      )}
    </div>
  );
};

// Propriedades para o Componente SettingsView
interface SettingsViewProps {
  store: IKanbanStore;
  setCurrentPage: (page: 'board' | 'settings') => void;
}

// Componente: SettingsView (Página de Configurações)
const SettingsView: React.FC<SettingsViewProps> = ({
  store,
  setCurrentPage,
}) => {
  const { theme, toggleTheme } = store;

  return (
    <div className="settings-view">
      <h1 className="settings-title">Configurações</h1>

      <div className="settings-content">
        {/* Tema Escuro/Claro */}
        <div>
          <h2 className="settings-subtitle">Aparência</h2>
          <div className="theme-toggle-container">
            <span>Tema do Aplicativo:</span>
            <Button
              variant="secondary"
              onClick={toggleTheme}
              className="theme-toggle-button"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="icon-sm" /> Escuro
                </>
              ) : (
                <>
                  <Sun className="icon-sm" /> Claro
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Informações */}
        <div>
          <h2 className="settings-subtitle">Informações</h2>
          <p className="settings-info-text">
            Este é um aplicativo Kanban de demonstração, simulando a arquitetura
            de um projeto React com `dnd-kit`, `Zustand` e `shadcn/ui` em um
            único arquivo.
          </p>
          <p className="settings-info-text">
            A persistência dos dados é feita usando `localStorage` e o estilo é
            puramente via **CSS Puro**.
          </p>
        </div>
      </div>

      <div className="settings-back-button-container">
        <Button onClick={() => setCurrentPage('board')} variant="secondary">
          Voltar para o Quadro
        </Button>
      </div>
    </div>
  );
};

// --- SEÇÃO 6: COMPONENTE PRINCIPAL (APP) TIPADO ---

// Definição do tipo para o estado da página
type Page = 'board' | 'settings';

const App: React.FC = () => {
  const store: IKanbanStore = useKanbanStore();
  const [currentPage, setCurrentPage] = useState<Page>('board');

  // Estilos CSS Puros
  const globalStyles = `
        :root {
            /* Cores Gerais - Claro */
            --color-primary: #2563EB;
            --color-primary-hover: #1D4ED8;
            --color-secondary: #E5E7EB;
            --color-secondary-hover: #D1D5DB;
            --color-destructive: #DC2626;
            --color-destructive-hover: #B91C1C;
            --color-text-dark: #18181B;
            --color-text-light: #FAFAFA;
            --color-text-medium: #52525B;
            --color-bg-light: #FAFAFA;
            --color-bg-medium: #F4F4F5;
            --color-bg-dark: #FFFFFF;
            --color-shadow: rgba(0, 0, 0, 0.1);
            --color-border: #D4D4D8;
            --color-placeholder: #A1A1AA;

            /* Cores Listas */
            --color-list-red: #EF4444;
            --color-list-blue: #3B82F6;
            --color-list-green: #10B981;
            --color-list-yellow: #F59E0B;
        }

        .dark {
            /* Cores Gerais - Escuro */
            --color-secondary: #3F3F46;
            --color-secondary-hover: #52525B;
            --color-text-dark: #FAFAFA;
            --color-text-light: #18181B;
            --color-text-medium: #A1A1AA;
            --color-bg-light: #18181B;
            --color-bg-medium: #27272A;
            --color-bg-dark: #09090B;
            --color-shadow: rgba(255, 255, 255, 0.1);
            --color-border: #3F3F46;
            --color-placeholder: #52525B;
        }

        /* Estilos Globais */
        body {
            margin: 0;
            font-family: sans-serif;
        }

        .app-container {
            height: 100%;
            background-color: var(--color-bg-light);
            transition: background-color 300ms, color 300ms;
            color: var(--color-text-dark);
            font-family: 'Inter', sans-serif;
        }

        .icon-sm {
            width: 1.25rem;
            height: 1.25rem;
            color: var(--color-text-medium);
        }

        .icon-sm.color-red-400 {
            color: #F87171; /* Cor específica para ícone de lixeira, mantendo proximidade */
        }
        .icon-sm.color-red-400:hover {
            color: #EF4444;
        }

        /* Scrollbar Personalizada */
        .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: ${store.theme === 'dark' ? '#52525B' : '#C7C7C7'};
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background-color: ${store.theme === 'dark' ? '#18181B' : '#F4F4F5'};
        }
        .app-content {
            height: calc(100vh - 64px);
            overflow: hidden;
        }

        /* Componente Botão */
        .button-base {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: background-color 200ms, opacity 200ms;
            box-shadow: 0 4px 6px -1px var(--color-shadow), 0 2px 4px -2px var(--color-shadow);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border: none;
            cursor: pointer;
        }
        .button-base:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .button-primary {
            background-color: var(--color-primary);
            color: var(--color-text-light);
        }
        .button-primary:hover {
            background-color: var(--color-primary-hover);
        }

        .button-secondary {
            background-color: var(--color-secondary);
            color: var(--color-text-dark);
        }
        .button-secondary:hover {
            background-color: var(--color-secondary-hover);
        }

        .button-destructive {
            background-color: var(--color-destructive);
            color: var(--color-text-light);
        }
        .button-destructive:hover {
            background-color: var(--color-destructive-hover);
        }

        .button-ghost {
            background-color: transparent;
            color: var(--color-text-dark);
            box-shadow: none;
            padding: 0.5rem;
        }
        .button-ghost:hover {
            background-color: var(--color-secondary);
        }

        .button-ghost .icon-sm {
            color: inherit; /* Garante que o ícone herde a cor do texto do botão */
        }

        .button-ghost.card-delete-btn {
            padding: 0.25rem;
            height: auto;
        }


        /* Navbar */
        .navbar {
            background-color: var(--color-bg-dark);
            box-shadow: 0 1px 3px 0 var(--color-shadow);
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .navbar-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1rem;
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .navbar-logo {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--color-primary);
        }
        .navbar-links {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        @media (min-width: 640px) {
            .navbar-content {
                padding: 0 1.5rem;
            }
        }
        @media (min-width: 1024px) {
            .navbar-content {
                padding: 0 2rem;
            }
        }

        /* Board View */
        .board-view {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 1.5rem;
            gap: 1rem;
        }

        /* Header (Search/Add List) */
        .board-header {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background-color: var(--color-bg-dark);
            padding: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px var(--color-shadow);
        }
        .search-container {
            position: relative;
            flex-grow: 1;
        }
        .search-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            width: 1.25rem;
            height: 1.25rem;
            color: var(--color-placeholder);
        }
        .search-input {
            width: 100%;
            padding-left: 2.5rem;
        }
        .header-actions {
            display: flex;
            gap: 1rem;
        }
        .new-list-input {
            flex-grow: 1;
        }

        @media (min-width: 640px) {
            .board-header {
                flex-direction: row;
                align-items: center;
            }
            .search-container {
                width: auto;
            }
            .header-actions {
                width: auto;
            }
        }

        /* Form Inputs */
        .form-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--color-border);
            border-radius: 0.5rem;
            background-color: var(--color-bg-dark);
            color: var(--color-text-dark);
            transition: border-color 200ms, background-color 200ms;
        }
        .form-input:focus {
            border-color: var(--color-primary);
            outline: 2px solid var(--color-primary);
            outline-offset: 0px;
        }
        .form-textarea {
            resize: vertical;
        }

        /* Kanban Columns Container */
        .kanban-columns-container {
            flex-grow: 1;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 1rem; /* Espaço para o scrollbar */
        }
        .kanban-columns-wrapper {
            display: flex;
            gap: 1.5rem;
            height: 100%;
            min-width: max-content;
        }

        /* List View (Coluna) */
        .list-view {
            flex-shrink: 0;
            width: 420px; /* 80w ≈ 320px */
            height: auto;
            background-color: var(--color-bg-medium);
            padding: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px var(--color-shadow);
            height: 100vh;
            display: flex;
            flex-direction: column;
            transition: box-shadow 300ms;
            
        }
        .drag-over-list {
            box-shadow: 0 0 0 2px var(--color-primary);
        }

        .list-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--color-border);
        }
        .list-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--color-text-dark);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .list-color-dot {
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
        }
        .list-count {
            margin-left: 0.5rem;
            font-size: 0.875rem;
            font-weight: 400;
            color: var(--color-text-medium);
        }
        .list-add-btn {
            color: var(--color-text-medium);
        }
        .list-add-btn:hover {
            color: var(--color-primary);
        }

        .list-cards-container {
            flex-grow: 1;
            overflow-y: auto;
            padding-right: 0.25rem;
        }

        /* Form Novo Cartão */
        .new-card-form {
            margin-top: 1rem;
            padding: 0.75rem;
            background-color: var(--color-bg-dark);
            border-radius: 0.5rem;
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        }
        .new-card-input {
            margin-bottom: 0.5rem;
            padding: 0.25rem 0.5rem;
        }
        .new-card-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
        }
        .new-card-actions .button-base {
            width: 100%;
            padding: 0.25rem;
        }


        /* Card Component */
        .card-component {
            background-color: var(--color-bg-dark);
            padding: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 var(--color-shadow);
            cursor: grab;
            margin-bottom: 0.75rem;
            border-left: 4px solid;
            transition: all 300ms;
        }
        .card-component:hover {
            box-shadow: 0 10px 15px -3px var(--color-shadow);
        }
        .dragging-opacity {
            opacity: 0.5;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .card-title {
            font-weight: 600;
            color: var(--color-text-dark);
            line-height: 1.375;
        }
        .card-description {
            font-size: 0.875rem;
            color: var(--color-text-medium);
            margin-top: 0.25rem;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .card-date {
            font-size: 0.75rem;
            font-family: monospace;
            margin-top: 0.75rem;
            display: inline-block;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            /* Cor será definida inline via JS (listColorVar) */
        }

        /* Modal */
        .modal-backdrop {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .modal-content {
            background-color: var(--color-bg-dark);
            width: 100%;
            max-width: 512px;
            border-radius: 0.75rem;
            box-shadow: 0 20px 25px -5px var(--color-shadow), 0 8px 10px -6px var(--color-shadow);
            padding: 1.5rem;
            transition: all 300ms;
            transform: scale(1);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--color-border);
        }
        .modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-text-dark);
        }
        .modal-close-btn {
            padding: 0.5rem;
        }
        .modal-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--color-text-medium);
            margin-bottom: 0.25rem;
        }
        .modal-actions {
            display: flex;
            justify-content: space-between;
            padding-top: 1rem;
            border-top: 1px solid var(--color-border);
        }

        /* Settings View */
        .settings-view {
            padding: 2rem;
            max-width: 48rem;
            margin: 0 auto;
            color: var(--color-text-dark);
        }
        .settings-title {
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--color-border);
        }
        .settings-content {
            background-color: var(--color-bg-dark);
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px var(--color-shadow);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        .settings-subtitle {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        .theme-toggle-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background-color: var(--color-bg-medium);
            border-radius: 0.5rem;
            border: 1px solid var(--color-border);
        }
        .theme-toggle-container span {
            color: var(--color-text-medium);
        }
        .theme-toggle-button {
            min-width: 120px;
        }
        .settings-info-text {
            font-size: 0.875rem;
            color: var(--color-text-medium);
            margin-top: 0.5rem;
        }
        .settings-back-button-container {
            margin-top: 2rem;
        }
    `;

  return (
    <>
      {/* O bloco <style> deve vir antes dos elementos que ele estiliza */}
      <style>{globalStyles}</style>

      <div className="app-container">
        {/* Navbar de Navegação */}
        <nav className="navbar">
          <div className="navbar-content">
            <div className="flex items-center">
              <span className="navbar-logo">KanbanFlow</span>
            </div>
            <div className="navbar-links">
              <Button
                variant={currentPage === 'board' ? 'primary' : 'ghost'}
                onClick={() => setCurrentPage('board')}
              >
                Board
              </Button>
              <Button
                variant={currentPage === 'settings' ? 'primary' : 'ghost'}
                onClick={() => setCurrentPage('settings')}
              >
                <Settings className="icon-sm" />
                Configurações
              </Button>
            </div>
          </div>
        </nav>

        {/* Conteúdo Principal */}
        <div className="app-content">
          {currentPage === 'board' && <BoardView store={store} />}
          {currentPage === 'settings' && (
            <SettingsView store={store} setCurrentPage={setCurrentPage} />
          )}
        </div>
      </div>
    </>
  );
};

export default App;
