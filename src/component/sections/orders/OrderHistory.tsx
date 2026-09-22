import React from "react";

interface Step {
  status: string;
  date: string;
  icon: React.ReactNode;
}

type StepStatus = "complete" | "in-progress" | "pending";

interface OrderHistoryProps {
  steps: Step[];
  getStepStatus?: (index: number) => StepStatus; 
}

const defaultGetStepStatus = (index: number): StepStatus => {
  if (index === 0) return "complete";
  if (index === 1) return "in-progress";
  return "pending";
};

const OrderHistory: React.FC<OrderHistoryProps> = ({
  steps,
  getStepStatus = defaultGetStepStatus,
}) => {
  if (steps.length <= 1) return null;
  return (
    <div className="bg-white rounded-[10px] pt-[16px] pl-[20px] pr-[40px] pb-[51px]">
      <h2 className="text-base font-medium text-[#002029]">Order History</h2>
      <div className="relative mt-[47px]">
        {steps.length > 1 && (
          <div className="absolute left-[35px] top-0 bottom-[115px] w-px border-l-2 border-dashed z-0 border-[#F2F2F2]" />
        )}
        <div className="flex flex-col gap-[84px]">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isComplete = status === "complete";

            return (
              <div className="flex justify-between items-center" key={index}>
                <div className="flex items-start relative z-10">
                  <div className="w-[70px] h-[70px] flex items-center justify-center relative z-10">
                    <div
                      className="w-[70px] h-[70px] rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isComplete ? "#54DC00" : "#F2F2F2",
                        color: isComplete ? "#FFFFFF" : "#002029",
                        border: isComplete
                          ? "4px solid #54DC00"
                          : "4px solid transparent",
                      }}
                    >
                      {step.icon}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col justify-center">
                    <p className="text-base font-semibold leading-[24px] tracking-[0.64px] text-[#002029] font-sofia-sans">
                      {step.status}
                    </p>
                    <p className="text-xs text-[#BDBDBD] mt-2">{step.date}</p>

                    {step.status === "Expected Arrival Time" && (
                      <div className="mt-4 rounded-[10px] overflow-hidden ">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2958.5801983481338!2d24.747874776758866!3d42.137869571214395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14acd1ae19df5257%3A0xeedd7ca6dd0cf25c!2sTsentarPlovdiv%20Center%2C%20King%20Asen%20St%2024%2C%204000%20Plovdiv%2C%20Bulgaria!5e0!3m2!1sen!2sin!4v1756123533274!5m2!1sen!2sin"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Expected Arrival Location"
                          className="w-full h-40"
                        />
                      </div>
                    )}
                  </div>
                </div>
                {index === 0 && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM15.2197 8.96967L10.75 13.4393L8.78033 11.4697C8.48744 11.1768 8.01256 11.1768 7.71967 11.4697C7.42678 11.7626 7.42678 12.2374 7.71967 12.5303L10.2197 15.0303C10.5126 15.3232 10.9874 15.3232 11.2803 15.0303L16.2803 10.0303C16.5732 9.73744 16.5732 9.26256 16.2803 8.96967C15.9874 8.67678 15.5126 8.67678 15.2197 8.96967Z"
                      fill="#54DC00"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
