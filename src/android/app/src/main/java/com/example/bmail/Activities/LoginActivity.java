package com.example.bmail.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.bmail.Api.SignupApi;
import com.example.bmail.ViewModels.LoginViewModel;
import com.example.bmail.R;

public class LoginActivity extends AppCompatActivity implements SignupApi.callback {
    private LoginViewModel loginViewModel;
    private EditText usernameET;
    private EditText passwordEt;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Initialize EditText fields
        usernameET = findViewById(R.id.username);
        passwordEt = findViewById(R.id.password);

        // Check for existing token
        SharedPreferences prefs = getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);
        // if token is not null, redirect to MailActivity
        if (token != null) {
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
            return;
        }

        SignupApi userApi = new SignupApi(this);

        // Initialize ViewModel with Repository
        loginViewModel = new LoginViewModel(userApi);

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
        String username = String.valueOf(usernameET.getText()).trim();
        String password = String.valueOf(passwordEt.getText()).trim();

        // Use ViewModel for validation
        LoginViewModel.ValidationResult result = loginViewModel.validateCredentials(username, password);
        usernameET.setError(result.usernameError);
        passwordEt.setError(result.passwordError);

        if (result.usernameError != null || result.passwordError != null) {
            Log.i("MainActivity", "Validation failed: " +
                    result.usernameError + ", " + result.passwordError);
            return; // Exit if validation fails
        }

        Log.i("LoginActivity", "The username is: " + username);
        Log.i("LoginActivity", "The password is: " + password);

        // Use ViewModel for login
        loginViewModel.login(username, password, this);
    }

    @Override
    public void onSuccess(String msg) {
        Log.i("LoginActivity", "Login successful. Token: " + msg);
        runOnUiThread(() -> {
            // Navigate to MainActivity on successful login
            Intent intent = new Intent(LoginActivity.this, MainActivity.class);
            startActivity(intent);
            finish(); // Close LoginActivity
        });
    }

    @Override
    public void onFailure(String errorMessage) {
        Log.e("LoginActivity", "Login failed: " + errorMessage);
        runOnUiThread(() -> {
            // Display error message to user
            Toast.makeText(LoginActivity.this, errorMessage, Toast.LENGTH_LONG).show();

        });
    }
}
