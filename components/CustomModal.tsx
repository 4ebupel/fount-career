import React, { useCallback } from 'react';
import AddGoalModal from '@/modals/AddGoalModal';
import { useModal } from '@/hooks/useModal';
import DefaultModal from '@/modals/DefaultModal';

export const DEFAULT_MODAL = 'DefaultModal';
export const ADD_GOAL_MODAL = 'AddGoalModal';

export const MODAL_LIST = {
    [DEFAULT_MODAL]: DefaultModal,
    [ADD_GOAL_MODAL]: AddGoalModal,
};


export default function CustomModal() {
    const { modalName, modalProps, closeModal } = useModal();

    const renderModal = useCallback(() => {
        const Component = MODAL_LIST[modalName as keyof typeof MODAL_LIST];

        return (
            <Component
                {...modalProps}
                onClose={closeModal}
                isVisible={!!modalName}
            />
        )
    }, [modalName, modalProps, closeModal]);

    if (!modalName) return null;

    return renderModal();
};
