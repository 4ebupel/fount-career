import React, { createContext, useState } from 'react';
import { DefaultModalProps } from '@/types/defaultModalProps';

const DEFAULT_PROPS: DefaultModalProps = {
    content: '',
    description: '',
    title: '',
    primaryCTA: '',
    secondaryCTA: '',
    theme: 'dark',
    onClose: () => { },
    onConfirm: () => { },
    onCancel: () => { },
};

type ContextType = {
    modalName: string;
    modalProps: DefaultModalProps;
    openModal: ({ modalName, props }: { modalName?: string, props?: DefaultModalProps }) => void;
    closeModal: () => void;
};

const contextType: ContextType = {
    modalName: 'DefaultModal',
    modalProps: DEFAULT_PROPS,
    openModal: ({ modalName, props }: { modalName?: string, props?: DefaultModalProps }) => { },
    closeModal: () => { },
};

export const ModalContext = createContext<ContextType>(contextType);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [modalName, setModalName] = useState<string>('');
    const [modalProps, setModalProps] = useState<DefaultModalProps>(DEFAULT_PROPS);

    const openModal = ({ modalName, props }: { modalName?: string, props?: DefaultModalProps }) => {
        if (modalName) {
            setModalName(modalName);
            setModalProps({ ...modalProps, ...props });
        }
    };

    const closeModal = () => setModalName('');

    const value = {
        modalName,
        modalProps,
        openModal,
        closeModal,
    };
    
    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    )
}
