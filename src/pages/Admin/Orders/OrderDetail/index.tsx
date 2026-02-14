import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowBack as BackIcon } from '@mui/icons-material'

import orderService from 'services/orderService'
import { IOrder, getOrderStatusLabel, getOrderItemStatusLabel } from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'

import { useStyles } from './styles'

const OrderDetail = () => {
  const classes = useStyles()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addPopup } = usePopup()
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        const data = await orderService.getOrder(Number(id))
        setOrder(data)
      } catch (error: any) {
        addPopup({
          type: 'error',
          title: 'Erro ao carregar pedido',
          message: error?.detail || error?.message || 'Tente novamente mais tarde',
        })
        navigate('/admin/orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, addPopup, navigate])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const allItems = order
    ? [
        ...(order.produced_items || []),
        ...(order.current_item ? [order.current_item] : []),
      ]
    : []

  const formatQuantity = (value: number | null | undefined, unitCode?: string | null) => {
    if (value == null) return '-'
    return unitCode ? `${value} ${unitCode}` : String(value)
  }

  if (loading) {
    return (
      <Container maxWidth="lg" className={classes.container}>
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!order) {
    return null
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Box className={classes.header}>
        <Box>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/admin/orders')}
            sx={{ mb: 1 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1" className={classes.title}>
            Pedido #{order.id}
          </Typography>
        </Box>
      </Box>

      <Paper className={classes.paper}>
        <Typography className={classes.sectionTitle} variant="subtitle1">
          Informações gerais
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Cliente
            </Typography>
            <Typography>{order.client?.name ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Data de entrega
            </Typography>
            <Typography>{formatDate(order.scheduled_date)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Status
            </Typography>
            <Typography>{getOrderStatusLabel(order.status)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Prioridade
            </Typography>
            <Typography>{order.priority}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper className={classes.paper}>
        <Typography className={classes.sectionTitle} variant="subtitle1">
          Itens do pedido
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Produzido</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum item
                  </TableCell>
                </TableRow>
              ) : (
                allItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name ?? '-'}</TableCell>
                    <TableCell align="right">
                      {formatQuantity(item.quantity, item.product?.unit?.code)}
                    </TableCell>
                    <TableCell align="right">
                      {formatQuantity(item.produced_quantity, item.product?.unit?.code)}
                    </TableCell>
                    <TableCell>{getOrderItemStatusLabel(item.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}

export default OrderDetail
