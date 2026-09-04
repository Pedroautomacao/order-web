import { useState, useEffect, useCallback } from 'react'
import { Autocomplete, Box, Button, IconButton, TextField, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import orderService from 'services/orderService'
import clientService from 'services/clientService'
import productService from 'services/productService'
import { IOrder, IOrderUpdate, OrderStatus, PaymentMethod } from 'interfaces/IOrder'
import { IClient } from 'interfaces/IClient'
import { IProduct } from 'interfaces/IProduct'
import { usePopup } from 'hooks/usePopup'
import { LoadingState, OrderDetailView, FormModal, ConfirmDialog, productLabel } from 'shared'

interface OrderFormValues {
  client: IClient | null
  scheduledDate: string
  items: { product: IProduct | null; quantity: number }[]
}

const editSchema = yup.object({
  client: yup.object().nullable().required('Selecione um cliente'),
  scheduledDate: yup.string().required('Informe a data de entrega'),
  items: yup
    .array()
    .of(
      yup.object({
        product: yup.object().nullable().required('Selecione um produto'),
        quantity: yup
          .number()
          .typeError('Quantidade inválida')
          .min(0.01, 'Quantidade deve ser maior que zero')
          .required('Informe a quantidade'),
      }),
    )
    .min(1, 'Adicione ao menos um item'),
})

const SellerOrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addPopup } = usePopup()

  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [clients, setClients] = useState<IClient[]>([])
  const [products, setProducts] = useState<IProduct[]>([])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: yupResolver(editSchema) as any,
    defaultValues: { client: null, scheduledDate: '', items: [{ product: null, quantity: 1 }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const loadOrder = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setOrder(await orderService.getSellerOrder(Number(id)))
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar pedido',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
      navigate('/admin/seller')
    } finally {
      setLoading(false)
    }
  }, [id, addPopup, navigate])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const openEdit = useCallback(async () => {
    if (!order) return
    try {
      const [clientsData, productsData] = await Promise.all([
        clientService.getClients(undefined, true),
        productService.getProducts(undefined, true),
      ])
      setClients(clientsData)
      setProducts(productsData)
      // Casar com a opção carregada do Autocomplete: o pedido traz só
      // {id, name}, e um objeto parcial deixa o rótulo quebrado (sem SKU/CNPJ)
      // e não bate no isOptionEqualToValue.
      const clientId = order.client?.id ?? order.client_id
      reset({
        client:
          clientsData.find((c) => c.id === clientId) ??
          (order.client ? ({ id: clientId, name: order.client.name } as IClient) : null),
        scheduledDate: order.scheduled_date,
        items: (order.items ?? []).map((i) => ({
          product:
            productsData.find((p) => p.id === i.product_id) ??
            (i.product ? ({ ...i.product, id: i.product_id } as IProduct) : null),
          quantity: i.quantity,
        })),
      })
    } catch {
      addPopup({ type: 'error', title: 'Erro ao carregar dados', message: 'Tente novamente.' })
      return
    }
    setEditOpen(true)
  }, [order, addPopup, reset])

  const onEditSubmit = async (values: OrderFormValues) => {
    if (!order || !values.client) return
    setSubmitting(true)
    try {
      const payload: IOrderUpdate = {
        clientId: values.client.id,
        scheduledDate: values.scheduledDate,
        paymentMethod: (order.payment_method as PaymentMethod) || PaymentMethod.CASH,
        items: values.items.map((i) => ({ product_id: i.product!.id, quantity: i.quantity })),
      }
      setOrder(await orderService.updateSellerOrder(order.id, payload))
      addPopup({ type: 'success', title: 'Pedido atualizado com sucesso!' })
      setEditOpen(false)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao atualizar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    setCanceling(true)
    try {
      await orderService.cancelSellerOrder(order.id)
      addPopup({ type: 'success', title: 'Pedido cancelado.' })
      setCancelOpen(false)
      navigate('/admin/seller')
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao cancelar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setCanceling(false)
    }
  }

  if (loading) return <LoadingState minHeight="60vh" />
  if (!order) return null

  const isAwaiting = order.status === OrderStatus.AWAITING

  return (
    <>
      <OrderDetailView
        order={order}
        onBack={() => navigate('/admin/seller')}
        actions={
          isAwaiting ? (
            <>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={openEdit}>
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setCancelOpen(true)}
              >
                Cancelar
              </Button>
            </>
          ) : undefined
        }
      />

      <FormModal
        open={editOpen}
        title={`Editar Pedido #${order.id}`}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSubmit(onEditSubmit)}
        submitLabel="Salvar"
        submitting={submitting}
      >
        <Controller
          name="client"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={clients}
              getOptionLabel={(o) => `${o.name} — ${o.cpf_cnpj}`}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              value={field.value}
              onChange={(_, v) => field.onChange(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  error={!!errors.client}
                  helperText={errors.client?.message}
                />
              )}
            />
          )}
        />
        <Controller
          name="scheduledDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data de entrega"
              type="date"
              InputLabelProps={{ shrink: true }}
              error={!!errors.scheduledDate}
              helperText={errors.scheduledDate?.message}
            />
          )}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Itens
        </Typography>
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Controller
              name={`items.${index}.product`}
              control={control}
              render={({ field: f }) => (
                <Autocomplete
                  options={products}
                  getOptionLabel={(o) => productLabel(o, { withSku: true })}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  value={f.value}
                  onChange={(_, v) => f.onChange(v)}
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Produto"
                      size="small"
                      error={!!errors.items?.[index]?.product}
                      helperText={(errors.items?.[index]?.product as any)?.message}
                    />
                  )}
                />
              )}
            />
            <Controller
              name={`items.${index}.quantity`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  {...f}
                  label="Qtd"
                  type="number"
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  error={!!errors.items?.[index]?.quantity}
                  helperText={errors.items?.[index]?.quantity?.message}
                />
              )}
            />
            <IconButton onClick={() => remove(index)} disabled={fields.length === 1} size="small" sx={{ mt: 0.5 }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => append({ product: null, quantity: 1 })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Adicionar item
        </Button>
      </FormModal>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancelar pedido"
        message={`Tem certeza que deseja cancelar o pedido #${order.id}? Esta ação não pode ser desfeita.`}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
        confirmText={canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
        cancelText="Voltar"
      />
    </>
  )
}

export default SellerOrderDetail
