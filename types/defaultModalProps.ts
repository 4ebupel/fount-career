export interface DefaultModalProps {
    content: string;
    description: string;
    title: string;
    primaryCTA: string;
    secondaryCTA: string;
    theme: 'dark' | 'light';
    onClose: () => void;
    onConfirm: () => void;
    onCancel: () => void;
};