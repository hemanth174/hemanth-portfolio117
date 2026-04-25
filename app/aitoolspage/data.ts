export type AiTool = {
    slug: string;
    name: string;
    category: string;
    description: string;
    logo: string;
    link: string;
    bestFor: string;
    article: string[];
};

export const aiTools: AiTool[] = [
    {
        slug: "chatgpt",
        name: "ChatGPT",
        category: "Text to Text",
        description: "AI chatbot by OpenAI for writing, coding and problem solving.",
        logo: "https://www.google.com/s2/favicons?domain=openai.com&sz=128",
        link: "https://chat.openai.com",
        bestFor: "Drafting, debugging, learning concepts, and turning rough ideas into usable plans.",
        article: [
            "ChatGPT is one of the tools I reach for when I want to move from a rough idea to a workable first version. It is useful for explaining code, comparing approaches, writing cleaner copy, and breaking a problem into steps.",
            "For development work, I found it strongest when I give it enough context: the goal, the existing code, the error message, and what I already tried. The better the prompt, the more practical the answer becomes.",
            "My main takeaway is that ChatGPT works best as a thinking partner. It can speed up exploration, but the final judgment still has to come from the developer."
        ],
    },
    {
        slug: "claude",
        name: "Claude",
        category: "Text to Text",
        description: "AI assistant by Anthropic focused on safety and helpfulness.",
        logo: "https://www.google.com/s2/favicons?domain=anthropic.com&sz=128",
        link: "https://claude.ai",
        bestFor: "Long-form reasoning, document review, careful explanations, and structured writing.",
        article: [
            "Claude feels especially helpful when the task needs calm reasoning across a longer context. I explored it for writing, reviewing explanations, and thinking through implementation choices.",
            "It is useful when I want a response that is structured and easy to refine. For technical notes or article drafts, it helps turn scattered thoughts into a clearer flow.",
            "The biggest lesson from using Claude is to treat it like a reviewer: ask it to compare options, point out gaps, and improve clarity."
        ],
    },
    {
        slug: "gemini",
        name: "Gemini",
        category: "Text to Text",
        description: "Google's multimodal AI assistant for text, images and code.",
        logo: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128",
        link: "https://gemini.google.com",
        bestFor: "Multimodal research, quick explanations, and Google ecosystem workflows.",
        article: [
            "Gemini is useful when I want to combine general research, code help, and multimodal exploration in one place. I explored it as a flexible assistant for learning and ideation.",
            "Its strength is convenience, especially for quick explanations and exploring topics from different angles. It can be a good starting point before going deeper into documentation or implementation.",
            "I see Gemini as a broad exploration tool: useful for learning fast, comparing ideas, and getting a quick first understanding."
        ],
    },
    {
        slug: "murf-ai",
        name: "Murf AI",
        category: "Text to Speech",
        description: "AI voice generator with 120+ realistic studio-quality voices.",
        logo: "https://www.google.com/s2/favicons?domain=murf.ai&sz=128",
        link: "https://murf.ai",
        bestFor: "Voiceovers for demos, presentations, videos, and polished narration.",
        article: [
            "Murf AI is built around turning written scripts into realistic voiceovers. I explored it for cases where a project needs audio narration without recording a voice manually.",
            "The useful part is how quickly a plain script can become a presentable voice track. It is helpful for demos, explainer videos, and product walkthroughs.",
            "My takeaway is that text to speech tools are strongest when the script is already clean and conversational. Good writing still matters."
        ],
    },
    {
        slug: "elevenlabs",
        name: "ElevenLabs",
        category: "Text to Speech",
        description: "AI voice cloning and text to speech with emotional control.",
        logo: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128",
        link: "https://elevenlabs.io",
        bestFor: "Expressive AI voice generation, narration, and audio experiments.",
        article: [
            "ElevenLabs stands out for expressive voices and natural-sounding audio. I explored it to understand how AI voice tools can support storytelling and product demos.",
            "It is useful when the voice needs more emotion and personality than a basic text to speech output. That makes it interesting for content creators and builders.",
            "The important thing is to use voice generation responsibly, especially when cloning or imitating voices."
        ],
    },
    {
        slug: "whisper-flow",
        name: "Whisper Flow",
        category: "Text to Speech",
        description: "AI-powered real time speech transcription and voice tool.",
        logo: "https://www.google.com/s2/favicons?domain=whisperflow.app&sz=128",
        link: "https://whisperflow.app",
        bestFor: "Fast voice input, transcription, and turning spoken thoughts into text.",
        article: [
            "Whisper Flow is useful for capturing speech quickly and turning it into text. I explored it from the perspective of saving time while writing or brainstorming.",
            "Voice tools are powerful when typing slows down the thinking process. They make it easier to capture raw ideas and clean them up later.",
            "The best workflow is to speak naturally first, then edit the output into something polished."
        ],
    },
    {
        slug: "lovable",
        name: "Lovable",
        category: "AI Website Builder",
        description: "Build full stack web apps from a simple text prompt.",
        logo: "https://www.google.com/s2/favicons?domain=lovable.dev&sz=128",
        link: "https://lovable.dev",
        bestFor: "Rapid prototypes, full stack app ideas, and early product experiments.",
        article: [
            "Lovable helps turn natural language prompts into working web app prototypes. I explored it to see how quickly an idea can become something interactive.",
            "It is strongest during the early stage, when the goal is to test a concept and understand the user flow. It can save time before writing everything manually.",
            "My takeaway is that AI builders are great for momentum, but production quality still needs careful review, testing, and customization."
        ],
    },
    {
        slug: "v0",
        name: "V0",
        category: "AI Website Builder",
        description: "Vercel's AI tool to generate UI components instantly.",
        logo: "https://www.google.com/s2/favicons?domain=v0.dev&sz=128",
        link: "https://v0.dev",
        bestFor: "Generating React UI ideas, component layouts, and polished interface drafts.",
        article: [
            "V0 is useful for quickly generating interface ideas. I explored it as a way to move from a prompt to a visual React component faster.",
            "It works well when I describe the layout, states, and style clearly. The generated result can become a strong starting point for a real implementation.",
            "The main value is speed: it helps skip the blank screen and gives me something concrete to refine."
        ],
    },
    {
        slug: "replit",
        name: "Replit",
        category: "AI Website Builder",
        description: "AI-powered browser IDE for building and deploying apps.",
        logo: "https://www.google.com/s2/favicons?domain=replit.com&sz=128",
        link: "https://replit.com",
        bestFor: "Browser-based coding, quick experiments, and deploying small apps.",
        article: [
            "Replit is a browser-based development environment with AI features built into the workflow. I explored it for fast experiments without setting up a local project first.",
            "It is helpful when I want to test an idea, share a working demo, or code from anywhere. The integrated environment keeps the workflow compact.",
            "For learning and prototyping, Replit lowers the setup barrier and helps focus on building."
        ],
    },
    {
        slug: "github-copilot",
        name: "GitHub Copilot",
        category: "AI Website Builder",
        description: "AI pair programmer that suggests code right in your editor.",
        logo: "https://www.google.com/s2/favicons?domain=github.com&sz=128",
        link: "https://github.com/features/copilot",
        bestFor: "Editor autocomplete, repetitive code, tests, and small implementation help.",
        article: [
            "GitHub Copilot is most useful when it stays close to the code I am already writing. I explored it for autocomplete, simple functions, and repeated patterns.",
            "It can speed up boilerplate and help suggest the next few lines, but it still needs review. Generated code should be tested and understood before keeping it.",
            "My takeaway is that Copilot is strongest as an assistant inside the editor, not as a replacement for understanding the codebase."
        ],
    },
    {
        slug: "cursor",
        name: "Cursor",
        category: "AI Website Builder",
        description: "AI-first code editor built for pair programming with AI.",
        logo: "https://www.google.com/s2/favicons?domain=cursor.com&sz=128",
        link: "https://cursor.com",
        bestFor: "AI-assisted coding across files, refactors, debugging, and project navigation.",
        article: [
            "Cursor brings AI into the code editor in a deeper way than simple autocomplete. I explored it for asking questions about a project and making guided changes across files.",
            "It is useful when the AI can see enough code context to explain how pieces connect. That makes debugging and refactoring feel faster.",
            "The best results come from giving focused instructions and reviewing the diff carefully."
        ],
    },
    {
        slug: "popai",
        name: "POPAI",
        category: "AI Website Builder",
        description: "AI tool for generating presentations and documents fast.",
        logo: "https://www.google.com/s2/favicons?domain=popai.pro&sz=128",
        link: "https://popai.pro",
        bestFor: "Presentation drafts, document summaries, and content organization.",
        article: [
            "POPAI focuses on documents and presentations. I explored it for turning raw information into a more organized format.",
            "It can help when the goal is to create a first draft quickly, especially for slides, summaries, or structured notes.",
            "The useful workflow is to let AI create the initial structure, then edit the tone, accuracy, and details manually."
        ],
    },
    {
        slug: "base44",
        name: "Base44",
        category: "AI Website Builder",
        description: "Build and deploy full stack apps using just plain English.",
        logo: "https://www.google.com/s2/favicons?domain=base44.com&sz=128",
        link: "https://base44.com",
        bestFor: "Plain-English app prototypes and quick full stack product tests.",
        article: [
            "Base44 is another AI app builder I explored for turning plain English into working software. It is interesting because it tries to compress design, backend, and deployment into one flow.",
            "That makes it useful for testing product ideas quickly. It helps answer whether an app concept makes sense before investing too much time.",
            "Like other AI builders, the generated app is a starting point. The real work is refining the details and making the product reliable."
        ],
    },
    {
        slug: "softgen",
        name: "SoftGen",
        category: "AI Website Builder",
        description: "AI software generator that builds apps from descriptions.",
        logo: "https://www.google.com/s2/favicons?domain=softgen.ai&sz=128",
        link: "https://softgen.ai",
        bestFor: "Software prototypes from descriptions and early idea validation.",
        article: [
            "SoftGen is focused on generating software from descriptions. I explored it as part of understanding how far prompt-based app creation can go.",
            "It is useful for early prototypes where speed matters more than perfect architecture. It can help shape an idea into something visible.",
            "The key lesson is that AI generation works best when the requirements are specific and the builder keeps checking the output."
        ],
    },
    {
        slug: "blackbox-ai",
        name: "BlackBox AI",
        category: "AI Website Builder",
        description: "AI coding assistant for code generation and debugging.",
        logo: "https://www.google.com/s2/favicons?domain=blackbox.ai&sz=128",
        link: "https://blackbox.ai",
        bestFor: "Code search, generation, debugging help, and developer productivity.",
        article: [
            "BlackBox AI is a coding assistant I explored for generation and debugging support. It is useful when looking for examples, fixes, or quick explanations.",
            "It can help reduce friction when I am stuck on syntax, implementation ideas, or a small bug. As with all code AI tools, the output needs verification.",
            "My takeaway is to use it for acceleration, then rely on tests and code review for confidence."
        ],
    },
    {
        slug: "vercel",
        name: "Vercel",
        category: "Hosting",
        description: "Frontend cloud platform for deploying web apps instantly.",
        logo: "https://www.google.com/s2/favicons?domain=vercel.com&sz=128",
        link: "https://vercel.com",
        bestFor: "Deploying Next.js and frontend projects with fast previews.",
        article: [
            "Vercel is the hosting platform I explored for deploying modern frontend projects. It is especially smooth with Next.js apps.",
            "The preview deployment workflow is valuable because every change can be tested through a live URL. That makes iteration and sharing much easier.",
            "For a portfolio or frontend project, Vercel keeps deployment simple and fast."
        ],
    },
    {
        slug: "netlify",
        name: "Netlify",
        category: "Hosting",
        description: "Platform for deploying and hosting modern web projects.",
        logo: "https://www.google.com/s2/favicons?domain=netlify.com&sz=128",
        link: "https://netlify.com",
        bestFor: "Static sites, frontend deployments, forms, and simple web hosting.",
        article: [
            "Netlify is another hosting platform I explored for frontend deployment. It is friendly for static sites and modern web apps.",
            "It offers a straightforward deploy flow, useful project previews, and features that help smaller web projects move quickly.",
            "My takeaway is that Netlify is a strong option when the project needs simple hosting with a clean developer experience."
        ],
    },
    {
        slug: "render",
        name: "Render",
        category: "Hosting",
        description: "Cloud platform to deploy web apps, APIs and databases.",
        logo: "https://www.google.com/s2/favicons?domain=render.com&sz=128",
        link: "https://render.com",
        bestFor: "Deploying web services, APIs, background workers, and databases.",
        article: [
            "Render is useful for deploying more than just frontend apps. I explored it as a platform for web services, APIs, and backend projects.",
            "It is helpful when a project needs a server, database, or worker alongside the frontend. That makes it flexible for full stack experiments.",
            "The big lesson is choosing hosting based on the shape of the app, not just popularity."
        ],
    },
    {
        slug: "godaddy",
        name: "GoDaddy",
        category: "Hosting",
        description: "Domain registration and web hosting platform.",
        logo: "https://www.google.com/s2/favicons?domain=godaddy.com&sz=128",
        link: "https://godaddy.com",
        bestFor: "Buying domains, managing DNS, and traditional hosting needs.",
        article: [
            "GoDaddy is mainly known for domains and hosting. I explored it from the perspective of domain registration and basic web presence setup.",
            "It is useful when a project needs a custom domain, DNS setup, or traditional hosting services.",
            "For modern app deployment I may choose other platforms, but domain management is still an important part of launching a real project."
        ],
    },
];

export function getAiTool(slug: string) {
    return aiTools.find((tool) => tool.slug === slug);
}
