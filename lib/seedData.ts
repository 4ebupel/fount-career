import { Goal, Habit, Task } from "@/types/database";

export const premadeGoalsSeedData: Omit<Goal, 'created_at' | 'updated_at'>[] = [
    {
        id: '1',
        title: 'Improve Public Speaking Skills',
        category: 'Personal Growth',
        due_date: null,
        achieved: false,
        image_small: null,
        image_large: null
    },
    {
        id: '2',
        title: 'Learn Machine Learning Fundamentals',
        category: 'Education',
        due_date: null,
        achieved: false,
        image_small: null,
        image_large: null
    },
    {
        id: '3',
        title: 'Network with Industry Leaders',
        category: 'Relationships',
        due_date: null,
        achieved: false,
        image_small: null,
        image_large: null
    },
    {
        id: '4',
        title: 'Build a Successful Side Hustle',
        category: 'Financial',
        due_date: null,
        achieved: false,
        image_small: null,
        image_large: null
    },
    {
        id: '5',
        title: 'Learn to Play the Guitar',
        category: 'Creativity',
        due_date: null,
        achieved: false,
        image_small: null,
        image_large: null
    },
    {
        id: '6',
        title: 'Start a Blog and Share Your Thoughts',
        category: 'Other',
        due_date: null,
        achieved: false,
        image_small: null,
        image_large: null
    }
];

export const premadeTasksSeedData: Omit<Task, 'created_at' | 'updated_at'>[] = [
    // Goal 1: Improve Public Speaking Skills
    {
        id: '1',
        goal_id: '1',
        title: 'Join a local Toastmasters club',
        selected_emoji: '🎤',
        reminder_time: '18:00',
        due_date: null,
        description: 'Find and attend a local Toastmasters meeting to improve public speaking skills',
        completed: false
    },
    {
        id: '2',
        goal_id: '1',
        title: 'Record a practice speech',
        selected_emoji: '📹',
        reminder_time: '16:30',
        due_date: null,
        description: 'Record yourself giving a 5-minute speech and review for improvement areas',
        completed: false
    },
    {
        id: '3',
        goal_id: '1',
        title: 'Read "Talk Like TED" book',
        selected_emoji: '📚',
        reminder_time: '20:00',
        due_date: null,
        description: 'Read the book to learn techniques from successful TED speakers',
        completed: false
    },
    
    // Goal 2: Learn Machine Learning Fundamentals
    {
        id: '4',
        goal_id: '2',
        title: 'Complete Andrew Ng\'s ML course',
        selected_emoji: '🧠',
        reminder_time: '19:00',
        due_date: null,
        description: 'Finish the first 3 modules of the Coursera Machine Learning specialization',
        completed: false
    },
    {
        id: '5',
        goal_id: '2',
        title: 'Build a simple linear regression model',
        selected_emoji: '📊',
        reminder_time: '17:00',
        due_date: null,
        description: 'Create a linear regression model using Python and scikit-learn',
        completed: false
    },
    {
        id: '6',
        goal_id: '2',
        title: 'Join an ML community forum',
        selected_emoji: '👥',
        reminder_time: '12:00',
        due_date: null,
        description: 'Sign up for Kaggle or a similar platform to connect with other ML enthusiasts',
        completed: false
    },
    
    // Goal 3: Network with Industry Leaders
    {
        id: '7',
        goal_id: '3',
        title: 'Attend industry conference',
        selected_emoji: '🏢',
        reminder_time: '09:00',
        due_date: null,
        description: 'Register and attend the upcoming tech conference in the city',
        completed: false
    },
    {
        id: '8',
        goal_id: '3',
        title: 'Update LinkedIn profile',
        selected_emoji: '💼',
        reminder_time: '14:00',
        due_date: null,
        description: 'Refresh profile with recent accomplishments and a professional photo',
        completed: false
    },
    {
        id: '9',
        goal_id: '3',
        title: 'Schedule coffee meetings',
        selected_emoji: '☕',
        reminder_time: '10:30',
        due_date: null,
        description: 'Reach out to 3 industry professionals for informal networking meetings',
        completed: false
    },
    
    // Goal 4: Build a Successful Side Hustle
    {
        id: '10',
        goal_id: '4',
        title: 'Research market opportunities',
        selected_emoji: '🔍',
        reminder_time: '20:30',
        due_date: null,
        description: 'Identify 3 potential niches for your side business based on your skills',
        completed: false
    },
    {
        id: '11',
        goal_id: '4',
        title: 'Create a business plan',
        selected_emoji: '📝',
        reminder_time: '19:00',
        due_date: null,
        description: 'Draft a simple one-page business plan with goals and financial projections',
        completed: false
    },
    {
        id: '12',
        goal_id: '4',
        title: 'Set up business social media',
        selected_emoji: '📱',
        reminder_time: '16:00',
        due_date: null,
        description: 'Create professional accounts on relevant platforms for your business',
        completed: false
    },
    
    // Goal 5: Learn to Play the Guitar
    {
        id: '13',
        goal_id: '5',
        title: 'Purchase a beginner guitar',
        selected_emoji: '🎸',
        reminder_time: '11:00',
        due_date: null,
        description: 'Research and buy an affordable acoustic guitar for beginners',
        completed: false
    },
    {
        id: '14',
        goal_id: '5',
        title: 'Learn basic chords',
        selected_emoji: '🎵',
        reminder_time: '18:30',
        due_date: null,
        description: 'Master the G, C, D, and Em chords through daily practice',
        completed: false
    },
    {
        id: '15',
        goal_id: '5',
        title: 'Sign up for online lessons',
        selected_emoji: '💻',
        reminder_time: '13:00',
        due_date: null,
        description: 'Find and subscribe to a structured online guitar course',
        completed: false
    },
    
    // Goal 6: Start a Blog and Share Your Thoughts
    {
        id: '16',
        goal_id: '6',
        title: 'Choose a blogging platform',
        selected_emoji: '🌐',
        reminder_time: '15:00',
        due_date: null,
        description: 'Research and select between WordPress, Medium, or other platforms',
        completed: false
    },
    {
        id: '17',
        goal_id: '6',
        title: 'Create content calendar',
        selected_emoji: '📅',
        reminder_time: '17:30',
        due_date: null,
        description: 'Plan your first 10 blog post topics and publishing schedule',
        completed: false
    },
    {
        id: '18',
        goal_id: '6',
        title: 'Write first blog post',
        selected_emoji: '✍️',
        reminder_time: '21:00',
        due_date: null,
        description: 'Draft, edit, and publish your first article on your chosen platform',
        completed: false
    }
];

export const premadeHabitsSeedData: Omit<Habit, 'created_at' | 'updated_at'>[] = [
    // Goal 1: Improve Public Speaking Skills
    {
        id: '1',
        goal_id: '1',
        title: 'Practice vocal exercises',
        selected_emoji: '🗣️',
        reminder_time: '08:00',
        reminder_days: '["Monday", "Wednesday", "Friday"]',
        completed: false
    },
    {
        id: '2',
        goal_id: '1',
        title: 'Read aloud for 10 minutes',
        selected_emoji: '📖',
        reminder_time: '19:30',
        reminder_days: '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]',
        completed: false
    },
    {
        id: '3',
        goal_id: '1',
        title: 'Watch one TED talk',
        selected_emoji: '👀',
        reminder_time: '12:30',
        reminder_days: '["Tuesday", "Thursday", "Saturday"]',
        completed: false
    },
    
    // Goal 2: Learn Machine Learning Fundamentals
    {
        id: '4',
        goal_id: '2',
        title: 'Code for 30 minutes',
        selected_emoji: '💻',
        reminder_time: '20:00',
        reminder_days: '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]',
        completed: false
    },
    {
        id: '5',
        goal_id: '2',
        title: 'Read ML research paper',
        selected_emoji: '📑',
        reminder_time: '17:00',
        reminder_days: '["Wednesday", "Sunday"]',
        completed: false
    },
    {
        id: '6',
        goal_id: '2',
        title: 'Practice with dataset',
        selected_emoji: '🔢',
        reminder_time: '18:30',
        reminder_days: '["Tuesday", "Thursday", "Saturday"]',
        completed: false
    },
    
    // Goal 3: Network with Industry Leaders
    {
        id: '7',
        goal_id: '3',
        title: 'Engage on LinkedIn',
        selected_emoji: '🔗',
        reminder_time: '09:15',
        reminder_days: '["Monday", "Wednesday", "Friday"]',
        completed: false
    },
    {
        id: '8',
        goal_id: '3',
        title: 'Send follow-up emails',
        selected_emoji: '📧',
        reminder_time: '16:00',
        reminder_days: '["Tuesday", "Thursday"]',
        completed: false
    }
];
