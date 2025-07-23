package com.example.bmail;

import androidx.annotation.NonNull;

public class SignupViewModel {

    public static class ValidationResult {
        public String firstNameError;
        public String lastNameError;
        public String usernameError;
        public String passwordError;
        public String confirmPasswordError;
    }

    public ValidationResult validateFields(@NonNull String firstName, @NonNull String lastName,
                                           @NonNull String username, String password,
                                           String confirmPassword) {
        ValidationResult result = new ValidationResult();

        result.firstNameError = firstName.isEmpty() ? "First name cannot be empty" : null;
        result.lastNameError = lastName.isEmpty() ? "Last name cannot be empty" : null;
        result.usernameError = username.isEmpty() ? "Username cannot be empty" : null;
        result.passwordError = getPasswordValidationError(password);
        result.confirmPasswordError = (result.passwordError == null && !password.equals(confirmPassword))
                ? "Passwords do not match" : null;

        return result;
    }

    /**
     * Validates the password based on the following criteria:
     * - At least 8 characters long
     * - Contains at least one uppercase letter
     * - Contains at least one lowercase letter
     * - Contains at least one digit
     * - Contains at least one special character
     *
     * @param password The password to validate.
     * @return A string describing the validation error, or null if the password is valid.
     */
    private String getPasswordValidationError(@NonNull String password) {
        if (password.isEmpty()) return "Password cannot be empty";
        if (password.length() < 8) return "Password must be at least 8 characters long";
        if (!password.matches(".*[A-Z].*"))
            return "Password must contain at least one uppercase letter";
        if (!password.matches(".*[a-z].*"))
            return "Password must contain at least one lowercase letter";
        if (!password.matches(".*\\d.*")) return "Password must contain at least one digit";
        if (!password.matches(".*[!@#$%^&*()\\-+=<>?{}\\[\\]~`.,;:'\"\\\\|/_].*"))
            return "Password must contain at least one special character";
        return null;
    }

}
