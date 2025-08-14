package com.example.bmail.Activities;

import com.example.bmail.Utils.PhotoSelectionHelper;

import android.content.pm.PackageManager;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.R;
import com.example.bmail.Repositories.UserRepository;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.google.android.material.textfield.TextInputEditText;

import java.util.Objects;

public class ProfileActivity extends AppCompatActivity {

    private PhotoSelectionHelper photoSelectionHelper;
    private String profileImagePath = null;

    private boolean hasUnsavedChanges = false;
    private TextInputEditText firstNameEditText;
    private TextInputEditText lastNameEditText;
    private TextInputEditText usernameEditText;
    private TextInputEditText currentPasswordEditText;
    private TextInputEditText newPasswordEditText;
    private TextInputEditText confirmPasswordEditText;
    private ImageView profileImage;
    private SwitchMaterial themeSwitch;
    private boolean initializingFields = true;

    private boolean manualImageSelected = false;

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
                    if (manualImageSelected) {
                        Log.d("ProfileActivity", "Manual image selection detected," +
                                "skipping automatic image load");
                        return;
                    }
                    Log.d("ProfileActivity", "User image loaded successfully");
                    profileImage.setImageBitmap(image);
                });
                // Set to false after initial population
                initializingFields = false;

            }
        });

        // Setup text watchers to detect changes
        setupTextWatchers();

        // Initialize the photo selection helper
        photoSelectionHelper = new PhotoSelectionHelper(this,
                (imagePath, imageUri) -> {
                    profileImagePath = imagePath;
                    manualImageSelected = true;
                    // Update the ImageView in the activity
                    if (imageUri != null) {
                        Log.d("ProfileActivity", "Selected Image URI: " + imageUri);
                        profileImage.setImageURI(imageUri);
                        profileImage.postInvalidate();
                    }
                    hasUnsavedChanges = true;
                });
        // Update the change photo click listener
        TextView changePhotoText = findViewById(R.id.change_photo_text);
        changePhotoText.setOnClickListener(v ->
                photoSelectionHelper.showPhotoSelectionOptions());

        // Setup save button click listener
        findViewById(R.id.save_button).setOnClickListener(v -> saveChanges());
    }

    /**
     * @brief Initializes the input fields for the profile activity.
     */
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

    /**
     * @brief Sets up text watchers for the input fields to detect changes.
     */
    private void setupTextWatchers() {
        TextWatcher textWatcher = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            if (initializingFields) {
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

    /**
     * @brief Shows an alert dialog when there are unsaved changes.
     */
    private void showUnsavedChangesAlert() {
        new AlertDialog.Builder(this)
                .setTitle("Unsaved Changes")
                .setMessage("You have unsaved changes. Do you want to save them before continuing?")
                .setPositiveButton("Save", (dialog, which) -> {
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

    /**
     * @brief Saves the changes made in the profile activity.
     */
    private void saveChanges() {
        hasUnsavedChanges = false;
        String firstName = Objects.requireNonNull(firstNameEditText.getText()).toString().trim();
        String lastName = Objects.requireNonNull(lastNameEditText.getText()).toString().trim();
        UserRepository userRepository = BmailApplication.getInstance().getUserRepository();
        userRepository.updateProfile(firstName, lastName, profileImagePath);

        finish();
    }

    /**
     * @brief Handles the back button press in the profile activity.
     */
    @Override
    public boolean onSupportNavigateUp() {
        if (hasUnsavedChanges) {
            showUnsavedChangesAlert();
            return true;
        }
        finish();
        return true;
    }

    /**
     * @brief Handles the back button press in the profile activity.
     */
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

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PhotoSelectionHelper.REQUEST_CAMERA_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted, launch camera directly
                photoSelectionHelper.launchCamera();
            } else {
                // Permission denied
                Toast.makeText(this,
                        "Camera permission is required to take photos", Toast.LENGTH_SHORT).show();
            }
        }
    }

   }


