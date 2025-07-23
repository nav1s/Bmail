package com.example.bmail;

public class LoginViewModel {
    private final UserRepository userRepository;

    public LoginViewModel(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class ValidationResult {
        public String usernameError;
        public String passwordError;
    }

    public ValidationResult validateCredentials(String username, String password) {
        ValidationResult result = new ValidationResult();
        result.usernameError = username.isEmpty() ? "Username cannot be empty" : null;
        result.passwordError = password.isEmpty() ? "Password cannot be empty" : null;
        return result;
    }

    public boolean login(String username, String password) {
        return userRepository.login(username, password);
    }

}
