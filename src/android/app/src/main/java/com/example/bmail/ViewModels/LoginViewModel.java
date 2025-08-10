package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;

import com.example.bmail.Repositories.UserRepository;

public class LoginViewModel {
    private final UserRepository userRepository;
    private LoginCallback loginCallback;

    public interface LoginCallback {
        void onLoginSuccess(String token);
        void onLoginFailure(String errorMessage);
    }

    public LoginViewModel(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void setLoginCallback(LoginCallback callback) {
        this.loginCallback = callback;
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

    public void login(String username, String password) {
        userRepository.login(username, password, new UserRepository.LoginCallback() {
            @Override
            public void onLoginSuccess(String token) {
                if (loginCallback != null) {
                    loginCallback.onLoginSuccess(token);
                }
            }

            @Override
            public void onLoginFailure(String errorMessage) {
                if (loginCallback != null) {
                    loginCallback.onLoginFailure(errorMessage);
                }
            }
        });
    }
}
