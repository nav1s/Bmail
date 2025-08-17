package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageButton;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.Utils.CallbackUtil;
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
            CallbackUtil callback = new CallbackUtil(
                    "Draft updated successfully.",
                    "Draft updated successfully.",
                    true,
                    this,
                    "ComposeActivity"
            );
            viewModel.updateDraft(to, subject, message, this.draftId, false, callback);
        } else {
            // If it's not a draft, send the mail
            Log.i("ComposeActivity", "Sending mail with subject: " + subject);
            CallbackUtil callback = new CallbackUtil(
                    "Mail sent successfully.",
                    "Mail sent successfully.",
                    true,
                    this,
                    "ComposeActivity"
            );
            viewModel.sendMail(to, subject, message, callback);
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
                CallbackUtil callback = new CallbackUtil(
                        "Draft updated successfully.",
                        "Draft updated successfully.",
                        false,
                        this,
                        "ComposeActivity"
                );
                viewModel.updateDraft(to, subject, message, this.draftId, true, callback);
            } else {
                CallbackUtil callback = new CallbackUtil(
                        "Draft created successfully.",
                        "Draft created successfully.",
                        false,
                        this,
                        "ComposeActivity"
                );
                viewModel.createDraft(to, subject, message, callback);
            }
        }
        finish();
        return true;
    }
}
