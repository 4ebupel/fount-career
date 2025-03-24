import React from 'react';
import AddGoalModal from '@/modals/AddGoalModal';
import DefaultModal from '@/modals/DefaultModal';
import GoalCreationTutorialModal from '@/modals/GoalCreationTutorialModal';
import CategorySelectorModal from '@/modals/CategorySelectorModal';
import DateSelectorModal from '@/modals/DateSelectorModal';
import EmojiSelectorModal from '@/modals/EmojiSelectorModal';
import { useModal } from '@/hooks/useModal';
import { ModalItem } from '@/contexts/ModalContext';

export const DEFAULT_MODAL = 'DefaultModal';
export const ADD_GOAL_MODAL = 'AddGoalModal';
export const GOAL_CREATION_TUTORIAL_MODAL = 'GoalCreationTutorialModal';
export const CATEGORY_SELECTOR_MODAL = 'CategorySelectorModal';
export const DATE_SELECTOR_MODAL = 'DateSelectorModal';
export const EMOJI_SELECTOR_MODAL = 'EmojiSelectorModal';

export const MODAL_LIST = {
    [DEFAULT_MODAL]: DefaultModal,
    [ADD_GOAL_MODAL]: AddGoalModal,
    [GOAL_CREATION_TUTORIAL_MODAL]: GoalCreationTutorialModal,
    [CATEGORY_SELECTOR_MODAL]: CategorySelectorModal,
    [DATE_SELECTOR_MODAL]: DateSelectorModal,
    [EMOJI_SELECTOR_MODAL]: EmojiSelectorModal,
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
                        onClose={() => closeModal(modal.id)}
                        isVisible={true}
                    />
                );
            })}
        </>
    );
}
