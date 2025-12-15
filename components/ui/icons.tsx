import * as React from "react";

export type IconProps = React.SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function IconMenu(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </BaseIcon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2.2 2.2 0 0 1-1.56 3.75 2.2 2.2 0 0 1-1.55-.64l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.09 1.64V22a2.2 2.2 0 0 1-4.4 0v-.08a1.8 1.8 0 0 0-1.09-1.64 1.8 1.8 0 0 0-1.98.36l-.05.05a2.2 2.2 0 0 1-3.11 0 2.2 2.2 0 0 1 0-3.11l.05-.05a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.64-1.09H2a2.2 2.2 0 0 1 0-4.4h.08a1.8 1.8 0 0 0 1.64-1.09 1.8 1.8 0 0 0-.36-1.98l-.05-.05a2.2 2.2 0 0 1 0-3.11 2.2 2.2 0 0 1 3.11 0l.05.05a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.09-1.64V2a2.2 2.2 0 0 1 4.4 0v.08a1.8 1.8 0 0 0 1.09 1.64 1.8 1.8 0 0 0 1.98-.36l.05-.05a2.2 2.2 0 0 1 3.11 0 2.2 2.2 0 0 1 0 3.11l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.64 1.09H22a2.2 2.2 0  0 1 0 4.4h-.08a1.8 1.8 0 0 0-1.64 1.09Z" />
    </BaseIcon>
  );
}

export function IconX(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </BaseIcon>
  );
}

export function IconSend(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </BaseIcon>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 12.2A8.9 8.9 0 0 1 11.8 3a7 7 0 1 0 9.2 9.2Z" />
    </BaseIcon>
  );
}

export function IconSun(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 19.07 1.41-1.41" />
      <path d="m17.66 6.34 1.41-1.41" />
    </BaseIcon>
  );
}
