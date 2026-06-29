const Titol = ({ titol, noPadding}) => {
    return (
        <>
            {(noPadding) ? 
                <h1 className="w-full tracking-tighter font-bold text-center text-3xl md:text-4xl">  {titol} </h1>
            :
                <h1 className="w-full pt-10 pb-5 tracking-tighter font-bold text-center text-3xl md:text-4xl">  {titol} </h1>
            }
        </>
    )
}

export default Titol
