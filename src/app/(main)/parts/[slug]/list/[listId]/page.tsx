
import MarketPlaceListing from '@/component/sections/marketPlace-listing/MarketPlaceListing'
import PriceHistory from '@/component/sections/marketPlace-listing/PriceHistory'
import TimelineCard from '@/component/sections/marketPlace-listing/TransactionHistory'
import React from 'react'

const page = () => {
  return (
    <div className='mb-[201px] max-tab-lg:mb-[40px]'>
     <MarketPlaceListing />
     <TimelineCard />
     <PriceHistory />
    </div>
  )
}

export default page
