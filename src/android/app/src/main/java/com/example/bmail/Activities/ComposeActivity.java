package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.Mail;
import com.example.bmail.R;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.ViewModels.ComposeViewModel;
import com.example.bmail.ViewModels.ComposeViewModelFactory;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo;
    private EditText etSubject;
    private EditText etMessage;
    private ImageButton btnSend;
    private ComposeViewModel viewModel;

    // Flag to store if the mail is a draft
    private String draftId = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        initViews();

        // todo move this part into a function
        // check if we are editing a mail
        String mailId = getIntent().getStringExtra("mail_id");
        MailRepository mailRepository = BmailApplication.getInstance().getMailRepository();
        if (mailId != null && !mailId.isEmpty()) {
            Mail mail = mailRepository.getMailById(mailId);
            // fill the content from the mail
            if (mail != null) {
                // log the mail for debugging
                Log.d("ComposeActivity", "Editing mail: " + mail);

                etTo.setText(String.join(", ", mail.getTo()));
                etSubject.setText(mail.getTitle());
                etMessage.setText(mail.getBody());
                draftId = mail.getId();
            }
        }


        setupViewModel();
        setupListeners();
    }

    private void initViews() {
        etTo = findViewById(R.id.et_to);
        etSubject = findViewById(R.id.et_subject);
        etMessage = findViewById(R.id.et_message);
        btnSend = findViewById(R.id.btn_send);
    }

    private void setupViewModel() {
        MailRepository mailRepository = BmailApplication.getInstance().getMailRepository();

        ComposeViewModelFactory factory = new ComposeViewModelFactory(mailRepository);
        viewModel = new ViewModelProvider(this, factory)
                .get(ComposeViewModel.class);
    }

    private void setupListeners() {
        btnSend.setOnClickListener(v -> sendMail());
    }

    private void sendMail() {
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

        // If it's a draft, send the draft
        if (this.draftId.isEmpty()) {
            viewModel.updateDraft(to, subject, message, this.draftId, false);
        } else {
            viewModel.sendMail(to, subject, message);
        }

        Toast.makeText(this, "sent", Toast.LENGTH_SHORT).show();
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        // todo update the same draft if the mail is a draft
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String message = etMessage.getText().toString().trim();

        // save draft
        if (!subject.isEmpty() || !message.isEmpty()) {
            if (!this.draftId.isEmpty()) {
                // todo check gmail behavior
                viewModel.updateDraft(to, subject, message, this.draftId, true);
            }
            else {
                viewModel.createDraft(to, subject, message);
                Toast.makeText(this, R.string.message_saved_as_draft, Toast.LENGTH_SHORT).show();
            }
        }
        finish();
        return true;
    }
}
