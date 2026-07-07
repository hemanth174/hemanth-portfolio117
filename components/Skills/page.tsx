export const transition = `relative w-fit after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-amber-600 dark:after:bg-yellow-400 after:transition-all after:duration-400 hover:after:w-full`
export const Skills = () => {
    const skills = [
        ['HTML, CSS, JS', 'TAILWIND', 'REACT'], 
        ['NODE JS', 'SQL', 'MONGO DB'],
        ['GITHUB', 'GEN AI', 'LLMs']
    ]
    
    return (
        <>
            <div id="section3" className="min-h-[100vh] bg-zinc-50 dark:bg-black px-5 lg:px-10 pt-20 lg:pt-30 text-zinc-900 dark:text-white font-mono">
                <h1 className={`tracking-widest text-3xl lg:text-4xl font-roboto text-amber-600 dark:text-yellow-300 font-bold lg:pt-0 pt-10 ${transition}`}>SKILLS</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 py-10 lg:p-20">
                    <div className="flex flex-col items-center gap-6 lg:gap-10">
                        <h1 className="text-3xl lg:text-5xl tracking-widest text-amber-600 dark:text-yellow-300 font-roboto font-bold text-center">FRONT-END</h1>
                        {skills[0].map(((item, index) => (
                            <span key={index} className="text-2xl lg:text-4xl tracking-widest transition-all transform hover:scale-110 lg:hover:scale-125 duration-200 hover:bg-yellow-400 dark:hover:bg-yellow-300 duration-300 hover:text-black p-2 hover:rounded-md cursor-pointer text-center">{item}</span>
                        )))}
                    </div>

                    <div className="flex flex-col items-center gap-6 lg:gap-10">
                        <h1 className="text-3xl lg:text-5xl tracking-widest text-amber-600 dark:text-yellow-300 font-roboto font-bold text-center">BACK-END</h1>
                        {skills[1].map(((item, index) => (
                            <span key={index} className="text-2xl lg:text-4xl tracking-widest transition-all transform hover:scale-110 lg:hover:scale-125 duration-200 hover:bg-yellow-400 dark:hover:bg-yellow-300 duration-300 ease-out hover:text-black p-2 hover:rounded-md cursor-pointer hover:shadow-[0_0_20px_rgba(255,221,0,0.2)] text-center">{item}</span>
                        )))}
                    </div>
                    
                    <div className="flex flex-col items-center gap-6 lg:gap-10">
                        <h1 className="text-3xl lg:text-5xl tracking-widest text-amber-600 dark:text-yellow-300 font-roboto font-bold text-center">TOOLS & AI</h1>
                        {skills[2].map(((item, index) => (
                            <span key={index} className="text-2xl lg:text-4xl tracking-widest transition-all transform hover:scale-110 lg:hover:scale-125 duration-200 hover:bg-yellow-400 dark:hover:bg-yellow-300 duration-300 ease-out hover:text-black p-2 hover:rounded-md cursor-pointer hover:shadow-[0_0_20px_rgba(255,221,0,0.2)] text-center">{item}</span>
                        )))}
                    </div>
                </div>
            </div>
        </>
    )

}