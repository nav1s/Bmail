package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;

import com.example.bmail.Api.SignupApi;

// todo check whether this class need to extend ViewModel or not
public class LoginViewModel {
    private final SignupApi userApi;

    public LoginViewModel(SignupApi userApi) {
        this.userApi = userApi;
    }


    public static class ValidationResult {
        public String usernameError;
        public String passwordError;
    }

    public ValidationResult validateCredentials(@NonNull String username, @NonNull String password) {
        ValidationResult result = new ValidationResult();
        result.usernameError = username.isEmpty() ? "Username cannot be empty" : null;
        result.passwordError = password.isEmpty() ? "Password cannot be empty" : null;
        return result;
    }

    public void login(String username, String password, SignupApi.callback loginCallback) {
        userApi.login(username, password, loginCallback);
    }
}
