from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Transacao(db.Model):
    __tablename__ = 'transacoes'
    
    id = Column(Integer, primary_key=True)
    data = Column(DateTime, nullable=False)
    descricao = Column(String(255), nullable=False)
    valor = Column(Float, nullable=False)
    tipo = Column(String(50), nullable=False)  # 'debito' ou 'credito'
    categoria = Column(String(100))
    origem = Column(String(50), nullable=False)  # 'extrato_bancario' ou 'sistema_interno'
    documento = Column(String(100))
    status_conciliacao = Column(String(50), default='pendente')  # 'pendente', 'conciliado', 'divergente'
    transacao_relacionada_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'data': self.data.isoformat() if self.data else None,
            'descricao': self.descricao,
            'valor': self.valor,
            'tipo': self.tipo,
            'categoria': self.categoria,
            'origem': self.origem,
            'documento': self.documento,
            'status_conciliacao': self.status_conciliacao,
            'transacao_relacionada_id': self.transacao_relacionada_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ResultadoConciliacao(db.Model):
    __tablename__ = 'resultados_conciliacao'
    
    id = Column(Integer, primary_key=True)
    data_processamento = Column(DateTime, default=datetime.utcnow)
    total_transacoes_bancarias = Column(Integer, default=0)
    total_transacoes_sistema = Column(Integer, default=0)
    total_conciliadas = Column(Integer, default=0)
    total_divergentes = Column(Integer, default=0)
    total_pendentes = Column(Integer, default=0)
    valor_total_bancario = Column(Float, default=0.0)
    valor_total_sistema = Column(Float, default=0.0)
    diferenca_valor = Column(Float, default=0.0)
    observacoes = Column(Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'data_processamento': self.data_processamento.isoformat() if self.data_processamento else None,
            'total_transacoes_bancarias': self.total_transacoes_bancarias,
            'total_transacoes_sistema': self.total_transacoes_sistema,
            'total_conciliadas': self.total_conciliadas,
            'total_divergentes': self.total_divergentes,
            'total_pendentes': self.total_pendentes,
            'valor_total_bancario': self.valor_total_bancario,
            'valor_total_sistema': self.valor_total_sistema,
            'diferenca_valor': self.diferenca_valor,
            'observacoes': self.observacoes
        }

