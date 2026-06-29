export default function Selector({name, value, setValue, placeholder, type}) {
    return (
        <div className='w-full flex flex-row bg-gray-300 shadow rounded my-5'>
            <p className='flex flex-col justify-center mx-3 whitespace-nowrap'>{name}</p>
            <input className="tracking-wide py-2 px-4 leading-relaxed appearance-none block w-full bg-white rounded focus:outline-none focus:ring" type={type} placeholder={placeholder} value={value} onChange={(e) => { setValue(e.target.value) }} style={{ transition: "all .15s ease" }}/>
        </div>
    )
}