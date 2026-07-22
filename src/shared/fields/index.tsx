import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  TextFieldProps,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

/** Campo de busca padrão (ícone de lupa + placeholder). */
export const SearchField = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  fullWidth,
  size = 'small',
  ...rest
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
} & Omit<TextFieldProps, 'onChange' | 'value'>) => (
  <TextField
    {...rest}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    size={size}
    fullWidth={fullWidth}
    sx={{ flexGrow: 1, minWidth: 200, ...rest.sx }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
    }}
  />
)

/** Campo de data padrão (rótulo sempre visível). */
export const DateField = ({
  value,
  onChange,
  label = 'Data',
  size = 'small',
  ...rest
}: {
  value: string
  onChange: (value: string) => void
  label?: string
} & Omit<TextFieldProps, 'onChange' | 'value'>) => (
  <TextField
    {...rest}
    type="date"
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    size={size}
    InputLabelProps={{ shrink: true }}
    sx={{ minWidth: 170, ...rest.sx }}
  />
)

/** Select padrão com opções (value/label). */
export const SelectField = ({
  value,
  onChange,
  label,
  options,
  size = 'small',
  minWidth = 170,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: { value: string; label: string }[]
  size?: 'small' | 'medium'
  minWidth?: number
}) => {
  const labelId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <FormControl size={size} sx={{ minWidth }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
