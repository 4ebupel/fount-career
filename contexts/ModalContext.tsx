import React, { createContext, useState } from 'react';
import { DefaultModalProps } from '@/types/defaultModalProps';

// Default props for modals
const DEFAULT_PROPS: DefaultModalProps = {
    content: '',
    description: '',
    title: '',
    primaryCTA: '',
    secondaryCTA: '',
    theme: 'dark',
    onClose: () => {},
    onConfirm: () => {},
    onCancel: () => {},
};

// Extend the modal item with a unique id
export type ModalItem = {
    id: string;
    modalName: string;
    modalProps: DefaultModalProps;
};

type ContextType = {
    modalStack: ModalItem[];
    openModal: ({ modalName, props }: { modalName?: string, props?: DefaultModalProps }) => void;
    closeModal: (id?: string) => void;
};

export const ModalContext = createContext<ContextType>({
    modalStack: [],
    openModal: () => {},
    closeModal: () => {},
});

let idCounter = 0; // simple counter for unique IDs

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [modalStack, setModalStack] = useState<ModalItem[]>([]);

    const openModal = ({
        modalName,
        props,
    }: {
        modalName?: string;
        props?: DefaultModalProps;
    }) => {
        const id = String(++idCounter); // generate a unique id
        const name = modalName || 'DefaultModal';
        const mergedProps = { ...DEFAULT_PROPS, ...props };
        const newModal: ModalItem = {
            id,
            modalName: name,
            modalProps: mergedProps,
        };
        setModalStack(prev => [...prev, newModal]);
    };

    // If an id is provided, filter the modal with that id. Otherwise, remove the top modal.
    const closeModal = (id?: string) => {
        if (id) {
            setModalStack(prev => prev.filter(modal => modal.id !== id));
        } else {
            setModalStack(prev => prev.slice(0, -1));
        }
    };

    const value = {
        modalStack,
        openModal,
        closeModal,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
