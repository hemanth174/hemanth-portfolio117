import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { aiTools, getAiTool } from "../data";
import { notFound } from "next/navigation";

type AiToolArticlePageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export function generateStaticParams() {
    return aiTools.map((tool) => ({
        slug: tool.slug,
    }));
}

export async function generateMetadata({ params }: AiToolArticlePageProps) {
    const { slug } = await params;
    const tool = getAiTool(slug);

    if (!tool) {
        return {
            title: "AI Tool Article",
        };
    }

    return {
        title: `${tool.name} | AI Tool Article`,
        description: tool.description,
    };
}

export default async function AiToolArticlePage({ params }: AiToolArticlePageProps) {
    const { slug } = await params;
    const tool = getAiTool(slug);

    if (!tool) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black px-5 py-5 text-white md:px-16">
             <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/aitoolspage"
                        className="inline-flex border border-yellow-400 px-5 py-2 font-mono text-sm font-bold text-yellow-300 transition-colors hover:bg-yellow-400 hover:text-black"
                    >
                        &larr; Back to AI Tools
                    </Link>
                    <Link
                        href="/#section6"
                        className="inline-flex border border-zinc-700 px-5 py-2 font-mono text-sm font-bold text-zinc-300 transition-colors hover:border-white hover:text-white"
                    >
                        Back to Home
                    </Link>
                </div>
            <div className="mx-auto flex max-w-4xl flex-col gap-10">
               

                <article className="transition hover:scale-110  hover:border-t-4 hover:border-b-4 border-yellow-300 bg-zinc-950 px-6 py-10 shadow-2xl md:px-12 md:py-14">
                    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
                        <Image
                            src={tool.logo}
                            alt={tool.name}
                            width={96}
                            height={96}
                            className="h-24 w-24 rounded-full bg-white"
                        />
                        <div>
                            <p className="mb-3 inline-flex bg-yellow-400 px-3 py-1 font-mono text-xs font-bold tracking-[0.2em] text-black">
                                {tool.category}
                            </p>
                            <h1 className="font-mono text-4xl font-black tracking-tight text-yellow-300 md:text-6xl">
                                {tool.name}
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
                                {tool.description}
                            </p>
                        </div>
                    </div>

                    <section className="mb-10 border-l-4 border-yellow-300 bg-black px-5 py-4">
                        <h2 className="mb-2 font-mono text-sm font-bold uppercase tracking-[0.25em] text-yellow-300">
                            Best For
                        </h2>
                        <p className="text-zinc-200">{tool.bestFor}</p>
                    </section>

                    <div className="space-y-6 text-base leading-8 text-zinc-300 md:text-lg">
                        {tool.article.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>

                    <div className="mt-12 flex flex-wrap gap-4">
                        <Link
                            href={tool.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-yellow-400 px-5 py-3 font-mono text-sm font-bold text-black transition-colors hover:bg-yellow-300"
                        >
                            Official Site <ExternalLink size={16} />
                        </Link>
                        <Link
                            href="/aitoolspage"
                            className="inline-flex border border-zinc-700 px-5 py-3 font-mono text-sm font-bold text-zinc-200 transition-colors hover:border-yellow-300 hover:text-yellow-300"
                        >
                            Explore More Tools
                        </Link>
                    </div>
                </article>
            </div>
        </main>
    );
}
