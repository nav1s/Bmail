package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.ViewModels.ComposeViewModel;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo;
    private EditText etSubject;
    private EditText etMessage;
    private ImageButton btnSend;
    private ComposeViewModel viewModel;

    // Flag to store if the mail is a draft
    private String draftId = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        initViews();

        loadMailIfEditing();
        setupViewModel();
        setupListeners();
    }

    /**
     * @brief Initializes the views used in this activity.
     */
    private void initViews() {
        etTo = findViewById(R.id.et_to);
        etSubject = findViewById(R.id.et_subject);
        etMessage = findViewById(R.id.et_message);
        btnSend = findViewById(R.id.btn_send);
    }

    /**
     * @brief Loads the mail content if we are editing an existing mail.
     * If a mail ID is provided in the intent, it fetches the mail from the repository
     * and fills the EditText fields with the mail's content.
     */
    private void loadMailIfEditing() {
        // Check if we are editing a mail
        String mailId = getIntent().getStringExtra("mail_id");
        MailRepository mailRepository = BmailApplication.getInstance().getMailRepository();
        if (mailId != null && !mailId.isEmpty()) {
            ServerMail mail = mailRepository.getMailById(mailId);
            // Fill the content from the mail
            if (mail != null) {
                // Log the mail for debugging
                Log.d("ComposeActivity", "Editing mail: " + mail);

                etTo.setText(String.join(", ", mail.getTo()));
                etSubject.setText(mail.getTitle());
                etMessage.setText(mail.getBody());
                draftId = mail.getId();
            }
            return;
        }

        // If we are not editing a mail, check if we are forwarding or replying to a mail
        String to = getIntent().getStringExtra("to");
        String subject = getIntent().getStringExtra("subject");
        String body = getIntent().getStringExtra("body");

        if (to != null) etTo.setText(to);
        if (subject != null) etSubject.setText(subject);
        if (body != null) etMessage.setText(body);
    }

    /**
     * @brief Sets up the ViewModel for this activity.
     * This method initializes the ComposeViewModel using a factory that provides the MailRepository.
     */
    private void setupViewModel() {
        viewModel = new ComposeViewModel();
    }

    /**
     * @brief Sets up the listeners for the buttons in this activity.
     * This method sets an OnClickListener on the send button to handle sending the mail.
     */
    private void setupListeners() {
        btnSend.setOnClickListener(v -> sendMail());
    }

    /**
     * @brief Sends the mail or updates the draft based on the current state.
     * If the mail is a draft, it updates the draft; otherwise, it sends the mail.
     * If no recipient is provided, it shows an error dialog.
     */
    private void sendMail() {
        Log.i("ComposeActivity", "Sending mail...");

        String to = etTo.getText().toString().trim();
        if (to.isEmpty()) {
            new androidx.appcompat.app.AlertDialog.Builder(this)
                    .setMessage("Please enter at least one recipient.")
                    .setPositiveButton("OK", (dialog, which) -> dialog.dismiss())
                    .show();
            return;
        }

        String subject = etSubject.getText().toString().trim();
        String message = etMessage.getText().toString().trim();

        // log the draft id for debugging
        Log.d("ComposeActivity", "Draft ID: " + this.draftId);

        // If it's a draft, send the draft
        if (this.draftId != null && !this.draftId.isEmpty()) {
            viewModel.updateDraft(to, subject, message, this.draftId, false);
        } else {
            // If it's not a draft, send the mail
            Log.i("ComposeActivity", "Sending mail with subject: " + subject);
            viewModel.sendMail(to, subject, message, new retrofit2.Callback<>() {
                @Override
                public void onResponse(@NonNull retrofit2.Call<Void> call,
                                       @NonNull retrofit2.Response<Void> response) {
                    if (response.isSuccessful()) {
                        Log.i("ComposeActivity", "Mail sent successfully.");
                        Toast.makeText(ComposeActivity.this, "Mail sent successfully.",
                                Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        Log.e("ComposeActivity", "Failed to send mail: " + response.message());
                        try(
                                okhttp3.ResponseBody errorBody = response.errorBody()) {
                            if (errorBody != null) {
                                String errorMessage = errorBody.string();
                                Log.e("ComposeActivity", "Error body: " + errorMessage);
                                Toast.makeText(ComposeActivity.this,
                                        "Failed to send mail: " + errorMessage,
                                        Toast.LENGTH_SHORT).show();
                            } else {
                                Log.e("ComposeActivity", "No error body available.");
                                Toast.makeText(ComposeActivity.this,
                                        "Failed to send mail: " + response.message(),
                                        Toast.LENGTH_SHORT).show();
                            }
                        } catch (Exception e) {
                            Log.e("ComposeActivity", "Error reading error body", e);
                            Toast.makeText(ComposeActivity.this,
                                    "Failed to send mail: " + response.message(),
                                    Toast.LENGTH_SHORT).show();
                        }
                    }
                }

                @Override
                public void onFailure(@NonNull retrofit2.Call<Void> call, @NonNull Throwable t) {
                    Log.e("ComposeActivity", "Error sending mail: " + t.getMessage());
                    Toast.makeText(ComposeActivity.this,
                            t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    /**
     * @brief Handles the back navigation in this activity.
     * When the user presses the back button, it saves the draft if there is any content
     * in the subject or message fields.
     * If the draft ID is not empty, it updates the existing draft; otherwise, it creates a new draft.
     */
    @Override
    public boolean onSupportNavigateUp() {
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String message = etMessage.getText().toString().trim();

        // save draft
        if (!subject.isEmpty() || !message.isEmpty()) {
            if (this.draftId != null && !this.draftId.isEmpty()) {
                viewModel.updateDraft(to, subject, message, this.draftId, true);
            } else {
                viewModel.createDraft(to, subject, message, new retrofit2.Callback<>() {
                    @Override
                    public void onResponse(@NonNull retrofit2.Call<Void> call,
                                           @NonNull retrofit2.Response<Void> response) {
                        if (response.isSuccessful()) {
                            Log.i("ComposeActivity", "Draft created successfully.");
                            Toast.makeText(ComposeActivity.this,
                                    R.string.message_saved_as_draft, Toast.LENGTH_SHORT).show();
                        } else {
                            Log.e("ComposeActivity", "Failed to create draft: " + response.message());
                            // send a toast with the error message
                            Toast.makeText(ComposeActivity.this,
                                    "Failed to create draft: " + response.message(),
                                    Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull retrofit2.Call<Void> call, @NonNull Throwable t) {
                        Log.e("ComposeActivity", "Error creating draft: " + t.getMessage());
                        Toast.makeText(ComposeActivity.this,
                                "Error creating draft: " + t.getMessage(),
                                Toast.LENGTH_SHORT).show();
                    }
                });
            }
        }
        finish();
        return true;
    }
}
