import { ComponentPropsWithoutRef } from 'react';

type IconProps = ComponentPropsWithoutRef<'img'> & {
  className?: string;
};

const Icon = ({ className, ...props }: IconProps) => {
  return (
    <img
      src={chrome.runtime.getURL('assets/icon.svg')}
      alt="CSAnalyzer.gg"
      className={className}
      {...props}
    />
  );
};

export default Icon;
