import React from 'react';
import AddGoalModal from '@/modals/AddGoalModal';
import DefaultModal from '@/modals/DefaultModal';
import GoalCreationTutorialModal from '@/modals/GoalCreationTutorialModal';
import CategorySelectorModal from '@/modals/CategorySelectorModal';
import DateSelectorModal from '@/modals/DateSelectorModal';
import EmojiSelectorModal from '@/modals/EmojiSelectorModal';
import TimePickerModal from '@/modals/TimePickerModal';
import { useModal } from '@/hooks/useModal';
import EditGoalModal from '@/modals/EditGoalModal';
import { ADD_GOAL_MODAL, DEFAULT_MODAL, GOAL_CREATION_TUTORIAL_MODAL, CATEGORY_SELECTOR_MODAL, DATE_SELECTOR_MODAL, EMOJI_SELECTOR_MODAL, TIME_PICKER_MODAL, EDIT_GOAL_MODAL } from '@/lib/modals';

export const MODAL_LIST = {
    [DEFAULT_MODAL]: DefaultModal,
    [ADD_GOAL_MODAL]: AddGoalModal,
    [GOAL_CREATION_TUTORIAL_MODAL]: GoalCreationTutorialModal,
    [CATEGORY_SELECTOR_MODAL]: CategorySelectorModal,
    [DATE_SELECTOR_MODAL]: DateSelectorModal,
    [EMOJI_SELECTOR_MODAL]: EmojiSelectorModal,
    [TIME_PICKER_MODAL]: TimePickerModal,
    [EDIT_GOAL_MODAL]: EditGoalModal,
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
