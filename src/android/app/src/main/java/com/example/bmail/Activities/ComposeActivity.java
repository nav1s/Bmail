package com.example.bmail.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.bmail.R;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo, etSubject, etMessage;
    private ImageButton btnBack, btnSend;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        initViews();
        setupListeners();
    }

    private void initViews() {
        etTo = findViewById(R.id.et_to);
        etSubject = findViewById(R.id.et_subject);
        etMessage = findViewById(R.id.et_message);
        btnBack = findViewById(R.id.btn_back);
        btnSend = findViewById(R.id.btn_send);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> onBackPressed());

        btnSend.setOnClickListener(v -> sendEmail());
    }

    private void sendEmail() {
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String message = etMessage.getText().toString().trim();

        // Validate input
        if (to.isEmpty()) {
            etTo.setError("Recipient is required");
            etTo.requestFocus();
            return;
        }

        if (subject.isEmpty()) {
            etSubject.setError("Subject is required");
            etSubject.requestFocus();
            return;
        }

        if (message.isEmpty()) {
            etMessage.setError("Message body is required");
            etMessage.requestFocus();
            return;
        }

        // Create email intent
        Intent emailIntent = new Intent(Intent.ACTION_SEND);
        emailIntent.setType("text/plain");
        emailIntent.putExtra(Intent.EXTRA_EMAIL, new String[]{to});
        emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
        emailIntent.putExtra(Intent.EXTRA_TEXT, message);

        try {
            startActivity(Intent.createChooser(emailIntent, "Send email via..."));
            Toast.makeText(this, "Email sent successfully", Toast.LENGTH_SHORT).show();
            finish();
        } catch (android.content.ActivityNotFoundException ex) {
            Toast.makeText(this, "No email app found", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onBackPressed() {
        // Check if there's any content and warn user
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String message = etMessage.getText().toString().trim();

        if (!to.isEmpty() || !subject.isEmpty() || !message.isEmpty()) {
            new androidx.appcompat.app.AlertDialog.Builder(this)
                    .setTitle("Discard Draft")
                    .setMessage("Are you sure you want to discard this draft?")
                    .setPositiveButton("Discard", (dialog, which) -> super.onBackPressed())
                    .setNegativeButton("Cancel", null)
                    .show();
        } else {
            super.onBackPressed();
        }
    }
}
