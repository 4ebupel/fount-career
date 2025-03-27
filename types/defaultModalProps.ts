export interface DefaultModalProps {
    content: string;
    description: string;
    title: string;
    primaryCTA: string;
    secondaryCTA: string;
    theme: 'dark' | 'light';
    onClose: () => void;
    onConfirm: (data?: any) => void;
    onCancel: () => void;
    // Additional optional props for CategorySelectorModal
    categories?: string[];
    onSelectCategory?: (category: string) => void;
    // Additional optional props for DateSelectorModal
    onSelectDate?: (date: string) => void;
    // Additional optional props for EmojiSelectorModal
    onSelectEmoji?: (emoji: string) => void;
    // Additional optional props for TimePickerModal
    initialHour?: string;
    initialMinute?: string;
    onTimeSelected?: (hour: string, minute: string) => void;
    // Additional optional props for TutorialOverlayModal
    highlightPosition?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    tutorialContent?: string;
    tutorialTitle?: string;
};