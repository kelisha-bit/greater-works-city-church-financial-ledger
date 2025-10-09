import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateForm } from '../validation';

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>;
  initialValues?: Partial<T>;
}

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: Record<string, string>;
}

export const useFormValidation = <T extends Record<string, any>>({
  schema,
  initialValues = {}
}: UseFormValidationProps<T>) => {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [errors]);

  const setValuesFromObject = useCallback((newValues: Partial<T>) => {
    setValues(newValues);
    setErrors({});
  }, []);

  const setTouchedField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field as string]: true }));
  }, []);

  const validate = useCallback((): ValidationResult<T> => {
    const result = validateForm(schema, values);

    if (!result.success) {
      setErrors(result.errors);
    } else {
      setErrors({});
    }

    return result;
  }, [schema, values]);

  const validateField = useCallback((field: keyof T) => {
    try {
      // Create a partial schema for just this field
      const fieldSchema = (schema as any).pick({ [field as string]: true });
      const fieldValue = { [field as string]: values[field] };
      fieldSchema.parse(fieldValue);
      setErrors(prev => ({ ...prev, [field as string]: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues.find(err =>
          err.path.includes(field as string)
        );
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field as string]: fieldError.message }));
        }
        return false;
      }
      return false;
    }
  }, [schema, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0 && Object.keys(values).length > 0;

  return {
    values,
    errors,
    touched,
    setValue,
    setValues: setValuesFromObject,
    setTouched: setTouchedField,
    validate,
    validateField,
    reset,
    isValid
  };
};
