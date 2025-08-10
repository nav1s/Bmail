package com.example.bmail.Activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.R;
import com.example.bmail.Repositories.UserRepository;
import com.example.bmail.ViewModels.SignupViewModel;

public class SignupActivity extends AppCompatActivity {
    private SignupViewModel viewModel;
    private static final int PICK_IMAGE_REQUEST = 1;

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

        UserRepository userRepository = BmailApplication.getInstance().getUserRepository();
        viewModel = new SignupViewModel(userRepository);

        initViews();

        signupBtn.setOnClickListener(view -> handleSignupButtonClick());

        // todo add ability to choose a photo from camera or gallery
        choosePhotoBtn.setOnClickListener(view -> handleChoosePhotoButtonClick());
    }

    private void initViews() {
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

    }

    private void handleChoosePhotoButtonClick() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");
        startActivityForResult(intent, PICK_IMAGE_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null
                && data.getData() != null) {
            Uri selectedImageUri = data.getData();
            Log.i("SignupActivity", "Selected Image URI: " + selectedImageUri.toString());
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
