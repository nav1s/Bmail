package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Api.SignupApi;
import com.example.bmail.R;
import com.example.bmail.Utils.PhotoSelectionHelper;
import com.example.bmail.ViewModels.SignupViewModel;
import com.google.android.material.textfield.TextInputLayout;

public class SignupActivity extends AppCompatActivity implements SignupApi.callback {
    private PhotoSelectionHelper photoSelectionHelper;
    private ImageView profileImage;
    private String profileImagePath = null; // Path to the selected profile image
    private SignupViewModel viewModel;

    private EditText firstNameET;
    private EditText lastNameET;
    private EditText usernameET;
    private EditText passwordET;
    private EditText confirmPasswordET;
    private Button signupBtn;
    private TextView choosePhotoBtn;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        initViews();

        // Initialize the ActivityResultLauncher

        signupBtn.setOnClickListener(view -> handleSignupButtonClick());

        // Initialize the photo selection helper
        photoSelectionHelper = new PhotoSelectionHelper(this,
                (imagePath, imageUri) -> {
                    profileImagePath = imagePath;
                    // Update the ImageView in the activity
                    if (imageUri != null) {
                        Log.d("ProfileActivity", "Selected Image URI: " + imageUri);
                        profileImage.setImageURI(imageUri);
                        profileImage.postInvalidate();
                    }
                });

        choosePhotoBtn.setOnClickListener(v ->
                photoSelectionHelper.showPhotoSelectionOptions());
    }

    private void initViews() {
        SignupApi userApi = new SignupApi(this);
        viewModel = new SignupViewModel(userApi);
        profileImage = findViewById(R.id.profile_image);

        firstNameET = findViewById(R.id.firstname);
        lastNameET = findViewById(R.id.lastname);
        usernameET = findViewById(R.id.username);
        passwordET = findViewById(R.id.password1);
        confirmPasswordET = findViewById(R.id.password2);
        signupBtn = findViewById(R.id.signupButton);
        choosePhotoBtn = findViewById(R.id.change_photo_text);
    }

    private void handleSignupButtonClick() {
        String firstName = String.valueOf(firstNameET.getText()).trim();
        String lastName = String.valueOf(lastNameET.getText()).trim();
        String username = String.valueOf(usernameET.getText()).trim();
        String password = String.valueOf(passwordET.getText()).trim();
        String confirmPassword = String.valueOf(confirmPasswordET.getText()).trim();

        SignupViewModel.ValidationResult result = viewModel.
                validateFields(firstName, lastName, username, password, confirmPassword);

        firstNameET.setError(result.firstNameError);
        lastNameET.setError(result.lastNameError);
        usernameET.setError(result.usernameError);

        TextInputLayout passwordInputLayout = findViewById(R.id.password_input_layout);
        TextInputLayout confirmPasswordInputLayout = findViewById(R.id.confirm_password_input_layout);

        passwordInputLayout.setError(result.passwordError);
        confirmPasswordInputLayout.setError(result.confirmPasswordError);

        // check if there are any errors
        if (result.firstNameError != null || result.lastNameError != null ||
                result.usernameError != null || result.passwordError != null ||
                result.confirmPasswordError != null) {
            Log.i("SignupActivity", "Validation failed: " +
                    result.firstNameError + ", " + result.lastNameError + ", " +
                    result.usernameError + ", " + result.passwordError + ", " +
                    result.confirmPasswordError);
            return; // Exit if validation fails
        }

        // otherwise, proceed with signup
        viewModel.signup(firstName, lastName, username, password, profileImagePath,
                this);


    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }

    @Override
    public void onSuccess(String msg) {
        Log.i("LoginActivity", msg);
        Toast.makeText(SignupActivity.this, msg, Toast.LENGTH_LONG).show();
        finish();
    }

    @Override
    public void onFailure(String errorMessage) {
        Toast.makeText(SignupActivity.this, errorMessage, Toast.LENGTH_LONG).show();

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        photoSelectionHelper.handlePermissionResult(requestCode, permissions, grantResults);
    }
}
