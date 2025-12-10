export const CATEGORIES = [
    "Development",
    "Design",
    "Marketing",
    "Writing",
    "Data Science",
    "Video & Animation",
    "Music & Audio",
    "Business",
    "Lifestyle"
];

export const SUBCATEGORIES = {
    "Development": ['Web Development', 'Mobile App', 'Debugging', 'API Integration', 'Automation', 'Game Dev', 'Blockchain', 'DevOps'],
    "Design": ['UI/UX', 'Logo', 'Poster', 'Branding', 'Illustration', '3D Models', 'Social Media Design', 'Infographics'],
    "Marketing": ['SEO', 'Social Media', 'Content Strategy', 'Email Marketing', 'Ads', 'Analytics'],
    "Writing": ['Blog Post', 'Copywriting', 'Technical Writing', 'Creative Writing', 'Translation', 'Proofreading'],
    "Data Science": ['Data Analysis', 'Machine Learning', 'Data Visualization', 'Data Entry', 'Python Scripting'],
    "Video & Animation": ['Video Editing', 'Animation', 'Intro/Outro', 'Visual Effects', 'Subtitles'],
    "Music & Audio": ['Voice Over', 'Mixing & Mastering', 'Producers & Composers', 'Sound Effects'],
    "Business": ['Virtual Assistant', 'Market Research', 'Business Plans', 'Legal Consulting'],
    "Lifestyle": ['Online Tutoring', 'Wellness', 'Gaming', 'Astrology']
};

export const REWARD_TIERS = [
    { id: 'small', label: 'Small • 20 coins', coins: 20 },
    { id: 'medium', label: 'Medium • 50 coins', coins: 50 },
    { id: 'large', label: 'Large • 100 coins', coins: 100 },
    { id: 'premium', label: 'Premium • 200 coins', coins: 200 }
];
