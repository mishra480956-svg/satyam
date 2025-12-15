import Link from "next/link";
import * as React from "react";

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./button";

export type LinkButtonProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
