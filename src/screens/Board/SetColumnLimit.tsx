import React, { FC, useState } from 'react';
import Form, { Field, ErrorMessage } from '@atlaskit/form';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import Modal from '@atlaskit/modal-dialog';
import './SetColumnLimit.scss';
import { validateColumnLimit, isValidColumnLimit } from './validateColumnLimit';

interface SetColumnLimitProps {
  onSubmit: (limit?: string) => void;
  onClose: () => void;
}

export const SetColumnLimit: FC<SetColumnLimitProps> = ({
  onSubmit,
  onClose
}) => {
  const [limit, setLimit] = useState('');
  const submit = () => onSubmit(limit);

  const formIsValid = isValidColumnLimit(limit);

  return (
    <Modal
      autoFocus
      key="active-modal"
      width="small"
      heading="Column limit"
      onClose={onClose}
    >
      <div className="set-column-limit">
        <p>
          We'll highlight this column if the number of issues in it passes this
          limit.
        </p>

        <Form onSubmit={submit}>
          {({ formProps }) => {
            return (
              <form {...formProps}>
                <Field
                  name="limit"
                  label="Maximum issues"
                  validate={validateColumnLimit}
                >
                  {({ fieldProps, error }) => (
                    <>
                      <TextField
                        placeholder="No limit set"
                        autoFocus
                        {...fieldProps}
                        autoComplete="off"
                        value={limit}
                        onChange={(event) => {
                          fieldProps.onChange(event);
                          console.log('change', event.currentTarget.value);

                          setLimit(event.currentTarget.value);
                        }}
                      />

                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </>
                  )}
                </Field>

                <footer>
                  <Button
                    appearance="primary"
                    type="submit"
                    isDisabled={!formIsValid}
                  >
                    Save
                  </Button>

                  <Button appearance="subtle" onClick={onClose}>
                    Cancel
                  </Button>
                </footer>
              </form>
            );
          }}
        </Form>
      </div>
    </Modal>
  );
};
