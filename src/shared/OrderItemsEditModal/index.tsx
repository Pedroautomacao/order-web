import { useEffect, useState } from 'react'
import {
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import { IOrder, IOrderItemCreate } from 'interfaces/IOrder'
import FormModal from 'shared/FormModal'
import { formatCurrency, productLabel } from 'shared/format'

interface LinhaEditavel {
  productId: number
  rotulo: string
  unidade?: string
  quantity: string
  unitPrice: string
}

interface OrderItemsEditModalProps {
  open: boolean
  order: IOrder | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (items: IOrderItemCreate[]) => void
}

const paraNumero = (valor: string) => {
  const n = Number(String(valor).replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

/**
 * Edição de quantidade e preço dos itens de um pedido.
 *
 * Mexe só nos itens: cliente e data de entrega seguem como estão, e o pedido
 * inteiro é reenviado pelo chamador. O preço aqui é exclusivo deste pedido —
 * o preço de tabela do produto não muda.
 */
export const OrderItemsEditModal = ({
  open,
  order,
  submitting = false,
  onClose,
  onSubmit,
}: OrderItemsEditModalProps) => {
  const [linhas, setLinhas] = useState<LinhaEditavel[]>([])

  useEffect(() => {
    if (!open || !order) return
    setLinhas(
      (order.items ?? []).map(item => ({
        productId: item.product_id,
        rotulo: productLabel(item.product, { withUnit: false }),
        unidade: item.product?.unit?.code ?? undefined,
        quantity: String(item.quantity ?? ''),
        unitPrice: String(item.unit_price ?? ''),
      })),
    )
  }, [open, order])

  const alterar = (indice: number, campo: 'quantity' | 'unitPrice', valor: string) =>
    setLinhas(atuais =>
      atuais.map((linha, i) => (i === indice ? { ...linha, [campo]: valor } : linha)),
    )

  const totalDaLinha = (linha: LinhaEditavel) => {
    const q = paraNumero(linha.quantity)
    const p = paraNumero(linha.unitPrice)
    return Number.isNaN(q) || Number.isNaN(p) ? NaN : q * p
  }

  const total = linhas.reduce((soma, linha) => {
    const v = totalDaLinha(linha)
    return Number.isNaN(v) ? soma : soma + v
  }, 0)

  // Bloqueia o envio em vez de deixar a API recusar: quantidade tem de ser
  // positiva e preço não pode ser negativo.
  const invalida = linhas.some(linha => {
    const q = paraNumero(linha.quantity)
    const p = paraNumero(linha.unitPrice)
    return Number.isNaN(q) || q <= 0 || Number.isNaN(p) || p < 0
  })

  const enviar = () =>
    onSubmit(
      linhas.map(linha => ({
        product_id: linha.productId,
        quantity: paraNumero(linha.quantity),
        unitPrice: paraNumero(linha.unitPrice),
      })),
    )

  return (
    <FormModal
      open={open}
      title={order ? `Editar itens — Pedido #${order.id}` : 'Editar itens'}
      onClose={onClose}
      onSubmit={enviar}
      submitLabel={submitting ? 'Salvando...' : 'Salvar'}
      submitting={submitting || invalida || !linhas.length}
      maxWidth="md"
    >
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell align="right" sx={{ minWidth: 140 }}>
                Valor unitário
              </TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>
                Quantidade
              </TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linhas.map((linha, indice) => {
              const valor = totalDaLinha(linha)
              return (
                <TableRow key={linha.productId}>
                  <TableCell>{linha.rotulo}</TableCell>
                  <TableCell align="right">
                    <TextField
                      value={linha.unitPrice}
                      onChange={e => alterar(indice, 'unitPrice', e.target.value)}
                      size="small"
                      inputProps={{ inputMode: 'decimal', style: { textAlign: 'right' } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                      error={Number.isNaN(paraNumero(linha.unitPrice)) || paraNumero(linha.unitPrice) < 0}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      value={linha.quantity}
                      onChange={e => alterar(indice, 'quantity', e.target.value)}
                      size="small"
                      inputProps={{ inputMode: 'decimal', style: { textAlign: 'right' } }}
                      InputProps={
                        linha.unidade
                          ? {
                              endAdornment: (
                                <InputAdornment position="end">{linha.unidade}</InputAdornment>
                              ),
                            }
                          : undefined
                      }
                      error={Number.isNaN(paraNumero(linha.quantity)) || paraNumero(linha.quantity) <= 0}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {Number.isNaN(valor) ? '-' : formatCurrency(valor)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography sx={{ mt: 2, textAlign: 'right', fontWeight: 600 }}>
        Total do pedido: {formatCurrency(total)}
      </Typography>
    </FormModal>
  )
}

export default OrderItemsEditModal
