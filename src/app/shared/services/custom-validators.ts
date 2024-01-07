import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { EMPTY } from 'rxjs';

export class CustomValidators {
  static patternValidator(regex: RegExp, error: ValidationErrors | null): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  static passwordMatchValidator(control: AbstractControl) {
    if (control.get('password')?.value) {
      
    }
    const password: string = control.get('password')?.value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPassword')?.value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPassword')?.setErrors({ NoPasswordMatch: true });
    }
  }

  static mailMatchValidator(control: AbstractControl) {
    const email: string = control.get('email')?.value;
    const confirmMail: string = control.get('confirmMail')?.value;

    if (email !== confirmMail) {
      control.get('confirmMail')?.setErrors({ NoMailMatch: true });
    }
  }


  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);

      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }

      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }

}
