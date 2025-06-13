from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from src.models.conciliacao import Transacao, ResultadoConciliacao, db
from src.services.conciliacao_service import ConciliadorBancario
import io
import csv

conciliacao_bp = Blueprint('conciliacao', __name__)

@conciliacao_bp.route('/upload-extrato', methods=['POST'])
@cross_origin()
def upload_extrato():
    """
    Endpoint para upload de arquivo CSV de extrato bancário
    """
    try:
        if 'arquivo' not in request.files:
            return jsonify({'erro': 'Nenhum arquivo enviado'}), 400
        
        arquivo = request.files['arquivo']
        if arquivo.filename == '':
            return jsonify({'erro': 'Nenhum arquivo selecionado'}), 400
        
        if not arquivo.filename.endswith('.csv'):
            return jsonify({'erro': 'Apenas arquivos CSV são aceitos'}), 400
        
        # Lê o conteúdo do arquivo
        conteudo = arquivo.read().decode('utf-8')
        
        # Processa o extrato
        conciliador = ConciliadorBancario()
        transacoes = conciliador.processar_extrato_csv(conteudo, 'extrato_bancario')
        
        # Salva no banco de dados
        for transacao in transacoes:
            db.session.add(transacao)
        
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'{len(transacoes)} transações importadas com sucesso',
            'total_transacoes': len(transacoes)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao processar arquivo: {str(e)}'}), 500

@conciliacao_bp.route('/upload-sistema', methods=['POST'])
@cross_origin()
def upload_sistema():
    """
    Endpoint para upload de arquivo CSV do sistema interno
    """
    try:
        if 'arquivo' not in request.files:
            return jsonify({'erro': 'Nenhum arquivo enviado'}), 400
        
        arquivo = request.files['arquivo']
        if arquivo.filename == '':
            return jsonify({'erro': 'Nenhum arquivo selecionado'}), 400
        
        if not arquivo.filename.endswith('.csv'):
            return jsonify({'erro': 'Apenas arquivos CSV são aceitos'}), 400
        
        # Lê o conteúdo do arquivo
        conteudo = arquivo.read().decode('utf-8')
        
        # Processa as transações do sistema
        conciliador = ConciliadorBancario()
        transacoes = conciliador.processar_extrato_csv(conteudo, 'sistema_interno')
        
        # Salva no banco de dados
        for transacao in transacoes:
            db.session.add(transacao)
        
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'{len(transacoes)} transações do sistema importadas com sucesso',
            'total_transacoes': len(transacoes)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao processar arquivo: {str(e)}'}), 500

@conciliacao_bp.route('/executar-conciliacao', methods=['POST'])
@cross_origin()
def executar_conciliacao():
    """
    Endpoint para executar o processo de conciliação
    """
    try:
        conciliador = ConciliadorBancario()
        resultado = conciliador.conciliar_transacoes()
        
        return jsonify({
            'sucesso': True,
            'resultado': resultado.to_dict()
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao executar conciliação: {str(e)}'}), 500

@conciliacao_bp.route('/transacoes', methods=['GET'])
@cross_origin()
def listar_transacoes():
    """
    Endpoint para listar todas as transações
    """
    try:
        origem = request.args.get('origem')
        status = request.args.get('status')
        
        query = Transacao.query
        
        if origem:
            query = query.filter_by(origem=origem)
        
        if status:
            query = query.filter_by(status_conciliacao=status)
        
        transacoes = query.order_by(Transacao.data.desc()).all()
        
        return jsonify({
            'sucesso': True,
            'transacoes': [t.to_dict() for t in transacoes],
            'total': len(transacoes)
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao listar transações: {str(e)}'}), 500

@conciliacao_bp.route('/resultados-conciliacao', methods=['GET'])
@cross_origin()
def listar_resultados():
    """
    Endpoint para listar resultados de conciliação
    """
    try:
        resultados = ResultadoConciliacao.query.order_by(
            ResultadoConciliacao.data_processamento.desc()
        ).all()
        
        return jsonify({
            'sucesso': True,
            'resultados': [r.to_dict() for r in resultados],
            'total': len(resultados)
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao listar resultados: {str(e)}'}), 500

@conciliacao_bp.route('/estatisticas', methods=['GET'])
@cross_origin()
def obter_estatisticas():
    """
    Endpoint para obter estatísticas gerais
    """
    try:
        total_transacoes = Transacao.query.count()
        total_bancarias = Transacao.query.filter_by(origem='extrato_bancario').count()
        total_sistema = Transacao.query.filter_by(origem='sistema_interno').count()
        total_conciliadas = Transacao.query.filter_by(status_conciliacao='conciliado').count()
        total_divergentes = Transacao.query.filter_by(status_conciliacao='divergente').count()
        total_pendentes = Transacao.query.filter_by(status_conciliacao='pendente').count()
        
        return jsonify({
            'sucesso': True,
            'estatisticas': {
                'total_transacoes': total_transacoes,
                'total_bancarias': total_bancarias,
                'total_sistema': total_sistema,
                'total_conciliadas': total_conciliadas,
                'total_divergentes': total_divergentes,
                'total_pendentes': total_pendentes
            }
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao obter estatísticas: {str(e)}'}), 500

@conciliacao_bp.route('/gerar-dados-exemplo', methods=['POST'])
@cross_origin()
def gerar_dados_exemplo():
    """
    Endpoint para gerar dados de exemplo para demonstração
    """
    try:
        conciliador = ConciliadorBancario()
        total_bancarias, total_sistema = conciliador.gerar_dados_exemplo()
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Dados de exemplo gerados com sucesso',
            'total_bancarias': total_bancarias,
            'total_sistema': total_sistema
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao gerar dados de exemplo: {str(e)}'}), 500

@conciliacao_bp.route('/limpar-dados', methods=['DELETE'])
@cross_origin()
def limpar_dados():
    """
    Endpoint para limpar todos os dados
    """
    try:
        Transacao.query.delete()
        ResultadoConciliacao.query.delete()
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Todos os dados foram removidos com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao limpar dados: {str(e)}'}), 500

