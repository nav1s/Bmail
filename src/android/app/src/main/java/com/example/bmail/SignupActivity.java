package com.example.bmail;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;

public class SignupActivity extends Activity {
    private SignupViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        viewModel = new SignupViewModel();

        Button signupBtn = findViewById(R.id.signupButton);
        signupBtn.setOnClickListener(view -> handleSignupButtonClick());
    }

    private void handleSignupButtonClick() {
        EditText firstNameET = findViewById(R.id.firstname);
        EditText lastNameET = findViewById(R.id.lastname);
        EditText usernameET = findViewById(R.id.username);
        EditText passwordET = findViewById(R.id.password1);
        EditText confirmPasswordET = findViewById(R.id.password2);

        String firstName = String.valueOf(firstNameET.getText()).trim();
        String lastName = String.valueOf(lastNameET.getText()).trim();
        String username = String.valueOf(usernameET.getText()).trim();
        String password = String.valueOf(passwordET.getText()).trim();
        String confirmPassword = String.valueOf(confirmPasswordET.getText()).trim();

        Log.i("foo", "First Name: " + firstName);
        Log.i("foo", "Last Name: " + lastName);
        Log.i("foo", "Username: " + username);
        Log.i("foo", "Password: " + password);
        Log.i("foo", "Confirm Password: " + confirmPassword);

        SignupViewModel.ValidationResult result = viewModel.
                validateFields(firstName, lastName, username, password, confirmPassword);

        firstNameET.setError(result.firstNameError);
        lastNameET.setError(result.lastNameError);
        usernameET.setError(result.usernameError);
        passwordET.setError(result.passwordError);
        confirmPasswordET.setError(result.confirmPasswordError);

    }
}
