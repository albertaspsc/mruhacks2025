import {
  DetailedHTMLProps,
  Dispatch,
  InputHTMLAttributes,
  SetStateAction,
} from "react";

type InputProps<T extends string, K> = {
  type: T;
  getState: K | undefined;
  setState: Dispatch<SetStateAction<K | undefined>>;
} & Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  "type" | "value" | "onChange"
>;

type BindInputProps =
  | InputProps<"email", string>
  | InputProps<"password", string>
  | InputProps<"text", string>;

export function BindInput(props: BindInputProps) {
  const { getState, setState, ...relevantProps } = props;
  return (
    <>
      <input
        {...relevantProps}
        value={getState}
        onChange={(e) => setState(e.target.value)}
      />
    </>
  );
}
