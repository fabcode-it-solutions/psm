import { Building2 } from 'lucide-react'
import React from 'react'

const EmptyTableUi = ({heading, description}: {heading:string, description:string}) => {
    return (
        <tr>
            <td
                colSpan={7}
                className="px-6 py-12 text-center text-gray-4"
            >
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-5" />
                <p className="text-lg font-medium mb-2 text-light-100 font-sofia-sans">
                   {heading} 
                </p>
                <p className="font-sofia-sans">
                    {description} 
                </p>
            </td>
        </tr>
    )
}

export default EmptyTableUi
