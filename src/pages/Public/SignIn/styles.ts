import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: theme.spacing(2),
  },
  content: {
    width: '100%',
    maxWidth: '400px',
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
  },
  title: {
    marginBottom: theme.spacing(1),
    textAlign: 'center',
    fontWeight: 600,
  },
  subtitle: {
    color: theme.palette.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  form: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5),
    fontSize: '1rem',
  },
}))

