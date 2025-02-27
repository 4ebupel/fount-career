import React, { useCallback } from 'react';
import AddGoalModal from '@/modals/AddGoalModal';
import DefaultModal from '@/modals/DefaultModal';
import GoalCreationTutorialModal from '@/modals/GoalCreationTutorialModal';
import { useModal } from '@/hooks/useModal';

export const DEFAULT_MODAL = 'DefaultModal';
export const ADD_GOAL_MODAL = 'AddGoalModal';
export const GOAL_CREATION_TUTORIAL_MODAL = 'GoalCreationTutorialModal';

export const MODAL_LIST = {
    [DEFAULT_MODAL]: DefaultModal,
    [ADD_GOAL_MODAL]: AddGoalModal,
    [GOAL_CREATION_TUTORIAL_MODAL]: GoalCreationTutorialModal,
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
