/**
 * @ghanem/ui — Form components.
 *
 * Built on:
 *   - react-hook-form (uncontrolled form state, minimal re-renders)
 *   - zod + @hookform/resolvers/zod (schema-first validation)
 *   - @radix-ui/* (a11y primitives untuk Checkbox/RadioGroup/Select)
 *
 * Patterns:
 *   - Wrap form dengan FormProvider untuk akses context
 *   - FormField untuk auto-wiring label/error/aria
 *   - Direct register: pakai Input/Textarea as child
 *   - Controlled (Radix): pakai render-prop di FormField
 */

export { FormLabel, type FormLabelProps } from './FormLabel';
export { FormHint, type FormHintProps } from './FormHint';
export { FormError, type FormErrorProps } from './FormError';
export { FormField, type FormFieldProps } from './FormField';

export { Input, type InputProps, type InputSize } from './Input';
export { Textarea, type TextareaProps, type TextareaSize } from './Textarea';
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './Button';

export { Checkbox, type CheckboxProps } from './Checkbox';
export { RadioGroup, RadioItem, type RadioGroupProps, type RadioItemProps } from './RadioGroup';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  type SelectTriggerProps,
  type SelectItemProps,
} from './Select';

// Schema examples — boleh di-consume oleh apps demo / Storybook, biasanya
// production app define schemas sendiri di features/.
export * from './schemas';

// Re-export RHF + Zod helpers yang sering dipakai supaya consumer cukup import dari @ghanem/ui.
export {
  useForm,
  useFormContext,
  useFormState,
  useFieldArray,
  useWatch,
  FormProvider,
  Controller,
  type SubmitHandler,
  type SubmitErrorHandler,
  type UseFormReturn,
  type FieldValues,
  type Path,
  type ControllerRenderProps,
} from 'react-hook-form';

export { zodResolver } from '@hookform/resolvers/zod';
