import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  CircularProgress,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material'
import { IRole, IMenuGroup, IPermission, PERMISSION_LABELS_PT } from 'interfaces/IUser'
import userService from 'services/userService'
import { usePopup } from 'hooks/usePopup'

/**
 * Linha com texto que pode quebrar em vários e um botão à direita.
 * O texto ocupa o espaço que sobra e quebra dentro dele; o botão não encolhe.
 * Com ListItemSecondaryAction (absoluto) a lista de menus do Admin passava por
 * baixo do "Editar".
 */
const LINHA_SX = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1,
} as const

const ACAO_SX = { flexShrink: 0, mt: 0.25 } as const


interface RoleMenuModalProps {
  open: boolean
  onClose: () => void
}

export default function RoleMenuModal({ open, onClose }: RoleMenuModalProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { addPopup } = usePopup()
  const [roles, setRoles] = useState<IRole[]>([])
  const [menuGroups, setMenuGroups] = useState<IMenuGroup[]>([])
  const [permissions, setPermissions] = useState<IPermission[]>([])
  const [loading, setLoading] = useState(false)
  const [editRole, setEditRole] = useState<IRole | null>(null)
  const [editName, setEditName] = useState('')
  const [editMenuGroupIds, setEditMenuGroupIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [openNewGroup, setOpenNewGroup] = useState(false)
  const [newGroupCode, setNewGroupCode] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupPermissionIds, setNewGroupPermissionIds] = useState<number[]>([])
  const [savingGroup, setSavingGroup] = useState(false)
  const [editGroup, setEditGroup] = useState<IMenuGroup | null>(null)
  const [editGroupName, setEditGroupName] = useState('')
  const [editGroupDescription, setEditGroupDescription] = useState('')
  const [editGroupPermissionIds, setEditGroupPermissionIds] = useState<number[]>([])
  const [savingEditGroup, setSavingEditGroup] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [rolesData, groupsData, permsData] = await Promise.all([
        userService.getRoles(),
        userService.getMenuGroups(),
        userService.getPermissions(),
      ])
      setRoles(rolesData)
      setMenuGroups(groupsData)
      setPermissions(permsData)
    } catch (e: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar',
        message: e?.detail || e?.message || 'Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    loadData()
  }, [open, addPopup])

  const handleEdit = (role: IRole) => {
    setEditRole(role)
    setEditName(role.name)
    setEditMenuGroupIds(role.menu_groups?.map((g) => g.id) ?? [])
  }

  const handleToggleGroup = (groupId: number) => {
    setEditMenuGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  const handleSaveRole = async () => {
    if (!editRole) return
    setSaving(true)
    try {
      await userService.updateRole(editRole.id, {
        menu_group_ids: editMenuGroupIds,
        name: editName !== editRole.name ? editName : undefined,
      })
      addPopup({ type: 'success', title: 'Perfil atualizado' })
      const updated = await userService.getRoles()
      setRoles(updated)
      setEditRole(null)
    } catch (e: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao salvar',
        message: e?.detail || e?.message || 'Tente novamente.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCloseEdit = () => {
    setEditRole(null)
  }

  const handleOpenNewGroup = () => {
    setNewGroupCode('')
    setNewGroupName('')
    setNewGroupDescription('')
    setNewGroupPermissionIds([])
    setOpenNewGroup(true)
  }

  const handleToggleNewGroupPermission = (permId: number) => {
    setNewGroupPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    )
  }

  const handleEditGroup = (mg: IMenuGroup) => {
    setEditGroup(mg)
    setEditGroupName(mg.name)
    setEditGroupDescription(mg.description ?? '')
    setEditGroupPermissionIds(mg.permissions?.map((p) => p.id) ?? [])
  }

  const handleToggleEditGroupPermission = (permId: number) => {
    setEditGroupPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    )
  }

  const handleSaveEditGroup = async () => {
    if (!editGroup) return
    const name = editGroupName.trim()
    if (!name) {
      addPopup({ type: 'error', title: 'Informe o nome do grupo' })
      return
    }
    if (editGroupPermissionIds.length === 0) {
      addPopup({ type: 'error', title: 'Selecione ao menos uma permissão' })
      return
    }
    setSavingEditGroup(true)
    try {
      await userService.updateMenuGroup(editGroup.id, {
        name,
        description: editGroupDescription.trim() || null,
        permission_ids: editGroupPermissionIds,
      })
      addPopup({ type: 'success', title: 'Grupo atualizado' })
      setEditGroup(null)
      loadData()
    } catch (e: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao salvar grupo',
        message: e?.detail || e?.message || 'Tente novamente.',
      })
    } finally {
      setSavingEditGroup(false)
    }
  }

  const handleCreateGroup = async () => {
    const code = newGroupCode.trim()
    const name = newGroupName.trim()
    if (!code || !name) {
      addPopup({ type: 'error', title: 'Preencha código e nome do grupo' })
      return
    }
    if (newGroupPermissionIds.length === 0) {
      addPopup({ type: 'error', title: 'Selecione ao menos uma permissão' })
      return
    }
    setSavingGroup(true)
    try {
      await userService.createMenuGroup({
        code,
        name,
        description: newGroupDescription.trim() || undefined,
        permission_ids: newGroupPermissionIds,
      })
      addPopup({ type: 'success', title: 'Grupo criado' })
      setOpenNewGroup(false)
      loadData()
    } catch (e: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao criar grupo',
        message: e?.detail || e?.message || 'Tente novamente.',
      })
    } finally {
      setSavingGroup(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle>Menus por perfil</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Grupos de menu
                  </Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={handleOpenNewGroup}>
                    Novo grupo
                  </Button>
                </Box>
                <List dense sx={{ mb: 2 }}>
                  {menuGroups.map((mg) => (
                    <ListItem key={mg.id} sx={LINHA_SX}>
                      <ListItemText
                        primary={mg.name}
                        secondary={mg.code}
                        sx={{ my: 0, pr: 1 }}
                      />
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditGroup(mg)}
                        sx={ACAO_SX}
                      >
                        Editar
                      </Button>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Perfis e menus
                </Typography>
                <List dense>
                  {roles.map((role) => (
                    <ListItem key={role.id} sx={LINHA_SX}>
                      <ListItemText
                        primary={role.name}
                        secondary={
                          role.menu_groups?.length
                            ? role.menu_groups.map((g) => g.name).join(', ')
                            : 'Nenhum menu'
                        }
                        sx={{ my: 0, pr: 1 }}
                      />
                      <Button size="small" onClick={() => handleEdit(role)} sx={ACAO_SX}>
                        Editar
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNewGroup} onClose={() => setOpenNewGroup(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Novo grupo de menu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              label="Código"
              value={newGroupCode}
              onChange={(e) => setNewGroupCode(e.target.value)}
              placeholder="ex: vendas"
              fullWidth
            />
            <TextField
              size="small"
              label="Nome"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="ex: Vendas"
              fullWidth
            />
            <TextField
              size="small"
              label="Descrição (opcional)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              fullWidth
            />
            <Box>
              <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Permissões do grupo
              </Box>
              <FormGroup sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                {permissions.map((p) => (
                  <FormControlLabel
                    key={p.id}
                    control={
                      <Checkbox
                        checked={newGroupPermissionIds.includes(p.id)}
                        onChange={() => handleToggleNewGroupPermission(p.id)}
                      />
                    }
                    label={PERMISSION_LABELS_PT[p.code] ?? p.description ?? p.code}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewGroup(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateGroup} disabled={savingGroup}>
            {savingGroup ? 'Criando...' : 'Criar grupo'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!editGroup}
        onClose={() => setEditGroup(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar grupo: {editGroup?.code}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              label="Nome"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              label="Descrição (opcional)"
              value={editGroupDescription}
              onChange={(e) => setEditGroupDescription(e.target.value)}
              fullWidth
            />
            <Box>
              <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Permissões do grupo
              </Box>
              <FormGroup sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                {permissions.map((p) => (
                  <FormControlLabel
                    key={p.id}
                    control={
                      <Checkbox
                        checked={editGroupPermissionIds.includes(p.id)}
                        onChange={() => handleToggleEditGroupPermission(p.id)}
                      />
                    }
                    label={PERMISSION_LABELS_PT[p.code] ?? p.description ?? p.code}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGroup(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEditGroup} disabled={savingEditGroup}>
            {savingEditGroup ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editRole} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Editar perfil: {editRole?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              label="Nome do perfil"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
            />
            <Box>
              <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Menus que este perfil pode acessar
              </Box>
              <FormGroup sx={{ mt: 1 }}>
                {menuGroups.map((mg) => (
                  <FormControlLabel
                    key={mg.id}
                    control={
                      <Checkbox
                        checked={editMenuGroupIds.includes(mg.id)}
                        onChange={() => handleToggleGroup(mg.id)}
                      />
                    }
                    label={mg.name}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveRole} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
