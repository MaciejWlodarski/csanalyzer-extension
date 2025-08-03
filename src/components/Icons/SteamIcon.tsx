import { ComponentPropsWithoutRef } from 'react';

type SteamIconProps = ComponentPropsWithoutRef<'img'> & {
  className?: string;
};

const SteamIcon = ({ className, ...props }: SteamIconProps) => {
  return (
    <img
      src={chrome.runtime.getURL('assets/steam.png')}
      alt="Steam"
      className={className}
      {...props}
    />
  );
};

export default SteamIcon;
