import React from 'react';
import Container from '@/component/ui/Container/Container';
import Image from 'next/image';
import Anchor from '@/component/ui/Anchor/Anchor';
import Heading from '@/component/ui/Heading/Heading';

const AccountCreated = () => {
    return (
        <Container className="pt-8 px-4 md:px-0">
            <div className="w-full max-w-[1272px] mx-auto flex flex-col items-center text-center gap-6">
                <div className="flex gap-[4px] flex-col">
                     <Heading level={1}>
                        Account Created
                    </Heading>
                    <p className="text-sm leading-normal">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                {/* Icon Box */}
                <div className="pb-6 pt-2 flex items-center justify-center">
                    <Image
                        className="object-contain"
                        src="/assets/images/Accountcreated.png"
                        alt="account-created"
                        width={270}
                        height={164}
                        quality={100}
                        unoptimized 
                    />
                </div>

                {/* Buttons */}
                <div className="w-full max-w-[400px] flex flex-col gap-4 mt-6">
                    <Anchor href='/accounts/select-brand' className='!text-[#333333]'>Customise Profile</Anchor>

                    <Anchor href="#" className="w-full !bg-[#EFEFEF] text-center !text-[#333333]">
                        Enter Overlap!
                    </Anchor>
                </div>
            </div>
        </Container>
    );
};

export default AccountCreated;
