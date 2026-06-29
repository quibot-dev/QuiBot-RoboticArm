import React, { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Titol from '../components/Titol'


function Esperant_Admin() {

    return (
        <>
            <Titol titol={"Esperant autorització del administrador ..."} noPadding={true} />
            <div className='container mx-auto'>
                <div className='mt-32 flex justify-center'>
                    <LazyLoadImage effect="blur" src="/treballant.gif" />

                </div>
            </div>
        </>
    )
}

export default Esperant_Admin