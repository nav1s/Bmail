package com.example.bmail.Activities;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.User;
import com.example.bmail.R;
import com.example.bmail.Repositories.UserRepository;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.google.android.material.textfield.TextInputEditText;

import java.util.Objects;

public class ProfileActivity extends AppCompatActivity {

    private boolean hasUnsavedChanges = false;
    private TextInputEditText firstNameEditText;
    private TextInputEditText lastNameEditText;
    private TextInputEditText usernameEditText;
    private TextInputEditText currentPasswordEditText;
    private TextInputEditText newPasswordEditText;
    private TextInputEditText confirmPasswordEditText;
    private ImageView profileImage;
    private SwitchMaterial themeSwitch;
    private boolean checkChanges = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        // Initialize input fields
        initializeInputFields();

        // Initialize theme switch
        setupThemeSwitch();

        // fetch the user data and populate the fields
        UserRepository userRepository = BmailApplication.getInstance().getUserRepository();
        userRepository.getUserData().observe(this, user -> {
            if (user != null) {
                firstNameEditText.setText(user.getFirstName());
                lastNameEditText.setText(user.getLastName());
                usernameEditText.setText(user.getUsername());
                userRepository.loadImage(user.getImage());
                userRepository.getUserImage().observe(this, image -> {
                    if (image == null) {
                        Log.e("ProfileActivity", "User image is null");
                        return;
                    }
                    Log.d("ProfileActivity", "User image loaded successfully");
                    profileImage.setImageBitmap(image);
                });
                checkChanges = true; // Prevent text change detection during initialization

            }
        });

        // Setup text watchers to detect changes
        setupTextWatchers();

        // Setup change photo click listener
        TextView changePhotoText = findViewById(R.id.change_photo_text);
        changePhotoText.setOnClickListener(v -> {
            // TODO: Implement photo selection logic
            checkForUnsavedChanges();
        });

        // Setup save button click listener
        findViewById(R.id.save_button).setOnClickListener(v -> saveChanges());
    }

    private void initializeInputFields() {
        firstNameEditText = findViewById(R.id.first_name_edit_text);
        lastNameEditText = findViewById(R.id.last_name_edit_text);
        usernameEditText = findViewById(R.id.username_edit_text);
        currentPasswordEditText = findViewById(R.id.current_password_edit_text);
        newPasswordEditText = findViewById(R.id.new_password_edit_text);
        confirmPasswordEditText = findViewById(R.id.confirm_password_edit_text);
        profileImage = findViewById(R.id.profile_image);
        themeSwitch = findViewById(R.id.theme_switch);
    }

    private void setupTextWatchers() {
        TextWatcher textWatcher = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            if (checkChanges) {
                return;
            }
                hasUnsavedChanges = true;
            }

            @Override
            public void afterTextChanged(Editable s) {}
        };

        firstNameEditText.addTextChangedListener(textWatcher);
        lastNameEditText.addTextChangedListener(textWatcher);
        usernameEditText.addTextChangedListener(textWatcher);
        currentPasswordEditText.addTextChangedListener(textWatcher);
        newPasswordEditText.addTextChangedListener(textWatcher);
        confirmPasswordEditText.addTextChangedListener(textWatcher);
    }

    private void checkForUnsavedChanges() {
        if (hasUnsavedChanges) {
            showUnsavedChangesAlert();
        }
    }

    private void showUnsavedChangesAlert() {
        new AlertDialog.Builder(this)
                .setTitle("Unsaved Changes")
                .setMessage("You have unsaved changes. Do you want to save them before continuing?")
                .setPositiveButton("Save", (dialog, which) -> {
                    // TODO: Implement save logic
                    saveChanges();
                    dialog.dismiss();
                })
                .setNegativeButton("Discard", (dialog, which) -> {
                    hasUnsavedChanges = false;
                    dialog.dismiss();
                })
                .setNeutralButton("Cancel", (dialog, which) -> dialog.dismiss())
                .show();
    }

    private void saveChanges() {
        hasUnsavedChanges = false;
        String firstName = Objects.requireNonNull(firstNameEditText.getText()).toString().trim();
        String lastName = Objects.requireNonNull(lastNameEditText.getText()).toString().trim();
        UserRepository userRepository = BmailApplication.getInstance().getUserRepository();
        userRepository.updateProfile(firstName, lastName, null);


        // Show confirmation
        new AlertDialog.Builder(this)
                .setTitle("Success")
                .setMessage("Your profile has been updated successfully!")
                .setPositiveButton("OK", (dialog, which) -> {
                    dialog.dismiss();
                    finish(); // Close the activity after saving
                })
                .show();
    }

    @Override
    public boolean onSupportNavigateUp() {
        if (hasUnsavedChanges) {
            showUnsavedChangesAlert();
            return true;
        }
        finish();
        return true;
    }

    private void setupThemeSwitch() {
        // Check the current theme mode
        int nightModeFlags = getResources().getConfiguration().uiMode
                & android.content.res.Configuration.UI_MODE_NIGHT_MASK;
        boolean isDarkMode = nightModeFlags == android.content.res.Configuration.UI_MODE_NIGHT_YES;
        Log.d("ProfileActivity", "Current theme mode: " + (isDarkMode ? "Dark" : "Light"));
        themeSwitch.setChecked(isDarkMode);

        // Set the listener for theme changes
        themeSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            // Apply the theme
            if (isChecked) {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
            } else {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
            }

        });
    }



}
