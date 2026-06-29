export default function Selector({name, value, setValue, options}) {
    return (
        <div className='w-full flex flex-row h-full bg-gray-300 shadow rounded my-5'>
            <p className='flex flex-col justify-center mx-3 whitespace-nowrap'>{name}</p>
            <select value={value} onChange={(e) => { setValue(e.target.value) }} className="p-3 placeholder-gray-400 bg-white rounded text-sm text-center focus:outline-none focus:ring w-full" style={{ transition: "all .15s ease" }}>
                { Object.keys(options).map((item, i) => (
                    <option value={options[item].value} className="rounded" key={i}>{options[item].name}</option>
                ))}
            </select>    
        </div>
    )
}