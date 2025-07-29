package com.example.bmail.Activities;

import android.app.AlertDialog;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.R;
import com.google.android.material.textfield.TextInputEditText;

public class ProfileActivity extends AppCompatActivity {

    private boolean hasUnsavedChanges = false;
    private TextInputEditText firstNameEditText;
    private TextInputEditText lastNameEditText;
    private TextInputEditText usernameEditText;
    private TextInputEditText currentPasswordEditText;
    private TextInputEditText newPasswordEditText;
    private TextInputEditText confirmPasswordEditText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        // Initialize input fields
        initializeInputFields();

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
    }

    private void setupTextWatchers() {
        TextWatcher textWatcher = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
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
}
