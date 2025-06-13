import csv
import io
from datetime import datetime
from typing import List, Dict, Any
from src.models.conciliacao import Transacao, ResultadoConciliacao, db

class ConciliadorBancario:
    def __init__(self):
        self.tolerancia_valor = 0.01  # Tolerância de R$ 0,01 para diferenças de arredondamento
        self.tolerancia_dias = 3  # Tolerância de 3 dias para diferenças de data
    
    def processar_extrato_csv(self, arquivo_csv: str, origem: str = 'extrato_bancario') -> List[Transacao]:
        """
        Processa um arquivo CSV de extrato bancário e retorna lista de transações
        """
        transacoes = []
        
        # Lê o conteúdo do CSV
        linhas = arquivo_csv.strip().split('\n')
        reader = csv.DictReader(linhas)
        
        for linha in reader:
            try:
                # Converte a data
                data_str = linha.get('data', '').strip()
                if '/' in data_str:
                    data = datetime.strptime(data_str, '%d/%m/%Y')
                else:
                    data = datetime.strptime(data_str, '%Y-%m-%d')
                
                # Converte o valor
                valor_str = linha.get('valor', '0').replace(',', '.').replace('R$', '').strip()
                valor = float(valor_str)
                
                # Determina o tipo baseado no valor ou coluna específica
                tipo = linha.get('tipo', '').lower()
                if not tipo:
                    tipo = 'credito' if valor > 0 else 'debito'
                    valor = abs(valor)
                
                transacao = Transacao(
                    data=data,
                    descricao=linha.get('descricao', '').strip(),
                    valor=valor,
                    tipo=tipo,
                    categoria=linha.get('categoria', '').strip(),
                    origem=origem,
                    documento=linha.get('documento', '').strip(),
                    status_conciliacao='pendente'
                )
                
                transacoes.append(transacao)
                
            except (ValueError, KeyError) as e:
                print(f"Erro ao processar linha: {linha}. Erro: {e}")
                continue
        
        return transacoes
    
    def conciliar_transacoes(self) -> ResultadoConciliacao:
        """
        Executa o processo de conciliação entre transações bancárias e do sistema
        """
        # Busca todas as transações pendentes
        transacoes_bancarias = Transacao.query.filter_by(
            origem='extrato_bancario', 
            status_conciliacao='pendente'
        ).all()
        
        transacoes_sistema = Transacao.query.filter_by(
            origem='sistema_interno', 
            status_conciliacao='pendente'
        ).all()
        
        conciliadas = 0
        divergentes = 0
        
        # Processo de conciliação
        for transacao_banco in transacoes_bancarias:
            melhor_match = None
            melhor_score = 0
            
            for transacao_sistema in transacoes_sistema:
                if transacao_sistema.status_conciliacao != 'pendente':
                    continue
                
                score = self._calcular_score_similaridade(transacao_banco, transacao_sistema)
                
                if score > melhor_score and score >= 0.8:  # Threshold de 80% de similaridade
                    melhor_score = score
                    melhor_match = transacao_sistema
            
            if melhor_match:
                # Marca ambas como conciliadas
                transacao_banco.status_conciliacao = 'conciliado'
                transacao_banco.transacao_relacionada_id = melhor_match.id
                melhor_match.status_conciliacao = 'conciliado'
                melhor_match.transacao_relacionada_id = transacao_banco.id
                conciliadas += 1
            else:
                # Marca como divergente
                transacao_banco.status_conciliacao = 'divergente'
                divergentes += 1
        
        # Marca transações do sistema não conciliadas como divergentes
        for transacao_sistema in transacoes_sistema:
            if transacao_sistema.status_conciliacao == 'pendente':
                transacao_sistema.status_conciliacao = 'divergente'
                divergentes += 1
        
        # Calcula estatísticas
        total_bancarias = len(transacoes_bancarias)
        total_sistema = len(transacoes_sistema)
        total_pendentes = Transacao.query.filter_by(status_conciliacao='pendente').count()
        
        valor_total_bancario = sum(t.valor for t in transacoes_bancarias)
        valor_total_sistema = sum(t.valor for t in transacoes_sistema)
        diferenca_valor = valor_total_bancario - valor_total_sistema
        
        # Salva o resultado
        resultado = ResultadoConciliacao(
            total_transacoes_bancarias=total_bancarias,
            total_transacoes_sistema=total_sistema,
            total_conciliadas=conciliadas,
            total_divergentes=divergentes,
            total_pendentes=total_pendentes,
            valor_total_bancario=valor_total_bancario,
            valor_total_sistema=valor_total_sistema,
            diferenca_valor=diferenca_valor,
            observacoes=f"Conciliação executada com {conciliadas} transações conciliadas e {divergentes} divergentes."
        )
        
        db.session.add(resultado)
        db.session.commit()
        
        return resultado
    
    def _calcular_score_similaridade(self, transacao1: Transacao, transacao2: Transacao) -> float:
        """
        Calcula um score de similaridade entre duas transações (0.0 a 1.0)
        """
        score = 0.0
        
        # Similaridade de valor (peso: 40%)
        diferenca_valor = abs(transacao1.valor - transacao2.valor)
        if diferenca_valor <= self.tolerancia_valor:
            score += 0.4
        elif diferenca_valor <= transacao1.valor * 0.05:  # 5% de tolerância
            score += 0.2
        
        # Similaridade de data (peso: 30%)
        diferenca_dias = abs((transacao1.data - transacao2.data).days)
        if diferenca_dias == 0:
            score += 0.3
        elif diferenca_dias <= self.tolerancia_dias:
            score += 0.15
        
        # Similaridade de tipo (peso: 20%)
        if transacao1.tipo == transacao2.tipo:
            score += 0.2
        
        # Similaridade de descrição (peso: 10%)
        desc1 = transacao1.descricao.lower().strip()
        desc2 = transacao2.descricao.lower().strip()
        
        if desc1 == desc2:
            score += 0.1
        elif desc1 in desc2 or desc2 in desc1:
            score += 0.05
        
        return score
    
    def gerar_dados_exemplo(self):
        """
        Gera dados de exemplo para demonstração
        """
        from datetime import timedelta
        
        # Limpa dados existentes
        Transacao.query.delete()
        ResultadoConciliacao.query.delete()
        
        # Dados de exemplo - Extrato bancário
        transacoes_bancarias = [
            Transacao(data=datetime(2024, 1, 15), descricao="Pagamento Fornecedor ABC", valor=1500.00, tipo="debito", origem="extrato_bancario"),
            Transacao(data=datetime(2024, 1, 16), descricao="Recebimento Cliente XYZ", valor=2300.50, tipo="credito", origem="extrato_bancario"),
            Transacao(data=datetime(2024, 1, 17), descricao="Taxa Bancária", valor=25.00, tipo="debito", origem="extrato_bancario"),
            Transacao(data=datetime(2024, 1, 18), descricao="Transferência Recebida", valor=800.00, tipo="credito", origem="extrato_bancario"),
            Transacao(data=datetime(2024, 1, 19), descricao="Pagamento Salários", valor=5000.00, tipo="debito", origem="extrato_bancario"),
        ]
        
        # Dados de exemplo - Sistema interno (alguns com pequenas diferenças)
        transacoes_sistema = [
            Transacao(data=datetime(2024, 1, 15), descricao="Pagamento Fornecedor ABC Ltda", valor=1500.00, tipo="debito", origem="sistema_interno"),
            Transacao(data=datetime(2024, 1, 16), descricao="Recebimento Cliente XYZ Corp", valor=2300.50, tipo="credito", origem="sistema_interno"),
            Transacao(data=datetime(2024, 1, 18), descricao="Transferência Recebida", valor=800.00, tipo="credito", origem="sistema_interno"),
            Transacao(data=datetime(2024, 1, 19), descricao="Folha de Pagamento", valor=5000.00, tipo="debito", origem="sistema_interno"),
            Transacao(data=datetime(2024, 1, 20), descricao="Venda Produto DEF", valor=1200.00, tipo="credito", origem="sistema_interno"),
        ]
        
        # Adiciona todas as transações
        for transacao in transacoes_bancarias + transacoes_sistema:
            db.session.add(transacao)
        
        db.session.commit()
        
        return len(transacoes_bancarias), len(transacoes_sistema)

