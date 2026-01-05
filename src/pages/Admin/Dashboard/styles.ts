import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
    fontWeight: 600,
  },
  content: {
    marginTop: theme.spacing(2),
  },
  card: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  number: {
    marginTop: theme.spacing(2),
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
}))

