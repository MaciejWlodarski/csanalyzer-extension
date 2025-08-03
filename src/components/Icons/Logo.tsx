import { ComponentPropsWithoutRef } from 'react';

type LogoProps = ComponentPropsWithoutRef<'img'> & {
  className?: string;
};

const Logo = ({ className, ...props }: LogoProps) => {
  return (
    <img
      src={chrome.runtime.getURL('assets/logo.svg')}
      alt="CSAnalyzer.gg"
      className={className}
      {...props}
    />
  );
};

export default Logo;
