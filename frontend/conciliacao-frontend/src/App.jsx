import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Upload, FileText, BarChart3, CheckCircle, XCircle, Clock, Download, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api/conciliacao'

function App() {
  const [estatisticas, setEstatisticas] = useState({})
  const [transacoes, setTransacoes] = useState([])
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  useEffect(() => {
    carregarEstatisticas()
    carregarTransacoes()
    carregarResultados()
  }, [])

  const showMessage = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estatisticas`)
      const data = await response.json()
      if (data.sucesso) {
        setEstatisticas(data.estatisticas)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const carregarTransacoes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transacoes`)
      const data = await response.json()
      if (data.sucesso) {
        setTransacoes(data.transacoes)
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    }
  }

  const carregarResultados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resultados-conciliacao`)
      const data = await response.json()
      if (data.sucesso) {
        setResultados(data.resultados)
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error)
    }
  }

  const handleFileUpload = async (file, tipo) => {
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('arquivo', file)

    try {
      const endpoint = tipo === 'bancario' ? 'upload-extrato' : 'upload-sistema'
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.sucesso) {
        showMessage(data.mensagem, 'success')
        carregarEstatisticas()
        carregarTransacoes()
      } else {
        showMessage(data.erro, 'error')
      }
    } catch (error) {
      showMessage('Erro ao fazer upload do arquivo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const executarConciliacao = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/executar-conciliacao`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.sucesso) {
        showMessage('Conciliação executada com sucesso!', 'success')
        carregarEstatisticas()
        carregarTransacoes()
        carregarResultados()
      } else {
        showMessage(data.erro, 'error')
      }
    } catch (error) {
      showMessage('Erro ao executar conciliação', 'error')
    } finally {
      setLoading(false)
    }
  }

  const gerarDadosExemplo = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/gerar-dados-exemplo`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.sucesso) {
        showMessage(data.mensagem, 'success')
        carregarEstatisticas()
        carregarTransacoes()
      } else {
        showMessage(data.erro, 'error')
      }
    } catch (error) {
      showMessage('Erro ao gerar dados de exemplo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const limparDados = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados?')) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/limpar-dados`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.sucesso) {
        showMessage(data.mensagem, 'success')
        carregarEstatisticas()
        carregarTransacoes()
        carregarResultados()
      } else {
        showMessage(data.erro, 'error')
      }
    } catch (error) {
      showMessage('Erro ao limpar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'conciliado':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'divergente':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      conciliado: 'bg-green-100 text-green-800',
      divergente: 'bg-red-100 text-red-800',
      pendente: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const chartData = [
    { name: 'Conciliadas', value: estatisticas.total_conciliadas || 0, color: '#10b981' },
    { name: 'Divergentes', value: estatisticas.total_divergentes || 0, color: '#ef4444' },
    { name: 'Pendentes', value: estatisticas.total_pendentes || 0, color: '#f59e0b' }
  ]

  const barData = [
    { name: 'Bancárias', value: estatisticas.total_bancarias || 0 },
    { name: 'Sistema', value: estatisticas.total_sistema || 0 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Simulador de Conciliação Bancária
          </h1>
          <p className="text-lg text-gray-600">
            Sistema interativo para conciliação de extratos bancários e transações internas
          </p>
        </header>

        {message && (
          <Alert className={`mb-6 ${messageType === 'error' ? 'border-red-500 bg-red-50' : messageType === 'success' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}>
            <AlertDescription className={messageType === 'error' ? 'text-red-700' : messageType === 'success' ? 'text-green-700' : 'text-blue-700'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.total_transacoes || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conciliadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{estatisticas.total_conciliadas || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Divergentes</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{estatisticas.total_divergentes || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{estatisticas.total_pendentes || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transações por Origem</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={executarConciliacao} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Executar Conciliação
              </Button>
              
              <Button 
                onClick={gerarDadosExemplo} 
                disabled={loading}
                variant="outline"
              >
                <FileText className="mr-2 h-4 w-4" />
                Gerar Dados de Exemplo
              </Button>
              
              <Button 
                onClick={limparDados} 
                disabled={loading}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Dados
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Extrato Bancário</CardTitle>
                  <CardDescription>
                    Faça upload do arquivo CSV do extrato bancário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'bancario')}
                      className="hidden"
                      id="extrato-upload"
                    />
                    <label htmlFor="extrato-upload" className="cursor-pointer">
                      <Button asChild disabled={loading}>
                        <span>Selecionar Arquivo CSV</span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Formato: data, descricao, valor, tipo
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Sistema Interno</CardTitle>
                  <CardDescription>
                    Faça upload do arquivo CSV do sistema interno
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'sistema')}
                      className="hidden"
                      id="sistema-upload"
                    />
                    <label htmlFor="sistema-upload" className="cursor-pointer">
                      <Button asChild disabled={loading}>
                        <span>Selecionar Arquivo CSV</span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Formato: data, descricao, valor, tipo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formato do Arquivo CSV</CardTitle>
                <CardDescription>
                  Exemplo de formato esperado para os arquivos CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div>data,descricao,valor,tipo</div>
                  <div>15/01/2024,Pagamento Fornecedor ABC,1500.00,debito</div>
                  <div>16/01/2024,Recebimento Cliente XYZ,2300.50,credito</div>
                  <div>17/01/2024,Taxa Bancária,25.00,debito</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Transações</CardTitle>
                <CardDescription>
                  Visualize todas as transações importadas e seus status de conciliação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Data</th>
                        <th className="border border-gray-300 p-2 text-left">Descrição</th>
                        <th className="border border-gray-300 p-2 text-right">Valor</th>
                        <th className="border border-gray-300 p-2 text-center">Tipo</th>
                        <th className="border border-gray-300 p-2 text-center">Origem</th>
                        <th className="border border-gray-300 p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoes.slice(0, 50).map((transacao) => (
                        <tr key={transacao.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">
                            {new Date(transacao.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="border border-gray-300 p-2">{transacao.descricao}</td>
                          <td className="border border-gray-300 p-2 text-right">
                            R$ {transacao.valor.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Badge variant={transacao.tipo === 'credito' ? 'default' : 'secondary'}>
                              {transacao.tipo}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Badge variant="outline">
                              {transacao.origem === 'extrato_bancario' ? 'Bancário' : 'Sistema'}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getStatusIcon(transacao.status_conciliacao)}
                              {getStatusBadge(transacao.status_conciliacao)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transacoes.length > 50 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Mostrando primeiras 50 transações de {transacoes.length} total
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resultados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Conciliações</CardTitle>
                <CardDescription>
                  Resultados das execuções de conciliação realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultados.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma conciliação executada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {resultados.map((resultado) => (
                      <Card key={resultado.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-600">Data de Processamento</h4>
                              <p className="text-lg">
                                {new Date(resultado.data_processamento).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-600">Transações Processadas</h4>
                              <p className="text-lg">
                                {resultado.total_transacoes_bancarias + resultado.total_transacoes_sistema}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-600">Taxa de Conciliação</h4>
                              <p className="text-lg">
                                {((resultado.total_conciliadas / (resultado.total_transacoes_bancarias + resultado.total_transacoes_sistema)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{resultado.total_conciliadas}</div>
                              <div className="text-sm text-gray-600">Conciliadas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{resultado.total_divergentes}</div>
                              <div className="text-sm text-gray-600">Divergentes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-600">{resultado.total_pendentes}</div>
                              <div className="text-sm text-gray-600">Pendentes</div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-semibold text-sm text-gray-600 mb-2">Diferença de Valores</h4>
                            <p className={`text-lg font-semibold ${resultado.diferenca_valor === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              R$ {resultado.diferenca_valor.toFixed(2)}
                            </p>
                          </div>

                          {resultado.observacoes && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-sm text-gray-600 mb-2">Observações</h4>
                              <p className="text-sm text-gray-700">{resultado.observacoes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

