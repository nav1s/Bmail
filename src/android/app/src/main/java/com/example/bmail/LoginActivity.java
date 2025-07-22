package com.example.bmail;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;

public class LoginActivity extends Activity {
    // todo move logic to view model
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        Button signupBtn = findViewById(R.id.signup);
        signupBtn.setOnClickListener(view -> {
            Intent intent = new Intent(this, SignupActivity.class);
            startActivity(intent);
        });

        Button loginBtn = findViewById(R.id.login);
        loginBtn.setOnClickListener(view -> {
            EditText usernameET = findViewById(R.id.username);
            EditText passwordEt = findViewById(R.id.password);

            String username = String.valueOf(usernameET.getText()).trim();
            String password = String.valueOf(passwordEt.getText()).trim();

            boolean valid = true;

            // Validate username
            if (username.isEmpty()) {
                usernameET.setError("Username cannot be empty");
                valid = false;
            } else {
                usernameET.setError(null);
            }

            // Validate password not empty
            if (password.isEmpty()) {
                passwordEt.setError("Password cannot be empty");
                valid = false;
            } else {
                // Validate password rules
                if (!isValidPassword(password)) {
                    passwordEt.setError("Password must be at least 8 characters long,\n" +
                            "contain uppercase, lowercase, digit, and special character");
                    valid = false;
                } else {
                    passwordEt.setError(null);
                }
            }

            if (!valid) {
                return; // Stop if validation failed
            }

            // Proceed with login
            Log.i("foo", "The username is: " + username);
            Log.i("foo", "The password is: " + password);
        });
    }

    /**
     * Validates the password based on the following rules:
     * - At least 8 characters long
     * - Contains at least one uppercase letter
     * - Contains at least one lowercase letter
     * - Contains at least one digit
     * - Contains at least one special character
     */
    private boolean isValidPassword(String password) {
        if (password.length() < 8) return false;
        if (!password.matches(".*[A-Z].*")) return false;      // no uppercase letter
        if (!password.matches(".*[a-z].*")) return false;      // no lowercase letter
        if (!password.matches(".*\\d.*")) return false;        // no digit
        return password.matches(".*[!@#$%^&*()\\-+=<>?{}\\[\\]~`.,;:'\"\\\\|/_].*"); // no special char
    }
}
