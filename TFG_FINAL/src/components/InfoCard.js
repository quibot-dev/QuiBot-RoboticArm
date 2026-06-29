export default function InfoCard({name, value}){
    return (
        <div className="flex flex-col items-center bg-white shadow rounded-xl p-4">
            <h3 className="flex text-base font-normal font-bold text-gray-900 text-center">{name}</h3>
            <p className="flex text-xl leading-none text-gray-700 text-center mt-2">{value}</p>
        </div>
    )
}