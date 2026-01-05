import { Snackbar, Alert as MuiAlert, AlertColor } from '@mui/material'

import { IAlert } from 'interfaces/IAlert'
import { usePopup } from 'hooks/usePopup'

const Alert = () => {
  const { popups, removePopup } = usePopup()

  const handleClose = (index: number) => {
    removePopup(index)
  }

  return (
    <>
      {popups.map((popup, index) => (
        <Snackbar
          key={index}
          open={true}
          autoHideDuration={5000}
          onClose={() => handleClose(index)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
            onClose={() => handleClose(index)}
            severity={popup.type as AlertColor}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {popup.title}
          </MuiAlert>
        </Snackbar>
      ))}
    </>
  )
}

export default Alert

