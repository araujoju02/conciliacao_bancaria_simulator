# Simulador de Conciliação Bancária

## Início Rápido

### 1. Executar o Backend
```bash
cd backend/conciliacao_api
source venv/bin/activate
python src/main.py
```

### 2. Acessar a Aplicação
Abra o navegador em: http://localhost:5000

### 3. Testar com Dados de Exemplo
1. Clique em "Gerar Dados de Exemplo"
2. Clique em "Executar Conciliação"
3. Explore as abas: Dashboard, Upload, Transações, Resultados

### 4. Testar Upload de Arquivos
1. Use os arquivos de exemplo: `exemplo_extrato_bancario.csv` e `exemplo_sistema_interno.csv`
2. Faça upload na aba "Upload"
3. Execute nova conciliação

## Estrutura dos Arquivos CSV

### Campos Obrigatórios
- **data**: DD/MM/AAAA ou AAAA-MM-DD
- **descricao**: Texto descritivo
- **valor**: Número decimal (use ponto como separador)
- **tipo**: "debito" ou "credito"

### Campos Opcionais
- **categoria**: Categoria da transação
- **documento**: Número/código do documento

## Funcionalidades Principais

- ✅ Upload de extratos bancários e transações internas
- ✅ Conciliação automática inteligente
- ✅ Dashboard interativo com gráficos
- ✅ Visualização detalhada de transações
- ✅ Histórico de conciliações
- ✅ Geração de dados de exemplo
- ✅ Interface responsiva e moderna

## Tecnologias

- **Backend**: Flask + SQLAlchemy + SQLite
- **Frontend**: React + Tailwind CSS + shadcn/ui + Recharts
- **Build**: Vite + pnpm

Para documentação completa, consulte o README.md principal.

