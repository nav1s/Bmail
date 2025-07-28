package com.example.bmail.Activities;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.content.Context;
import android.content.SharedPreferences;

import com.example.bmail.ViewModels.LoginViewModel;
import com.example.bmail.R;
import com.example.bmail.Repositories.UserRepository;

public class LoginActivity extends Activity {
    private LoginViewModel loginViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Check for existing token
        SharedPreferences prefs = getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);
        // if token is not null, redirect to MailActivity
        if (token != null) {
            Intent intent = new Intent(this, MailActivity.class);
            startActivity(intent);
            finish();
            return;
        }

        UserRepository userRepository = new UserRepository(this);

        // Initialize ViewModel with Repository
        loginViewModel = new LoginViewModel(userRepository);

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
        usernameET.setError(result.usernameError);
        passwordEt.setError(result.passwordError);

        if (result.usernameError != null || result.passwordError != null) {
            Log.i("foo", "Validation failed: " +
                    result.usernameError + ", " + result.passwordError);
            return; // Exit if validation fails
        }

        Log.i("foo", "The username is: " + username);
        Log.i("foo", "The password is: " + password);
        // Use ViewModel for login
        loginViewModel.login(username, password);
        SharedPreferences prefs = getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);
        // check if token is null
        if (token == null) {
            Log.i("foo", "No token found in SharedPreferences.");
            return;
        }
        Log.i("foo", "Token retrieved: " + token);
        Intent intent = new Intent(this, MailActivity.class);
        startActivity(intent);
    }
}
