import { ComponentPropsWithoutRef } from 'react';

type FaceitIconProps = ComponentPropsWithoutRef<'img'> & {
  className?: string;
};

const FaceitIcon = ({ className, ...props }: FaceitIconProps) => {
  return (
    <img
      src={chrome.runtime.getURL('assets/faceit.svg')}
      alt="Faceit"
      className={className}
      {...props}
    />
  );
};

export default FaceitIcon;
