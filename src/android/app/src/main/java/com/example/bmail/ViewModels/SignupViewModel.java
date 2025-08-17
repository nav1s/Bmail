package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.bmail.Api.SignupApi;

import okhttp3.MediaType;
import okhttp3.RequestBody;

public class SignupViewModel {
    private final SignupApi userApi;

    public SignupViewModel(SignupApi userApi) {
        this.userApi = userApi;
    }

    public static class ValidationResult {
        public String firstNameError;
        public String lastNameError;
        public String usernameError;
        public String passwordError;
        public String confirmPasswordError;
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
    @Nullable
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


    /**
     * Validates the fields for the signup form.
     *
     * @param firstName       The first name of the user.
     * @param lastName        The last name of the user.
     * @param username        The username of the user.
     * @param password        The password of the user.
     * @param confirmPassword The confirmation password.
     * @return A ValidationResult object containing error messages for each field, if any.
     */
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
     * Signs up a new user with the provided details.
     *
     * @param firstName   The first name of the user.
     * @param lastName    The last name of the user.
     * @param username    The username of the user.
     * @param password    The password of the user.
     * @param imageUri    The URI of the user's profile image.
     * @param signupCallback The callback to handle the signup response.
     */
    public void signup(@NonNull String firstName, @NonNull String lastName,
                        @NonNull String username, @NonNull String password, @NonNull String imageUri,
                       SignupApi.callback signupCallback
                       ) {

        // Create RequestBody instances from strings
        RequestBody firstNameBody = RequestBody.create(firstName, MediaType.parse("text/plain"));
        RequestBody lastNameBody = RequestBody.create(lastName, MediaType.parse("text/plain"));
        RequestBody usernameBody = RequestBody.create(username, MediaType.parse("text/plain"));
        RequestBody passwordBody = RequestBody.create(password, MediaType.parse("text/plain"));

        userApi.signup(firstNameBody, lastNameBody, usernameBody,
                passwordBody, imageUri, signupCallback);
    }


}
