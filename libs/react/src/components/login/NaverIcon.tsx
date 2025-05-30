import { SvgIcon, SvgIconProps } from '@mui/material';

export default function NaverIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="4" fill="#03C75A" />
      <path d="M7 7h3.2l3.6 5.2V7H17v10h-3.2l-3.6-5.2V17H7V7z" fill="#fff" />
    </SvgIcon>
  );
}
