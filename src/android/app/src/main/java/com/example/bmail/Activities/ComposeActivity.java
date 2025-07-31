package com.example.bmail.Activities;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.bmail.BmailApplication;
import com.example.bmail.Entities.Mail;
import com.example.bmail.R;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.ViewModels.ComposeViewModel;
import com.example.bmail.ViewModels.ComposeViewModelFactory;

import java.util.List;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo;
    private EditText etSubject;
    private EditText etMessage;
    private ImageButton btnSend;
    private ComposeViewModel composeViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        initViews();
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
        composeViewModel = new ViewModelProvider(this, factory)
                .get(ComposeViewModel.class);
    }

    private void setupListeners() {
        btnSend.setOnClickListener(v -> sendMail());
    }

    private void sendMail() {
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String message = etMessage.getText().toString().trim();

        // Validate input
        if (to.isEmpty()) {
            new androidx.appcompat.app.AlertDialog.Builder(this)
                    .setMessage("Add at least one recipient.")
                    .setPositiveButton("OK", (dialog, which) -> dialog.dismiss())
                    .show();
            return;
        }

        if (subject.isEmpty()) {
            subject = "(No Subject)";
        }

        if (message.isEmpty()) {
            message = "";
        }

        // todo replace sender with actual user email
        Mail mail = new Mail(subject, message, "Me", List.of(to), false);
        composeViewModel.send(mail);
        Toast.makeText(this, "sent", Toast.LENGTH_SHORT).show();
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
