/**
 * Sets or clears a FormField's error from the browser, for validation that
 * runs after the page renders. It does what FormField's `error` prop does:
 * shows the message under the control, marks the control aria-invalid, lists
 * the message in its aria-describedby and gives the field its error colour.
 * An empty message undoes all of it.
 */
export function setFieldError(control: HTMLElement, message?: string | null) {
  const field = control.closest<HTMLElement>('.form-field');
  const error = field?.querySelector<HTMLElement>(':scope > .error');

  if (!field || !error) {
    throw new Error('setFieldError needs a control inside a FormField.');
  }

  const describedBy = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && id !== error.id);

  if (message) {
    describedBy.push(error.id);
    control.setAttribute('aria-invalid', 'true');
  } else {
    control.removeAttribute('aria-invalid');
  }

  if (describedBy.length) {
    control.setAttribute('aria-describedby', describedBy.join(' '));
  } else {
    control.removeAttribute('aria-describedby');
  }

  error.textContent = message ?? '';
  error.hidden = !message;
  field.classList.toggle('invalid', Boolean(message));
}
