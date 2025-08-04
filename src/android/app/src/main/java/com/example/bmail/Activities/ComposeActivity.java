package com.example.bmail.Activities;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.bmail.Entities.BmailApplication;
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

        viewModel.sendMail(to, subject, message);

        Toast.makeText(this, "sent", Toast.LENGTH_SHORT).show();
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
