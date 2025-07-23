package com.example.bmail;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;

public class LoginActivity extends Activity {
    private LoginViewModel loginViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Initialize ViewModel with Repository
        loginViewModel = new LoginViewModel(new UserRepository());

        Button signupBtn = findViewById(R.id.signup);
        signupBtn.setOnClickListener(view -> {
            Intent intent = new Intent(this, SignupActivity.class);
            startActivity(intent);
        });

        Button loginBtn = findViewById(R.id.login);
        loginBtn.setOnClickListener(view -> handleLogin());
    }

    /**
     * Handles the login button click event.
     * Validates the input and performs the login operation using ViewModel.
     */
    private void handleLogin() {
        EditText usernameET = findViewById(R.id.username);
        EditText passwordEt = findViewById(R.id.password);

        String username = String.valueOf(usernameET.getText()).trim();
        String password = String.valueOf(passwordEt.getText()).trim();

        // Use ViewModel for validation
        LoginViewModel.ValidationResult result = loginViewModel.validateCredentials(username, password);
        if (result.usernameError != null) {
            usernameET.setError(result.usernameError);
        } else {
            usernameET.setError(null);
        }
        if (result.passwordError != null) {
            passwordEt.setError(result.passwordError);
        } else {
            passwordEt.setError(null);
        }

        // Use ViewModel for login
        boolean loginSuccess = loginViewModel.login(username, password);
        Log.i("foo", "The username is: " + username);
        Log.i("foo", "The password is: " + password);
        Log.i("foo", "Login success: " + loginSuccess);
    }
}
