package com.example.bmail.Activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Api.UserApi;
import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.R;
import com.example.bmail.Repositories.UserRepository;
import com.example.bmail.ViewModels.SignupViewModel;

public class SignupActivity extends AppCompatActivity implements UserApi.callback {
    private ImageView profileImageView;
    private SignupViewModel viewModel;

    private EditText firstNameET;
    private EditText lastNameET;
    private EditText usernameET;
    private EditText passwordET;
    private EditText confirmPasswordET;
    private Button signupBtn;
    private TextView choosePhotoBtn;

    private ActivityResultLauncher<Intent> imagePickerLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        initViews();

        // Initialize the ActivityResultLauncher
        imagePickerLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        Uri selectedImageUri = result.getData().getData();
                        Log.i("SignupActivity", "Selected Image URI: " + selectedImageUri);
                        if (selectedImageUri != null) {
                            profileImageView.setImageURI(selectedImageUri);
                        } else {
                            Log.e("SignupActivity", "Selected image URI is null");
                        }
                    }
                });


        signupBtn.setOnClickListener(view -> handleSignupButtonClick());

        choosePhotoBtn.setOnClickListener(view -> {
            Intent intent = new Intent(Intent.ACTION_PICK);
            intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");
            imagePickerLauncher.launch(intent);
        });
    }

    private void initViews() {
        UserApi userApi = new UserApi(this);
        viewModel = new SignupViewModel(userApi);
        profileImageView = findViewById(R.id.profile_image);

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
        passwordET.setError(result.passwordError);
        confirmPasswordET.setError(result.confirmPasswordError);

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
        viewModel.signup(firstName, lastName, username, password, this);


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
}
