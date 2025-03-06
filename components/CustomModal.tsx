// CustomModal.tsx
import React from 'react';
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
    const { modalStack, closeModal } = useModal();

    return (
        <>
            {modalStack.map((modal) => {
                const Component = MODAL_LIST[modal.modalName as keyof typeof MODAL_LIST];
                return (
                    <Component
                        key={modal.id}
                        {...modal.modalProps}
                        // Pass the modal's id so it can close itself specifically
                        onClose={() => closeModal(modal.id)}
                        isVisible={true}
                    />
                );
            })}
        </>
    );
}
