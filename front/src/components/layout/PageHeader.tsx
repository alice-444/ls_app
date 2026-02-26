"use client";

interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly className?: string;
}

export function PageHeader({
  title,
  subtitle,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`relative mb-6 sm:mb-8 lg:mb-10 ${className}`}>
      <div className="relative h-[60px] sm:h-[70px] lg:h-[75px]">
        <div className="absolute left-0 top-0 h-[60px] sm:h-[70px] lg:h-[75px] w-full sm:w-[450px] lg:w-[580px]">
          <div className="absolute left-[120px] sm:left-[140px] lg:left-[163px] top-0 h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
            <div className="h-full w-full bg-ls-heading rounded" />
          </div>
          <div className="absolute left-[85px] sm:left-[100px] lg:left-[116px] top-[30px] sm:top-[35px] lg:top-[38px] h-[24px] sm:h-[28px] lg:h-[31px] w-[24px] sm:w-[28px] lg:w-[31px] opacity-20">
            <div className="h-full w-full bg-ls-heading rounded" />
          </div>
          <div className="absolute left-0 top-[-20px] sm:top-[-24px] lg:top-[-27px] h-[36px] sm:h-[40px] lg:h-[45px] w-[36px] sm:w-[40px] lg:w-[45px]">
            <div className="h-full w-full bg-ls-heading rounded-full opacity-20" />
          </div>
          <div className="absolute left-[40px] sm:left-[48px] lg:left-[56px] top-[2px] h-[52px] sm:h-[60px] lg:h-[66px] w-[360px] sm:w-[400px] lg:w-[520px]">
            <div className="absolute right-[100px] sm:right-[120px] lg:right-[138px] top-[-6px] sm:top-[-7px] lg:top-[-8px] h-[64px] sm:h-[72px] lg:h-[80px] w-[320px] sm:w-[360px] lg:w-[480px] rotate-[359.6deg]">
              <div className="h-[62px] sm:h-[70px] lg:h-[78px] w-[320px] sm:w-[360px] lg:w-[480px] bg-ls-heading border-2 border-white rounded-tl-[28px] sm:rounded-tl-[32px] lg:rounded-tl-[36px] rounded-tr-[28px] sm:rounded-tr-[32px] lg:rounded-tr-[36px] rounded-bl-[4px] rounded-br-[4px]" />
            </div>
          </div>
        </div>
        <div className="relative z-10 pt-2 sm:pt-3 lg:pt-4">
          <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-black text-white leading-[1.2] sm:leading-[1.3] lg:leading-[75px] whitespace-nowrap">
            {title}
          </h1>
        </div>
      </div>
      {subtitle && (
        <p className="text-[20px] sm:text-[22px] lg:text-[24px] text-ls-text mt-4 sm:mt-5 lg:mt-6">
          {subtitle}
        </p>
      )}
    </div>
  );
}
