import Image from "next/image"

export const Logo = ()=>{
    return <Image className="w-8 h-8 object-contain rounded-full" src={'/shitpost.png'} width={1024} height={1024} alt="shitpost"/>
}
