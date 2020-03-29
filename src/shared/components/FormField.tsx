import React, { FC, InputHTMLAttributes } from 'react';
import { Field } from 'formik';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export const FormField: FC<FormFieldProps> = (props) => {
  return (
    <Field name={props.name}>
      {({ field, meta }: any) => {
        const className = meta.touched && !!meta.error ? 'error' : '';

        return <input className={className} {...field} {...props} />;
      }}
    </Field>
  );
};
