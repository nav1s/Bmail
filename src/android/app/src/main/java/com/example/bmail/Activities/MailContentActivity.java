package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.Mail;
import com.example.bmail.R;
import com.example.bmail.Repositories.MailRepository;

public class MailContentActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // todo add viewmodel
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail_content);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        // fetch the mail id from intent extras
        int mailId = getIntent().getIntExtra("mail_id", -1);
        if (mailId == -1) {
            Log.e("MailContentActivity", "Invalid mail ID");
            finish();
            return;
        }
        MailRepository mailRepository = BmailApplication.getInstance().getMailRepository();

        Mail mail = mailRepository.getMailById(mailId);
        if (mail == null) {
            Log.e("MailContentActivity", "Mail not found for ID: " + mailId);
            finish();
            return;
        }

        TextView tvMailTitle = findViewById(R.id.tv_mail_title);
        TextView tvSender = findViewById(R.id.tv_sender_name);
        TextView tvRecipients = findViewById(R.id.tv_recipients);
        TextView tvMailBody = findViewById(R.id.tv_mail_body);

        tvMailTitle.setText(mail.getTitle());
        tvSender.setText(mail.getFrom());
        tvRecipients.setText(String.join(", ", mail.getTo()));
        tvMailBody.setText(mail.getBody());

        // setup delete button
        ImageButton btnDelete = findViewById(R.id.btn_delete);
        btnDelete.setOnClickListener(v -> {
            finish();
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
