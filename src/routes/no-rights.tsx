import cx from 'classix'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react'

import fulcrumLogo from '../assets/fulcrum.svg'

export default function NoRights() {
  return (
    <Modal hideCloseButton={true} isOpen={true} isDismissable={false}>
      <ModalContent>
        <>
          <ModalHeader className="items-center flex gap-1 justify-center pt-8">
            <img
              src={fulcrumLogo}
              alt="Fulcrum Logo"
              className={cx(
                'text-sm mr-0 w-8 h-8 text-link dark:text-link-dark flex origin-center transition-all ease-in-out'
              )}
            />
            <div className="ml-2 text-2xl">Fulcrum</div>
          </ModalHeader>
          <ModalBody>
            <p className="text-center font-bold">
              You have insufficient rights to access this wiki. Please contact
              your adminstrator to give you access.
            </p>
            <Button as="a" color="primary" href={`${window.location.origin}`}>
              Go To Website
            </Button>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </>
      </ModalContent>
    </Modal>
  )
}
