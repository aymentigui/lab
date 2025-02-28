"use client"
import { getImageFromLocalHost } from '@/actions/localstorage/util-client'
import { useEffect, useState } from 'react'

const GetImage = (id:string) => {
    const [src, setSrc] = useState<string | null>(null)

    useEffect(()=>{
        fetch()
    },[])

    const fetch=async ()=>{
        setSrc(await getImageFromLocalHost(id)??"")
    }

    if(!src)
        return null

    return src
}

export default GetImage
