"use client"
import * as Accordion from '@radix-ui/react-accordion'
import React from 'react'
import IconArrowDown from '@/assets/icons/IconArrowDown'

interface AccordionItemProps {
  value: string
  title: string
  content: React.ReactNode
}

interface AccordionTabsProps {
  accordionItems: AccordionItemProps[]
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string | string[] // for controlled behavior
  disabled?: boolean
}

const AccordionTabs: React.FC<AccordionTabsProps> = ({
  accordionItems,
  type = 'single',
  collapsible = true,
  defaultValue,
  disabled = false,
}) => {
  return (
    <>
      {type === 'single' ? (
        <Accordion.Root
          type="single"
          collapsible={collapsible}
          defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
          className="mt-[40px] flex flex-col gap-3.5"
        >
          {accordionItems.map(({ value, title, content }) => (
            <Accordion.Item
              key={value}
              value={value}
              className="AccordionItem flex flex-col gap-[9px] px-[21.95px] bg-white rounded-[6px] border-[1.5px] border-[#E8E8E866]"
            >
              <Accordion.Header className="flex py-[15px] justify-between">
                <Accordion.Trigger
                  className="text-left text-[18px] font-bold leading-[1.2] tracking-[0.18px] w-full flex justify-between items-center group AccordionTrigger"
                  disabled={disabled}
                >
                  {title}
                  <IconArrowDown className="AccordionChevron transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="AccordionContent max-tab-lg:pb-4 pb-[84px] overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <span className="text-base font-light tracking-[0.16px] leading-[1.35] text-[#002029]">
                  {content || 'No content provided.'}
                </span>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      ) : (
        <Accordion.Root
          type="multiple"
          defaultValue={Array.isArray(defaultValue) ? defaultValue : undefined}
          className="mt-[40px] flex flex-col gap-3.5"
        >
          {accordionItems.map(({ value, title, content }) => (
            <Accordion.Item
              key={value}
              value={value}
              className="AccordionItem flex flex-col gap-[9px] px-[21.95px] bg-white rounded-[6px] border-[1.5px] border-[#E8E8E866]"
            >
              <Accordion.Header className="flex py-[15px] justify-between">
                <Accordion.Trigger
                  className="text-left text-[18px] font-bold leading-[1.2] tracking-[0.18px] w-full flex justify-between items-center group AccordionTrigger"
                  disabled={disabled}
                >
                  {title}
                  <IconArrowDown className="AccordionChevron transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="AccordionContent max-tab-lg:pb-4 pb-[84px] overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <span className="text-base font-light tracking-[0.16px] leading-[1.35] text-[#002029]">
                  {content || 'No content provided.'}
                </span>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </>
  )
}

export default AccordionTabs
