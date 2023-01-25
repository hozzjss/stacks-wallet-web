import React, { useEffect, useState } from 'react';
import AnimateHeight from 'react-animate-height';

import { Box, Flex } from '@stacks/ui';
import { FormikContextType, useFormikContext } from 'formik';

import { ErrorLabel } from '@app/components/error-label';

function omitAmountErrorsAsDisplayedElsewhere([key]: [string, unknown]) {
  return key !== 'amount';
}

function shouldDisplayErrors(form: FormikContextType<unknown>) {
  return Object.values(form.touched).includes(true) && Object.keys(form.errors).length;
}

const closedHeight = 24;
const openHeight = 56;

export function FormErrors() {
  const [showHide, setShowHide] = useState(closedHeight);
  const form = useFormikContext();

  useEffect(() => {
    if (shouldDisplayErrors(form)) {
      setShowHide(openHeight);
      return;
    }
    setShowHide(closedHeight);
  }, [form]);

  const [firstError] = Object.entries(form.errors).filter(omitAmountErrorsAsDisplayedElsewhere);

  return firstError && shouldDisplayErrors(form) ? (
    <AnimateHeight duration={400} easing="ease-out" height={showHide}>
      <Flex height={openHeight + 'px'}>
        <ErrorLabel alignSelf="center">{firstError?.[1] as React.ReactNode}</ErrorLabel>
      </Flex>
    </AnimateHeight>
  ) : (
    <Box height={closedHeight + 'px'}></Box>
  );
}
