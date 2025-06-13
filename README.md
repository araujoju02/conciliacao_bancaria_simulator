# Simulador de Conciliação Bancária

Um sistema interativo e completo para conciliação de extratos bancários e transações internas, desenvolvido com Flask (backend) e React (frontend).

## 📋 Descrição

O Simulador de Conciliação Bancária é uma aplicação web que permite:

- **Upload de extratos bancários** em formato CSV
- **Upload de transações do sistema interno** em formato CSV
- **Conciliação automática** baseada em algoritmos de similaridade
- **Visualização interativa** dos resultados com gráficos e tabelas
- **Dashboard em tempo real** com estatísticas e métricas
- **Geração de dados de exemplo** para demonstração
- **Interface responsiva** e moderna

## 🚀 Funcionalidades

### Backend (Flask)
- API RESTful com endpoints para todas as operações
- Processamento de arquivos CSV
- Algoritmo inteligente de conciliação
- Banco de dados SQLite para persistência
- CORS habilitado para integração frontend-backend

### Frontend (React)
- Interface moderna com Tailwind CSS e shadcn/ui
- Dashboard interativo com gráficos (Recharts)
- Sistema de abas para organização
- Upload de arquivos drag-and-drop
- Visualização de transações em tabelas
- Gráficos de pizza e barras para estatísticas

### Algoritmo de Conciliação
- **Similaridade de valor** (tolerância configurável)
- **Similaridade de data** (tolerância de dias)
- **Comparação de tipo** (débito/crédito)
- **Análise de descrição** (correspondência textual)
- **Score ponderado** para determinar matches

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **Flask-CORS** - Suporte a CORS
- **SQLite** - Banco de dados

### Frontend
- **React** - Biblioteca JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones

## 📦 Estrutura do Projeto

```
conciliacao_bancaria_simulator/
├── backend/
│   └── conciliacao_api/
│       ├── src/
│       │   ├── models/
│       │   │   ├── conciliacao.py    # Modelos de dados
│       │   │   └── user.py           # Modelo de usuário
│       │   ├── routes/
│       │   │   ├── conciliacao.py    # Rotas da API
│       │   │   └── user.py           # Rotas de usuário
│       │   ├── services/
│       │   │   └── conciliacao_service.py  # Lógica de negócio
│       │   ├── static/               # Arquivos estáticos (build do React)
│       │   └── main.py               # Aplicação principal
│       ├── venv/                     # Ambiente virtual Python
│       └── requirements.txt          # Dependências Python
├── frontend/
│   └── conciliacao-frontend/
│       ├── src/
│       │   ├── components/           # Componentes React
│       │   ├── assets/               # Assets estáticos
│       │   ├── App.jsx               # Componente principal
│       │   └── main.jsx              # Entry point
│       ├── dist/                     # Build de produção
│       ├── package.json              # Dependências Node.js
│       └── vite.config.js            # Configuração Vite
└── README.md                         # Este arquivo
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm (ou npm)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd conciliacao_bancaria_simulator
```

### 2. Configuração do Backend

```bash
# Navegue para o diretório do backend
cd backend/conciliacao_api

# Ative o ambiente virtual
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Execute o servidor Flask
python src/main.py
```

O backend estará disponível em `http://localhost:5000`

### 3. Configuração do Frontend (Desenvolvimento)

```bash
# Navegue para o diretório do frontend
cd frontend/conciliacao-frontend

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm run dev --host
```

O frontend estará disponível em `http://localhost:5173`

### 4. Build de Produção

```bash
# No diretório do frontend
pnpm run build

# Copie os arquivos para o backend
cp -r dist/* ../../backend/conciliacao_api/src/static/
```

Após o build, a aplicação completa estará disponível em `http://localhost:5000`

## 📊 Formato dos Arquivos CSV

### Estrutura Esperada
```csv
data,descricao,valor,tipo
15/01/2024,Pagamento Fornecedor ABC,1500.00,debito
16/01/2024,Recebimento Cliente XYZ,2300.50,credito
17/01/2024,Taxa Bancária,25.00,debito
```

### Campos Obrigatórios
- **data**: Data da transação (formato DD/MM/AAAA ou AAAA-MM-DD)
- **descricao**: Descrição da transação
- **valor**: Valor da transação (formato decimal com ponto)
- **tipo**: Tipo da transação (debito ou credito)

### Campos Opcionais
- **categoria**: Categoria da transação
- **documento**: Número do documento

## 🎯 Como Usar

### 1. Gerar Dados de Exemplo
- Clique em "Gerar Dados de Exemplo" no dashboard
- Isso criará transações de exemplo para demonstração

### 2. Upload de Arquivos
- Acesse a aba "Upload"
- Faça upload do extrato bancário (CSV)
- Faça upload das transações do sistema (CSV)

### 3. Executar Conciliação
- Clique em "Executar Conciliação" no dashboard
- O sistema processará automaticamente as transações
- Visualize os resultados nos gráficos e tabelas

### 4. Visualizar Resultados
- **Dashboard**: Visão geral com estatísticas e gráficos
- **Transações**: Lista detalhada de todas as transações
- **Resultados**: Histórico de conciliações executadas

## 🔍 API Endpoints

### Estatísticas
- `GET /api/conciliacao/estatisticas` - Estatísticas gerais

### Upload
- `POST /api/conciliacao/upload-extrato` - Upload extrato bancário
- `POST /api/conciliacao/upload-sistema` - Upload transações sistema

### Conciliação
- `POST /api/conciliacao/executar-conciliacao` - Executar processo
- `GET /api/conciliacao/resultados-conciliacao` - Listar resultados

### Transações
- `GET /api/conciliacao/transacoes` - Listar transações
- `GET /api/conciliacao/transacoes?origem=extrato_bancario` - Filtrar por origem
- `GET /api/conciliacao/transacoes?status=conciliado` - Filtrar por status

### Utilitários
- `POST /api/conciliacao/gerar-dados-exemplo` - Gerar dados de teste
- `DELETE /api/conciliacao/limpar-dados` - Limpar todos os dados

## 🧮 Algoritmo de Conciliação

O sistema utiliza um algoritmo de pontuação ponderada para determinar correspondências:

### Critérios de Similaridade
1. **Valor** (40% do score)
   - Tolerância de R$ 0,01 para diferenças de arredondamento
   - Tolerância de 5% para pequenas variações

2. **Data** (30% do score)
   - Correspondência exata: pontuação máxima
   - Tolerância de 3 dias: pontuação parcial

3. **Tipo** (20% do score)
   - Débito/Crédito deve corresponder exatamente

4. **Descrição** (10% do score)
   - Correspondência exata ou parcial de texto

### Threshold de Conciliação
- **80% ou mais**: Transações são marcadas como conciliadas
- **Menos de 80%**: Transações permanecem divergentes

## 🎨 Interface do Usuário

### Dashboard
- Cards com estatísticas principais
- Gráfico de pizza para distribuição por status
- Gráfico de barras para transações por origem
- Botões de ação principais

### Upload
- Áreas de drag-and-drop para arquivos
- Validação de formato CSV
- Feedback visual de upload

### Transações
- Tabela responsiva com todas as transações
- Filtros por origem e status
- Badges coloridos para status
- Ícones intuitivos

### Resultados
- Histórico de conciliações
- Métricas detalhadas por execução
- Taxa de conciliação calculada
- Diferenças de valores destacadas

## 🔧 Configurações Avançadas

### Tolerâncias do Algoritmo
No arquivo `src/services/conciliacao_service.py`:

```python
self.tolerancia_valor = 0.01  # R$ 0,01
self.tolerancia_dias = 3      # 3 dias
```

### CORS
O backend está configurado para aceitar requisições de qualquer origem:

```python
CORS(app)  # Permite todas as origens
```

### Banco de Dados
SQLite é usado por padrão. Para mudar para PostgreSQL ou MySQL, modifique a configuração em `main.py`:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sua-string-de-conexao'
```

## 🚀 Deploy

### Opção 1: Servidor Local
1. Execute o build do frontend
2. Copie os arquivos para a pasta static do Flask
3. Execute apenas o servidor Flask

### Opção 2: Servidores Separados
1. Deploy do backend em um servidor (ex: Heroku, Railway)
2. Deploy do frontend em outro servidor (ex: Vercel, Netlify)
3. Configure a URL da API no frontend

### Opção 3: Docker (Recomendado para produção)
```dockerfile
# Dockerfile exemplo para o backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "src/main.py"]
```

## 🧪 Testes

### Dados de Exemplo
O sistema inclui dados de exemplo que demonstram:
- Transações que se conciliam perfeitamente
- Transações com pequenas diferenças
- Transações divergentes
- Diferentes tipos e categorias

### Cenários de Teste
1. **Upload de arquivos válidos**
2. **Upload de arquivos inválidos**
3. **Conciliação com dados diversos**
4. **Visualização de resultados**
5. **Limpeza de dados**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **JULIANA ARAÚJO** - Simulador de Conciliação Bancária

## 🙏 Agradecimentos

- Comunidade Flask pela excelente documentação
- Equipe React pelo framework incrível
- Contribuidores do Tailwind CSS e shadcn/ui
- Comunidade open source em geral

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**Simulador de Conciliação Bancária** - Desenvolvido com ❤️ para facilitar processos financeiros. - PROJETO FACULDADE

