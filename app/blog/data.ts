export type BlogPost = {
    slug: string;
    title: string;
    date: string;
    category: string;
    description: string;
    content: string[];
};

export const blogPosts: BlogPost[] = [
    {
        slug: "hoas",
        title: "Building HOAS: Revolutionizing Hostel Accountability",
        date: "MAY 2026",
        category: "Startup / Full Stack",
        description: "A deep dive into how we built a full-stack platform to bridge the gap between students and management.",
        content: [
            "The Hostel Operational Accountability System (HOAS) was born out of a real-world problem: the lack of transparency and speed in handling student complaints. Traditional paper-based systems or simple WhatsApp groups were failing both the residents and the administration.",
            "In building HOAS, I focused on creating a role-based environment. Students can raise complaints with photos, Wardens can assign tasks, and Management can track the overall health of the hostel's operations. This triple-check system ensures that every issue is addressed and every action is recorded.",
            "Technically, this project pushed me to master state management and complex backend architectures. Integrating real-time notifications and an intuitive dashboard was key to making the system 'live' and 'accountable'.",
            "Today, HOAS is more than just a project; it's a blueprint for institutional transparency. It shows how software can take a chaotic process and turn it into a streamlined, data-driven workflow."
        ]
    },
    {
        slug: "syllabiq",
        title: "The Vision Behind SyllabiQ: Tracking Academic Success",
        date: "MAR 2026",
        category: "Personal Project",
        description: "Why I built an exam syllabus tracker and how it helps students stay on top of their studies.",
        content: [
            "Exam season is notoriously stressful, not just because of the content, but because of the volume. SyllabiQ was designed to solve the 'Where do I even start?' problem by breaking down massive syllabi into trackable, bite-sized topics.",
            "The core feature of SyllabiQ is the progress visualization. Seeing a percentage bar move as you finish chapters provides a psychological boost that 'to-do lists' often lack. It transforms a daunting goal into a series of small, achievable wins.",
            "Built with Next.js and Tailwind CSS, the app prioritizes a clean, distraction-free interface. I wanted students to focus on their learning, not on how to use the tool. The countdown timer adds just enough urgency to keep the momentum going.",
            "Building SyllabiQ taught me the importance of UX in utility apps. If a tool isn't easier to use than a pen and paper, it won't be used. This project was a masterclass in 'Less is More' design."
        ]
    },
    {
        slug: "llm-assistant",
        title: "AI Study Companions: Lessons from LLM Development",
        date: "FEB 2026",
        category: "AI / Machine Learning",
        description: "What I learned while building and deploying an AI-powered student assistant on Hugging Face.",
        content: [
            "Large Language Models (LLMs) are changing education, but generic chatbots aren't always the best study partners. My LLM Student Assistant project was an exploration into creating a specialized AI that focuses on explanation rather than just providing answers.",
            "I deployed the assistant on Hugging Face Spaces to make it accessible. One of the biggest challenges was prompt engineering—ensuring the model stays within academic boundaries and encourages critical thinking instead of doing the student's homework for them.",
            "I integrated natural language interaction to make the experience feel like talking to a tutor. The model can break down complex topics into simpler analogies, which is the hallmark of true understanding.",
            "This project taught me about the intersection of AI and ethics. Building tools that empower users rather than replace their effort is a delicate balance, and it's where the future of AI in education lies."
        ]
    }
];

export function getBlogPost(slug: string) {
    return blogPosts.find((post) => post.slug === slug);
}
