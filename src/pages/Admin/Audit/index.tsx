import { useState, useEffect, useCallback } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

import auditService, { IAuditLog, IAuditFilterOptions } from 'services/auditService'
import userService from 'services/userService'
import { IUser } from 'interfaces/IUser'
import { usePopup } from 'hooks/usePopup'
import { PageLayout, PageHeader, DataTable, SelectField, DateField } from 'shared'

const PAGE_SIZE = 25

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })
  } catch {
    return dateStr
  }
}

const Audit = () => {
  const { addPopup } = usePopup()
  const [logs, setLogs] = useState<IAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState<IAuditFilterOptions>({ actions: [], entities: [] })
  const [users, setUsers] = useState<IUser[]>([])
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadOptions = useCallback(async () => {
    try {
      const [opts, usersData] = await Promise.all([
        auditService.getFilterOptions(),
        userService.getUsers(),
      ])
      setOptions(opts)
      setUsers(usersData)
    } catch (e: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar opções',
        message: e?.detail || e?.message || 'Tente novamente.',
      })
    }
  }, [addPopup])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await auditService.getLogs({
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        user_id: userIdFilter !== '' ? Number(userIdFilter) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: PAGE_SIZE,
        offset: 0,
      })
      setLogs(data)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar logs',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [actionFilter, entityFilter, userIdFilter, dateFrom, dateTo, addPopup])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'created_at',
      headerName: 'Data/Hora',
      width: 170,
      valueFormatter: (params) => formatDate(params.value),
    },
    // fallback para a chave crua: se a API estiver defasada e não mandar o
    // rótulo, é melhor mostrar "order:create" do que uma coluna vazia
    {
      field: 'action_label',
      headerName: 'Ação',
      width: 220,
      valueGetter: (p) => p.row.action_label || p.row.action || '-',
    },
    {
      field: 'entity_label',
      headerName: 'Entidade',
      width: 150,
      valueGetter: (p) => p.row.entity_label || p.row.entity || '-',
    },
    {
      field: 'entity_id',
      headerName: 'Registro',
      width: 100,
      valueGetter: (p) => (p.value != null ? `#${p.value}` : '-'),
    },
    { field: 'username', headerName: 'Usuário', width: 140, valueGetter: (p) => p.value ?? '-' },
    {
      field: 'description',
      headerName: 'Descrição',
      flex: 1,
      minWidth: 200,
      valueGetter: (p) => p.value ?? '-',
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Auditoria"
        subtitle="Logs de ações no sistema. Use os filtros para refinar a busca."
        filters={
          <>
            <SelectField
              label="Ação"
              value={actionFilter}
              onChange={setActionFilter}
              minWidth={220}
              options={[{ value: '', label: 'Todas' }, ...options.actions]}
            />
            <SelectField
              label="Entidade"
              value={entityFilter}
              onChange={setEntityFilter}
              minWidth={150}
              options={[{ value: '', label: 'Todas' }, ...options.entities]}
            />
            <SelectField
              label="Usuário"
              value={userIdFilter}
              onChange={setUserIdFilter}
              minWidth={160}
              options={[
                { value: '', label: 'Todos' },
                ...users.map((u) => ({ value: String(u.id), label: u.username })),
              ]}
            />
            <DateField label="Data de" value={dateFrom} onChange={setDateFrom} />
            <DateField label="Data até" value={dateTo} onChange={setDateTo} />
          </>
        }
      />

      <DataTable<IAuditLog>
        rows={logs}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        pageSize={PAGE_SIZE}
        emptyTitle="Nenhum log encontrado"
        renderMobileCard={(log) => (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {log.action_label || log.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  #{log.id}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {log.entity_label || log.entity}
                {log.entity_id != null ? ` #${log.entity_id}` : ''} ·{' '}
                {formatDate(log.created_at)} — {log.username ?? '-'}
              </Typography>
              {log.description && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {log.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      />
    </PageLayout>
  )
}

export default Audit
